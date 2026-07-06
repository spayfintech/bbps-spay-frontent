const PanCardForm = ({ onBack, onSubmit }) => {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900">PAN Verification</h2>

      <p className="text-sm text-slate-500 mt-2 mb-8">
        Verify your PAN details to complete merchant onboarding.
      </p>

      <div className="space-y-5">
        {/* PAN Number */}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            PAN Number
          </label>

          <input
            type="text"
            maxLength={10}
            placeholder="ABCDE1234F"
            className="w-full h-11 uppercase border border-slate-300 rounded-md px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Name on PAN */}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Name as per PAN
          </label>

          <input
            type="text"
            placeholder="Enter name as per PAN"
            className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Date of Birth */}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date of Birth / Incorporation
          </label>

          <input
            type="date"
            className="w-full h-11 border border-slate-300 rounded-md px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Upload PAN */}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload PAN Card
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

        {/* Declaration */}

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 accent-blue-600" />

          <span>
            I certify that the PAN details provided are correct and belong to me
            / my organization.
          </span>
        </label>

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
            onClick={onSubmit}
            className="h-11 px-8 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition"
          >
            Complete Registration
          </button>
        </div>
      </div>
    </>
  );
};

export default PanCardForm;
