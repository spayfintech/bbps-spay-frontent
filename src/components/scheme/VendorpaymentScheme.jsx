import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faMoneyBillTransfer,
  faPercent,
  faIndianRupeeSign,
  faXmark,
  faCheck,
  faArrowLeft,
  faCircleInfo,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";

import { usePost } from "../../hooks/usePost";

const VendorpaymentScheme = ({ refresh, onClose, onBack }) => {
  /* ============================================================
     API
  ============================================================ */

  const { execute, loading: submitting } = usePost("/create-scheme");

  /* ============================================================
     FORM STATE
  ============================================================ */

  const [schemeName, setSchemeName] = useState("Card to Cash Scheme");

  const [commissionType, setCommissionType] = useState("percent");

  const [commissionValue, setCommissionValue] = useState("");

  const [gstValue, setGstValue] = useState("");

  const [minAmount, setMinAmount] = useState("");

  const [maxAmount, setMaxAmount] = useState("");

  const [status, setStatus] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ============================================================
     PREVIEW
  ============================================================ */

  const previewAmount = 10000;

  const commissionPreview = useMemo(() => {
    const value = Number(commissionValue);

    if (!value || Number.isNaN(value)) {
      return 0;
    }

    if (commissionType === "percent") {
      return (previewAmount * value) / 100;
    }

    return value;
  }, [commissionType, commissionValue]);

  const gstPreview = useMemo(() => {
    const gst = Number(gstValue);

    if (!gst || Number.isNaN(gst)) {
      return 0;
    }

    return (commissionPreview * gst) / 100;
  }, [gstValue, commissionPreview]);

  const totalDeduction = commissionPreview + gstPreview;

  /* ============================================================
     FORMAT CURRENCY
  ============================================================ */

  const formatCurrency = (value) => {
    if (!value) {
      return "₹0.00";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "₹0.00";
    }

    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = () => {
    setError("");

    if (!schemeName.trim()) {
      setError("Please enter scheme name.");
      return false;
    }

    if (!commissionType) {
      setError("Please select commission type.");
      return false;
    }

    if (!commissionValue || Number(commissionValue) <= 0) {
      setError("Please enter a valid commission value.");
      return false;
    }

    if (commissionType === "percent" && Number(commissionValue) > 100) {
      setError("Percentage commission cannot be greater than 100%.");
      return false;
    }

    if (!gstValue || Number(gstValue) < 0) {
      setError("Please enter a valid GST value.");
      return false;
    }

    if (Number(gstValue) > 100) {
      setError("GST percentage cannot be greater than 100%.");
      return false;
    }

    if (minAmount && Number(minAmount) < 0) {
      setError("Minimum transaction amount cannot be negative.");
      return false;
    }

    if (maxAmount && Number(maxAmount) < 0) {
      setError("Maximum transaction amount cannot be negative.");
      return false;
    }

    if (minAmount && maxAmount && Number(minAmount) > Number(maxAmount)) {
      setError(
        "Minimum transaction amount cannot be greater than maximum transaction amount.",
      );
      return false;
    }

    return true;
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError("");
    setSuccess("");

    const body = {
      name: schemeName.trim(),

      // Service identification
      service: "vendor_payment",

      // Transaction category
      category: "card_to_cash",

      // Commission configuration
      commission_type: "wallet",
      type: commissionType,
      commission_value: commissionValue,

      // Scheme status
      status: status,

      // GST
      gst_type: "percent",
      gst_value: gstValue,

      // Vendor Payment does not use BBPS merchant/biller mapping
      merchant_id: [],
      blr_id: [],

      // Transaction limits
      min_amount: minAmount || null,
      max_amount: maxAmount || null,
    };

    try {
      const response = await execute(body);

      if (response?.status === "false" || response?.success === false) {
        setError(
          response?.error || response?.message || "Unable to create scheme.",
        );

        return;
      }

      setSuccess("Card to Cash commission scheme created successfully.");

      if (refresh) {
        refresh();
      }

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 800);
    } catch (err) {
      console.error("Vendor Payment Scheme Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while creating the scheme.",
      );
    }
  };

  /* ============================================================
     CLOSE
  ============================================================ */

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  Card to Cash Scheme
                </h2>

                <p className="truncate text-xs text-slate-500 sm:text-sm">
                  Configure Vendor Payment commission structure
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
          </div>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-3">
              {/* ==================================================
                  LEFT / MAIN FORM
              ================================================== */}

              <div className="space-y-5 lg:col-span-2">
                {/* ==================================================
                    SERVICE INFORMATION
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FontAwesomeIcon icon={faMoneyBillTransfer} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Service Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Define the Vendor Payment scheme
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Scheme Name */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Scheme Name
                      </label>

                      <input
                        type="text"
                        value={schemeName}
                        onChange={(e) => setSchemeName(e.target.value)}
                        placeholder="Enter scheme name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* Service */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Service
                      </label>

                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <FontAwesomeIcon
                          icon={faWallet}
                          className="text-blue-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Vendor Payment
                          </p>

                          <p className="text-xs text-slate-500">
                            Wallet based transaction
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Type */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Transaction Type
                      </label>

                      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                        <FontAwesomeIcon
                          icon={faCreditCard}
                          className="text-blue-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            Card to Cash
                          </p>

                          <p className="text-xs text-blue-600">
                            Card based vendor transaction
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    SCHEME MAPPING
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FontAwesomeIcon icon={faWallet} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Scheme Assignment
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Users will be assigned to this scheme separately.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      className="mt-0.5 text-blue-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        User-based scheme assignment
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        This scheme is not directly mapped to merchants. After
                        creating the scheme, assign it to users through the
                        Scheme Assignment API.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    COMMISSION CONFIGURATION
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FontAwesomeIcon icon={faPercent} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Commission Configuration
                        </h3>

                        <p className="text-xs text-slate-500">
                          Define how commission is deducted
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Commission Type */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Commission Type
                      </label>

                      <select
                        value={commissionType}
                        onChange={(e) => setCommissionType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="">Select Type</option>

                        <option value="percent">Percentage (%)</option>

                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>

                    {/* Commission Value */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Commission Value
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {commissionType === "percent" ? (
                            <FontAwesomeIcon icon={faPercent} />
                          ) : (
                            <FontAwesomeIcon icon={faIndianRupeeSign} />
                          )}
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value)}
                          placeholder={
                            commissionType === "percent"
                              ? "e.g. 2.75"
                              : "e.g. 50"
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>

                    {/* GST */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        GST on Commission
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FontAwesomeIcon icon={faPercent} />
                        </span>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={gstValue}
                          onChange={(e) => setGstValue(e.target.value)}
                          placeholder="e.g. 18"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    TRANSACTION LIMITS
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <h3 className="font-semibold text-slate-900">
                      Transaction Limits
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Optional limits for Card to Cash transactions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Minimum */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Minimum Transaction Amount
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FontAwesomeIcon icon={faIndianRupeeSign} />
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>

                    {/* Maximum */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Maximum Transaction Amount
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FontAwesomeIcon icon={faIndianRupeeSign} />
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          placeholder="e.g. 100000"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  RIGHT SIDE
              ================================================== */}

              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-5">
                  {/* ==================================================
                      STATUS
                  ================================================== */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Scheme Status
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Control scheme availability
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStatus(!status)}
                        className={`relative h-7 w-12 rounded-full transition ${
                          status ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                            status ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div
                      className={`flex items-center gap-3 rounded-xl p-3 ${
                        status ? "bg-emerald-50" : "bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          status
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </div>

                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            status ? "text-emerald-800" : "text-slate-700"
                          }`}
                        >
                          {status ? "Scheme Active" : "Scheme Inactive"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {status
                            ? "Transactions can use this scheme."
                            : "Transactions are disabled."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      SUMMARY
                  ================================================== */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-900">
                      Scheme Summary
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Service</span>

                        <span className="font-semibold text-slate-800">
                          Vendor Payment
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Type</span>

                        <span className="font-semibold text-slate-800">
                          Card to Cash
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Commission</span>

                        <span className="font-semibold text-slate-800">
                          {commissionValue
                            ? `${commissionValue}${
                                commissionType === "percent" ? "%" : "₹"
                              }`
                            : "--"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">GST</span>

                        <span className="font-semibold text-slate-800">
                          {gstValue ? `${gstValue}%` : "--"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Assignment</span>

                        <span className="font-semibold text-slate-800">
                          User Based
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      CALCULATION PREVIEW
                  ================================================== */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="text-blue-500"
                      />

                      <h3 className="font-semibold text-slate-900">
                        Calculation Preview
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transaction</span>

                        <span className="font-semibold text-slate-800">
                          {formatCurrency(previewAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Commission</span>

                        <span className="font-semibold text-slate-800">
                          {formatCurrency(commissionPreview)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">GST</span>

                        <span className="font-semibold text-slate-800">
                          {formatCurrency(gstPreview)}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">
                            Total Deduction
                          </span>

                          <span className="font-bold text-blue-600">
                            {formatCurrency(totalDeduction)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                ERROR / SUCCESS
            ================================================== */}

            {(error || success) && (
              <div className="px-4 pb-4 sm:px-6">
                <div
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    error
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {error || success}
                </div>
              </div>
            )}

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Card to Cash commission will apply to users assigned to this
                  scheme.
                </div>

                <div className="flex w-full gap-3 sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        Create Scheme
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorpaymentScheme;
