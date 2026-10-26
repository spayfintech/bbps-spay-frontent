import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePost } from "../hooks/usePost";

import logo from "../images/spaylogo.png";
import LoginIllustration from "../images/hero.png";

import ContactDetailsForm from "../components/register/ContactDetailsForm";
import AadhaarForm from "../components/register/AadhaarForm";
import BankAccountForm from "../components/register/BankAccountForm";
import PanCardForm from "../components/register/PanCardForm";

const STORAGE_STEP = "merchant_onboarding_step";
const STORAGE_ID = "merchant_onboarding_id";
const STORAGE_DATA = "merchant_onboarding_data";

const RegisterUser = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { execute: regUser } = usePost("/register-new-merchant");

  const [loadingResume] = useState(false);
  const [error, setError] = useState("");

  const resumeFromLogin = location.state?.fromLogin === true;

  const steps = useMemo(
    () => [
      "Contact Details",
      "Identity Verification",
      "Bank Account",
      "Terms & Conditions",
    ],
    [],
  );

  const resumeStepFromState = Number(location.state?.currentStep || 0);
  const resumeStepFromStorage = Number(sessionStorage.getItem(STORAGE_STEP) || 0);

  const initialStep =
    resumeStepFromState >= 1 && resumeStepFromState <= 4
      ? resumeStepFromState
      : resumeStepFromStorage >= 1 && resumeStepFromStorage <= 4
        ? resumeStepFromStorage
        : 1;

  const [currentStep, setCurrentStep] = useState(initialStep);

  const [onboardingData, setOnboardingData] = useState(() => {
    try {
      if (location.state?.onboardingData) {
        sessionStorage.setItem(STORAGE_DATA, JSON.stringify(location.state.onboardingData));
        return location.state.onboardingData;
      }
      const stored = sessionStorage.getItem(STORAGE_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return location.state?.onboardingData || null;
    }
  });

  const [merchantOnboardingId, setMerchantOnboardingId] = useState(() => {
    const id = location.state?.merchantOnboardingId || sessionStorage.getItem(STORAGE_ID) || null;
    if (id) sessionStorage.setItem(STORAGE_ID, String(id));
    return id;
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_STEP, String(currentStep));
  }, [currentStep]);

  useEffect(() => {
    if (!onboardingData) return;
    sessionStorage.setItem(STORAGE_DATA, JSON.stringify(onboardingData));
  }, [onboardingData]);

  useEffect(() => {
    if (!merchantOnboardingId) return;
    sessionStorage.setItem(STORAGE_ID, String(merchantOnboardingId));
  }, [merchantOnboardingId]);

  const handleDataUpdate = (data) => {
    if (!data) return;
    setOnboardingData((previous) => ({
      ...(previous || {}),
      ...(data || {}),
    }));
  };

  const handleMerchantId = (id) => {
    if (!id) return;
    setMerchantOnboardingId(String(id));
    sessionStorage.setItem(STORAGE_ID, String(id));
  };

  const goToStep = (step) => {
    const safeStep = Math.min(4, Math.max(1, Number(step)));
    setCurrentStep(safeStep);
    sessionStorage.setItem(STORAGE_STEP, String(safeStep));
  };

  const handleNext = (data = null, merchantId = null) => {
    if (data) handleDataUpdate(data);
    if (merchantId) handleMerchantId(merchantId);
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setError("");

    try {
      const option = location.state?.option;
      const name = location.state?.name || onboardingData?.contact_name || "";
      const phone = location.state?.phone || onboardingData?.mobile || "";
      const email = location.state?.email || onboardingData?.email || "";

      if (option === "Organization") {
        const body = { name, mobile_no: phone, email };
        const res = await regUser(body);

        if (res?.registered) {
          navigate("/register-organization", {
            state: { name, phone, email, option },
          });
        }
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to complete registration.",
      );
    }
  };

  const shouldLockBackOnStep2 = resumeFromLogin && currentStep === 2;

  // 🔥 Determine if Step 1 is already verified based on landing step
  const isStep1PreVerified = initialStep > 1 || resumeStepFromStorage > 1 || onboardingData?.otp_verified === true;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      <div className="w-full lg:w-[45%] h-screen bg-white flex flex-col">
        <div className="px-10 pt-8 pb-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Spay Fintech" className="h-8 object-contain" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Spay Fintech</h2>
              <p className="text-xs text-slate-400">Merchant Onboarding</p>
            </div>
          </div>

          <div className="flex items-center">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const active = stepNumber <= currentStep;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        active
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 text-slate-400"
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <span
                      className={`mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] md:text-[11px] leading-tight text-center max-w-[55px] sm:max-w-[70px] ${
                        active ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>

                  {index !== steps.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-3 ${
                        stepNumber < currentStep ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 no-scrollbar">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loadingResume ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-slate-500">Loading your onboarding...</p>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <ContactDetailsForm
                  initialData={onboardingData}
                  merchantOnboardingId={merchantOnboardingId}
                  // 🔥 Pass explicit pre-verification flag
                  isPreVerified={isStep1PreVerified} 
                  onNext={(data, id) => handleNext(data, id)}
                  onDataUpdate={handleDataUpdate}
                  onMerchantId={handleMerchantId}
                />
              )}

              {currentStep === 2 && (
                <AadhaarForm
                  initialData={onboardingData}
                  merchantOnboardingId={merchantOnboardingId}
                  onBack={handleBack}
                  disableBack={shouldLockBackOnStep2}
                  onNext={(data, id) => handleNext(data, id)}
                  onDataUpdate={handleDataUpdate}
                  onMerchantId={handleMerchantId}
                />
              )}

              {currentStep === 3 && (
                <BankAccountForm
                  initialData={onboardingData}
                  merchantOnboardingId={merchantOnboardingId}
                  onBack={handleBack}
                  onNext={(data, id) => handleNext(data, id)}
                  onDataUpdate={handleDataUpdate}
                  onMerchantId={handleMerchantId}
                />
              )}

              {currentStep === 4 && (
                <PanCardForm
                  initialData={onboardingData}
                  merchantOnboardingId={merchantOnboardingId}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  onDataUpdate={handleDataUpdate}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[58%] bg-[#9FC5FF] items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C3D8FC] to-[#C3D8FC]" />
        <img src={LoginIllustration} alt="Login Illustration" className="relative z-10 w-[68%] max-h-[120vh] object-contain" />
      </div>
    </div>
  );
};

export default RegisterUser;