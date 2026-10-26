import React, { useEffect, useMemo, useState } from "react";
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

  const [selectedBillerId, setSelectedBillerId] = useState("");
  const [selectedBillerOption, setSelectedBillerOption] = useState(null);
  const [selectedBillerData, setSelectedBillerData] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isOpen = isModalOpen("serviceSelecter");
  const { service } = getModalData("serviceSelecter") || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const endpoint = useMemo(() => {
    if (!service?.label) {
      return null;
    }

    const category = encodeURIComponent(service.label);
    const search = encodeURIComponent(debouncedSearch);

    return `/get-billers${forWhat}/${category}?search=${search}`;
  }, [service?.label, forWhat, debouncedSearch]);

  const {
    data,
    loading: apiLoading,
    error: apiError,
  } = useGet(endpoint, { cacheTime: 5 * 60 * 1000 });

  const loading = apiLoading || (!Array.isArray(data) && !apiError);

  const {
    data: billerResponse,
    execute: fetchBillerInfo,
    loading: billerInfoLoading,
  } = usePost(`/bbps/biller-info${forWhat}/json`);

  const billerOptions = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((item) => ({
        value: item.blr_id,
        label:
          item.blr_id === "NOVI00000NAT8C"
            ? "Jio Hotstar Quaterly"
            : item.blr_name,
      })),
    [data],
  );

  const resetForm = () => {
    setSelectedBillerId("");
    setSelectedBillerOption(null);
    setSelectedBillerData(null);
    setSearchInput("");
    setDebouncedSearch("");
  };

  const handleBillerChange = async (option) => {
    if (!option) {
      setSelectedBillerId("");
      setSelectedBillerOption(null);
      setSelectedBillerData(null);
      setSearchInput("");
      setDebouncedSearch("");
      return;
    }

    setSelectedBillerId(option.value);
    setSelectedBillerOption(option);
    setSelectedBillerData(null);
    setSearchInput("");
    setDebouncedSearch("");

    const response = await fetchBillerInfo(option.value);
    const result = response?.data?.biller;

    if (Array.isArray(result) && result[0]) {
      setSelectedBillerData(result[0]);
    }
  };

  const handleNext = (close) => {
    if (!selectedBillerId || !selectedBillerData) {
      return;
    }

    close();

    setTimeout(() => {
      if (
        selectedBillerData.planMdmRequirement === "MANDATORY" ||
        selectedBillerData.planMdmRequirement === "OPTIONAL"
      ) {
        openModal("plandisplay", {
          selectedBiller: selectedBillerData,
        });
      } else {
        openModal("details", {
          selectedBiller: selectedBillerData,
          billerResponse,
        });
      }
    }, 260);
  };

  if (service?.label === "Metro Bill") {
    return <MetroBillForm />;
  }

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("serviceSelecter")}
      resetOnClose={resetForm}
      renderHeader={
        <span className="font-semibold text-xl ml-2">
          Select {service?.label || "Biller"}
        </span>
      }
      renderMiddle={
        <>
          {apiError ? (
            <div role="alert">Unable to load billers. Please try again.</div>
          ) : (
            <div onMouseDown={(event) => event.stopPropagation()}>
              <div role="note" className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <p className="font-semibold">Can’t find your biller?</p>
                <p className="mt-1">
                  Click the field below and type the biller’s name to search.
                </p>
              </div>
              <Select
                options={billerOptions}
                isLoading={loading}
                placeholder="Select Biller"
                inputValue={searchInput}
                onInputChange={(value, actionMeta) => {
                  if (actionMeta.action === "input-change") {
                    setSearchInput(value);
                  }

                  return value;
                }}
                onChange={handleBillerChange}
                value={selectedBillerOption}
                isClearable
                className="text-sm"
                classNamePrefix="react-select"
                menuPlacement="auto"
                loadingMessage={() => "Searching billers..."}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.trim()
                    ? "No matching billers found. Try a different name in the search box."
                    : "No billers available. Type a biller name in the search box to search."
                }
              />
            </div>
          )}
        </>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={() => handleNext(close)}
            disabled={
              loading ||
              billerInfoLoading ||
              !selectedBillerId ||
              !selectedBillerData
            }
            className={`px-4 py-2 rounded text-white ${
              loading ||
              billerInfoLoading ||
              !selectedBillerId ||
              !selectedBillerData
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {billerInfoLoading ? "Loading..." : "Next"}
          </button>

          <button
            onClick={close}
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