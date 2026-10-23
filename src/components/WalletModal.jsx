// src/components/WalletModal.jsx

import { useEffect, useState } from "react";
import {
  X,
  Wallet,
  ArrowDownToLine,
  RotateCcw,
  IndianRupee,
  FileText,
  UserRound,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import Button from "./Button";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

export default function WalletModal({
  isOpen,
  onClose,
  merchant,
  defaultMode = "load",
  onSuccess,
}) {
  const toast = useToast();

  const [mode, setMode] = useState(defaultMode);
  const [form, setForm] = useState({
    payout_wallet: "",
    remark: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { execute: loadWallet } = usePost("/payout-load-wallet");
  const { execute: reverseTopup } = usePost("/payout-take-back");

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setForm({ payout_wallet: "", remark: "" });
      setSubmitting(false);
    }
  }, [defaultMode, isOpen, merchant?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, submitting]);

  if (!isOpen || !merchant?.id) return null;

  const isLoadMode = mode === "load";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    const amount = Number(form.payout_wallet);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    const payload = {
      user_id: merchant.id,
      payout_wallet: amount,
      remark: form.remark.trim() || "Fund transfer",
    };

    setSubmitting(true);

    try {
      const api = isLoadMode ? loadWallet : reverseTopup;
      const response = await api(payload);

      if (!response || response.message === "Validation failed") {
        throw new Error(
          response?.message || "The wallet operation could not be completed.",
        );
      }

      toast.success(
        isLoadMode
          ? `₹${amount.toLocaleString("en-IN")} added to the payout wallet successfully.`
          : `₹${amount.toLocaleString("en-IN")} deducted successfully.`,
      );

      setForm({ payout_wallet: "", remark: "" });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Wallet operation failed:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Wallet operation failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formattedAmount = form.payout_wallet
    ? Number(form.payout_wallet).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isLoadMode
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {isLoadMode ? (
                <ArrowDownToLine size={23} />
              ) : (
                <RotateCcw size={23} />
              )}
            </div>

            <div>
              <h2
                id="wallet-modal-title"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                {isLoadMode ? "Load Wallet" : "Reverse Top-up"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isLoadMode
                  ? "Add funds to the merchant's payout wallet."
                  : "Return or deduct funds from the payout wallet."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Merchant details */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">
              {(merchant.name || "M").trim().charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                {merchant.name || "Merchant"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Merchant ID:{" "}
                <span className="font-medium text-slate-700">
                  {merchant.id}
                </span>
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
              <UserRound size={17} />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Amount */}
          <div>
            <label
              htmlFor="payout_wallet"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Transaction Amount
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <IndianRupee size={18} className="text-slate-400" />
              </div>

              <input
                id="payout_wallet"
                type="number"
                name="payout_wallet"
                value={form.payout_wallet}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                placeholder="0.00"
                autoFocus
                required
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-lg font-semibold tabular-nums text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Enter the amount in Indian Rupees (INR).
            </p>
          </div>

          {/* Remark */}
          <div>
            <label
              htmlFor="wallet_remark"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <FileText size={15} className="text-slate-400" />
              Remark
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>

            <textarea
              id="wallet_remark"
              name="remark"
              value={form.remark}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="Enter the reason for this transaction..."
              disabled={submitting}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {form.remark.length}/500
            </p>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${
                isLoadMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Processing...
                </>
              ) : isLoadMode ? (
                <>
                  <ArrowDownToLine size={16} />
                  Confirm Load
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Confirm Reversal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
