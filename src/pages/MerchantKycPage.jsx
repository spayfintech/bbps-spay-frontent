import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import VerificationDocumentCard from "../components/MerchantOnboarding/VerificationDocumentCard";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

export default function MerchantKycPage() {
  const STORAGE_URL =
    "https://dashboardbbps.spay.live/laravel_project/storage/app/public/";

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [cookie] = useCookies(["token", "user"]);

  const { execute: createVideoSession } = usePost("/vkyc/session");

  const { execute: reuploadVideoKyc } = usePost("/merchant/reupload/video-kyc");

  const { execute: reuploadDigilocker } = usePost(
    "/merchant/reupload/digilocker",
  );

  const { execute: reuploadDocument } = usePost("/merchant/reupload/document");

  const { data, loading, refetch } = useGet("/merchant/kyc");

  const documents = data?.documents || [];

  const stats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === 1).length,
    rejected: documents.filter((d) => d.status === 2).length,
    pending: documents.filter((d) => d.status === 0).length,
  };

  const rejectedDocuments = documents
    .filter((doc) => doc.status === 2)
    .map((doc) => ({
      id: doc.id,
      title: doc.document_name,
      reason: doc.remarks,
      accepted: doc.accepted,
      action: doc.action,
      preview: doc.preview,
      document_key: doc.document_key,
    }));

  const progress =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const startVideoKycForCorrection = async () => {
    try {
      const merchantId = data?.merchant?.id;

      if (!merchantId) {
        toast.error("Merchant not found.");
        return;
      }

      const res = await createVideoSession({
        user_id: cookie.user.id,
        merchant_onboarding_id: merchantId,
      });

      if (res.status !== "success") {
        toast.error(res.message);
        return;
      }

      const session = res.data;

      const popup = window.open(
        session.link,
        "VideoKYC",
        "width=900,height=700",
      );

      if (!popup) {
        toast.error("Please allow popup.");
        return;
      }

      let completed = false;

      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/vkyc/${session.session_id}/status`,
            {
              headers: {
                Authorization: `Bearer ${cookie.token}`,
                Accept: "application/json",
              },
            },
          );

          if (response.data.data.session_status === "uploaded") {
            completed = true;

            clearInterval(interval);

            if (!popup.closed) {
              popup.close();
            }

            const result = await reuploadVideoKyc({
              merchant_onboarding_id: merchantId,
              video_session_id: session.session_id,
            });

            if (result?.status === "success") {
              toast.success(result.message);
              await refetch();
            } else {
              toast.error(result?.message || "Failed to submit Video KYC.");
            }
          }
        } catch (e) {}
      }, 2000);

      setTimeout(() => {
        clearInterval(interval);

        if (!completed) {
          toast.info("Video KYC not completed.");
        }
      }, 180000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const startDigilockerForCorrection = async () => {
    try {
      const merchantId = data?.merchant?.id;

      if (!merchantId) {
        toast.error("Merchant not found.");
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/digilocker/init-aadhaar-pan`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
            Accept: "application/json",
          },
        },
      );

      const sdkUrl = res.data.data.sdk_url;
      const requestId = res.data.data.request_id;

      const popup = window.open(sdkUrl, "Digilocker", "width=900,height=700");

      if (!popup) {
        toast.error("Please allow popup.");
        return;
      }

      const timer = setInterval(async () => {
        if (popup.closed) {
          clearInterval(timer);

          toast.info("Fetching DigiLocker documents...");

          setTimeout(() => {
            fetchDigilockerDocuments(merchantId, requestId);
          }, 2000);
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start DigiLocker.");
    }
  };

  const fetchDigilockerDocuments = async (merchantId, requestId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/digilocker/fetch-documents`,
        {
          request_id: requestId,
        },
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
            Accept: "application/json",
          },
        },
      );

      const result = await reuploadDigilocker({
        merchant_onboarding_id: merchantId,

        digilocker_request_id: requestId,

        aadhaar_number: res.data.data.aadhaar?.aadhaar_data?.uid,

        pan_number: res.data.data.pan?.pancard_data?.pan_number,
      });

      if (result.status === "success") {
        toast.success(result.message);

        await refetch();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to fetch DigiLocker documents.",
      );
    }
  };

  const replaceRejectedDocument = async (documentKey, file) => {
    try {
      const merchantId = data?.merchant?.id;

      if (!merchantId) {
        toast.error("Merchant not found.");

        return;
      }

      const formData = new FormData();

      formData.append("merchant_onboarding_id", merchantId);

      formData.append("document_key", documentKey);

      formData.append("document", file);

      const result = await reuploadDocument(formData);

      if (result?.status === "success") {
        toast.success(result.message);

        await refetch();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* ===========================
            HEADER
        ============================ */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-blue-600">Dashboard</span>

                <span>/</span>

                <span>Merchant KYC</span>
              </div>

              <h1 className="text-3xl font-bold text-slate-900">
                Merchant KYC Update
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Update only the rejected documents below to complete your
                merchant verification. Approved documents don't need to be
                uploaded again.
              </p>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">
                <XCircle size={17} />
                KYC Rejected
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <ShieldCheck size={18} className="text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  Merchant Verification Progress
                </h2>

                <p className="text-xs text-slate-500">
                  Complete the remaining corrections to activate your merchant
                  account.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Verification Progress
              </span>

              <span className="text-sm font-semibold text-blue-600">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.approved}
                </h3>

                <p className="text-sm text-slate-500">Documents Verified</p>
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

        <div className="mt-6 overflow-hidden rounded-2xl border border-red-200 bg-red-50"></div>

        {/* =======================================================
            DOCUMENTS REQUIRING CORRECTION
        ======================================================= */}
        <div className="mt-8">
          {/* Cards */}

          {rejectedDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {rejectedDocuments.map((doc) => (
                <VerificationDocumentCard
                  key={doc.id}
                  doc={doc}
                  onStartVideo={startVideoKycForCorrection}
                  onStartDigilocker={startDigilockerForCorrection}
                  onReplaceDocument={replaceRejectedDocument}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
              <p className="text-sm font-medium text-blue-800">
                ✅ All requested documents have been submitted successfully.
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Your KYC correction has been received. Our verification team is
                reviewing your documents. Please wait for approval.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
