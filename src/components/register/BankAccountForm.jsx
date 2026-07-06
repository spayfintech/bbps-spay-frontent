const BankAccountForm = ({ onBack, onNext }) => {
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
            placeholder="Enter account holder name"
            className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bank Name
          </label>

          <input
            type="text"
            placeholder="Enter bank name"
            className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Account Number
          </label>

          <input
            type="text"
            placeholder="Enter account number"
            className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        {/* Confirm Account Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Account Number
          </label>

          <input
            type="text"
            placeholder="Re-enter account number"
            className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        {/* IFSC */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            IFSC Code
          </label>

          <input
            type="text"
            placeholder="Enter IFSC Code"
            className="w-full h-11 uppercase border border-slate-300 rounded-md px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        {/* Cancelled Cheque */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Cancelled Cheque / Bank Passbook
          </label>

          <input
            type="file"
            accept="image/*,.pdf"
            className="w-full border border-slate-300 rounded-md p-2 text-sm
            file:mr-4
            file:px-4
            file:py-2
            file:border-0
            file:rounded-md
            file:bg-blue-50
            file:text-blue-600
            file:cursor-pointer"
          />
        </div>

        {/* Buttons */}

        <div className="flex justify-between pt-3">
          <button
            type="button"
            onClick={onBack}
            className="h-11 px-6 border border-slate-300 rounded-md font-medium hover:bg-slate-50 transition"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={onNext}
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
