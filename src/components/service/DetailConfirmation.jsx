import React, { useState, useEffect, useMemo } from "react";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import placeholderImg from "../../images/Spaylogo.png";
import BillAvenuelogo from "../../images/BillAvenuelogo.png";
import { usePost } from "../../hooks/usePost";
import { useServicesContext } from "../../contexts/ServicesAuthContext";
import ErrorToast from "../ErrorToast";

import BBPSQrSection from "./BBPSQrSection";

const DetailConfirmation = () => {
  const { isModalOpen, getModalData, closeModal, openModal } = useModal();
  const { forWhat } = useServicesContext();

  // Fallback for modal data
  const modalData = getModalData("finalData") || {};
  const { data = {}, custData = {}, selectedBiller = {} } = modalData;

  const testEnv = useMemo(() => forWhat, [forWhat]);

  const [input, setInput] = useState([]);
  const [addInfo, setAddInfo] = useState([]);
  const [billerRes, setBillerRes] = useState({});
  const [acceptAmount, setAcceptAmount] = useState(false);
  const [userDataRequire, setUserDataRequire] = useState(false);

  const [formValues, setFormValues] = useState({
    amount: "",
    customerPan: "",
  });

  const [userData, setUserData] = useState({});
  const [qrPaymentSuccess, setQrPaymentSuccess] = useState(false);
  const [isPanInputDisplay, setIsPanInputDisplay] = useState(false);

  const {
    error,
    loading,
    execute: fetchPayment,
  } = usePost(`/bbps/bill-payment${testEnv}/json`);

  const [resError, setResError] = useState();

  // ---------------- HANDLE API ERRORS ----------------
  useEffect(() => {
    if (error?.errors) {
      const firstMsg =
        Object.values(error.errors)[0]?.[0] || "Something went wrong";
      setResError(firstMsg);
    } else if (error?.message) {
      setResError(error.message || "Something went wrong");
    }
  }, [error]);

  // ---------------- PAN VISIBILITY (FIXED) ----------------
  useEffect(() => {
    const amount = Number(formValues.amount || 0);

    if (amount >= 50000 && !custData?.customerPan) {
      setIsPanInputDisplay(true);
    } else {
      setIsPanInputDisplay(false);
    }
  }, [formValues.amount, custData?.customerPan]);

  useEffect(() => {
    if (!resError) return;
    setTimeout(() => setResError(null), 3000);
  }, [resError]);

  // ---------------- LOAD MODAL DATA ----------------
  useEffect(() => {
    if (!selectedBiller) return;

    setUserDataRequire(
      selectedBiller?.billerFetchRequiremet !== "MANDATORY" &&
        selectedBiller?.billerFetchRequiremet !== "OPTIONAL",
    );

    setInput(data?.inputParams?.input || []);
    setAddInfo(data?.additionalInfo?.info || []);
    setBillerRes(data?.billerResponse || {});
    setAcceptAmount(selectedBiller?.billerAdhoc === "true");
  }, [selectedBiller, data]);

  // ---------------- HELPERS ----------------
  const mapInput = (arr, nameKey = "paramName", valueKey = "paramValue") =>
    Array.isArray(arr)
      ? arr.map((i) => ({
          key: i[nameKey] ?? "Unknown Param",
          value:
            i[valueKey] && typeof i[valueKey] === "object"
              ? JSON.stringify(i[valueKey], null, 2)
              : (i[valueKey] ?? ""),
        }))
      : [];

  const mapAddInfo = (arr) =>
    Array.isArray(arr)
      ? arr.map((i) => ({
          key: i.infoName ?? "Unknown Info",
          value:
            i.infoValue && typeof i.infoValue === "object"
              ? JSON.stringify(i.infoValue, null, 2)
              : (i.infoValue ?? ""),
        }))
      : [];

  const mapBillerRows = (billerResponse) =>
    billerResponse && typeof billerResponse === "object"
      ? Object.entries(billerResponse).map(([key, value]) => {
          if (key === "billAmount" && !isNaN(value)) {
            return { key, value: Number(value) / 100 };
          }

          if (key === "amountOptions" && Array.isArray(value?.option)) {
            return {
              key: "amountOptions",
              value: value.option
                .map(
                  (opt) =>
                    `${opt.amountName}: ${Number(opt.amountValue) / 100}`,
                )
                .join(" | "),
            };
          }

          if (value && typeof value === "object") {
            return { key, value: JSON.stringify(value, null, 2) };
          }

          return { key, value: value ?? "" };
        })
      : [];

  // ---------------- DYNAMIC ROWS ----------------
  const dynamicRows = [
    ...mapInput(input),
    ...mapAddInfo(addInfo),
    ...mapBillerRows(billerRes),
  ];

  // ---------------- HANDLE USER INPUT ----------------
  const handleChange = (key, value) =>
    setUserData((prev) => ({ ...prev, [key]: value }));

  // ---------------- FINAL PAYMENT PAYLOAD (FIXED) ----------------
  const finalMergedData = {
    billerId: selectedBiller?.billerId,

    ...dynamicRows.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {}),

    ...custData,
    ...userData,

    ...(formValues.customerPan
      ? { customerPan: formValues.customerPan }
      : custData?.customerPan
        ? { customerPan: custData.customerPan }
        : {}),

    paymentMode: "Cash",
    splitPay: "N",
    quickPay: "N",

    ...(acceptAmount ? { amount: formValues.amount * 100 } : {}),
  };

  const handleCancel = (close) => {
    window.location.reload(true);
    close();
  };

  // ---------------- EXECUTE PAYMENT ----------------
  const handlePay = async () => {
    // return;
    const response = await fetchPayment(finalMergedData);

    // Generic API error
    if (response?.status === false && response?.message) {
      setResError(response.message);
      return;
    }

    // Validation errors
    if (response?.errors) {
      const messages = Object.values(response.errors).flat().join(", ");
      setResError(messages);
      return;
    }

    // FORM BBPS ERROR
    if (response?.response?.vErrorRootVO) {
      setResError(response.response.vErrorRootVO.error[0].errorMessage);
      closeModal("finalData");
      return;
    }

    // Success
    closeModal("finalData");
    openModal("lastModal", {
      lastModal: response,
      serviceId: selectedBiller?.billerId,
      data,
      custData,
    });
  };

  useEffect(() => {
    if (qrPaymentSuccess && userData?.remitterName && userData?.remarks) {
      handlePay();
    }
  }, [qrPaymentSuccess, userData?.remitterName, userData?.remarks]);

  return (
    <ServicesModalWrapper
      isOpen={isModalOpen("finalData")}
      onClose={() => closeModal("finalData")}
      renderHeader={
        <>
          <img src={placeholderImg} alt="logo" className="h-7 mx-auto" />
          <p className="text-center text-lg mt-1 font-semibold">
            Are you sure you want to proceed?
          </p>
        </>
      }
      renderMiddle={
        <>
          <div className="flex justify-end mb-2">
            <img
              src={BillAvenuelogo}
              alt="Bill Avenue"
              className="h-4 object-contain"
            />
          </div>

          {/* Amount Field */}
          {acceptAmount && (
            <div className="mt-4">
              <label className="font-semibold mb-1 block">Enter Amount</label>
              <input
                type="number"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter a positive number"
                value={formValues.amount}
                onChange={(e) => {
                  const val = e.target.value;

                  // Convert to number
                  const num = Number(val);

                  // Allow empty input
                  if (val === "") {
                    setFormValues((prev) => ({ ...prev, amount: "" }));
                    return;
                  }

                  // Only allow positive numbers
                  if (!isNaN(num) && num >= 0) {
                    setFormValues((prev) => ({ ...prev, amount: val }));
                  } else {
                    alert("Please enter a valid positive number");
                  }
                }}
              />
            </div>
          )}

          {/* PAN Field */}
          {isPanInputDisplay && (
            <div className="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
              <h2 className="text-sm font-semibold text-red-600 mb-3">
                * For payments ₹50,000 and above, PAN details are required
              </h2>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter PAN
              </label>

              <input
                type="text"
                placeholder="ABCDE1234F"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none
                placeholder:text-gray-400"
                value={formValues.customerPan}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    customerPan: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          )}

          {resError && <ErrorToast errMsg={resError} />}

          <div className="grid grid-cols-1 md:grid-cols-[30%_68%] gap-4 mt-5">
            {/* USER DETAILS — UNCHANGED */}

            <div>
              {/* <BBPSQrSection
                dynamicRows={dynamicRows}
                custData={custData}
                userData={userData}
                amount={acceptAmount ? formValues.amount : null}
              /> */}

              <BBPSQrSection
                dynamicRows={dynamicRows}
                custData={custData}
                userData={userData}
                amount={acceptAmount ? formValues.amount : null}
                // onPaymentSuccess={(paymentData) => {
                //   setUserData((prev) => ({
                //     ...prev,
                //     remitterName: paymentData.amount,
                //     remarks: paymentData.message,
                //   }));

                //   setQrPaymentSuccess(true);
                // }}
                onPaymentSuccess={(paymentData) => {
                  setUserData((prev) => ({
                    ...prev,
                    // remitterName: paymentData.amount,
                    remitterName: paymentData.rrn,
                    remarks: paymentData.message,
                  }));

                  setQrPaymentSuccess(true);
                }}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Customer Details
              </h3>

              {userDataRequire && (
                <div className="space-y-3">
                  <div>
                    <label className="font-medium block mb-1">
                      Customer Mobile
                    </label>
                    <input
                      type="text"
                      name="customerMobile"
                      maxLength={10}
                      className="w-full border p-1 rounded"
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">
                      Customer PAN
                    </label>
                    <input
                      type="text"
                      name="customerPan"
                      className="w-full border p-1 rounded"
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="font-medium block mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      className="w-full border p-2 rounded"
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-medium block mb-1">Remitter Name</label>
                {/* <input
                  type="text"
                  name="remitterName"
                  disabled={true}
                  className="w-full border p-2 rounded cursor-not-allowed"
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                /> */}
                <input
                  type="text"
                  name="remitterName"
                  value={userData?.remitterName || ""}
                  disabled
                  className="w-full border p-2 rounded cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium block mb-1">Remarks</label>
                {/* <input
                  type="text"
                  name="remarks"
                  disabled={true}
                  className="w-full border p-2 rounded cursor-not-allowed"
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                /> */}
                <input
                  type="text"
                  name="remarks"
                  value={userData?.remarks || ""}
                  disabled
                  className="w-full border p-2 rounded cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* ✅ BILL RESPONSE / DYNAMIC ROWS TABLE (RESTORED) */}
          <div className="w-full mt-6">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <tbody>
                {dynamicRows.map((row, i) => (
                  <tr key={i} className="border-b last:border-none">
                    <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-100 w-1/2">
                      {row.key}
                    </td>
                    <td className="py-2 px-3 text-gray-800 w-1/2">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
      renderFooter={(close) => (
        <div className="flex justify-center gap-3 mt-4">
          <button
            type="submit"
            onClick={handlePay}
            // className="px-6 py-2 bg-green-600 text-white rounded cursor-not-allowed opacity-60"
            // disabled={loading}
            // disabled={true}
            // disabled={!qrPaymentSuccess}
            disabled={loading || !qrPaymentSuccess}
            className={`px-6 py-2 text-white rounded ${
              qrPaymentSuccess
                ? "bg-green-600"
                : "bg-green-600 opacity-60 cursor-not-allowed"
            }`}
            // className="px-6 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Submiting..." : "Submit"}
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

export default DetailConfirmation;
