import React, { useState, useEffect, useMemo } from "react";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import { useGet } from "../../hooks/useGet";
import { usePost } from "../../hooks/usePost";
import { useServicesContext } from "../../contexts/ServicesAuthContext";
import MetroBillForm from "./MetroBillForm";
import Select from "react-select";

const SelectServiceBiller = () => {
  const { forWhat } = useServicesContext();
  const { isModalOpen, getModalData, openModal, closeModal } = useModal();

  const testEnv = useMemo(() => forWhat, [forWhat]);

  const [selectedBillerId, setSelectedBillerId] = useState("");
  const [selectedBillerData, setSelectedBillerData] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOpen = isModalOpen("serviceSelecter");
  const { service } = getModalData("serviceSelecter") || {};

  const endpoint = useMemo(() => {
    return service?.label ? `/get-billers${testEnv}/${service.label}` : null;
  }, [service?.label, testEnv]);

  const { data, loading: apiLoading } = useGet(endpoint);

  const { data: billerResponse, execute: fetchBillerInfo } = usePost(
    `/bbps/biller-info${testEnv}/json`,
  );
  const handleCancel = (close) => {
    // window.location.reload(true);
    close();
  };
  useEffect(() => {
    if (apiLoading) {
      setLoading(true);
      return;
    }

    if (Array.isArray(data)) {
      setServiceList(data);
      setLoading(false);
    }
  }, [data, apiLoading]);

  const resetForm = () => {
    setSelectedBillerId("");
    setSelectedBillerData(null);
    setLoading(true);
  };

  const handleNext = (close) => {
    if (!selectedBillerId) {
      alert("Select a biller!");
      return;
    }

    close();
    setTimeout(() => {
      if (
        selectedBillerData?.planMdmRequirement === "MANDATORY" ||
        selectedBillerData?.planMdmRequirement === "OPTIONAL"
      ) {
        openModal("plandisplay", { selectedBiller: selectedBillerData });
      } else {
        openModal("details", {
          selectedBiller: selectedBillerData,
          billerResponse,
        });
      }
    }, 260);
  };

  const onChangeHandler = async (id) => {
    setSelectedBillerId(id);

    const res = await fetchBillerInfo(id);
    const result = res.data?.biller;

    if (Array.isArray(result) && result[0]) {
      setSelectedBillerData(result[0]);
    }
  };

  //  Convert API data → react-select options
  const billerOptions = useMemo(() => {
    return serviceList.map((item) => {
      if (item.blr_id === "NOVI00000NAT8C") {
        return {
          value: item.blr_id,
          label: "Jio Hotstar Quaterly",
        };
      }
      return {
        value: item.blr_id,
        label: item.blr_name,
      };
    });
  }, [serviceList]);

  if (service?.label === "Metro Bill") {
    return <MetroBillForm />;
  }
  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("serviceSelecter")}
      resetOnClose={resetForm}
      renderHeader={
        <>
          <span className="font-semibold text-xl ml-2">
            Select {service?.label || "Biller"}
          </span>
        </>
      }
      renderMiddle={
        <>
          {billerOptions.length > 0 ? (
            <Select
              options={billerOptions}
              isLoading={loading}
              placeholder="Select Biller"
              onChange={(option) => option && onChangeHandler(option.value)}
              value={
                billerOptions.find((opt) => opt.value === selectedBillerId) ||
                null
              }
              isClearable
              className="text-sm"
              classNamePrefix="react-select"
              menuPlacement="auto"
            />
          ) : (
            <div>No Biller Available</div>
          )}
        </>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={() => handleNext(close)}
            disabled={loading || !selectedBillerId}
            className={`px-4 py-2 rounded text-white ${
              !selectedBillerId
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Next
          </button>

          <button
            onClick={() => handleCancel(close)}
            className="px-3 py-1.5 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
        </>
      )}
    />
  );
};

export default SelectServiceBiller;
