import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { usePost } from "../../hooks/usePost";

const ContactDetailsForm = ({ onNext }) => {
  const [timeLeft, setTimeLeft] = useState(600);
  const [otpExpired, setOtpExpired] = useState(false);

  const [sameAddress, setSameAddress] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const { execute: saveContact } = usePost("/merchant-onboarding/save-contact");

  const { execute: sendOtp, loading: sendingOtp } = usePost(
    "/otp/send-custom-mobile",
  );

  const { execute: verifyOtp, loading: verifyingOtp } =
    usePost("/otp/verify-otp");

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    if (mobile.length !== 10) {
      toast.warning("Please enter a valid mobile number.");
      return;
    }

    try {
      const res = await sendOtp({
        mobile,
      });

      if (res.status === "success") {
        setOtpSent(true);
        setOtpExpired(false);
        setTimeLeft(600);

        toast.success("OTP sent successfully.");
      }
    } catch (err) {
      toast.error("Unable to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.warning("Please enter a valid OTP.");
      return;
    }

    try {
      const res = await verifyOtp({
        mobile,
        otp,
      });

      if (
        res.status === "success" ||
        res.message?.toLowerCase().includes("verified")
      ) {
        setOtpVerified(true);

        const merchant = await saveContact({
          contact_name: fullName,
          business_name: businessName,
          mobile,
          email,
          business_type: businessType,
          gst_number: gstNumber || null,

          registered_address:
            registeredAddress + ", " + registeredCity + " - " + registeredPin,

          residential_address: sameAddress
            ? registeredAddress + ", " + registeredCity + " - " + registeredPin
            : residentialAddress +
              ", " +
              residentialCity +
              " - " +
              residentialPin,
        });

        if (merchant.status !== "success") {
          toast.error("Unable to save contact details.");
          return;
        }

        sessionStorage.setItem(
          "merchant_onboarding_id",
          merchant.merchant_onboarding_id,
        );

        toast.success("Contact Details Saved Successfully");

        setTimeout(() => {
          onNext();
        }, 700);
      }
    } catch (err) {
      toast.error("Invalid OTP.");
    }
  };

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

  //validation
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [registeredAddress, setRegisteredAddress] = useState("");
  const [registeredCity, setRegisteredCity] = useState("");
  const [registeredPin, setRegisteredPin] = useState("");

  const [residentialAddress, setResidentialAddress] = useState("");
  const [residentialCity, setResidentialCity] = useState("");
  const [residentialPin, setResidentialPin] = useState("");

  const [errors, setErrors] = useState({});

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const mobileRegex = /^[6-9]\d{9}$/;

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  const nameRegex = /^[A-Za-z ]{3,50}$/;

  const businessNameRegex = /^[A-Za-z0-9&.,'()\- ]{3,100}$/;

  const pinRegex = /^[1-9][0-9]{5}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!mobileRegex.test(mobile)) {
      newErrors.mobile = "Enter a valid mobile number.";
    }

    if (gstNumber.trim() && !gstRegex.test(gstNumber.toUpperCase())) {
      newErrors.gstNumber = "Enter a valid GST number.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!fullName.trim()) {
      newErrors.fullName = "Contact person name is required.";
    } else if (!nameRegex.test(fullName)) {
      newErrors.fullName = "Enter a valid contact person name.";
    }

    if (!businessName.trim()) {
      newErrors.businessName = "Shop name is required.";
    } else if (!businessNameRegex.test(businessName)) {
      newErrors.businessName = "Enter a valid Shop name.";
    }

    if (!businessType) {
      newErrors.businessType = "Please select a business type.";
    }

    if (!registeredAddress.trim()) {
      newErrors.registeredAddress = "Registered address is required.";
    }

    if (!registeredCity.trim()) {
      newErrors.registeredCity = "Registered city is required.";
    }

    if (!registeredPin.trim()) {
      newErrors.registeredPin = "PIN code is required.";
    } else if (!pinRegex.test(registeredPin)) {
      newErrors.registeredPin = "Enter a valid PIN code.";
    }

    if (!sameAddress) {
      if (!residentialAddress.trim()) {
        newErrors.residentialAddress = "Residential address is required.";
      }

      if (!residentialCity.trim()) {
        newErrors.residentialCity = "Residential city is required.";
      }

      if (!residentialPin.trim()) {
        newErrors.residentialPin = "Residential PIN code is required.";
      } else if (!pinRegex.test(residentialPin)) {
        newErrors.residentialPin = "Enter a valid PIN code.";
      }
    }

    setErrors(newErrors);

    // 🔥 Show first error as toast
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0], {
        position: "top-right",
        autoClose: 3000,
      });

      return false;
    }

    return true;
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">Contact Details</h2>

      <p className="text-sm text-slate-500 mt-2 mb-8">
        Let's start with your basic details for merchant onboarding.
      </p>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((prev) => ({ ...prev, fullName: "" }));
            }}
            placeholder="Enter your full name"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.fullName
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />

          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mobile Number
          </label>

          <input
            type="tel"
            value={mobile}
            maxLength={10}
            onChange={(e) => {
              setMobile(e.target.value.replace(/\D/g, ""));
              setErrors((prev) => ({ ...prev, mobile: "" }));
            }}
            placeholder="Enter mobile number"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.mobile
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />

          {errors.mobile && (
            <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="Enter your email"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.email
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Shop Name
          </label>

          <input
            type="text"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setErrors((prev) => ({ ...prev, businessName: "" }));
            }}
            placeholder="Enter your Shop name"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.businessName
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />

          {errors.businessName && (
            <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>
          )}
        </div>

        {/* Merchant Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Business Type
          </label>

          <select
            value={businessType}
            onChange={(e) => {
              setBusinessType(e.target.value);
              setErrors((prev) => ({ ...prev, businessType: "" }));
            }}
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.businessType
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

          {errors.businessType && (
            <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>
          )}
        </div>

        {/* GST Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            GST Number
            <span className="text-red-500 text-sm font-normal">
              {" "}
              (optional)
            </span>
          </label>

          <input
            type="text"
            value={gstNumber}
            maxLength={15}
            onChange={(e) => {
              setGstNumber(
                e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
              );
              setErrors((prev) => ({ ...prev, gstNumber: "" }));
            }}
            placeholder="Enter GST number"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.gstNumber
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
          />

          {errors.gstNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.gstNumber}</p>
          )}
        </div>

        {/* Registered Address */}
        <div className="pt-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Registered Address
            <span className="text-slate-500 text-sm font-normal">
              {" "}
              (As per Aadhaar)
            </span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>

              <textarea
                rows={3}
                value={registeredAddress}
                onChange={(e) => {
                  setRegisteredAddress(e.target.value);
                  setErrors((prev) => ({ ...prev, registeredAddress: "" }));
                }}
                placeholder="Enter registered address"
                className={`w-full rounded-md px-4 py-3 resize-none outline-none transition
                ${
                  errors.registeredAddress
                    ? "border border-red-500"
                    : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
              />

              {errors.registeredAddress && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.registeredAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  value={registeredCity}
                  onChange={(e) => {
                    setRegisteredCity(e.target.value);
                    setErrors((prev) => ({ ...prev, registeredCity: "" }));
                  }}
                  placeholder="City"
                  className={`w-full h-11 rounded-md px-4 outline-none transition
                    ${
                      errors.registeredCity
                        ? "border border-red-500"
                        : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                />

                {errors.registeredCity && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.registeredCity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PIN Code
                </label>

                <input
                  type="text"
                  maxLength={6}
                  value={registeredPin}
                  onChange={(e) => {
                    setRegisteredPin(e.target.value.replace(/\D/g, ""));
                    setErrors((prev) => ({ ...prev, registeredPin: "" }));
                  }}
                  placeholder="PIN Code"
                  className={`w-full h-11 rounded-md px-4 outline-none transition
                    ${
                      errors.registeredPin
                        ? "border border-red-500"
                        : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                />

                {errors.registeredPin && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.registeredPin}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Residential Address */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Residential Address
            </h3>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
                className="accent-blue-600"
              />
              Same as above
            </label>
          </div>

          {!sameAddress && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={residentialAddress}
                  onChange={(e) => {
                    setResidentialAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, residentialAddress: "" }));
                  }}
                  placeholder="Enter residential address"
                  className={`w-full rounded-md px-4 py-3 resize-none outline-none transition
                    ${
                      errors.residentialAddress
                        ? "border border-red-500"
                        : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                />

                {errors.residentialAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.residentialAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    value={residentialCity}
                    onChange={(e) => {
                      setResidentialCity(e.target.value);
                      setErrors((prev) => ({ ...prev, residentialCity: "" }));
                    }}
                    placeholder="City"
                    className={`w-full h-11 rounded-md px-4 outline-none transition
                    ${
                      errors.residentialCity
                        ? "border border-red-500"
                        : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  />

                  {errors.residentialCity && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.residentialCity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PIN Code
                  </label>

                  <input
                    type="text"
                    maxLength={6}
                    value={residentialPin}
                    onChange={(e) => {
                      setResidentialPin(e.target.value.replace(/\D/g, ""));
                      setErrors((prev) => ({ ...prev, residentialPin: "" }));
                    }}
                    placeholder="PIN Code"
                    className={`w-full h-11 rounded-md px-4 outline-none transition
                    ${
                      errors.residentialPin
                        ? "border border-red-500"
                        : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  />

                  {errors.residentialPin && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.residentialPin}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OTP */}

        <div className="pt-6">
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer"
            >
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  OTP ( sent on your register mobile number )
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter OTP"
                  className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <p
                className={`text-sm ${
                  otpExpired ? "text-red-500" : "text-slate-500"
                }`}
              >
                {otpExpired
                  ? "OTP has expired. Please resend OTP."
                  : `OTP expires in ${formatTime(timeLeft)}`}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="flex-1 h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer"
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-6 h-11 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 accent-blue-600" />

          <span>I agree to the Terms & Conditions and Privacy Policy.</span>
        </label>
      </div>
    </>
  );
};

export default ContactDetailsForm;
