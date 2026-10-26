import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { usePost } from "../../hooks/usePost";

const ContactDetailsForm = ({ onNext, initialData, isPreVerified, merchantOnboardingId }) => {
  /* -------------------------------------------------------------------------- */
  /* OTP STATE                                                                  */
  /* -------------------------------------------------------------------------- */

  const [timeLeft, setTimeLeft] = useState(600);
  const [otpExpired, setOtpExpired] = useState(false);

  const [sameAddress, setSameAddress] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // 🔥 CRITICAL: Initial state derived from isPreVerified prop OR initialData
  const [otpVerified, setOtpVerified] = useState(
    isPreVerified || initialData?.otp_verified === true || false
  );

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  /* -------------------------------------------------------------------------- */
  /* BASIC FORM STATE                                                           */
  /* -------------------------------------------------------------------------- */

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");

  /* -------------------------------------------------------------------------- */
  /* GST / AADHAAR UDYOG                                                        */
  /* -------------------------------------------------------------------------- */

  const [verificationType, setVerificationType] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [udyogNumber, setUdyogNumber] = useState("");

  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);

  const verificationTimerRef = useRef(null);
  const verificationAbortRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* GST RETRY CONTROL                                                          */
  /* -------------------------------------------------------------------------- */

  const gstRetryCountRef = useRef(0);
  const MAX_GST_RETRIES = 3;

  /* -------------------------------------------------------------------------- */
  /* ADDRESS                                                                    */
  /* -------------------------------------------------------------------------- */

  const [registeredAddress, setRegisteredAddress] = useState("");
  const [registeredCity, setRegisteredCity] = useState("");
  const [registeredPin, setRegisteredPin] = useState("");

  const [residentialAddress, setResidentialAddress] = useState("");
  const [residentialCity, setResidentialCity] = useState("");
  const [residentialPin, setResidentialPin] = useState("");

  const [errors, setErrors] = useState({});

  /* -------------------------------------------------------------------------- */
  /* API                                                                        */
  /* -------------------------------------------------------------------------- */

  const { execute: checkContact, loading: checkingContact } = usePost("/merchant-onboarding/check-contact");
  const { execute: saveContact, loading: savingContact } = usePost("/merchant-onboarding/save-contact");
  const { execute: sendOtp, loading: sendingOtp } = usePost("/otp/send-custom-mobile");
  const { execute: verifyOtp, loading: verifyingOtp } = usePost("/otp/verify-otp");
  const { execute: verifyGst, loading: verifyingGst } = usePost("/gst/advance-verify");

  /* -------------------------------------------------------------------------- */
  /* REGEX                                                                      */
  /* -------------------------------------------------------------------------- */

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  const udyogRegex = /^[A-Z0-9-]{8,30}$/i;
  const nameRegex = /^[A-Za-z ]{3,50}$/;
  const businessNameRegex = /^[A-Za-z0-9&.,'()\-\s]{3,100}$/;
  const pinRegex = /^[1-9][0-9]{5}$/;

  /* -------------------------------------------------------------------------- */
  /* RESTORE DATA ON MOUNT                                                      */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    // 1. Determine the source of truth for data
    const data = initialData || {};
    
    // 2. Populate basic fields
    if (data?.contact_name) setFullName(String(data.contact_name));
    if (data?.mobile) setMobile(String(data.mobile));
    if (data?.email) setEmail(String(data.email));
    if (data?.business_name) setBusinessName(String(data.business_name));
    if (data?.business_type) setBusinessType(String(data.business_type));

    /* GST / Udyog */
    if (data?.gst_number) {
      setVerificationType("gst");
      setGstNumber(String(data.gst_number));
      setVerificationStatus("verified");
      setVerificationMessage("GST number verified successfully.");
    } else if (data?.udyog_number) {
      setVerificationType("udyog");
      setUdyogNumber(String(data.udyog_number));
    }

    /* Addresses */
    if (data?.registered_address) {
      // Handling case where backend sends combined string vs individual fields
      const parts = String(data.registered_address).split(", ");
      if (parts.length > 1) {
         setRegisteredAddress(parts[0]);
      } else {
         setRegisteredAddress(String(data.registered_address));
      }
    }
    if (data?.registered_city) setRegisteredCity(String(data.registered_city));
    if (data?.registered_pin) setRegisteredPin(String(data.registered_pin));

    if (data?.residential_address) setResidentialAddress(String(data.residential_address));
    if (data?.residential_city) setResidentialCity(String(data.residential_city));
    if (data?.residential_pin) setResidentialPin(String(data.residential_pin));

    if (data?.same_address !== undefined) setSameAddress(Boolean(data.same_address));

    // 3. Lock verification if pre-verified
    if (isPreVerified || data?.otp_verified === true) {
      setOtpVerified(true);
      setOtpSent(true);
    }
  }, [initialData, isPreVerified]);

  /* -------------------------------------------------------------------------- */
  /* CLEANUP                                                                    */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (verificationTimerRef.current) clearTimeout(verificationTimerRef.current);
      if (verificationAbortRef.current) {
        try {
          verificationAbortRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* VERIFICATION TYPE CHANGE                                                   */
  /* -------------------------------------------------------------------------- */

  const handleVerificationTypeChange = (e) => {
    const type = e.target.value;
    setVerificationType(type);
    setGstNumber("");
    setUdyogNumber("");
    setVerificationStatus("idle");
    setVerificationMessage("");
    gstRetryCountRef.current = 0;

    setErrors((prev) => ({ ...prev, gstNumber: "", udyogNumber: "", verificationType: "" }));

    if (verificationTimerRef.current) clearTimeout(verificationTimerRef.current);
    if (verificationAbortRef.current) {
      try {
        verificationAbortRef.current.abort();
      } catch (_) {}
    }
  };

  /* -------------------------------------------------------------------------- */
  /* GST VERIFICATION                                                           */
  /* -------------------------------------------------------------------------- */

  const verifyGstNumber = async (gst) => {
    const normalizedGst = gst.trim().toUpperCase();
    if (!normalizedGst) return;

    if (!gstRegex.test(normalizedGst)) {
      setVerificationStatus("invalid");
      setVerificationMessage("Enter a valid GST number.");
      return;
    }

    if (verificationLoading || verifyingGst) return;

    setVerificationStatus("verifying");
    setVerificationMessage("Verifying GST number...");
    sessionStorage.setItem("pending_gst_verification", normalizedGst);

    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const financialYear =
        currentMonth >= 4
          ? `${currentYear}-${String(currentYear + 1).slice(-2)}`
          : `${currentYear - 1}-${String(currentYear).slice(-2)}`;

      const response = await verifyGst({
        business_gstin_number: normalizedGst,
        financial_year: financialYear,
      });

      if (response?.status === "success" || response?.verified === true) {
        gstRetryCountRef.current = 0;
        setVerificationStatus("verified");
        setVerificationMessage(response?.message || "GST number verified successfully.");
        sessionStorage.removeItem("pending_gst_verification");
        toast.success("GST number verified successfully.");
        return;
      }

      gstRetryCountRef.current = 0;
      setVerificationStatus("failed");
      setVerificationMessage(response?.message || "GST verification failed.");
    } catch (error) {
      console.error("GST verification error:", error);
      const httpStatus = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.data?.message || error?.message || "";

      if (httpStatus && httpStatus >= 400 && httpStatus < 500) {
        gstRetryCountRef.current = 0;
        setVerificationStatus("failed");
        setVerificationMessage(backendMessage || "GST verification failed. Please check the number.");
        sessionStorage.removeItem("pending_gst_verification");
        return;
      }

      if (gstRetryCountRef.current < MAX_GST_RETRIES) {
        gstRetryCountRef.current += 1;
        setVerificationStatus("retrying");
        setVerificationMessage(
          httpStatus === 504
            ? `GST service timed out. Retrying (${gstRetryCountRef.current}/${MAX_GST_RETRIES})...`
            : `Verification failed. Retrying (${gstRetryCountRef.current}/${MAX_GST_RETRIES})...`
        );
        if (verificationTimerRef.current) clearTimeout(verificationTimerRef.current);
        verificationTimerRef.current = setTimeout(() => {
          verifyGstNumber(normalizedGst);
        }, 3000);
        return;
      }

      gstRetryCountRef.current = 0;
      setVerificationStatus("failed");
      if (httpStatus === 504) {
        setVerificationMessage("GST verification service is currently unavailable. Please try again after some time.");
      } else {
        setVerificationMessage(backendMessage || "Unable to verify GST at this time. Please try again.");
      }
      sessionStorage.removeItem("pending_gst_verification");
    }
  };

  const handleGstChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setGstNumber(value);
    setErrors((prev) => ({ ...prev, gstNumber: "" }));
    setVerificationStatus("idle");
    setVerificationMessage("");
    gstRetryCountRef.current = 0;
    if (verificationTimerRef.current) clearTimeout(verificationTimerRef.current);
    if (!gstRegex.test(value)) return;
    verificationTimerRef.current = setTimeout(() => {
      verifyGstNumber(value);
    }, 800);
  };

  /* -------------------------------------------------------------------------- */
  /* AADHAAR UDYOG                                                              */
  /* -------------------------------------------------------------------------- */

  const handleUdyogChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
    setUdyogNumber(value);
    setErrors((prev) => ({ ...prev, udyogNumber: "" }));

    if (!value) {
      setVerificationStatus("idle");
      setVerificationMessage("");
      return;
    }
    if (!udyogRegex.test(value)) {
      setVerificationStatus("invalid");
      setVerificationMessage("Enter a valid Aadhaar Udyog number.");
      return;
    }
    setVerificationStatus("pending");
    setVerificationMessage("Aadhaar Udyog number entered. Verification API is not configured yet.");
  };

  /* -------------------------------------------------------------------------- */
  /* RESUME GST AFTER REFRESH                                                   */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const pendingGst = sessionStorage.getItem("pending_gst_verification");
    if (verificationType === "gst" && pendingGst && gstRegex.test(pendingGst) && verificationStatus !== "verified") {
      setGstNumber(pendingGst);
      const timer = setTimeout(() => verifyGstNumber(pendingGst), 500);
      return () => clearTimeout(timer);
    }
  }, [verificationType]);

  /* -------------------------------------------------------------------------- */
  /* VALIDATION                                                                 */
  /* -------------------------------------------------------------------------- */

  const validateForm = () => {
    const newErrors = {};

    if (!mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!mobileRegex.test(mobile)) newErrors.mobile = "Enter a valid mobile number.";

    if (verificationType === "gst") {
      if (!gstNumber.trim()) {
        newErrors.gstNumber = "GST number is required since GST verification is selected.";
      } else if (!gstRegex.test(gstNumber.toUpperCase())) {
        newErrors.gstNumber = "Enter a valid GST number.";
      } else if (verificationStatus !== "verified") {
        newErrors.gstNumber = "Please wait for GST verification to complete.";
      }
    }

    if (verificationType === "udyog") {
      if (!udyogNumber.trim()) {
        newErrors.udyogNumber = "Aadhaar Udyog number is required since Udyog verification is selected.";
      } else if (!udyogRegex.test(udyogNumber)) {
        newErrors.udyogNumber = "Enter a valid Aadhaar Udyog number.";
      }
    }

    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address.";

    if (!fullName.trim()) newErrors.fullName = "Contact person name is required.";
    else if (!nameRegex.test(fullName)) newErrors.fullName = "Enter a valid contact person name.";

    if (!businessName.trim()) newErrors.businessName = "Shop name is required.";
    else if (!businessNameRegex.test(businessName)) newErrors.businessName = "Enter a valid Shop name.";

    if (!businessType) newErrors.businessType = "Please select a business type.";

    if (!registeredAddress.trim()) newErrors.registeredAddress = "Registered address is required.";
    if (!registeredCity.trim()) newErrors.registeredCity = "Registered city is required.";
    if (!registeredPin.trim()) newErrors.registeredPin = "PIN code is required.";
    else if (!pinRegex.test(registeredPin)) newErrors.registeredPin = "Enter a valid PIN code.";

    if (!sameAddress) {
      if (!residentialAddress.trim()) newErrors.residentialAddress = "Residential address is required.";
      if (!residentialCity.trim()) newErrors.residentialCity = "Residential city is required.";
      if (!residentialPin.trim()) newErrors.residentialPin = "Residential PIN code is required.";
      else if (!pinRegex.test(residentialPin)) newErrors.residentialPin = "Enter a valid residential PIN code.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0], { position: "top-right", autoClose: 3000 });
      return false;
    }
    return true;
  };

  /* -------------------------------------------------------------------------- */
  /* CHECK REGISTRATION + SEND OTP                                              */
  /* -------------------------------------------------------------------------- */

  const handleSendOtp = async () => {
    if (!validateForm()) return;
    if (mobile.length !== 10) {
      toast.warning("Please enter a valid mobile number.");
      return;
    }

    try {
      const registration = await checkContact({ email: email.trim(), mobile: mobile.trim() });
      if (registration?.status === "failed") {
        setOtpSent(false);
        setOtpExpired(false);
        setOtpVerified(false);
        setOtp("");
        setTimeLeft(600);
        toast.error(registration?.message || "Email or Mobile already registered.");
        return;
      }
      if (registration?.status !== "success") {
        toast.error(registration?.message || "Unable to check registration details.");
        return;
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message;
      toast.error(errorMessage || "Unable to check registration details.");
      return;
    }

    try {
      const res = await sendOtp({ mobile: mobile.trim() });
      if (res?.status === "success") {
        setOtpSent(true);
        setOtpExpired(false);
        setTimeLeft(600);
        setOtp("");
        setOtpVerified(false);
        toast.success("OTP sent successfully.");
      } else {
        toast.error(res?.message || "Unable to send OTP.");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message;
      toast.error(errorMessage || "Unable to send OTP.");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* VERIFY OTP + SAVE                                                          */
  /* -------------------------------------------------------------------------- */

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.warning("Please enter a valid OTP.");
      return;
    }
    if (otpExpired) {
      toast.error("OTP has expired. Please resend OTP.");
      return;
    }

    let otpResponse;
    try {
      otpResponse = await verifyOtp({ mobile, otp });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message;
      toast.error(errorMessage || "Invalid OTP.");
      return;
    }

    if (otpResponse?.status !== "success" && !otpResponse?.message?.toLowerCase().includes("verified")) {
      toast.error(otpResponse?.message || "Invalid OTP.");
      return;
    }

    setOtpVerified(true);

    const unifiedVerificationValue =
      verificationType === "gst" && gstNumber ? gstNumber :
      verificationType === "udyog" && udyogNumber ? udyogNumber : null;

    let merchant;
    try {
      merchant = await saveContact({
        contact_name: fullName,
        business_name: businessName,
        mobile,
        email,
        business_type: businessType,
        gst_number: unifiedVerificationValue,
        udyog_number: verificationType === "udyog" && udyogNumber ? udyogNumber : null,
        registered_address: `${registeredAddress}, ${registeredCity} - ${registeredPin}`,
        residential_address: sameAddress
          ? `${registeredAddress}, ${registeredCity} - ${registeredPin}`
          : `${residentialAddress}, ${residentialCity} - ${residentialPin}`,
      });
    } catch (err) {
      const backendResponse = err?.response?.data || err?.data || err;
      const backendMessage = backendResponse?.message || err?.response?.data?.message || err?.message || "";
      const lowerMessage = backendMessage.toLowerCase();

      if (lowerMessage.includes("email or mobile already registered") || lowerMessage.includes("users_email_unique") || lowerMessage.includes("duplicate entry") || (lowerMessage.includes("email") && lowerMessage.includes("unique"))) {
        toast.error("Email or Mobile already registered.");
        return;
      }
      toast.error(backendMessage || "Unable to save contact details.");
      return;
    }

    if (merchant?.status === "failed" || merchant?.status !== "success") {
      toast.error(merchant?.message || "Unable to save contact details.");
      return;
    }

    if (merchant?.merchant_onboarding_id) {
      sessionStorage.setItem("merchant_onboarding_id", String(merchant.merchant_onboarding_id));
    }

    toast.success("Contact Details Saved Successfully");

    setTimeout(() => {
      onNext({
        contact_name: fullName,
        business_name: businessName,
        mobile,
        email,
        business_type: businessType,
        gst_number: verificationType === "gst" && gstNumber ? gstNumber : null,
        udyog_number: verificationType === "udyog" && udyogNumber ? udyogNumber : null,
        registered_address: registeredAddress,
        registered_city: registeredCity,
        registered_pin: registeredPin,
        residential_address: residentialAddress,
        residential_city: residentialCity,
        residential_pin: residentialPin,
        same_address: sameAddress,
        otp_verified: true, // 🔥 Push to parent
      });
    }, 700);
  };

  /* -------------------------------------------------------------------------- */
  /* TIMER                                                                      */
  /* -------------------------------------------------------------------------- */

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!otpSent) return;
    if (timeLeft <= 0) {
      setOtpExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  /* -------------------------------------------------------------------------- */
  /* VERIFICATION STATUS UI                                                     */
  /* -------------------------------------------------------------------------- */

  const renderVerificationStatus = () => {
    if (!verificationType) return null;

    if (verificationStatus === "verifying")
      return <p className="mt-2 text-xs text-blue-600">Verifying number, please wait...</p>;
    if (verificationStatus === "retrying")
      return <p className="mt-2 text-xs text-orange-600">{verificationMessage}</p>;
    if (verificationStatus === "verified")
      return <p className="mt-2 text-xs text-green-600 font-medium">✓ {verificationMessage}</p>;
    if (verificationStatus === "failed")
      return <p className="mt-2 text-xs text-red-500">{verificationMessage}</p>;
    if (verificationStatus === "invalid")
      return <p className="mt-2 text-xs text-red-500">{verificationMessage}</p>;
    if (verificationStatus === "pending")
      return <p className="mt-2 text-xs text-orange-600">{verificationMessage}</p>;

    return null;
  };

  /* -------------------------------------------------------------------------- */
  /* CONTINUE (when already verified)                                           */
  /* -------------------------------------------------------------------------- */

  const handleContinueAfterVerified = () => {
    toast.success("Contact Details Already Saved");
    onNext({
      contact_name: fullName,
      business_name: businessName,
      mobile,
      email,
      business_type: businessType,
      gst_number: verificationType === "gst" && gstNumber ? gstNumber : null,
      udyog_number: verificationType === "udyog" && udyogNumber ? udyogNumber : null,
      registered_address: registeredAddress,
      registered_city: registeredCity,
      registered_pin: registeredPin,
      residential_address: residentialAddress,
      residential_city: residentialCity,
      residential_pin: residentialPin,
      same_address: sameAddress,
      otp_verified: true,
    });
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">Contact Details</h2>
      <p className="text-sm text-slate-500 mt-2 mb-8">
        Let's start with your basic details for merchant onboarding.
      </p>

      <div className="space-y-5">
        {/* FULL NAME */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((prev) => ({ ...prev, fullName: "" }));
            }}
            placeholder="Enter your full name"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.fullName ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        {/* MOBILE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            maxLength={10}
            disabled={otpVerified}
            onChange={(e) => {
              setMobile(e.target.value.replace(/\D/g, ""));
              setErrors((prev) => ({ ...prev, mobile: "" }));
            }}
            placeholder="Enter mobile number"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.mobile ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${otpVerified ? "bg-slate-100 cursor-not-allowed text-slate-500" : ""}`}
          />
          {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            disabled={otpVerified}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="Enter your email"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.email ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${otpVerified ? "bg-slate-100 cursor-not-allowed text-slate-500" : ""}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* SHOP NAME */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Shop Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setErrors((prev) => ({ ...prev, businessName: "" }));
            }}
            placeholder="Enter your Shop name"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.businessName ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />
          {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
        </div>

        {/* BUSINESS TYPE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
          <select
            value={businessType}
            onChange={(e) => {
              setBusinessType(e.target.value);
              setErrors((prev) => ({ ...prev, businessType: "" }));
            }}
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.businessType ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          >
            <option value="">Select the Business Type</option>
            <option>kirana Store</option>
            <option>Insurance Agent</option>
            <option>Real Estate Agent</option>
            <option>Professional</option>
            <option>Teacher</option>
            <option>Retail Store</option>
            <option>Medicine Shop</option>
            <option>Student</option>
            <option>Retired Person</option>
            <option>Travel Agent</option>
            <option>Money Exchange</option>
            <option>Share Trader</option>
          </select>
          {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
        </div>

        {/* VERIFICATION TYPE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Business Verification <span className="text-slate-500 text-sm font-normal">(optional)</span>
          </label>
          <select
            value={verificationType}
            onChange={handleVerificationTypeChange}
            className="w-full h-11 rounded-md px-4 border border-slate-300 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Select Verification Type</option>
            <option value="gst">GST Number</option>
            <option value="udyog">Aadhaar Udyog</option>
          </select>
        </div>

        {/* GST */}
        {verificationType === "gst" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GST Number <span className="text-red-500 text-sm font-normal"> *</span>
            </label>
            <input
              type="text"
              value={gstNumber}
              maxLength={15}
              onChange={handleGstChange}
              placeholder="Enter GST number"
              disabled={verifyingGst}
              className={`w-full h-11 rounded-md px-4 outline-none transition ${
                errors.gstNumber ? "border border-red-500" : verificationStatus === "verified" ? "border border-green-500 bg-green-50" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              } ${verifyingGst ? "bg-slate-100 cursor-not-allowed" : ""}`}
            />
            {errors.gstNumber && <p className="mt-1 text-xs text-red-500">{errors.gstNumber}</p>}
            {renderVerificationStatus()}
          </div>
        )}

        {/* UDYOG */}
        {verificationType === "udyog" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Aadhaar Udyog Number <span className="text-red-500 text-sm font-normal"> *</span>
            </label>
            <input
              type="text"
              value={udyogNumber}
              maxLength={30}
              onChange={handleUdyogChange}
              placeholder="Enter Aadhaar Udyog number"
              className={`w-full h-11 rounded-md px-4 outline-none transition ${
                errors.udyogNumber ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
            />
            {errors.udyogNumber && <p className="mt-1 text-xs text-red-500">{errors.udyogNumber}</p>}
            {renderVerificationStatus()}
          </div>
        )}

        {/* REGISTERED ADDRESS */}
        <div className="pt-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Registered Address <span className="text-slate-500 text-sm font-normal">(As per Aadhaar)</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <textarea
                rows={3}
                value={registeredAddress}
                onChange={(e) => {
                  setRegisteredAddress(e.target.value);
                  setErrors((prev) => ({ ...prev, registeredAddress: "" }));
                }}
                placeholder="Enter registered address"
                className={`w-full rounded-md px-4 py-3 resize-none outline-none transition ${
                  errors.registeredAddress ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
              />
              {errors.registeredAddress && <p className="mt-1 text-xs text-red-500">{errors.registeredAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                <input
                  type="text"
                  value={registeredCity}
                  onChange={(e) => {
                    setRegisteredCity(e.target.value);
                    setErrors((prev) => ({ ...prev, registeredCity: "" }));
                  }}
                  placeholder="City"
                  className={`w-full h-11 rounded-md px-4 outline-none transition ${
                    errors.registeredCity ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errors.registeredCity && <p className="mt-1 text-xs text-red-500">{errors.registeredCity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={registeredPin}
                  onChange={(e) => {
                    setRegisteredPin(e.target.value.replace(/\D/g, ""));
                    setErrors((prev) => ({ ...prev, registeredPin: "" }));
                  }}
                  placeholder="PIN Code"
                  className={`w-full h-11 rounded-md px-4 outline-none transition ${
                    errors.registeredPin ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errors.registeredPin && <p className="mt-1 text-xs text-red-500">{errors.registeredPin}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* RESIDENTIAL ADDRESS */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Residential Address</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} className="accent-blue-600" />
              Same as above
            </label>
          </div>

          {!sameAddress && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <textarea
                  rows={3}
                  value={residentialAddress}
                  onChange={(e) => {
                    setResidentialAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, residentialAddress: "" }));
                  }}
                  placeholder="Enter residential address"
                  className={`w-full rounded-md px-4 py-3 resize-none outline-none transition ${
                    errors.residentialAddress ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errors.residentialAddress && <p className="mt-1 text-xs text-red-500">{errors.residentialAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    value={residentialCity}
                    onChange={(e) => {
                      setResidentialCity(e.target.value);
                      setErrors((prev) => ({ ...prev, residentialCity: "" }));
                    }}
                    placeholder="City"
                    className={`w-full h-11 rounded-md px-4 outline-none transition ${
                      errors.residentialCity ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  />
                  {errors.residentialCity && <p className="mt-1 text-xs text-red-500">{errors.residentialCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={residentialPin}
                    onChange={(e) => {
                      setResidentialPin(e.target.value.replace(/\D/g, ""));
                      setErrors((prev) => ({ ...prev, residentialPin: "" }));
                    }}
                    placeholder="PIN Code"
                    className={`w-full h-11 rounded-md px-4 outline-none transition ${
                      errors.residentialPin ? "border border-red-500" : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  />
                  {errors.residentialPin && <p className="mt-1 text-xs text-red-500">{errors.residentialPin}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OTP / CONTINUE */}
        <div className="pt-6">
          {otpVerified ? (
            <button
              type="button"
              onClick={handleContinueAfterVerified}
              className="w-full h-11 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition cursor-pointer"
            >
              Continue to Next Step →
            </button>
          ) : !otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || checkingContact || verifyingGst}
              className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer"
            >
              {checkingContact ? "Checking..." : sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">OTP (sent on your registered mobile number)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  maxLength={6}
                  placeholder="Enter OTP"
                  className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <p className={`text-sm ${otpExpired ? "text-red-500" : "text-slate-500"}`}>
                {otpExpired ? "OTP has expired. Please resend OTP." : `OTP expires in ${formatTime(timeLeft)}`}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || savingContact || otpExpired || verifyingGst}
                  className="flex-1 h-11 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium cursor-pointer"
                >
                  {verifyingOtp ? "Verifying..." : savingContact ? "Saving..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || checkingContact}
                  className="px-6 h-11 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {checkingContact ? "Checking..." : sendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 accent-blue-600" />
          <span>I agree to the Terms & Conditions and Privacy Policy.</span>
        </label>
      </div>
    </>
  );
};

export default ContactDetailsForm;