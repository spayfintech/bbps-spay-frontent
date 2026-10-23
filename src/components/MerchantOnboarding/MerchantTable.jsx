import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function MerchantTable({
  merchants,
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((item) => item[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-pink-100 text-pink-600",
      "bg-cyan-100 text-cyan-600",
    ];

    return colors[index % colors.length];
  };

  const navigate = useNavigate();

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Header */}

          <thead className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
            <tr className="text-left text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              <th className="px-6 py-5">Merchant ID</th>

              <th className="px-4 py-5">Merchant Name</th>

              <th className="px-4 py-5">Business Type</th>

              <th className="px-4 py-5">Mobile Number</th>

              <th className="px-4 py-5">Submitted On</th>

              <th className="px-4 py-5 text-center">Documents</th>

              <th className="px-4 py-5 text-center">Status</th>

              <th className="px-6 py-5 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {merchants.length > 0 ? (
              merchants.map((merchant, index) => {
                return (
                  <tr
                    key={merchant.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Merchant ID */}

                    <td className="px-6 py-6 text-[14px] font-medium text-slate-700">
                      {merchant.merchantId}
                    </td>

                    {/* Name */}

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(
                            index,
                          )}`}
                        >
                          {getInitials(merchant.name)}
                        </div>

                        <div>
                          <h3 className="text-[14px] font-semibold text-slate-800">
                            {merchant.name}
                          </h3>

                          <p className="text-xs text-slate-500">
                            {merchant.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Business */}

                    <td className="px-4 py-6 text-[14px] text-slate-700">
                      {merchant.business}
                    </td>

                    {/* Mobile */}

                    <td className="px-4 py-6 text-[14px] text-slate-700">
                      {merchant.mobile}
                    </td>

                    {/* Submitted */}

                    <td className="px-4 py-5">
                      <p className="text-[14px] font-medium text-slate-700">
                        {merchant.submitted}
                      </p>

                      <span className="mt-1 block text-xs text-slate-500">
                        {new Date(merchant.submitted).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Documents */}

                    <td className="px-4 py-5 text-center">
                      <span
                        className={`
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-medium

                              ${
                                merchant.documents === "10/10"
                                  ? "bg-green-100 text-green-700"
                                  : merchant.documents === "9/10"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                              }

                          `}
                      >
                        {merchant.documents}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-4 py-5 text-center">
                      <StatusBadge status={merchant.status} />
                    </td>

                    {/* Action */}

                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() =>
                          navigate(`/merchant-onboarding/${merchant.id}`)
                        }
                        className="inline-flex items-center gap-2 rounded-lg
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        px-4
                        py-2
                        text-sm font-medium
                        transition-all
                        cursor-pointer"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-20 text-slate-500 text-lg"
                >
                  No merchants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}

      <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}

        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {(currentPage - 1) * merchants.length + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-700">
            {Math.min(
              currentPage * merchants.length,
              totalPages * merchants.length,
            )}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {totalPages * merchants.length}
          </span>{" "}
          merchants
        </p>

        {/* Pagination */}

        <div className="flex items-center gap-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition
              ${
                currentPage === 1
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            ← Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition
                  ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition
              ${
                currentPage === totalPages
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
