// pages/Scheme.jsx

import React, { useContext, useEffect, useState } from "react";
import Table from "../../components/Table";
import { useGet } from "../../hooks/useGet";
import { SchemeContext } from "../../contexts/SchemeContext";
import SchemeOperationModal from "../../components/SchemeOperationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faLayerGroup,
  faPlus,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import TableSkeleton from "../../components/TableSkeleton";
import { ServicesAuthContext } from "../../contexts/ServicesAuthContext";

// import AddScheme from "../../components/scheme/AddScheme";
import AddSchemeForm from "../../components/scheme/AddSchemeForm";

const Scheme = () => {
  const { isModelOpen, setIsModelOpen } = useContext(SchemeContext);

  const [showAddScheme, setShowAddScheme] = useState(false);

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // API
  const { data: response, loading } = useGet(
    `/get-schemes?refresh=${refreshKey}`,
  );

  const [tableData, setTableData] = useState([]);
  const [operation, setOperation] = useState(null);
  const [value, setValue] = useState(null);

  /*
   |--------------------------------------------------------------------------
   | TABLE COLUMNS
   |--------------------------------------------------------------------------
   */

  const columns = [
    {
      label: "Sr.No",
      key: "srno",
    },
    {
      label: "Action",
      key: "action",
    },
    // {
    //   label: "Scheme ID",
    //   key: "scheme_id",
    // },
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Commission Value",
      key: "commission_value",
    },
    {
      label: "Status",
      key: "status",
    },
    {
      label: "GST Value",
      key: "gst_value",
    },
    {
      label: "Merchants",
      key: "user_names_json",
    },
    {
      label: "Billers",
      key: "blr_names_json",
    },
    {
      label: "Date",
      key: "created_at",
    },
    {
      label: "Update Date",
      key: "updated_at",
    },
  ];

  /*
   |--------------------------------------------------------------------------
   | TABLE STYLE
   |--------------------------------------------------------------------------
   */

  // const tstyle = {
  //   tableClass: "min-w-full bg-white text-gray-700 text-center",

  //   headerClass:
  //     "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white text-xs font-semibold uppercase tracking-wide text-center",

  //   rowClass:
  //     "bg-white even:bg-slate-50 hover:bg-blue-50/60 transition-all duration-200 text-center",

  //   cellClass: "py-4 px-4 text-sm font-medium text-center",

  //   paginationClass:
  //     "bg-white px-4 py-3 text-gray-700 flex items-center justify-center gap-3 border-t border-slate-200",
  // };

  const tstyle = {
    tableClass: "min-w-full bg-white text-gray-700 text-center",

    headerClass:
      "bg-white text-slate-700 text-xs font-semibold uppercase tracking-wide text-center border-b border-slate-200",

    rowClass:
      "bg-white even:bg-slate-50 hover:bg-slate-50 transition-all duration-200 text-center",

    cellClass: "py-4 px-4 text-sm font-medium text-center",

    paginationClass:
      "bg-white px-4 py-3 text-gray-700 flex items-center justify-center gap-3 border-t border-slate-200",
  };

  /*
   |--------------------------------------------------------------------------
   | BUILD TABLE DATA
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    if (response?.data) {
      const withActionButton = response.data.map((d, index) => {
        const {
          created_at,
          updated_at,
          status,
          commission_value,
          gst_value,
          type,
          gst_type,
          user_names_json,
          blr_names_json,
          ...rest
        } = d;

        /*
         * Merchants
         */

        let userInfo = "No User was added";

        if (user_names_json) {
          try {
            const parsed = JSON.parse(user_names_json);

            userInfo =
              Array.isArray(parsed) && parsed.length
                ? parsed
                : ["No User was added"];
          } catch (err) {
            console.error("Merchant JSON parsing error:", err);
          }
        }

        /*
         * Billers
         */

        let billerInfo = "No Biller was added";

        if (blr_names_json) {
          try {
            const parsed = JSON.parse(blr_names_json);

            billerInfo =
              Array.isArray(parsed) && parsed.length
                ? parsed
                : ["No Biller was added"];
          } catch (err) {
            console.error("Biller JSON parsing error:", err);
          }
        }

        return {
          ...rest,

          /*
           * Sr No
           */

          srno: index + 1,

          /*
           * Commission
           */

          commission_value:
            type === "percent"
              ? `${commission_value}%`
              : `${commission_value}₹`,

          /*
           * GST
           */

          gst_value: gst_type === "percent" ? `${gst_value}%` : `${gst_value}₹`,

          /*
           * Created Date
           */

          created_at: created_at
            ? new Date(created_at).toLocaleString()
            : "None",

          /*
           * Updated Date
           */

          updated_at: updated_at
            ? new Date(updated_at).toLocaleString()
            : "None",

          /*
           * Status
           */

          status:
            status === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Inactive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active
              </span>
            ),

          /*
           * Merchants
           */

          user_names_json: user_names_json ? (
            <div className="flex flex-col gap-1">
              {userInfo.map((u, index) => (
                <span key={index} className="text-sm text-slate-600">
                  {u}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-slate-400">{userInfo}</span>
          ),

          /*
           * Billers
           */

          blr_names_json: blr_names_json ? (
            <div className="flex flex-col gap-1">
              {billerInfo.map((b, index) => (
                <span key={index} className="text-sm text-slate-600">
                  {b}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-slate-400">{billerInfo}</span>
          ),

          /*
           * Action Buttons
           */

          action: (
            <div className="flex items-center justify-center gap-2">
              {/* Edit */}

              <button
                title="Edit Scheme"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
                onClick={() => {
                  setValue(d);
                  setOperation(2);
                  setIsModelOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPen} size="sm" />
              </button>

              {/* Delete */}

              <button
                title="Delete Scheme"
                onClick={() => {
                  setValue(d.scheme_id);
                  setOperation(3);
                  setIsModelOpen(true);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          ),
        };
      });

      setTableData(withActionButton);
    } else {
      setTableData([]);
    }
  }, [response, loading, setIsModelOpen]);

  /*
   |--------------------------------------------------------------------------
   | UI
   |--------------------------------------------------------------------------
   */

  return (
    <>
      <div
        className={`min-h-screen bg-slate-50 p-4 md:p-6 transition-all duration-300 ${
          isModelOpen ? "pointer-events-none blur-sm" : ""
        }`}
      >
        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          {/* Left */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-800">BBPS Scheme</h1>

              <p className="text-sm text-slate-500">
                Manage BBPS payment schemes
              </p>
            </div>
          </div>

          {/* Right */}

          <div className="flex flex-wrap items-center gap-2">
            {/* Refresh */}

            <button
              onClick={refresh}
              disabled={loading}
              title="Refresh"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faRotate} spin={loading} />

              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Add Scheme */}

            <button
              onClick={() => setShowAddScheme(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Scheme
            </button>
          </div>
        </div>

        {/* ================================================================
            TABLE CARD
        ================================================================= */}

        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            </div>

            <TableSkeleton />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table */}

            <div className="overflow-x-auto">
              <Table
                data={tableData}
                columns={columns}
                isPaginationRequired={true}
                {...tstyle}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          EDIT / DELETE MODAL
      ================================================================= */}

      {isModelOpen && (
        <ServicesAuthContext>
          <SchemeOperationModal
            operation={operation}
            value={value}
            refresh={refresh}
          />
        </ServicesAuthContext>
      )}

      {/* ================================================================
          ADD SCHEME
      ================================================================= */}

      {showAddScheme && (
        <AddSchemeForm
          refresh={refresh}
          onClose={() => setShowAddScheme(false)}
        />
      )}
    </>
  );
};

export default Scheme;
