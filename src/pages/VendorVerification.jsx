import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { usePost } from "../hooks/usePost";

const VendorVerification = () => {
  const [searchParams] = useSearchParams();
  const [resendTimer, setResendTimer] = useState(0);
  const token = searchParams.get("token");

  const { execute: sendOtp, loading: otpLoading } = usePost(
    "/beneficiary/send-verification-otp",
  );

  const { execute: verifyOtp, loading: verifyLoading } = usePost(
    "/beneficiary/verify-otp",
  );

  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);

  // --------------------------------------------------
  // FETCH BENEFICIARY
  // --------------------------------------------------

  useEffect(() => {
    const fetchBeneficiary = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/beneficiary/verify/${token}`,
        );

        if (response.data?.status) {
          setBeneficiary(response.data.data);
        }
      } catch (error) {
        console.log("Verification API Error:", error);

        // Temporary:
        // Don't show invalid-link screen while designing.
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBeneficiary();
    }
  }, [token]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  // --------------------------------------------------
  // SEND OTP
  // --------------------------------------------------

  const handleSendOtp = async () => {
    if (!beneficiary?.id) {
      toast.error("Beneficiary details not found.");
      return;
    }

    if (!token) {
      toast.error("Verification token is missing.");
      return;
    }

    const response = await sendOtp({
      beneficiary_id: beneficiary.id,
      token: token,
    });

    if (response?.status) {
      setOtpSent(true);
      setOtp("");
      setResendTimer(30);

      toast.success(response.message || "OTP sent successfully.");
    } else {
      toast.error(
        response?.message || response?.error || "Failed to send OTP.",
      );
    }
  };

  // --------------------------------------------------
  // VERIFY OTP
  // --------------------------------------------------
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!beneficiary?.id || !token) {
      toast.error("Verification details are missing.");
      return;
    }

    const response = await verifyOtp({
      beneficiary_id: beneficiary.id,
      token: token,
      otp: otp,
    });

    if (response?.status) {
      setVerified(true);

      toast.success(response.message || "Beneficiary verified successfully.");
    } else {
      toast.error(response?.message || response?.error || "Invalid OTP.");
    }
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#DBEAFE] border-t-[#2563EB]" />

          <p className="mt-4 text-sm text-[#64748B]">Loading verification...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------

  if (verified) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 flex items-center justify-center">
        <div className="w-full max-w-[430px]">
          {/* Brand */}
          <div className="mb-7 text-center">
            <h2 className="text-xl font-bold tracking-tight text-[#1E3A8A]">
              Spay Fintech
            </h2>

            <p className="mt-1 text-xs text-[#64748B]">Secure Verification</p>
          </div>

          {/* Success Card */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#2563EB]"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-semibold text-[#0F172A]">
              Verification Successful
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Your beneficiary details have been successfully verified.
            </p>

            <div className="mt-7 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-4">
              <p className="text-xs text-[#64748B]">Beneficiary</p>

              <p className="mt-1 text-sm font-semibold text-[#1E3A8A]">
                {beneficiary?.beneficiary_name || "Verified"}
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-5 text-[#94A3B8]">
            Your information has been securely verified.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN VERIFICATION PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[430px]">
        {/* --------------------------------------------------
            BRAND
        -------------------------------------------------- */}

        <div className="mb-7 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1E3A8A]">
            Spay Fintech
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">Secure Verification</p>
        </div>

        {/* --------------------------------------------------
            MAIN CARD
        -------------------------------------------------- */}

        <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-sm">
          {/* --------------------------------------------------
              HEADER
          -------------------------------------------------- */}

          <div className="px-5 pb-5 pt-6 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#2563EB]"
                >
                  <path d="M3 10h18" />
                  <path d="M5 10v9h14v-9" />
                  <path d="M3 10l2-6h14l2 6" />
                  <path d="M8 14h8" />
                </svg>
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[#0F172A]">
                  Vendor Verification
                </h1>

                <p className="mt-0.5 text-xs text-[#64748B]">
                  Confirm your beneficiary details
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------
              BENEFICIARY DETAILS
          -------------------------------------------------- */}

          <div className="border-t border-[#E2E8F0] px-5 py-5 sm:px-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">
              Beneficiary Details
            </p>

            <div className="space-y-4">
              <Detail
                label="Name"
                value={beneficiary?.beneficiary_name || "—"}
              />

              <Detail
                label="Mobile"
                value={beneficiary?.beneficiary_mobile_no || "—"}
              />

              <Detail
                label="Account Number"
                value={beneficiary?.account_no || "—"}
              />

              <Detail label="IFSC Code" value={beneficiary?.ifsc_code || "—"} />

              <Detail
                label="Account Type"
                value={beneficiary?.account_type || "—"}
              />
            </div>
          </div>

          {/* --------------------------------------------------
              VERIFICATION SECTION
          -------------------------------------------------- */}

          <div className="border-t border-[#E2E8F0] px-5 pb-6 pt-5 sm:px-6">
            {/* BEFORE OTP */}
            {!otpSent ? (
              <>
                <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="text-[#2563EB]"
                      >
                        <circle cx="12" cy="12" r="9" />

                        <path d="M12 10v6" />
                        <path d="M12 7h.01" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#1E3A8A]">
                        Verify your mobile number
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#64748B]">
                        We will send a one-time password to your registered
                        mobile number.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="mt-4 w-full rounded-2xl bg-[#2563EB] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            ) : (
              /* AFTER OTP */
              <>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Enter OTP
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#64748B]">
                    Enter the 6-digit OTP sent to your registered mobile number.
                  </p>
                </div>

                {/* OTP INPUT */}

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="mt-4 w-full rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-4 text-center text-xl font-semibold tracking-[0.45em] text-[#0F172A] outline-none transition placeholder:text-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#DBEAFE]"
                />

                {/* VERIFY */}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading || otp.length !== 6}
                  className="mt-4 w-full rounded-2xl bg-[#2563EB] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyLoading ? "Verifying..." : "Verify & Confirm"}
                </button>

                {/* RESEND */}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || resendTimer > 0}
                  className="mt-4 w-full py-2 text-xs font-medium text-[#64748B] transition hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {otpLoading
                    ? "Sending..."
                    : resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Didn't receive OTP? Resend"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* --------------------------------------------------
            FOOTER
        -------------------------------------------------- */}

        <div className="mt-6 flex items-center justify-center gap-2">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#94A3B8]"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />

            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>

          <p className="text-[11px] text-[#94A3B8]">
            Securely processed by Spay Fintech
          </p>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// DETAIL COMPONENT
// --------------------------------------------------

const Detail = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-5">
      <p className="shrink-0 text-xs text-[#64748B]">{label}</p>

      <p className="text-right text-sm font-medium text-[#0F172A] break-all">
        {value}
      </p>
    </div>
  );
};

export default VendorVerification;
