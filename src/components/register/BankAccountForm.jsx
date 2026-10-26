import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePost } from "../../hooks/usePost";
import {
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Paperclip,
  Pencil,
} from "lucide-react";

const BankAccountForm = ({ onBack, onNext, initialData }) => {
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [confirmAccountNo, setConfirmAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [cancelledCheque, setCancelledCheque] = useState(null);
  const [previousChequeName, setPreviousChequeName] = useState("");

  const holderNameRegex = /^[A-Za-z ]{3,100}$/;
  const bankNameRegex = /^[A-Za-z0-9&.,'()\- ]{3,100}$/;
  const accountNumberRegex = /^\d{9,18}$/;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  const [errors, setErrors] = useState({});

  /* -------------------------------------------------------------------------- */
  /* BANK STATE                                                                 */
  /* -------------------------------------------------------------------------- */

  const [bankVerified, setBankVerified] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);   // <- true after successful save-bank
  const [editMode, setEditMode] = useState(true);      // <- true = fields editable

  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [saving, setSaving] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* API                                                                        */
  /* -------------------------------------------------------------------------- */

  const { execute: verifyBank, loading: verifyingBank } = usePost(
    "/bank/account/verification-advance",
  );

  const { execute: saveBank, loading: saveBankLoading } = usePost(
    "/merchant-onboarding/save-bank",
  );

  /* -------------------------------------------------------------------------- */
  /* RESTORE PREVIOUSLY SAVED DATA                                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("merchant_onboarding_data");

      const data =
        (initialData && Object.keys(initialData).length > 0
          ? initialData
          : null) || (stored ? JSON.parse(stored) : null);

      if (!data) return;

      if (data?.account_holder_name)
        setHolderName(String(data.account_holder_name));

      if (data?.bank_name) setBankName(String(data.bank_name));

      if (data?.account_number) {
        const value = String(data.account_number);
        setAccountNo(value);
        setConfirmAccountNo(value);
      }

      if (data?.ifsc) setIfsc(String(data.ifsc).toUpperCase());

      if (data?.cancelled_cheque_name) {
        setPreviousChequeName(String(data.cancelled_cheque_name));
      }

      /* Already verified in a previous session */
      if (data?.bank_verified === true) {
        setBankVerified(true);
        setVerificationStatus("verified");
        setVerificationMessage("Bank account verified successfully.");
        if (data?.beneficiary_name)
          setBeneficiaryName(String(data.beneficiary_name));
      }

      /* Already SAVED on the server — lock the form by default */
      if (data?.bank_saved === true || data?.bank_verified === true) {
        setBankSaved(true);
        setEditMode(false);
      } else {
        setEditMode(true);
      }
    } catch (error) {
      console.error("Unable to restore bank details:", error);
    }
  }, [initialData]);

  /* -------------------------------------------------------------------------- */
  /* EDIT / CANCEL EDIT                                                         */
  /* -------------------------------------------------------------------------- */

  const handleEdit = () => {
    setEditMode(true);
    setBankVerified(false);           // must re-verify after editing
    setVerificationStatus("idle");
    setVerificationMessage("");
    setBeneficiaryName("");
  };

  const handleCancelEdit = () => {
    if (!bankSaved) return;           // only meaningful when bank was saved before

    setEditMode(false);
    setBankVerified(true);
    setVerificationStatus("verified");
    setVerificationMessage("Bank account verified successfully.");
  };

  /* -------------------------------------------------------------------------- */
  /* DERIVED                                                                    */
  /* -------------------------------------------------------------------------- */

  const hasExistingCheque = Boolean(previousChequeName);
  const isLocked = bankSaved && !editMode;

  /* -------------------------------------------------------------------------- */
  /* RESET VERIFICATION WHEN INPUTS CHANGE                                      */
  /* -------------------------------------------------------------------------- */

  const resetVerification = () => {
    if (isLocked) return;
    setVerificationStatus("idle");
    setVerificationMessage("");
    setBeneficiaryName("");
  };

  /* -------------------------------------------------------------------------- */
  /* SUBMIT                                                                     */
  /* -------------------------------------------------------------------------- */

  const handleContinue = async () => {
    /* ====================================================================== */
    /* PATH A — already saved + verified + NOT editing: just move forward      */
    /* ====================================================================== */

    if (isLocked) {
      if (typeof onNext === "function") {
        onNext({
          account_holder_name: holderName,
          bank_name: bankName,
          account_number: accountNo,
          ifsc: ifsc.toUpperCase(),
          cancelled_cheque: true,
          cancelled_cheque_name: previousChequeName || null,
          bank_verified: true,
          bank_saved: true,
          beneficiary_name: beneficiaryName,
        });
      }
      return;
    }

    /* ====================================================================== */
    /* PATH B — normal verify + save flow                                     */
    /* ====================================================================== */

    if (!validateForm()) return;

    const merchantId = sessionStorage.getItem("merchant_onboarding_id");

    if (!merchantId) {
      toast.error("Session expired.");
      return;
    }

    /* ---- STEP 1 — VERIFY ------------------------------------------------- */

    let beneficiary = beneficiaryName;

    if (!bankVerified) {
      setVerificationStatus("verifying");
      setVerificationMessage("Verifying bank account, please wait...");

      try {
        const verifyRes = await verifyBank({
          account_number: accountNo.trim(),
          ifsc: ifsc.trim().toUpperCase(),
          name_to_match: holderName.trim(),
        });

        const verified =
          verifyRes?.status === "success" && verifyRes?.verified === true;

        if (!verified) {
          const msg =
            verifyRes?.message ||
            "Bank verification failed. Please check your account details.";

          setVerificationStatus("failed");
          setVerificationMessage(msg);
          toast.error(msg);
          return;
        }

        beneficiary = verifyRes?.beneficiary_name || "";

        setBankVerified(true);
        setVerificationStatus("verified");
        setVerificationMessage(
          verifyRes?.message || "Bank account verified successfully.",
        );
        setBeneficiaryName(beneficiary);

        toast.success("Bank account verified successfully.");
      } catch (err) {
        console.error("Bank verification error:", err);

        const httpStatus = err?.response?.status;
        const backendMessage =
          err?.response?.data?.message ||
          err?.data?.message ||
          err?.message ||
          "";

        const msg =
          httpStatus === 504
            ? "Bank verification service timed out. Please try again."
            : backendMessage ||
              "Unable to verify bank account. Please try again.";

        setVerificationStatus("failed");
        setVerificationMessage(msg);
        toast.error(msg);
        return;
      }
    }

    /* ---- STEP 2 — SAVE --------------------------------------------------- */

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("merchant_onboarding_id", merchantId);
      formData.append("account_holder_name", holderName);
      formData.append("bank_name", bankName);
      formData.append("account_number", accountNo);
      formData.append("ifsc", ifsc.toUpperCase());

      if (cancelledCheque) {
        /* New file selected → upload it */
        formData.append("cancelled_cheque", cancelledCheque);
      } else if (hasExistingCheque) {
        /* No new file, but server already has one → keep it */
        formData.append("keep_existing_cheque", "1");
      }
      /* else: validation would have already failed */

      const res = await saveBank(formData);

      if (res?.status !== "success") {
        toast.error(res?.message || "Unable to save bank details.");
        return;
      }

      /* ---- Cache for next visit ---------------------------------------- */

      try {
        const existingData = JSON.parse(
          sessionStorage.getItem("merchant_onboarding_data") || "{}",
        );

        sessionStorage.setItem(
          "merchant_onboarding_data",
          JSON.stringify({
            ...existingData,
            account_holder_name: holderName,
            bank_name: bankName,
            account_number: accountNo,
            ifsc: ifsc.toUpperCase(),
            cancelled_cheque: true,
            cancelled_cheque_name:
              cancelledCheque?.name || previousChequeName || null,
            bank_verified: true,
            bank_saved: true,
            beneficiary_name: beneficiary,
          }),
        );
      } catch (error) {
        console.error("Unable to cache bank details locally:", error);
      }

      /* ---- Lock the form after successful save ------------------------- */

      setBankSaved(true);
      setEditMode(false);

      toast.success("Bank Details Saved");

      if (typeof onNext === "function") {
        onNext({
          account_holder_name: holderName,
          bank_name: bankName,
          account_number: accountNo,
          ifsc: ifsc.toUpperCase(),
          cancelled_cheque: true,
          cancelled_cheque_name:
            cancelledCheque?.name || previousChequeName || null,
          bank_verified: true,
          bank_saved: true,
          beneficiary_name: beneficiary,
        });
      }
    } catch (err) {
      console.error("Save bank error:", err);
      toast.error("Unable to save bank details.");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* VALIDATION                                                                 */
  /* -------------------------------------------------------------------------- */

  const validateForm = () => {
    const newErrors = {};

    if (!holderName.trim()) {
      newErrors.holderName = "Account holder name is required.";
    } else if (!holderNameRegex.test(holderName.trim())) {
      newErrors.holderName = "Enter a valid account holder name.";
    }

    if (!bankName.trim()) {
      newErrors.bankName = "Bank name is required.";
    } else if (!bankNameRegex.test(bankName.trim())) {
      newErrors.bankName = "Enter a valid bank name.";
    }

    if (!accountNo.trim()) {
      newErrors.accountNo = "Account number is required.";
    } else if (!accountNumberRegex.test(accountNo)) {
      newErrors.accountNo =
        "Account number must be between 9 and 18 digits.";
    }

    if (!confirmAccountNo.trim()) {
      newErrors.confirmAccountNo = "Please confirm account number.";
    } else if (accountNo !== confirmAccountNo) {
      newErrors.confirmAccountNo = "Account numbers do not match.";
    }

    if (!ifsc.trim()) {
      newErrors.ifsc = "IFSC code is required.";
    } else if (!ifscRegex.test(ifsc)) {
      newErrors.ifsc = "Enter a valid IFSC code.";
    }

    /* Cheque required ONLY if there is no previously uploaded cheque */
    if (!cancelledCheque && !hasExistingCheque) {
      newErrors.cancelledCheque =
        "Please upload cancelled cheque or passbook.";
    } else if (cancelledCheque) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];

      if (!allowedTypes.includes(cancelledCheque.type)) {
        newErrors.cancelledCheque =
          "Only JPG, PNG and PDF files are allowed.";
      }

      const maxSize = 2 * 1024 * 1024;

      if (cancelledCheque.size > maxSize) {
        newErrors.cancelledCheque = "File size should not exceed 2 MB.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0], {
        position: "top-right",
        autoClose: 3000,
      });

      return false;
    }

    return true;
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  const isProcessing = verifyingBank || saving || saveBankLoading;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Bank Account Details
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Enter your bank account details for settlements.
          </p>
        </div>

        {/* Edit button (only when locked) */}
        {isLocked && (
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-5 mt-6">
        {/* Account Holder Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Account Holder Name
          </label>

          <input
            type="text"
            value={holderName}
            disabled={isLocked}
            onChange={(e) => {
              setHolderName(e.target.value);
              setErrors((prev) => ({ ...prev, holderName: "" }));
              resetVerification();
            }}
            placeholder="Enter account holder name"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.holderName
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${isLocked ? "bg-slate-100 cursor-not-allowed" : ""}`}
          />

          {errors.holderName && (
            <p className="mt-1 text-xs text-red-500">{errors.holderName}</p>
          )}
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bank Name
          </label>

          <input
            type="text"
            value={bankName}
            disabled={isLocked}
            onChange={(e) => {
              setBankName(e.target.value);
              setErrors((prev) => ({ ...prev, bankName: "" }));
              resetVerification();
            }}
            placeholder="Enter bank name"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.bankName
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${isLocked ? "bg-slate-100 cursor-not-allowed" : ""}`}
          />

          {errors.bankName && (
            <p className="mt-1 text-xs text-red-500">{errors.bankName}</p>
          )}
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Account Number
          </label>

          <input
            type="text"
            value={accountNo}
            maxLength={18}
            disabled={isLocked}
            onChange={(e) => {
              setAccountNo(e.target.value.replace(/\D/g, ""));
              setErrors((prev) => ({ ...prev, accountNo: "" }));
              resetVerification();
            }}
            placeholder="Enter account number"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.accountNo
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${isLocked ? "bg-slate-100 cursor-not-allowed" : ""}`}
          />

          {errors.accountNo && (
            <p className="mt-1 text-xs text-red-500">{errors.accountNo}</p>
          )}
        </div>

        {/* Confirm Account Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Account Number
          </label>

          <input
            type="text"
            value={confirmAccountNo}
            maxLength={18}
            disabled={isLocked}
            onChange={(e) => {
              setConfirmAccountNo(e.target.value.replace(/\D/g, ""));
              setErrors((prev) => ({ ...prev, confirmAccountNo: "" }));
              resetVerification();
            }}
            placeholder="Re-enter account number"
            className={`w-full h-11 rounded-md px-4 outline-none transition ${
              errors.confirmAccountNo
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${isLocked ? "bg-slate-100 cursor-not-allowed" : ""}`}
          />

          {errors.confirmAccountNo && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmAccountNo}
            </p>
          )}
        </div>

        {/* IFSC */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            IFSC Code
          </label>

          <input
            type="text"
            value={ifsc}
            maxLength={11}
            disabled={isLocked}
            onChange={(e) => {
              setIfsc(e.target.value.toUpperCase());
              setErrors((prev) => ({ ...prev, ifsc: "" }));
              resetVerification();
            }}
            placeholder="Enter IFSC Code"
            className={`w-full h-11 uppercase rounded-md px-4 outline-none transition ${
              errors.ifsc
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            } ${isLocked ? "bg-slate-100 cursor-not-allowed" : ""}`}
          />

          {errors.ifsc && (
            <p className="mt-1 text-xs text-red-500">{errors.ifsc}</p>
          )}
        </div>

        {/* Cancelled Cheque */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Cancelled Cheque / Bank Passbook
          </label>

          <input
            type="file"
            accept="image/*,.pdf"
            disabled={isLocked}
            onChange={(e) => {
              setCancelledCheque(e.target.files[0]);
              setErrors((prev) => ({ ...prev, cancelledCheque: "" }));
            }}
            className={`w-full rounded-md p-2 text-sm ${
              errors.cancelledCheque
                ? "border border-red-500"
                : "border border-slate-300"
            } file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-md file:bg-blue-50 file:text-blue-600 file:cursor-pointer ${
              isLocked ? "bg-slate-100 cursor-not-allowed" : ""
            }`}
          />

          {/* Existing cheque hint */}
          {previousChequeName && !cancelledCheque && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
              <Paperclip size={14} className="text-blue-600" />
              <p className="text-xs text-blue-700">
                Previously uploaded:{" "}
                <span className="font-medium">{previousChequeName}</span>
                <span className="text-blue-500 ml-1">
                  (leave blank to keep the existing file)
                </span>
              </p>
            </div>
          )}

          {/* New selection hint */}
          {cancelledCheque && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
              <Paperclip size={14} className="text-green-600" />
              <p className="text-xs text-green-700">
                Selected:{" "}
                <span className="font-medium">{cancelledCheque.name}</span>
              </p>
            </div>
          )}

          {errors.cancelledCheque && (
            <p className="mt-1 text-xs text-red-500">
              {errors.cancelledCheque}
            </p>
          )}
        </div>

        {/* VERIFICATION STATUS PANEL */}
        {verificationStatus === "verifying" && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <ShieldCheck size={18} className="text-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">
              {verificationMessage || "Verifying bank account..."}
            </span>
          </div>
        )}

        {verificationStatus === "verified" && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle size={18} className="mt-0.5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">
                Bank account verified successfully.
              </p>
              {beneficiaryName && (
                <p className="text-xs text-green-600 mt-1">
                  Beneficiary Name: <b>{beneficiaryName}</b>
                </p>
              )}
            </div>
          </div>
        )}

        {verificationStatus === "failed" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-700">
                Bank verification failed.
              </p>
              {verificationMessage && (
                <p className="text-xs text-red-600 mt-1">
                  {verificationMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4 pt-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isProcessing}
              className="h-11 px-8 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {/* Cancel Edit — only when editing existing saved bank */}
            {!isLocked && bankSaved && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isProcessing}
                className="h-11 px-6 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isProcessing}
            className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLocked
              ? "Continue"
              : verifyingBank
                ? "Verifying Bank..."
                : saving || saveBankLoading
                  ? "Saving..."
                  : bankVerified
                    ? "Save & Continue"
                    : "Verify & Continue"}
          </button>
        </div>
      </div>
    </>
  );
};

export default BankAccountForm;