import { useState } from "react";
import { History, Settings2, Package2 } from "lucide-react";

const packages = [
  "Retailer",
  "Distributor",
  "Master Distributor",
  "Super Distributor",
  "API User",
];

const commissionTypes = [
  "PAYOUT CHARGE NEFT",
  "DMT CHARGE",
  "CW COMMISSION",
  "AP CHARGE",
  "MINI STATEMENT",
  "PAYOUT CHARGE IMPS",
  "RECHARGE COMMISSION",
  "BBPS COMMISSION",
  "Q-TRANSFER CHARGE",
  "WALLET TO WALLET CHARGES",
];

export default function CommissionSelection() {
  const [selectedCommission, setSelectedCommission] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>

            <span>/</span>

            <span>Commission</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Commission & Charges
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage commission plans and charges for different services and
            packages.
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200"></div>

      <div className="space-y-5 p-6 pb-0">
        {/* Commission */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Select Commission Type
            <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Settings2
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={selectedCommission}
              onChange={(e) => setSelectedCommission(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select Commission Type</option>

              {commissionTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Package */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Select Package
            <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Package2
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select Package</option>

              {packages.map((pkg) => (
                <option key={pkg} value={pkg}>
                  {pkg}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            The commission table will be loaded according to the selected
            commission type and package.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Commission Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View commission slabs for the selected commission type and
              package.
            </p>
          </div>

          <button
            className="
        rounded-xl
        bg-blue-600
        px-5
        py-2.5
        text-sm
        font-medium
        text-white
        transition
        hover:bg-blue-700
      "
          >
            Export
          </button>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  #
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  From Amount
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  To Amount
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Commission
                </th>

                <th className="px-6 py-4 text-left font-semibold text-slate-700">
                  Type
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4">0</td>
                <td className="px-6 py-4">1,000</td>
                <td className="px-6 py-4">₹5</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Flat
                  </span>
                </td>
              </tr>

              <tr className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4">2</td>
                <td className="px-6 py-4">1,001</td>
                <td className="px-6 py-4">5,000</td>
                <td className="px-6 py-4">₹8</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Flat
                  </span>
                </td>
              </tr>

              <tr className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4">3</td>
                <td className="px-6 py-4">5,001</td>
                <td className="px-6 py-4">10,000</td>
                <td className="px-6 py-4">₹10</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Flat
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
