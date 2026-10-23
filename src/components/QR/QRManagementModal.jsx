import React from "react";
import { X, QrCode, Wallet, Settings, History } from "lucide-react";

const QRManagementModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">QR Management</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage QR settings for {user?.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRManagementModal;
