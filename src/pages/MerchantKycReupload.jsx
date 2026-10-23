import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowLeft,
  UploadCloud,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

// Human-friendly labels for each document_key coming from backend
const DOC_META = {
  company_pan: { title: "Company PAN", type: "file" },
  gst_certificate: { title: "GST Certificate", type: "file" },
  cancelled_cheque: { title: "Cancelled Cheque", type: "file" },
  video_kyc: { title: "Video KYC", type: "vkyc" },
  director_pan: { title: "Director PAN", type: "digilocker" },
  director_aadhaar: { title: "Director Aadhaar", type: "digilocker" },
};

export default function MerchantKycReupload() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, fetchProfile } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vkycLoading, setVkycLoading] = useState(false);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  const token = localStorage.getItem("token");

  const fetchDocuments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/merchant-kyc-documents/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Failed to load KYC documents");
        return;
      }

      setDocuments(result?.data || []);
    } catch (err) {
      toast.error("Network error while loading documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getDoc = (key) => documents.find((d) => d.document_key === key);
  const getStatus = (key) => Number(getDoc(key)?.status ?? 0); // 0 pending, 1 approved, 2 rejected

  const rejectedDocs = Object.keys(DOC_META).filter(
    (key) => getStatus(key) === 2,
  );

  const stats = {
    total: Object.keys(DOC_META).length,
    approved: Object.keys(DOC_META).filter((k) => getStatus(k) === 1).length,
    rejected: rejectedDocs.length,
  };

  const progress =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const handleBackToLogin = () => {
    logout();
    navigate("/", { replace: true });
  };

  // ─────────────────────────────
  // File-based document reupload (PAN / GST / Cancel Cheque)
  // ─────────────────────────────
  const handleFileReupload = async (documentKey, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setUploadingKey(documentKey);

      const formData = new FormData();
      formData.append("merchant_onboarding_id", user.id);
      formData.append("document_key", documentKey);
      formData.append("document", file);

      const res = await fetch(`${BASE_URL}/merchant/reupload/document`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Failed to upload document");
        return;
      }

      toast.success(result?.message || "Document uploaded for review");
      await fetchDocuments();
      await fetchProfile(); // refresh kyc/pre_kyc/kyc_rejected flags
    } catch (err) {
      toast.error("Network error while uploading document");
    } finally {
      setUploadingKey(null);
    }
  };

  // ─────────────────────────────
  // Video KYC redo
  // ─────────────────────────────
  const startVideoKycRedo = async () => {
    setVkycLoading(true);

    try {
      const res = await fetch("https://uatfintech.spay.live/api/vkyc/session", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to generate VKYC link");
        return;
      }

      const sessionId = data?.data?.session_id;
      const link = data?.data?.link;

      if (!link) {
        toast.error("VKYC link not received");
        return;
      }

      const popup = window.open(
        link,
        "VideoKYC",
        "width=900,height=700,resizable=yes,scrollbars=yes",
      );

      if (!popup) {
        toast.error("Please allow popups.");
        return;
      }

      let verified = false;
      let statusInterval = null;
      let closeWatcher = null;

      const checkStatus = async () => {
        try {
          const statusRes = await fetch(
            `https://uatfintech.spay.live/api/vkyc/${sessionId}/status`,
            { headers: { Accept: "application/json" } },
          );
          const statusData = await statusRes.json();
          const status =
            statusData?.data?.session_status || statusData?.data?.status;

          if (["uploaded", "verified", "completed"].includes(status)) {
            verified = true;
            clearInterval(statusInterval);
            clearInterval(closeWatcher);
            if (!popup.closed) popup.close();

            // Finalize on backend
            const finalizeRes = await fetch(
              `${BASE_URL}/merchant/reupload/video-kyc`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  merchant_onboarding_id: user.id,
                  video_session_id: sessionId,
                }),
              },
            );

            const finalizeResult = await finalizeRes.json();

            if (finalizeRes.ok) {
              toast.success(
                finalizeResult?.message || "Video KYC submitted for review",
              );
              await fetchDocuments();
              await fetchProfile();
            } else {
              toast.error(
                finalizeResult?.message || "Failed to submit Video KYC",
              );
            }
          }
        } catch (e) {
          // keep polling silently
        }
      };

      const pollDelay = setTimeout(() => {
        statusInterval = setInterval(checkStatus, 3000);
      }, 15000);

      closeWatcher = setInterval(() => {
        if (popup.closed && !verified) {
          clearInterval(closeWatcher);
          clearInterval(statusInterval);
          clearTimeout(pollDelay);
          toast.info("Video KYC window closed before verification completed.");
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(statusInterval);
        clearInterval(closeWatcher);
        if (!verified) toast.info("Video KYC verification timed out.");
      }, 180000);
    } catch (err) {
      toast.error("Network error while generating VKYC link");
    } finally {
      setVkycLoading(false);
    }
  };

  // ─────────────────────────────
  // Director PAN + Aadhaar redo (DigiLocker)
  // ─────────────────────────────
  const startDigilockerRedo = async () => {
    setDigilockerLoading(true);

    try {
      const res = await fetch(
        "https://uatfintech.spay.live/api/digilocker/init-aadhaar-pan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to start DigiLocker");
        return;
      }

      const sdkUrl = data?.data?.sdk_url;
      const requestId = data?.data?.request_id;

      const popup = window.open(
        sdkUrl,
        "Digilocker",
        "width=900,height=700,resizable=yes,scrollbars=yes",
      );

      if (!popup) {
        toast.error("Please allow popups.");
        return;
      }

      const timer = setInterval(async () => {
        if (popup.closed) {
          clearInterval(timer);
          toast.info("Fetching DigiLocker documents...");

          try {
            const fetchRes = await fetch(
              "https://uatfintech.spay.live/api/digilocker/fetch-documents",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request_id: requestId }),
              },
            );

            const fetchData = await fetchRes.json();

            if (!fetchRes.ok) {
              toast.error(
                fetchData?.message || "Failed to fetch DigiLocker documents",
              );
              return;
            }

            const aadhaarNumber = fetchData?.data?.aadhaar?.aadhaar_data?.uid;
            const panNumber = fetchData?.data?.pan?.pancard_data?.pan_number;

            const finalizeRes = await fetch(
              `${BASE_URL}/merchant/reupload/digilocker`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  merchant_onboarding_id: user.id,
                  digilocker_request_id: requestId,
                  aadhaar_number: aadhaarNumber,
                  pan_number: panNumber,
                }),
              },
            );

            const finalizeResult = await finalizeRes.json();

            if (finalizeRes.ok) {
              toast.success(
                finalizeResult?.message ||
                  "Director documents submitted for review",
              );
              await fetchDocuments();
              await fetchProfile();
            } else {
              toast.error(
                finalizeResult?.message || "Failed to submit documents",
              );
            }
          } catch (e) {
            toast.error("Network error while fetching DigiLocker documents");
          } finally {
            setDigilockerLoading(false);
          }
        }
      }, 1000);
    } catch (err) {
      toast.error("Unable to start DigiLocker");
      setDigilockerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading your KYC status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Merchant KYC Update
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Update only the rejected items below. Approved items don't need
                to be re-submitted.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">
              <XCircle size={17} />
              KYC Rejected
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <ShieldCheck size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">
                  Verification Progress
                </h2>
                <p className="text-xs text-slate-500">
                  Complete the remaining corrections to activate your account.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Progress
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.approved}
                </h3>
                <p className="text-sm text-slate-500">Verified</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </h3>
                <p className="text-sm text-slate-500">Need Correction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejected items */}
        <div className="mt-8">
          {rejectedDocs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {rejectedDocs.map((key) => {
                const doc = getDoc(key);
                const meta = DOC_META[key];

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={18} className="text-red-600" />
                      <h4 className="font-semibold text-slate-900">
                        {meta.title}
                      </h4>
                    </div>

                    <div className="rounded-xl bg-red-50 border border-red-100 p-3 mb-4">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Reason for rejection
                      </p>
                      <p className="text-sm text-slate-700">
                        {doc?.remarks || "No remarks provided."}
                      </p>
                    </div>

                    {meta.type === "file" && (
                      <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:bg-slate-100 transition">
                        <UploadCloud size={18} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-600">
                          {uploadingKey === key
                            ? "Uploading..."
                            : "Upload new PDF"}
                        </span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          disabled={uploadingKey === key}
                          onChange={(e) =>
                            handleFileReupload(key, e.target.files?.[0])
                          }
                        />
                      </label>
                    )}

                    {meta.type === "vkyc" && (
                      <button
                        onClick={startVideoKycRedo}
                        disabled={vkycLoading}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                          vkycLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {vkycLoading ? "Generating link..." : "Redo Video KYC"}
                      </button>
                    )}

                    {meta.type === "digilocker" && (
                      <button
                        onClick={startDigilockerRedo}
                        disabled={digilockerLoading}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                          digilockerLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {digilockerLoading
                          ? "Opening DigiLocker..."
                          : "Verify via DigiLocker"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 flex items-start gap-3">
              <Clock3 className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  All requested documents have been submitted.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Our verification team is reviewing your updated KYC. Please
                  wait for approval.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-start">
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
