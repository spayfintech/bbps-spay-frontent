import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../hooks/usePost";

import logo from "../images/spaylogo.png";
import LoginIllustration from "../images/hero.png";

import ContactDetailsForm from "../components/register/ContactDetailsForm";
import AadhaarForm from "../components/register/AadhaarForm";
import BankAccountForm from "../components/register/BankAccountForm";
import PanCardForm from "../components/register/PanCardForm";

const RegisterUser = () => {
  const navigate = useNavigate();

  /* ---------------- API ---------------- */
  const { execute: regUser, loading: regLoading } = usePost(
    "/register-new-merchant",
  );

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneVerified) return setError("Verify phone number");
    if (!emailVerified) return setError("Verify email address");
    if (password !== confirmPassword) return setError("Passwords do not match");

    if (option === "Organization") {
      try {
        const body = { name, mobile_no: phone, email, password };
        const res = await regUser(body);

        if (res?.registered) {
          // navigate();
          navigate("/register-organization", {
            state: { name, phone, email, option },
          });
        }
      } catch (err) {
        setError(err?.message || "Registration failed");
      }
    } else {
      navigate("/register-user", {
        state: { name, phone, email, option },
      });
    }
  };

  const steps = [
    "Contact Details",
    "Identity Verification",
    "Bank Account",
    "Terms & Conditions",
  ];

  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-[45%] h-screen bg-white flex flex-col">
        {/* Fixed Header */}
        <div className="px-10 pt-8 pb-6 border-b border-slate-200 bg-white">
          {/* <div className="px-4 sm:px-6 md:px-10 pt-5 sm:pt-6 md:pt-8 pb-4 sm:pb-5 md:pb-6 border-b border-slate-200 bg-white"> */}
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Spay Fintech" className="h-8 object-contain" />

            <div>
              <h2 className="text-sm font-bold text-slate-900">Spay Fintech</h2>

              <p className="text-xs text-slate-400">Merchant Onboarding</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
              ${
                index + 1 <= currentStep
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 text-slate-400"
              }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] md:text-[11px] leading-tight text-center max-w-[55px] sm:max-w-[70px]
              ${index + 1 <= currentStep ? "text-blue-600" : "text-slate-400"}`}
                  >
                    {step}
                  </span>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-3
              ${index + 1 < currentStep ? "bg-blue-600" : "bg-slate-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-10 py-8 no-scrollbar">
          {currentStep === 1 && (
            <ContactDetailsForm onNext={() => setCurrentStep(2)} />
          )}

          {currentStep === 2 && (
            <AadhaarForm
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <BankAccountForm
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <PanCardForm
              onBack={() => setCurrentStep(3)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden lg:flex lg:w-[58%] bg-[#9FC5FF] items-center justify-center relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C3D8FC] to-[#C3D8FC]" />
        {/* Illustration */}
        <img
          src={LoginIllustration}
          alt="Login Illustration"
          className="relative z-10 w-[68%] max-h-[120vh] object-contain"
        />
      </div>
    </div>
  );
};

export default RegisterUser;
