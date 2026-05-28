import React, { useState } from "react";
import axios from "axios";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import placeholderImg from "../../images/Spaylogo.jpg";

const MetroBillForm = () => {
  const { isModalOpen, closeModal } = useModal();

  const isOpen = isModalOpen("serviceSelecter");

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    email: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const loadAtomScript = () => {
    return new Promise((resolve) => {
      const existingScript = document.getElementById("atom-script");

      if (!existingScript) {
        const script = document.createElement("script");

        script.src =
          "https://pgtest.atomtech.in/staticdata/ots/js/atomcheckout.js";

        script.id = "atom-script";

        script.onload = () => {
          resolve(true);
        };

        document.body.appendChild(script);
      } else {
        resolve(true);
      }
    });
  };

  const startPayment = async () => {
    try {
      setLoading(true);

      // Load Atom SDK
      await loadAtomScript();

      // Backend API Call
      const response = await axios.post(
        "https://dashboardbbps.spay.live/backend/api/ntt/payin",
        formData,
      );

      if (!response.data.status) {
        alert("Unable to create payment");
        return;
      }

      const options = {
        atomTokenId: response.data.atomTokenId,
        merchId: response.data.merchId,
        custEmail: formData.email,
        custMobile: formData.mobile,
        returnUrl: "https://uatdashboard.spay.live/api/ntt/callback",
      };

      new window.AtomPaynetz(options, "uat");
    } catch (error) {
      console.error(error);

      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServicesModalWrapper
      isOpen={isOpen}
      onClose={() => closeModal("serviceSelecter")}
      renderHeader={
        <>
          <img src={placeholderImg} alt="Logo" className="h-7" />
          <span className="font-semibold text-xl ml-2">Metro Bill</span>
        </>
      }
      renderMiddle={
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      }
      renderFooter={(close) => (
        <>
          <button
            onClick={startPayment}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Pay Now"}
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

export default MetroBillForm;
