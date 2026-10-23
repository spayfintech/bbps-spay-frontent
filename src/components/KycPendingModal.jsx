import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, ShieldCheck, AlertTriangle } from "lucide-react";

const KycPendingModal = ({ open, status, remarks }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const isPending = Number(status) === 1;
  const isRejected = Number(status) === 3;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden">
        {/* Top Accent */}
        <div
          className={`h-1.5 ${
            isPending
              ? "bg-gradient-to-r from-blue-600 to-cyan-500"
              : "bg-gradient-to-r from-red-500 to-orange-500"
          }`}
        />

        <div className="p-8">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              isPending ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
            }`}
          >
            {isPending ? (
              <ShieldCheck size={30} />
            ) : (
              <AlertTriangle size={30} />
            )}
          </div>

          {/* Pending */}
          {isPending && (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">
                KYC Verification Pending
              </h2>

              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                Thank you for completing your merchant onboarding.
                <br />
                Your KYC documents have been submitted successfully and are
                currently under review.
              </p>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <Clock3 className="text-blue-600 mt-0.5" size={20} />

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Verification Timeline
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Our verification team usually completes the review within{" "}
                      <span className="font-semibold text-slate-900">
                        24 Hours
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-600">
                  Dashboard services will be available once your KYC has been
                  successfully verified.
                </p>
              </div>
            </>
          )}

          {/* Rejected */}
          {isRejected && (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">
                KYC Correction Required
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-slate-600">
                Your KYC application couldn't be approved at this stage. Please
                review the remarks below, update the required details, and
                submit your KYC again.
              </p>

              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-red-600" />

                  <h4 className="font-semibold text-red-700">
                    Reason for Rejection
                  </h4>
                </div>

                <p className="text-sm leading-6 text-slate-700">
                  {remarks || "No remarks provided."}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => navigate("/merchant/kyc")}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-all duration-200 cursor-pointer"
                >
                  Update KYC
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycPendingModal;
