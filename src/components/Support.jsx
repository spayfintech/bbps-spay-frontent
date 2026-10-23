import React, { useEffect, useState } from "react";
import { usePost } from "../hooks/usePost";

const inputClass =
  "p-3 rounded-lg border border-gray-300 outline-none transition " +
  "focus:ring-2 focus:ring-indigo-400 " +
  "disabled:bg-gray-100 disabled:text-gray-400 " +
  "disabled:cursor-not-allowed disabled:border-gray-200 disabled:focus:ring-0";

const Support = ({ onClose }) => {
  // Inputs
  const [requestId, setRequestId] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isDisable, setIsDisable] = useState({
    requestId: false,
    mobile: false,
    startDate: false,
    endDate: false,
  });

  // API
  const { loading, execute } = usePost("/bbps/get-txn-status");

  // Response
  const [response, setResponse] = useState([]);
  const [resError, setResError] = useState(null);

  // Enable / Disable logic
  useEffect(() => {
    const hasRequestId = requestId.trim().length > 0;
    const hasOtherFields =
      mobile.trim().length > 0 ||
      startDate.trim().length > 0 ||
      endDate.trim().length > 0;

    setIsDisable({
      requestId: hasOtherFields,
      mobile: hasRequestId,
      startDate: hasRequestId,
      endDate: hasRequestId,
    });
  }, [requestId, mobile, startDate, endDate]);

  const handleSubmit = async () => {
    setResError(null);
    setResponse([]);

    // 🔒 Validation
    if (!requestId && !mobile) {
      setResError("Please enter Request ID or Mobile Number");
      return;
    }

    let body;

    if (requestId) {
      body = { txnRefID: requestId };
    } else {
      body = {
        mobile_no: mobile,
        fromDate: startDate,
        toDate: endDate || new Date().toISOString().split("T")[0],
      };
    }

    try {
      const result = await execute(body);

      const key = requestId || mobile;
      const apiRes = result?.responses?.[key];

      if (!apiRes) {
        setResError("No transaction data found");
        return;
      }

      if (apiRes?.errorInfo) {
        setResError(apiRes.errorInfo.error?.[0]?.errorMessage);
        return;
      }

      setResponse(apiRes.txnList || []);
    } catch {
      setResError("Something went wrong. Please try again.");
    }
  };

  const clearField = () => {
    setRequestId("");
    setMobile("");
    setStartDate("");
    setEndDate("");
    setResponse([]);
    setResError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Form */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Review Transaction Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search transaction using Request ID or Mobile Number.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl text-slate-500 transition hover:bg-slate-100"
          >
            ×
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              disabled={isDisable.requestId}
              placeholder="Transaction Reference Id / Request Id"
              className={inputClass}
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
            />

            <div className="relative text-center text-gray-500 font-semibold">
              <span className="bg-white px-2">OR</span>
            </div>

            <input
              type="text"
              disabled={isDisable.mobile}
              placeholder="Mobile Number"
              className={inputClass}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <div className="flex gap-3">
              <input
                type="date"
                disabled={isDisable.startDate}
                className={`${inputClass} w-full`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="date"
                disabled={isDisable.endDate}
                className={`${inputClass} w-full`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white px-6 py-2 rounded-lg shadow-md 
                         hover:opacity-90 transition
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Check Status"}
            </button>

            <button
              onClick={clearField}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md 
                         hover:bg-gray-700 transition"
            >
              Clear
            </button>

            {resError && (
              <p className="text-sm text-red-600 font-medium">{resError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Response */}
      {response.length > 0 && (
        <div className="space-y-6 mt-10">
          {response.map((res, index) => (
            <div
              key={res.payRequestId || index}
              className="bg-white/90 p-6 rounded-2xl shadow-xl border border-gray-200 backdrop-blur-lg w-full lg:w-2/3 mx-auto"
            >
              <h3 className="text-xl font-bold mb-5 text-gray-800">
                Transaction Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Agent ID", res.agentId],
                  ["Amount", res.amount],
                  ["Biller ID", res.billerId],
                  ["Mobile", res.mobile],
                  ["Pay Request ID", res.payRequestId],
                  ["Approval Ref Number", res.approvalRefNumber],
                  ["Transaction Date", res.txnDate],
                  ["Customer Name", res.respCustomerName],
                ].map(([label, value], i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <b className="text-gray-600">{label}</b>
                    <p className="text-gray-800 font-medium break-all">
                      {value || "—"}
                    </p>
                  </div>
                ))}

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <b className="text-gray-600">Transaction Status</b>
                  <p
                    className={`font-semibold ${
                      res.txnStatus === "SUCCESS"
                        ? "text-green-600"
                        : res.txnStatus === "FAILED"
                          ? "text-red-600"
                          : "text-gray-800"
                    }`}
                  >
                    {res.txnStatus || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Support;
