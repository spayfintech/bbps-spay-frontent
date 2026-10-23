import { useEffect, useState } from "react";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Image,
  FileArchive,
} from "lucide-react";

export default function MerchantOnboardingDetails() {
  const navigate = useNavigate();

  const { id } = useParams();
  const { data, loading, error, refetch } = useGet(
    "/admin/merchant-onboarding",
  );

  const { execute: approveMerchant, loading: approving } = usePost(
    "/admin/merchant-onboarding/approve",
  );

  const { execute: rejectMerchant, loading: rejecting } = usePost(
    "/admin/merchant-onboarding/reject",
  );

  const { execute: approveDocument } = usePost(
    "/admin/merchant-onboarding/document-approve",
  );

  const { execute: rejectDocument } = usePost(
    "/admin/merchant-onboarding/document-reject",
  );

  const STORAGE_URL =
    "https://dashboardbbps.spay.live/laravel_project/storage/app/public/";

  const [merchant, setMerchant] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [remarks, setRemarks] = useState("");

  const verificationDocuments = [
    {
      title: "PAN Card",
      key: "pan",
    },
    {
      title: "Aadhaar",
      key: "aadhaar",
    },
    {
      title: "Cancelled Cheque",
      key: "cancelled_cheque",
    },
    {
      title: "Shop Front",
      key: "shop_front",
    },
    {
      title: "Shop Inside",
      key: "shop_inside",
    },
    {
      title: "Video KYC",
      key: "video_kyc",
    },
  ];

  useEffect(() => {
    if (id) {
      refetch(id);
    }
  }, [id]);

  useEffect(() => {
    if (!data?.data) return;

    const merchantData = data.data;

    setMerchant(merchantData);

    setDocuments([
      {
        title: "Shop Front",
        file: merchantData.merchant?.shop_front_image,
        type: "image",
      },
      {
        title: "Shop Inside",
        file: merchantData.merchant?.shop_inside_image,
        type: "image",
      },
      {
        title: "Video KYC",
        file: merchantData.video_kyc?.video_path,
        type: "video",
      },
      {
        title: "Aadhaar",
        file: merchantData.aadhaar?.photo_base64,
        type: "aadhaar",
      },
      {
        title: "Cancelled Cheque",
        file: merchantData.merchant?.cancelled_cheque,
        type: "image",
      },
    ]);
  }, [data]);

  const handleApprove = async () => {
    try {
      const response = await approveMerchant({
        merchant_onboarding_id: merchant?.merchant?.id,
      });

      if (response?.status === "success") {
        toast.success(response.message);
        refetch(id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter rejection remarks.");
      return;
    }

    try {
      const response = await rejectMerchant({
        merchant_onboarding_id: merchant?.merchant?.id,
        remarks,
      });

      if (response?.status === "success") {
        toast.error(response.message);
        refetch(id);
        navigate("/merchant-onboarding");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDocumentApprove = async (documentKey) => {
    try {
      const res = await approveDocument({
        merchant_onboarding_id: merchant.merchant.id,
        document_key: documentKey,
      });

      toast.success(res.message);

      refetch(id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDocumentReject = async (documentKey) => {
    if (!remarks.trim()) {
      toast.error("Enter remarks first");
      return;
    }

    try {
      const res = await rejectDocument({
        merchant_onboarding_id: merchant.merchant.id,
        document_key: documentKey,
        remarks,
      });

      toast.success(res.message);

      refetch(id);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}

      <div className="mb-6 flex items-start justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-blue-600 font-medium">
              Merchant Onboarding
            </span>

            <span>/</span>

            <span>{merchant?.merchant?.id}</span>
          </div>

          {/* Heading */}

          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900">
              Merchant Onboarding Details
            </h1>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {merchant?.merchant?.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Review and verify merchant onboarding request.
          </p>
        </div>

        {/* Buttons */}

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            py-3
            text-sm
            font-medium
            shadow-sm
            hover:bg-slate-50
          "
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleReject}
            disabled={rejecting}
            className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-3
            text-sm
            font-medium
            text-red-600
            hover:bg-red-100
            cursor-pointer
          "
          >
            <XCircle size={16} />
            {rejecting ? "Rejecting..." : "Reject"}
          </button>

          <button
            onClick={handleApprove}
            disabled={approving}
            className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-5
            py-3
            text-sm
            font-medium
            text-green-700
            hover:bg-green-100
            cursor-pointer
          "
          >
            <CheckCircle2 size={16} />
            {approving ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>

      {/* Main Grid */}

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="col-span-12 xl:col-span-8">
            {/* Merchant Information */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Card Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 pb-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-[15px] font-semibold text-slate-800">
                    Merchant Information
                  </h2>
                </div>

                <span className="rounded-md bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  10/10 Completed
                </span>
              </div>

              {/* Information */}
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Business Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <InfoRow
                        label="Business Name"
                        value={merchant?.merchant?.contact_name}
                      />

                      <InfoRow
                        label="Business Type"
                        value={merchant?.merchant?.business_type}
                      />

                      <InfoRow
                        label="Mobile Number"
                        value={merchant?.merchant?.mobile}
                      />

                      <InfoRow
                        label="Email Address"
                        value={merchant?.merchant?.email}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        KYC Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <InfoRow
                        label="PAN Number"
                        value={merchant?.merchant?.pan_number}
                      />

                      <InfoRow
                        label="Aadhaar Number"
                        value={merchant?.merchant?.aadhaar_number}
                      />

                      <InfoRow
                        label="GST Number"
                        value={merchant?.merchant?.gst_number || "N/A"}
                      />

                      <InfoRow
                        label="Agreement"
                        value={
                          merchant?.merchant?.agreement ? "Accepted" : "Pending"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Bank Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <InfoRow
                        label="Account Holder"
                        value={merchant?.merchant?.account_holder_name}
                      />

                      <InfoRow
                        label="Bank Name"
                        value={merchant?.merchant?.bank_name}
                      />

                      <InfoRow
                        label="Account Number"
                        value={merchant?.merchant?.account_number}
                      />

                      <InfoRow
                        label="IFSC Code"
                        value={merchant?.merchant?.ifsc}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Timeline & Verification
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <InfoRow
                        label="Submitted At"
                        value={
                          merchant?.merchant?.submitted_at
                            ? new Date(
                                merchant.merchant.submitted_at,
                              ).toLocaleString("en-GB")
                            : "-"
                        }
                      />

                      <InfoRow
                        label="Verified At"
                        // value={merchant?.merchant?.verified_at || "Pending"}
                        value={
                          merchant?.merchant?.verified_at
                            ? new Date(
                                merchant.merchant.verified_at,
                              ).toLocaleString("en-GB")
                            : "-"
                        }
                      />

                      <InfoRow
                        label="Status"
                        value={merchant?.merchant?.status}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>

                    <h3 className="text-sm font-semibold text-slate-800">
                      Address Information
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Registered Address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {merchant?.merchant?.registered_address}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Residential Address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {merchant?.merchant?.residential_address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Submitted */}
          <div className="col-span-12 xl:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <FileText size={16} className="text-blue-600" />
                  </div>

                  <h2 className="text-[15px] font-semibold text-slate-800">
                    Documents Submitted
                  </h2>
                </div>

                <button
                  className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-blue-600
                  hover:bg-blue-50
                  "
                >
                  View All
                </button>
              </div>

              {/* Documents */}

              <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4 xl:grid-cols-4">
                {documents.map((doc) => (
                  <div
                    key={doc.title}
                    className="rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-lg"
                  >
                    {/* Preview */}
                    <div
                      onClick={() => {
                        setSelectedDocument(doc);
                        setPreviewOpen(true);
                      }}
                      className="flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-100"
                    >
                      {doc.type === "image" && doc.file && (
                        <img
                          src={`${STORAGE_URL}${doc.file}`}
                          alt={doc.title}
                          className="h-full w-full object-cover transition hover:scale-105"
                        />
                      )}

                      {doc.type === "aadhaar" && doc.file && (
                        <img
                          src={`data:image/jpeg;base64,${doc.file}`}
                          alt={doc.title}
                          className="h-full w-full object-cover transition hover:scale-105"
                        />
                      )}

                      {doc.type === "video" && doc.file && (
                        <video className="h-full w-full object-cover" muted>
                          <source src={`${STORAGE_URL}${doc.file}`} />
                        </video>
                      )}
                    </div>

                    <h4 className="mt-3 text-sm font-semibold">{doc.title}</h4>

                    <button
                      onClick={() => {
                        const url =
                          doc.type === "aadhaar"
                            ? `data:image/jpeg;base64,${doc.file}`
                            : `${STORAGE_URL}${doc.file}`;

                        const a = document.createElement("a");
                        a.href = url;
                        a.download = doc.title;
                        a.click();
                      }}
                      className="
                        mt-3
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-blue-600
                        py-2
                        text-xs
                        font-medium
                        text-white
                        hover:bg-blue-700
                      "
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="sticky top-6 flex flex-col gap-4">
            {/* Verification */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-800">
                  Verification Status
                </h2>
              </div>

              {/* Body */}

              <div className="grid grid-cols-2 gap-2 p-4">
                {verificationDocuments.map((item) => {
                  const document = merchant?.documents?.find(
                    (doc) => doc.document_key === item.key,
                  );

                  const status = Number(document?.status);

                  return (
                    <div
                      key={item.key}
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-slate-100
                        bg-slate-50
                        px-3
                        py-2
                      "
                    >
                      <span className="truncate text-[11px] font-medium text-slate-700">
                        {item.title}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDocumentApprove(item.key)}
                          disabled={status === 1}
                          className={`${
                            status === 1
                              ? "text-green-600"
                              : "text-slate-400 hover:text-green-600"
                          }`}
                        >
                          <CheckCircle2 size={18} />
                        </button>

                        <button
                          onClick={() => handleDocumentReject(item.key)}
                          disabled={status === 2}
                          className={`${
                            status === 2
                              ? "text-red-600"
                              : "text-slate-400 hover:text-red-600"
                          }`}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Internal Review */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-[15px] font-semibold text-slate-800">
                  Internal Remark
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review comments before approval.
                </p>
              </div>

              <div className="p-5">
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter review remarks..."
                  className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      p-4
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                      "
                />
              </div>
            </div>

            {/* Admin Actions */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3"
                      />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </div>

                  <h2 className="text-[15px] font-semibold text-slate-800">
                    Admin Actions
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Take action on this merchant application.
                </p>
              </div>

              <div className="space-y-4 p-5">
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-green-50
                    py-3
                    text-sm
                    font-medium
                    text-green-700
                    transition
                    hover:bg-green-100
                    cursor-pointer
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {approving ? "Approving..." : "Approve Merchant"}
                </button>

                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-50
                    py-3
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-100
                    cursor-pointer
                    "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {rejecting ? "Rejecting..." : "Reject Merchant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewOpen && selectedDocument && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            p-6
          "
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="
              relative
              max-h-[90vh]
              w-full
              max-w-5xl
              rounded-2xl
              bg-white
              p-5
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedDocument.title}
              </h2>

              <button
                onClick={() => setPreviewOpen(false)}
                className="text-3xl text-slate-500 hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* Preview */}

            <div className="flex max-h-[70vh] items-center justify-center overflow-auto">
              {selectedDocument.type === "image" && (
                <img
                  src={`${STORAGE_URL}${selectedDocument.file}`}
                  className="max-h-[70vh] rounded-xl"
                />
              )}

              {selectedDocument.type === "aadhaar" && (
                <img
                  src={`data:image/jpeg;base64,${selectedDocument.file}`}
                  className="max-h-[70vh] rounded-xl"
                />
              )}

              {selectedDocument.type === "video" && (
                <video controls autoPlay className="max-h-[70vh] rounded-xl">
                  <source src={`${STORAGE_URL}${selectedDocument.file}`} />
                </video>
              )}
            </div>

            {/* Footer */}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => {
                  const url =
                    selectedDocument.type === "aadhaar"
                      ? `data:image/jpeg;base64,${selectedDocument.file}`
                      : `${STORAGE_URL}${selectedDocument.file}`;

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = selectedDocument.title;
                  a.click();
                }}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  text-white
                  hover:bg-blue-700
                "
              >
                <Download size={17} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-3 last:border-none last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="max-w-[60%] text-right text-sm text-slate-800 break-words">
        {value || "-"}
      </span>
    </div>
  );
}
