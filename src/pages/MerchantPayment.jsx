import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronRight,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiAlertCircle,
  FiLoader,
  FiCreditCard,
  FiEdit3,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { usePost } from "../hooks/usePost";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS
/* -------------------------------------------------------------------------- */

/*  */

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "S";

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const MerchantPayment = () => {
  const { slug } = useParams();

  const { execute: createPayment, loading: paymentLoading } =
    usePost("/qr/payment/create");

  /* ------------------------------------------------------------------------ */
  /*                                  STATE                                   */
  /* ------------------------------------------------------------------------ */

  const [merchant, setMerchant] = useState(null);

  const [loadingMerchant, setLoadingMerchant] = useState(true);
  const [merchantError, setMerchantError] = useState("");

  const [amount, setAmount] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");

  const [errors, setErrors] = useState({});

  /* ------------------------------------------------------------------------ */
  /*                              FETCH MERCHANT                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!slug) {
      setMerchantError("Invalid payment link.");
      setLoadingMerchant(false);
      return;
    }

    const fetchMerchant = async () => {
      try {
        setLoadingMerchant(true);
        setMerchantError("");

        const response = await fetch(
          `${API_BASE_URL}/qr/payment/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load merchant details.");
        }

        setMerchant(data.data);
      } catch (error) {
        console.error("Merchant payment page error:", error);

        setMerchantError(
          error?.message || "Unable to load payment information.",
        );
      } finally {
        setLoadingMerchant(false);
      }
    };

    fetchMerchant();
  }, [slug]);

  /* ------------------------------------------------------------------------ */
  /*                              DERIVED DATA                                */
  /* ------------------------------------------------------------------------ */

  const merchantName = merchant?.merchant_name || "SPAY Merchant";

  const merchantInitials = useMemo(
    () => getInitials(merchantName),
    [merchantName],
  );

  const numericAmount = Number(amount || 0);

  const isInactive = merchant?.status === "inactive";

  /* ------------------------------------------------------------------------ */
  /*                              VALIDATION                                  */
  /* ------------------------------------------------------------------------ */

  const validateForm = () => {
    const newErrors = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid amount.";
    }

    if (Number(amount) > 1000000) {
      newErrors.amount = "Maximum payment amount is ₹10,00,000.";
    }

    if (!customerName.trim()) {
      newErrors.customerName = "Enter your name.";
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = "Enter a valid name.";
    }

    if (!mobile.trim()) {
      newErrors.mobile = "Enter your mobile number.";
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ------------------------------------------------------------------------ */
  /*                              AMOUNT CHANGE                               */
  /* ------------------------------------------------------------------------ */

  const handleAmountChange = (event) => {
    let value = event.target.value;

    value = value.replace(/[^\d.]/g, "");

    const parts = value.split(".");

    if (parts.length > 2) {
      value = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    if (parts[1]?.length > 2) {
      value = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setAmount(value);

    if (errors.amount) {
      setErrors((prev) => ({
        ...prev,
        amount: "",
      }));
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                              PAY NOW                                     */
  /* ------------------------------------------------------------------------ */

  const handlePayNow = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await createPayment({
        slug,
        amount: Number(amount),
        customer_name: customerName.trim(),
        customer_mobile: mobile.trim(),
      });

      console.log("Payment Response:", result);

      if (!result?.success) {
        toast.error(result?.message || "Unable to initialize payment.");
        return;
      }

      const paymentUrl = result?.data?.payment_url;

      console.log("Payment URL:", paymentUrl);

      if (!paymentUrl) {
        toast.error("Payment URL was not generated.");
        return;
      }

      // Validate normal HTTP/HTTPS payment URL
      if (
        !paymentUrl.startsWith("https://") &&
        !paymentUrl.startsWith("http://")
      ) {
        toast.error("Invalid payment URL.");
        return;
      }

      // Redirect to Paytm hosted payment page   
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Payment initialization error:", error);

      toast.error(error?.message || "Something went wrong. Please try again.");
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                              LOADING STATE                               */
  /* ------------------------------------------------------------------------ */

  if (loadingMerchant) {
    return (
      <div className="min-h-screen bg-[#f4f8ff] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-[28px] bg-white border border-blue-100 shadow-[0_20px_60px_rgba(37,99,235,0.12)] p-7">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <FiLoader className="h-7 w-7 text-blue-600 animate-spin" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Loading payment page
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we fetch merchant details.
              </p>

              <div className="mt-7 w-full space-y-3">
                <div className="h-3 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-3 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                               ERROR STATE                                */
  /* ------------------------------------------------------------------------ */

  if (merchantError || !merchant) {
    return (
      <div className="min-h-screen bg-[#f4f8ff] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[28px] bg-white border border-slate-200 shadow-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <FiAlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Payment link unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {merchantError ||
              "This payment link is invalid or no longer available."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                MAIN UI                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#f4f8ff] text-slate-900">
      {/* ==================================================================== */}
      {/* TOP BLUE HEADER                                                      */}
      {/* ==================================================================== */}

      <header className="relative overflow-hidden bg-gradient-to-br from-[#075ee8] via-[#1269ed] to-[#2384f5] text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-blue-300/10 blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4 sm:py-5">
            <div className="flex items-center gap-3">
              {/* <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg font-black">S</span>
              </div> */}

              <div>
                <p className="text-base font-extrabold tracking-tight">
                  SPAY FINTECH
                </p>

                <p className="text-[9px] uppercase tracking-[0.18em] text-blue-100 font-semibold">
                  Secure Payments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-2 backdrop-blur-sm">
              <FiShield className="h-4 w-4" />

              <span className="hidden xs:inline text-[11px] sm:text-xs font-semibold">
                Secure Payment
              </span>
            </div>
          </div>

          {/* Merchant Hero */}
          <div className="pb-8 sm:pb-12 pt-3 sm:pt-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[22px] bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm">
                <span className="text-xl sm:text-2xl font-black">
                  {merchantInitials}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-blue-100 font-medium">
                  Paying to
                </p>

                <h1 className="mt-0.5 text-xl sm:text-3xl font-extrabold truncate">
                  {merchantName}
                </h1>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-400 flex items-center justify-center">
                    <FiCheck className="h-3.5 w-3.5 text-white" />
                  </span>

                  <span className="text-xs sm:text-sm font-semibold text-blue-50">
                    Verified Merchant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-[-1px] left-0 right-0 h-5 bg-[#f4f8ff] rounded-t-[50%]" />
      </header>

      {/* ==================================================================== */}
      {/* MAIN CONTENT                                                         */}
      {/* ==================================================================== */}

      <main className="relative max-w-6xl mx-auto px-3 sm:px-6 pb-10">
        <div className="grid lg:grid-cols-[1fr_450px] gap-5 lg:gap-10 items-start -mt-1 sm:-mt-2">
          {/* ================================================================= */}
          {/* LEFT INFORMATION                                                  */}
          {/* ================================================================= */}

          <section className="hidden lg:block space-y-5 pt-4">
            {/* Merchant Information */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-[0_12px_40px_rgba(37,99,235,0.08)] p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FiCreditCard className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Merchant
                    </p>

                    <p className="mt-0.5 text-base font-bold text-slate-800">
                      {merchantName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">
                    Payment Mode
                  </p>

                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      UPI
                    </span>

                    <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FiCreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-400">Merchant ID</p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    #{merchant?.merchant_id || "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Status</p>

                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isInactive ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      {isInactive ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-[0_12px_40px_rgba(37,99,235,0.08)] p-7">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FiShield className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Safe & Secure Payment
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your payment details are protected. Never share your UPI
                    PIN, OTP, card PIN or banking credentials with anyone.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                  <FiLock className="h-4 w-4 text-blue-600" />

                  <p className="mt-3 text-xs font-bold text-slate-700">
                    Secure
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">Protected</p>
                </div>

                <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                  <FiCreditCard className="h-4 w-4 text-blue-600" />

                  <p className="mt-3 text-xs font-bold text-slate-700">UPI</p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Fast payment
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                  <FiCheck className="h-4 w-4 text-blue-600" />

                  <p className="mt-3 text-xs font-bold text-slate-700">
                    Verified
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">Merchant</p>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* PAYMENT CARD                                                     */}
          {/* ================================================================= */}

          <section className="w-full lg:pt-4">
            <div className="bg-white rounded-[26px] sm:rounded-[30px] border border-blue-100 shadow-[0_20px_60px_rgba(37,99,235,0.12)] overflow-hidden">
              {/* Payment Card Header */}
              <div className="px-5 sm:px-7 py-5 sm:py-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold tracking-[0.15em] text-blue-600 uppercase">
                      Payment
                    </p>

                    <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                      Make a payment
                    </h2>
                  </div>

                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FiCreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* PAYMENT BODY                                                  */}
              {/* ============================================================= */}

              <div className="p-5 sm:p-7">
                {/* =========================================================== */}
                {/* MERCHANT MOBILE SUMMARY                                     */}
                {/* =========================================================== */}

                <div className="lg:hidden mb-5 rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <span className="font-bold text-sm">
                        {merchantInitials}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-500">
                        Paying to
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-800 truncate">
                        {merchantName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <FiCheck className="h-4 w-4" />

                      <span className="text-[10px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>

                {/* =========================================================== */}
                {/* AMOUNT                                                      */}
                {/* =========================================================== */}

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-bold text-slate-800">
                      Enter Amount
                    </label>

                    <span className="text-[11px] text-slate-400">INR</span>
                  </div>

                  <div
                    className={`relative rounded-2xl border-2 ${
                      errors.amount
                        ? "border-red-300 bg-red-50/30"
                        : "border-blue-100 bg-[#f8fbff] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                    } transition-all`}
                  >
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full h-[76px] sm:h-[84px] pl-12 sm:pl-14 pr-5 rounded-2xl outline-none text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 placeholder:text-slate-300 bg-transparent"
                      autoFocus
                    />
                  </div>

                  {errors.amount && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* =========================================================== */}
                {/* QUICK AMOUNTS                                               */}
                {/* =========================================================== */}

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-semibold text-slate-500">
                      Quick select
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Choose an amount
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 1000, 2000].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setAmount(String(value));

                          setErrors((prev) => ({
                            ...prev,
                            amount: "",
                          }));
                        }}
                        className={`h-11 rounded-xl border text-xs sm:text-sm font-bold transition-all active:scale-[0.97] ${
                          Number(amount) === value
                            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        ₹{value.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* =========================================================== */}
                {/* DIVIDER                                                     */}
                {/* =========================================================== */}

                <div className="my-7 h-px bg-slate-100" />

                {/* =========================================================== */}
                {/* CUSTOMER DETAILS                                            */}
                {/* =========================================================== */}

                <div>
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Your Details
                    </h3>

                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                      We'll send payment confirmation on these details.
                    </p>
                  </div>

                  {/* NAME */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      Full Name
                    </label>

                    <div
                      className={`relative rounded-xl border ${
                        errors.customerName
                          ? "border-red-300 bg-red-50/30"
                          : "border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                      } transition-all`}
                    >
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);

                          if (errors.customerName) {
                            setErrors((prev) => ({
                              ...prev,
                              customerName: "",
                            }));
                          }
                        }}
                        placeholder="Enter your name"
                        className="w-full h-13 min-h-[52px] pl-11 pr-4 rounded-xl outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-transparent"
                      />
                    </div>

                    {errors.customerName && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  {/* MOBILE */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      Mobile Number
                    </label>

                    <div
                      className={`relative rounded-xl border ${
                        errors.mobile
                          ? "border-red-300 bg-red-50/30"
                          : "border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                      } transition-all`}
                    >
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600">
                        +91
                      </span>

                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");

                          setMobile(value);

                          if (errors.mobile) {
                            setErrors((prev) => ({
                              ...prev,
                              mobile: "",
                            }));
                          }
                        }}
                        placeholder="Mobile number"
                        className="w-full h-13 min-h-[52px] pl-[78px] pr-4 rounded-xl outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-transparent"
                      />
                    </div>

                    {errors.mobile && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* =========================================================== */}
                {/* PAYMENT SUMMARY                                             */}
                {/* =========================================================== */}

                <div className="mt-6 rounded-2xl bg-[#f7faff] border border-blue-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-500">
                      Amount payable
                    </span>

                    <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                      ₹{formatCurrency(numericAmount)}
                    </span>
                  </div>
                </div>

                {/* =========================================================== */}
                {/* PAY BUTTON                                                  */}
                {/* =========================================================== */}

                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={paymentLoading || isInactive}
                  className="mt-5 w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-[#075ee8] to-[#1976ed] text-white font-bold text-base flex items-center justify-center gap-3 shadow-[0_12px_28px_rgba(37,99,235,0.28)] hover:shadow-[0_15px_32px_rgba(37,99,235,0.35)] hover:from-[#0557d8] hover:to-[#126de0] active:scale-[0.985] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {paymentLoading ? (
                    <>
                      <FiLoader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{formatCurrency(numericAmount)}
                      <FiArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* =========================================================== */}
                {/* SECURITY NOTICE                                             */}
                {/* =========================================================== */}

                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 py-3 px-3 flex items-center justify-center gap-2">
                  <FiLock className="h-3.5 w-3.5 text-slate-400 shrink-0" />

                  <span className="text-[10px] sm:text-[11px] text-slate-400 text-center">
                    Your payment information is secured with encryption
                  </span>
                </div>
              </div>

              {/* ============================================================= */}
              {/* CARD FOOTER                                                   */}
              {/* ============================================================= */}

              <div className="border-t border-slate-100 bg-[#fbfcff] px-5 sm:px-7 py-4">
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-slate-400">
                  <FiShield className="h-3.5 w-3.5 text-blue-500" />

                  <span>
                    Secured by{" "}
                    <strong className="text-blue-600 font-extrabold">
                      SPAY Payments
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ================================================================== */}
        {/* MOBILE SECURITY                                                    */}
        {/* ================================================================== */}

        <section className="lg:hidden mt-5">
          <div className="rounded-2xl bg-white border border-blue-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FiShield className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Safe & Secure Payment
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                  Never share your OTP, UPI PIN or banking credentials.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <FiLock className="mx-auto h-4 w-4 text-blue-600" />

                <p className="mt-1.5 text-[10px] font-bold text-slate-600">
                  Secure
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <FiCreditCard className="mx-auto h-4 w-4 text-blue-600" />

                <p className="mt-1.5 text-[10px] font-bold text-slate-600">
                  UPI
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <FiCheck className="mx-auto h-4 w-4 text-emerald-500" />

                <p className="mt-1.5 text-[10px] font-bold text-slate-600">
                  Verified
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* TERMS                                                               */}
        {/* ================================================================== */}

        <p className="mt-5 px-3 text-center text-[10px] sm:text-xs leading-5 text-slate-400">
          By continuing, you agree to the applicable payment terms and
          conditions.
          <span>.....© {new Date().getFullYear()} SPAY</span>
        </p>
      </main>
    </div>
  );
};

export default MerchantPayment;
