import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Table = ({
  columns = [],
  data = [],
  rowsPerPage = 5,
  isPaginationRequired = false,
  tableWrapperClass = "",
  tableClass = "",
  headerClass = "",
  rowClass = "",
  cellClass = "",
  paginationClass = "",
  paginationBtnClass = "",
  paginationActiveClass = "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const paginationHandler = (action) => {
    setCurrentPage((prev) => {
      if (action === "prev") return Math.max(prev - 1, 1);
      if (action === "next") return Math.min(prev + 1, totalPages);
      return prev;
    });
  };

  const goToPage = (page) =>
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  const getColumnLabel = (col) =>
    typeof col === "string" ? col : col.label || col.key;
  const getCellValue = (col, row, rowIndex) => {
    if (typeof col === "string") return row[col] ?? "-";
    if (col.render) return col.render(row, rowIndex);
    return row[col.key] ?? "-";
  };

  // Table wrapper
  const defaultWrapperClass =
    "overflow-x-auto rounded-[18px] border border-[#EEF2F7] bg-white";

  // Table
  const defaultTableClass = "min-w-full";

  // Header
  const defaultHeaderClass =
    "bg-[#F8FAFC] text-[#64748B] text-[12px] font-semibold uppercase border-b border-[#EEF2F7]";

  // Rows
  const defaultRowClass =
    "border-b border-[#F5F7FA] hover:bg-[#FAFBFC] transition-all duration-200";

  // Cells
  const defaultCellClass =
    "px-4 py-3.5 text-[13px] text-[#0F172A] whitespace-nowrap";

  // Pagination
  const defaultPaginationClass =
    "flex justify-between items-center px-4 py-4 border-t border-[#EEF2F7]";

  const defaultPaginationBtnClass =
    "flex items-center gap-1 bg-[#2563EB] text-white px-3 py-2 rounded-xl hover:bg-[#1D4ED8] disabled:opacity-40 transition-all text-[12px] font-medium cursor-pointer";

  const defaultPaginationActiveClass =
    "px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-[12px] font-medium";

  return (
    <div className={`${defaultWrapperClass} ${tableWrapperClass}`}>
      {/* TABLE SCROLL AREA */}
      <div className="overflow-x-auto">
        <table className={`${defaultTableClass} ${tableClass}`}>
          <thead className={headerClass || defaultHeaderClass}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={typeof col === "string" ? col : col.key || idx}
                  className="px-3 sm:px-4 py-2 "
                >
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr key={rIdx} className={`${rowClass || defaultRowClass}`}>
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`${defaultCellClass} ${cellClass}`}
                    >
                      {getCellValue(col, row, startIndex + rIdx)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPaginationRequired && totalPages > 1 && (
        <div className={`${defaultPaginationClass} ${paginationClass}`}>
          <button
            onClick={() => paginationHandler("prev")}
            disabled={currentPage === 1}
            className={paginationBtnClass || defaultPaginationBtnClass}
          >
            <FaChevronLeft /> Prev
          </button>

          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={
                  page === currentPage
                    ? paginationActiveClass || defaultPaginationActiveClass
                    : "px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-200 transition-all"
                }
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginationHandler("next")}
            disabled={currentPage === totalPages}
            className={paginationBtnClass || defaultPaginationBtnClass}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
