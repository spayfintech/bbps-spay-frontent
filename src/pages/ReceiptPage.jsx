import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReceiptPage() {
  const location = useLocation();

  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);

  const data = JSON.parse(query.get("data"));

  const details = data?.payInstrument || {};

  const txnDate =
    details?.merchDetails?.merchTxnDate || new Date().toLocaleString();

  const txnId = details?.merchDetails?.merchTxnId || "N/A";

  const amount = details?.payDetails?.amount || "0";

  const status = details?.responseDetails?.statusCode || "SUCCESS";

  const email = details?.custDetails?.custEmail || "N/A";

  const mobile = details?.custDetails?.custMobile || "N/A";

  const bankTxnId = details?.responseDetails?.atomTxnId || "N/A";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-green-600 text-white text-center py-7 px-4">
          <div className="text-5xl mb-3">✓</div>

          <h1 className="text-2xl font-bold">Payment Successful</h1>

          <p className="text-sm opacity-90 mt-1">
            Your transaction has been completed
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Transaction Status</span>

            <span className="text-green-600 font-semibold">{status}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Amount</span>

            <span className="font-semibold">₹ {amount}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Transaction ID</span>

            <span className="font-semibold text-sm">{txnId}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Bank Ref No</span>

            <span className="font-semibold text-sm">{bankTxnId}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Transaction Date</span>

            <span className="font-semibold text-sm text-right">{txnDate}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Customer Mobile</span>

            <span className="font-semibold">{mobile}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Customer Email</span>

            <span className="font-semibold text-sm text-right">{email}</span>
          </div>

          <button
            onClick={() => navigate("/services")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold mt-5"
          >
            Back To Home
          </button>
        </div>
      </div>
    </div>
  );
}
