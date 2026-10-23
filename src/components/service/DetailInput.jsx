import React, { useState, useEffect, useCallback } from "react";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import { usePost } from "../../hooks/usePost";
import { useServicesContext } from "../../contexts/ServicesAuthContext";
import { useMemo } from "react";
import ErrorToast from "../ErrorToast";

const DetailInput = () => {
  const { isModalOpen, getModalData, openModal, closeModal } = useModal();
  const { forWhat } = useServicesContext();

  const testEnv = useMemo(() => {
    return forWhat;
  }, [forWhat]);
  // Modal data
  const { selectedBiller } = getModalData("details") || {};
  const isOpen = isModalOpen("details");

  // Dynamic params from biller API
  const [params, setParams] = useState([]);
  const [formValues, setFormValues] = useState({});

  // Mandatory extra fields
  const [custMob, setCustMob] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custAdd, setCustAdd] = useState("");
  const [custPan, setCustPan] = useState("");
  // const [disable,setDisable]=useState();
  const [billerFetchRequiremet, setBillerFetchRequiremet] = useState(false);
  const [resError, setResError] = useState(null);
  const {
    loading,
    error,
    execute: fetchResponse,
  } = usePost(`/bbps/bill-process${testEnv}/json`);

  useEffect(() => {
    if (!resError) return;
    setTimeout(() => setResError(null), 3000);
  }, [resError]);

  /* -------------------------------------------------------
     LOAD selectedBiller PARAMS
  ------------------------------------------------------- */
  useEffect(() => {
    if (error?.result?.message) {
      setResError(error.result.message);
      return;
    }

    if (error?.result?.errors) {
      let a = error?.result?.errors;
      let msg = Object.values(a)[0][0];
      setResError(msg);
      return;
    }
    if (error?.result?.decryptedResponse?.errorInfo) {
      setResError(
        error?.result?.decryptedResponse.errorInfo.error[0].errorMessage,
      ); // sync UI error
      // "line 45",
      // error?.result?.decryptedResponse.errorInfo.error[0].errorMessage
      // );
      return;
    }

    if (error?.result?.decryptedResponse?.complianceReason) {
      setResError(error?.result.decryptedResponse.complianceReason);
      return;
    }
  }, [error]);

  // const checkError=useCallback(async()=>{
  //   await setResError(error);
  // },[error]);

  useEffect(() => {
    if (!selectedBiller) return;

    if (selectedBiller?.billerInputParams?.[0]?.paramsList) {
      setParams(selectedBiller.billerInputParams[0].paramsList);
    }

    if (
      selectedBiller?.billerFetchRequiremet === "MANDATORY" ||
      selectedBiller?.billerFetchRequiremet === "OPTIONAL"
    ) {
      setBillerFetchRequiremet(true);
    }
  }, [selectedBiller]);

  /* -------------------------------------------------------
     TRACK INPUT CHANGES
  ------------------------------------------------------- */
  const handleChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  /*--------------------------------------------
    CANCLE HANDELING
--------------------------------------------*/

  const handleCancel = (close) => {
    // window.location.reload(true);
    close();
  };
  /* -------------------------------------------------------
     SUBMIT REQUEST
  ------------------------------------------------------- */
  const handleSubmit = async (close) => {
    // 1️⃣ Merge mandatory UI fields into formValues dynamically
    // setDisable(!true)

    const extendedFormValues = {
      ...formValues,
    };
    // 2️⃣ Build mandatoryData based on biller param rules
    const mandatoryData = {
      customerMobile: custMob,
      customerEmail: custEmail,
      customerAdhaar: custAdd,
      customerPan: custPan,
    };

    // 3️⃣ Build API request body
    const currentBillerFetchRequiremet = billerFetchRequiremet;

    // if()
    const requestBody = {
      data: {
        billerId: selectedBiller?.billerId,
        ...extendedFormValues,
        ...(currentBillerFetchRequiremet ? mandatoryData : {}),
      },
    };

    // 4️⃣ API CALL

    // callAPI()

    // setResError(null);
    const response = await fetchResponse(requestBody.data);

    if (!response) {
      return;
    }
    // const response = await fetchResponse(requestBody.data);
    // checkError();
    const res = response?.result;

    // Check if it's an error shape
    if (res?.status === false && res?.message) {
      setResError(res.message);
      return; // prevent closing modal
    }

    // Otherwise, success shape
    const decrypted = res?.decryptedResponse;

    if (!decrypted || decrypted.responseCode !== "000") {
      setResError(decrypted?.responseReason || "Unknown error");
      return;
    }

    // Success → proceed

    close();

    // 5️⃣ Send next modal data
    setTimeout(() => {
      openModal("finalData", {
        data: response?.result?.decryptedResponse,
        custData: billerFetchRequiremet ? mandatoryData : {},
        selectedBiller,
      });
    }, 260);
  };

  /* -------------------------------------------------------
     INPUT MAPPER (DYNAMIC PARAMS)
  ------------------------------------------------------- */
  const inputMapper = () =>
    params.map((item, index) => {
      const hasDropdown = item.values && item.values.trim() !== "";

      const optionList = hasDropdown
        ? item.values.split(",").map((v) => v.trim())
        : [];

      return (
        <div key={index} className="mb-3 flex flex-col">
          <label className="font-semibold mb-1">
            {item.paramName}
            {item.isOptional === "false" ? (
              <span className="text-red-500"> *</span>
            ) : (
              <span></span>
            )}
          </label>

          {hasDropdown ? (
            <select
              className="border p-2 rounded"
              value={formValues[item.paramName] || ""}
              onChange={(e) => handleChange(item.paramName, e.target.value)}
              required={item.isOptional === "false"}
            >
              <option value="">Select {item.paramName}</option>
              {optionList.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="border p-2 rounded"
              value={formValues[item.paramName] || ""}
              minLength={Number(item.minLength)}
              maxLength={Number(item.maxLength)}
              pattern={item.regEx || ".*"}
              required={item.isOptional === "false"}
              onChange={(e) => handleChange(item.paramName, e.target.value)}
            />
          )}
        </div>
      );
    });

  /* -------------------------------------------------------
     MANDATORY FIELDS UI
  ------------------------------------------------------- */
  const mandatoryInputs = () => (
    <div className="mt-3">
      <h3 className="font-semibold mb-2">Customer Details</h3>

      <div className="flex flex-col mb-3">
        <label className="font-semibold mb-1">Customer Aadhaar</label>
        <input
          type="text"
          className="border p-2 rounded"
          value={custAdd}
          onChange={(e) => setCustAdd(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-semibold mb-1">
          Customer Mobile <span className="text-red-500"> *</span>
        </label>
        <input
          type="text"
          className="border p-2 rounded"
          value={custMob}
          onChange={(e) => setCustMob(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-semibold mb-1">Customer PAN </label>
        <input
          type="text"
          className="border p-2 rounded"
          value={custPan}
          onChange={(e) => setCustPan(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-semibold mb-1">Customer Email</label>
        <input
          type="email"
          className="border p-2 rounded"
          value={custEmail}
          onChange={(e) => setCustEmail(e.target.value)}
          required
        />
      </div>
    </div>
  );

  /* -------------------------------------------------------
     COMPONENT RETURN
  ------------------------------------------------------- */
  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("details")}
      renderHeader={
        <>
          <span className="font-semibold ml-2 text-sm">
            Details for {selectedBiller?.billerName}
          </span>
        </>
      }
      renderMiddle={
        <>
          {selectedBiller ? (
            <>
              <div className="space-y-2">{inputMapper()}</div>

              {billerFetchRequiremet && (
                <div className="mt-2 space-y-2">{mandatoryInputs()}</div>
              )}

              {resError && <ErrorToast errMsg={resError} />}
            </>
          ) : (
            <p className="text-sm">Loading...</p>
          )}
        </>
      }
      renderFooter={(close) => (
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={() => handleSubmit(close)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            {loading ? "Loading..." : "Submit"}
          </button>

          <button
            onClick={() => handleCancel(close)}
            className="px-3 py-1.5 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    />
  );
};

export default DetailInput;
