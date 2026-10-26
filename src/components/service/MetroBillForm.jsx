import React, { useState } from "react";
import axios from "axios";
import { ServicesModalWrapper } from "../ServicesModalWrapper";
import { useModal } from "../../contexts/ServicesModalContext";
import placeholderImg from "../../images/Spaylogo.png";

let atomScriptPromise = null;

const loadAtomScript = () => {
  if (typeof window.AtomPaynetz === "function") {
    return Promise.resolve();
  }

  if (atomScriptPromise) {
    return atomScriptPromise;
  }

  atomScriptPromise = new Promise((resolve, reject) => {
    let script = document.getElementById("atom-script");

    const handleLoad = () => {
      if (typeof window.AtomPaynetz === "function") {
        resolve();
      } else {
        reject(new Error("Atom checkout script loaded, but AtomPaynetz is unavailable."));
      }
    };

    const handleError = () => {
      script?.remove();
      reject(new Error("Failed to load the Atom checkout script."));
    };

    if (!script) {
      script = document.createElement("script");
      script.src =
        "https://pgtest.atomtech.in/staticdata/ots/js/atomcheckout.js";
      script.id = "atom-script";
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
    }
  }).catch((error) => {
    atomScriptPromise = null;
    throw error;
  });

  return atomScriptPromise;
};

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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const startPayment = async () => {
    try {
      setLoading(true);

      await loadAtomScript();

      const response = await axios.post(
        "https://dashboardbbps.spay.live/api/ntt/payin",
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
        returnUrl: "https://dashboardbbps.spay.live/api/ntt/callback",
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