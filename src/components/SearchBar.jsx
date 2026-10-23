import React from "react";
import { FaFileExcel, FaFilePdf, FaSyncAlt, FaSearch } from "react-icons/fa";

const SearchBar = ({
  filters,
  handleChange,
  handleSearch,
  exportExcel,
  exportPDF,
  handleReset,
  filterFields,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-6 transition-all duration-300">
      {/* Filter Inputs + Search Button */}
      <div className="flex flex-wrap items-end gap-4 justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          {filterFields.map((field) => (
            <div
              key={field.name}
              className="flex flex-col min-w-[180px] flex-1 xl:max-w-[220px]"
            >
              <label
                className="mb-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500 mb-1"
              >
                {field.label}
              </label>

              {field.type === "date" ? (
                <input
                  type="date"
                  name={field.name}
                  value={filters[field.name]}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={filters[field.name]}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                >
                  <option value="">
                    {field.placeholder || `Select ${field.label}`}
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={filters[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder || `Enter ${field.label}...`}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              )}
            </div>
          ))}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-700
              cursor-pointer
            "
          >
            <FaSearch className="text-base" /> Search
          </button>

          {/* Reset Button */}
          {handleReset && (
            <button
              onClick={handleReset}
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-sm
                font-medium
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              <FaSyncAlt size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        {exportExcel && (
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl shadow-sm 
                       hover:from-green-600 hover:to-green-700 hover:shadow-md transition-transform duration-300 transform hover:scale-105 cursor-pointer"
          >
            <FaFileExcel className="text-base" /> Excel
          </button>
        )}
        {exportPDF && (
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-sm 
                       hover:from-red-600 hover:to-red-700 hover:shadow-md transition-transform duration-300 transform hover:scale-105 cursor-pointer"
          >
            <FaFilePdf className="text-base" /> PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
