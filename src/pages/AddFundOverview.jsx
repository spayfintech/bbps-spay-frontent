import {
  Landmark,
  Clock3,
  ShieldCheck,
  History,
  Info,
  Building2,
  Copy,
  CheckCircle2,
  IndianRupee,
  Hash,
  CalendarDays,
  FileText,
  UploadCloud,
  FileImage,
  SendHorizonal,
} from "lucide-react";

const AddFundOverview = () => {
  const banks = [
    {
      id: 1,
      bank: "HDFC Bank",
      accountName: "SPay Fintech Pvt. Ltd.",
      accountNumber: "78965412136547",
      ifsc: "HDFC00025835",
      branch: "Mumbai",
      selected: true,
    },
    {
      id: 2,
      bank: "ICICI Bank",
      accountName: "SPay Fintech Pvt. Ltd.",
      accountNumber: "45678912365478",
      ifsc: "ICIC0001234",
      branch: "Mumbai",
      selected: false,
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>

            <span>/</span>

            <span>Fund</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Add Fund
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add funds to your wallet by transferring money to one of our
            authorised bank accounts.
          </p>
        </div>

        <button
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            py-2.5
            text-sm
            font-medium
            text-slate-700
            shadow-sm
            transition-all
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
          "
        >
          <History size={17} />
          Transaction History
        </button>
      </div>

      {/* Important Notice */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <Info className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#18316D]">
              Important Instructions
            </h3>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Transfer funds only to the bank accounts listed below.</li>
              <li>
                • Enter the correct UTR / RRN after completing the payment.
              </li>
              <li>• Incorrect transaction details may delay verification.</li>
              <li>• Fund requests are processed during business hours.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="xl:col-span-3">
          {/* Select Bank Heading */}
          <div>
            {/* Heading */}

            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-900">
                Select Bank Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose the bank account where you want to transfer the payment.
              </p>
            </div>

            {/* Cards */}

            <div className="space-y-4">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  className={`
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    bg-white
                    p-4
                    transition-all
                    duration-300
                    cursor-pointer
                    ${
                      bank.selected
                        ? "border-blue-500 ring-2 ring-blue-100 shadow-lg"
                        : "border-slate-200 hover:border-blue-200 hover:shadow-md"
                    }
                    `}
                >
                  {/* Bank */}

                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                      <Landmark className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {bank.bank}
                      </h3>

                      <p className="text-sm text-slate-500">
                        Verified Bank Account
                      </p>
                    </div>
                  </div>

                  {/* Details */}

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">A/C :</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {bank.accountNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400">IFSC :</span>
                      <span className="ml-2 font-medium text-slate-800">
                        {bank.ifsc}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}

                  <div className="mt-4 flex gap-2">
                    <button
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        py-2
                        text-xs
                        font-medium
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        "
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Copy size={16} />
                        Copy Details
                      </div>
                    </button>

                    <button
                      className={`
                  flex-1
                  rounded-xl
                  py-3
                  text-sm
                  font-semibold
                  transition

                  ${
                    bank.selected
                      ? "bg-blue-600 text-white"
                      : "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }
                `}
                    >
                      {bank.selected ? "Selected" : "Select Bank"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Banks */}
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-9">
          {/* Payment Details */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}

            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                Payment Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your payment information to create a fund request.
              </p>
            </div>

            {/* Form */}

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Amount */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <IndianRupee
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* UTR */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  UTR / RRN Number <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Hash
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter UTR / RRN"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Transfer Date */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transfer Date <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Transfer Time */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transfer Time <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Clock3
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="time"
                    className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Remarks */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Remarks
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    rows={4}
                    placeholder="Write any additional information..."
                    className="w-full rounded-xl border border-slate-200 pl-11 pr-4 pt-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  className="
              rounded-xl
              border
              border-slate-300
              bg-white
              px-6
              py-3
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-100
            "
                >
                  Cancel
                </button>

                <button
                  className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
                >
                  <SendHorizonal size={18} />
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFundOverview;
