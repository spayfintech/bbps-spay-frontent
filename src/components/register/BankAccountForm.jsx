import { useState } from "react";
import { toast } from "react-toastify";
import { usePost } from "../../hooks/usePost";

const BankAccountForm = ({ onBack, onNext }) => {
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [confirmAccountNo, setConfirmAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [cancelledCheque, setCancelledCheque] = useState(null);

  const holderNameRegex = /^[A-Za-z ]{3,100}$/;
  const bankNameRegex = /^[A-Za-z0-9&.,'()\- ]{3,100}$/;
  const accountNumberRegex = /^\d{9,18}$/;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  const [errors, setErrors] = useState({});

  //--------

  const { execute: saveBank } = usePost("/merchant-onboarding/save-bank");

  const handleContinue = async () => {
    if (!validateForm()) return;

    try {
      const merchantId = sessionStorage.getItem("merchant_onboarding_id");

      if (!merchantId) {
        toast.error("session expired.");
        return;
      }

      const formData = new FormData();

      formData.append("merchant_onboarding_id", merchantId);

      formData.append("account_holder_name", holderName);

      formData.append("bank_name", bankName);

      formData.append("account_number", accountNo);

      formData.append("ifsc", ifsc);

      formData.append("cancelled_cheque", cancelledCheque);

      const res = await saveBank(formData);

      if (res.status === "success") {
        toast.success("Bank Details Saved");

        onNext();
      }
    } catch (err) {
      toast.error("Unable to save bank details.");
    }
  };

  //--------

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
      newErrors.accountNo = "Account number must be between 9 and 18 digits.";
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

    if (!cancelledCheque) {
      newErrors.cancelledCheque = "Please upload cancelled cheque or passbook.";
    } else {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];

      if (!allowedTypes.includes(cancelledCheque.type)) {
        newErrors.cancelledCheque = "Only JPG, PNG and PDF files are allowed.";
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

  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">
        Bank Account Details
      </h2>

      <p className="text-sm text-slate-500 mt-2 mb-8">
        Enter your bank account details for settlements.
      </p>

      <div className="space-y-5">
        {/* Account Holder Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Account Holder Name
          </label>

          <input
            type="text"
            value={holderName}
            onChange={(e) => {
              setHolderName(e.target.value);
              setErrors((prev) => ({ ...prev, holderName: "" }));
            }}
            placeholder="Enter account holder name"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.holderName
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
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
            onChange={(e) => {
              setBankName(e.target.value);
              setErrors((prev) => ({ ...prev, bankName: "" }));
            }}
            placeholder="Enter bank name"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.bankName
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
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
            onChange={(e) => {
              setAccountNo(e.target.value.replace(/\D/g, ""));
              setErrors((prev) => ({ ...prev, accountNo: "" }));
            }}
            placeholder="Enter account number"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.accountNo
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
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
            onChange={(e) => {
              setConfirmAccountNo(e.target.value.replace(/\D/g, ""));
              setErrors((prev) => ({ ...prev, confirmAccountNo: "" }));
            }}
            placeholder="Re-enter account number"
            className={`w-full h-11 rounded-md px-4 outline-none transition
            ${
              errors.confirmAccountNo
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
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
            onChange={(e) => {
              setIfsc(e.target.value.toUpperCase());
              setErrors((prev) => ({ ...prev, ifsc: "" }));
            }}
            placeholder="Enter IFSC Code"
            className={`w-full h-11 uppercase rounded-md px-4 outline-none transition
            ${
              errors.ifsc
                ? "border border-red-500"
                : "border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            }`}
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
            onChange={(e) => {
              setCancelledCheque(e.target.files[0]);
              setErrors((prev) => ({ ...prev, cancelledCheque: "" }));
            }}
            className={`w-full rounded-md p-2 text-sm
            ${
              errors.cancelledCheque
                ? "border border-red-500"
                : "border border-slate-300"
            }
            file:mr-4
            file:px-4
            file:py-2
            file:border-0
            file:rounded-md
            file:bg-blue-50
            file:text-blue-600
            file:cursor-pointer`}
          />

          {errors.cancelledCheque && (
            <p className="mt-1 text-xs text-red-500">
              {errors.cancelledCheque}
            </p>
          )}
        </div>

        {/* Buttons */}

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={handleContinue}
            className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default BankAccountForm;
