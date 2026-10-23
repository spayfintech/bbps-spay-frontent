import { useState } from "react";
import { AlertTriangle, Eye, Upload, FileText, XCircle } from "lucide-react";

export default function VerificationDocumentCard({
  doc,
  onStartVideo,
  onStartDigilocker,
  onReplaceDocument,
}) {
  const STORAGE_URL =
    "https://dashboardbbps.spay.live/laravel_project/storage/app/public/";

  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <FileText className="text-red-600" size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">{doc.title}</h3>

            <p className="mt-1 text-sm text-slate-500">
              Requires correction before verification.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
          <XCircle size={14} />
          Rejected
        </span>
      </div>

      {/* Body */}
      <div className="grid gap-8 p-6 lg:grid-cols-2">
        {/* Previous Document */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">
            Previous Document
          </h4>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {doc.action === "upload" && doc.preview && (
              <img
                src={`${STORAGE_URL}${doc.preview}`}
                alt={doc.title}
                className="h-34 w-full object-cover"
              />
            )}

            {doc.action === "digilocker" && doc.preview && (
              <img
                src={`data:image/jpeg;base64,${doc.preview}`}
                alt={doc.title}
                className="h-34 w-full object-cover"
              />
            )}

            {doc.action === "video" && doc.preview && (
              <video className="h-34 w-full object-cover" controls>
                <source src={`${STORAGE_URL}${doc.preview}`} />
              </video>
            )}

            {!doc.preview && (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                No preview available
              </div>
            )}
          </div>

          {doc.preview && (
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Eye size={16} />
              View Document
            </button>
          )}
        </div>

        {/* Upload */}
        <div className="flex flex-col">
          <h4 className="mb-3 text-sm font-semibold text-slate-800">
            {doc.action === "upload" && "Upload Updated Document"}

            {doc.action === "digilocker" && "Reconnect DigiLocker"}

            {doc.action === "video" && "Complete Video Verification"}
          </h4>

          {/* Reason */}
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 text-red-600" size={18} />

              <div>
                <p className="font-semibold text-red-700">Rejection Reason</p>

                <p className="mt-1 text-sm leading-6 text-red-600">
                  {doc.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Box */}
          {doc.action === "upload" && (
            <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-blue-500 hover:bg-blue-50">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <Upload className="text-blue-600" size={22} />
              </div>

              <p className="mt-2 text-sm text-slate-500">Click to browse</p>

              <span className="mt-4 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                {doc.accepted}
              </span>

              <input
                type="file"
                className="hidden"
                accept={doc.accepted}
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
              />
            </label>
          )}

          {doc.action === "digilocker" && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h4 className="font-semibold text-blue-700">
                Reconnect DigiLocker
              </h4>

              <p className="mt-2 text-center text-sm text-slate-500">
                Fetch your latest Aadhaar / PAN details again.
              </p>

              <button
                onClick={onStartDigilocker}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white cursor-pointer"
              >
                Connect DigiLocker
              </button>
            </div>
          )}

          {doc.action === "video" && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-purple-200 bg-purple-50 p-6">
              <h4 className="font-semibold text-purple-700">
                Video Verification Required
              </h4>

              <p className="mt-2 text-center text-sm text-slate-500">
                Your previous Video KYC was rejected.
              </p>

              <button
                onClick={onStartVideo}
                className="mt-5 rounded-lg bg-purple-600 px-5 py-2 text-white cursor-pointer"
              >
                Start Video KYC
              </button>
            </div>
          )}

          {doc.action === "upload" && (
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-slate-500">Maximum file size: 5 MB</p>

              <button
                disabled={!selectedFile}
                onClick={() => {
                  onReplaceDocument(doc.document_key, selectedFile);
                }}
                className="rounded-lg bg-blue-600 px-4 py-1 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                Replace File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
