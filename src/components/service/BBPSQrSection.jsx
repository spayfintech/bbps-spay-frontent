import React, { useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

const BBPSQrSection = ({
  dynamicRows,
  custData,
  userData,
  amount,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState("");

  const [generatedOrderId, setGeneratedOrderId] = useState("");

  const amountRow =
    dynamicRows?.find(
      (row) => String(row.key || "").toLowerCase() === "billamount",
    ) ||
    dynamicRows?.find((row) =>
      String(row.key || "")
        .toLowerCase()
        .includes("total due amount"),
    ) ||
    dynamicRows?.find((row) =>
      String(row.key || "")
        .toLowerCase()
        .includes("payable amount"),
    ) ||
    dynamicRows?.find(
      (row) => String(row.key || "").toLowerCase() === "amount",
    );

  const mobileRow = dynamicRows?.find((row) => {
    const key = String(row.key || "").toLowerCase();

    return key.includes("mobile");
  });

  const finalAmount = Number(amountRow?.value ?? amount ?? 0);

  const finalMobile =
    userData?.customerMobile ||
    custData?.customerMobile ||
    mobileRow?.value ||
    "";

  const startStatusCheck = (orderId) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `https://ebookspay.co.in/dashboard/api/orderstatus?orderid=${orderId}`,
        );

        console.log("STATUS RESPONSE:", data);

        if (
          data?.status === "Success" &&
          data?.data?.transaction_payment_status === "success"
        ) {
          clearInterval(interval);

          onPaymentSuccess?.({
            amount: data.data.amount,
            message: data.data.message,
            rrn: data.data.rrn,
          });

          console.log("PAYMENT SUCCESS");
        }
      } catch (err) {
        console.error("STATUS API ERROR:", err);
      }
    }, 5000);
  };

  const handleShowQr = async () => {
    try {
      setLoading(true);
      setError("");

      //   console.log("amount prop =", amount);
      //   console.log("amountRow =", amountRow);
      //   console.log("amountRow value =", amountRow?.value);
      //   console.log("finalAmount =", finalAmount);

      if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
        throw new Error("Invalid amount received");
      }

      console.log({
        amountRow,
        finalAmount,
        finalMobile,
      });

      if (!finalMobile) {
        throw new Error("Customer mobile number not found");
      }

      const formData = new FormData();

      const orderId = `YUV${Date.now()}`;

      setGeneratedOrderId(orderId);

      formData.append("orderid", orderId);
      formData.append("amount", String(finalAmount));
      // formData.append("amount", 10);
      formData.append("buyer_email", "test@gmail.com");
      formData.append("buyer_phone", finalMobile);

      const { data } = await axios.post(
        "https://ebookspay.co.in/dashboard/api/generateQR",
        formData,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (
        data?.response?.status_code !== "200" ||
        data?.response?.response_code !== "00"
      ) {
        throw new Error(data?.response?.message || "QR generation failed");
      }

      const qrString = data?.response?.data?.qrcode_string;

      if (!qrString) {
        throw new Error("QR string not found in response");
      }

      setQrData(qrString);
      startStatusCheck(orderId);

      // Temporary Testing
      // startStatusCheck("S220260316587987");
    } catch (err) {
      console.error("QR Error:", err);

      setError(
        err?.response?.data?.response?.message ||
          err?.message ||
          "Unable to generate QR",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 border border-gray-200 rounded-xl p-5 bg-white shadow-sm relative overflow-hidden min-h-[180px]">
      {/* Blur Layer */}
      <div className="h-full flex items-center justify-center">
        {qrData ? (
          <QRCode
            value={qrData}
            size={180}
            className="bg-white p-2 rounded-lg"
          />
        ) : (
          <div className="select-none pointer-events-none">
            <div className="flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=sample"
                alt="QR Placeholder"
                className="w-36 h-36 rounded-lg blur-[4px] opacity-80"
              />
            </div>
          </div>
        )}
      </div>

      {/* Center Button */}
      {!qrData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            disabled={loading}
            onClick={() => !loading && handleShowQr()}
            className="
                bg-gradient-to-r 
                from-blue-600 
                to-blue-700
                hover:from-blue-700 
                hover:to-blue-800
                text-white
                px-3
                py-2
                rounded-lg
                font-semibold
                shadow-lg
                transition-all
                duration-200
                disabled:opacity-60
                disabled:cursor-not-allowed
                cursor-pointer
            "
          >
            {loading ? "Loading QR..." : "↻ Show QR"}
          </button>
          {error && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-50 border border-red-200 rounded p-2">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BBPSQrSection;
