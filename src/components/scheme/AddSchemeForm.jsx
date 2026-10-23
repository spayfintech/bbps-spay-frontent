// components/scheme/AddSchemeForm.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useGet } from "../../hooks/useGet";
import { usePost } from "../../hooks/usePost";
import Select from "react-select";
import { useServicesContext } from "../../contexts/ServicesAuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faArrowLeft,
  faSliders,
  faUsers,
  faPercent,
  faIndianRupeeSign,
  faCheck,
  faLayerGroup,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

const AddSchemeForm = ({ refresh, onClose, onBack }) => {
  const { data: merchentData } = useGet("/get-merchants");
  // const { data: billerData } = useGet("/get-biller-name-and-category");

  const { execute } = usePost("/create-scheme");

  const [schemeName, setSchemeName] = useState("");
  const [merchentValue, setMerchentValue] = useState([]);
  const [billerValue, setBillerValue] = useState([]);
  const [commissionType, setCommissionType] = useState("");
  const [chargeValue, setChargeValue] = useState("");
  const [chargeGSTValue, setChargeGSTValue] = useState("");
  const [GSTType, setGSTType] = useState("");
  const [isError, setIsError] = useState("");
  const [category, setCategory] = useState("");
  const [billerData, setBillerData] = useState([]);

  // const { forWhat } = useServicesContext();

  const endpoint = useMemo(() => {
    // return category ? `/get-billers${forWhat}/${category}` : null;
    return category ? `/get-billers/${category}` : null;
  }, [category]);

  const { data: serviceByCategory } = useGet(endpoint);

  useEffect(() => {
    setBillerData(serviceByCategory);
  }, [serviceByCategory]);

  const servicesList = [
    { label: "Agent Collection" },
    { label: "Broadband Postpaid" },
    { label: "Cable TV" },
    { label: "Clubs and Associations" },
    { label: "Credit Card" },
    { label: "Donation" },
    { label: "DTH" },
    { label: "eChallan" },
    { label: "Education Fees" },
    { label: "Electricity" },
    { label: "EV Recharge" },
    { label: "Fastag" },
    { label: "Gas" },
    { label: "Housing Society" },
    { label: "Insurance" },
    { label: "Landline Postpaid" },
    { label: "Loan Repayment" },
    { label: "LPG Gas" },
    { label: "Mobile Postpaid" },
    { label: "Mobile Prepaid" },
    { label: "Municipal Services" },
    { label: "Municipal Taxes" },
    { label: "National Pension System" },
    { label: "NCMC Recharge" },
    { label: "Prepaid Meter" },
    { label: "Recurring Deposit" },
    { label: "Rental" },
    { label: "Subscription" },
    { label: "Water" },
  ];

  const merchentOptions =
    merchentData?.data?.map((m) => ({
      value: m.id,
      label: m.name,
    })) || [];

  const billerOptions =
    billerData?.map((b) => ({
      value: b.blr_id,
      label: b.blr_name,
    })) || [];

  const closeModal = () => {
    onClose();
  };

  const handleSubmit = async () => {
    const body = {
      name: schemeName,
      commission_type: "wallet",
      type: commissionType,
      commission_value: chargeValue,
      status: true,
      gst_type: "percent",
      gst_value: chargeGSTValue,
      merchant_id: merchentValue.map((m) => m.value),
      blr_id: billerValue.map((b) => b.value),
    };

    const response = await execute(body);

    if (response?.status === "false") {
      setIsError(response.error);
      return;
    }

    refresh();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  Add Scheme
                </h2>

                <p className="truncate text-xs text-slate-500 sm:text-sm">
                  Configure commission scheme for BBPS services
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
          </div>
        </div>

        {/* =====================================================
            BODY
        ====================================================== */}

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-5 p-4 sm:p-6">
            {/* =================================================
                MAIN FORM
            ================================================== */}

            <div className="space-y-5 lg:col-span-2">
              {/* =================================================
                  SERVICE CONFIGURATION
              ================================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Service Configuration
                    </h3>

                    <p className="text-xs text-slate-500">
                      Select the BBPS service category
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Scheme Name */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Scheme Name
                    </label>

                    <input
                      type="text"
                      value={schemeName}
                      onChange={(e) => setSchemeName(e.target.value)}
                      placeholder="Enter scheme name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  {/* Category */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Select Category
                    </label>

                    <select
                      onChange={(e) => {
                        setSchemeName(e.target.value);
                        setCategory(e.target.value);
                      }}
                      value={category}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Select Category</option>

                      {servicesList.map((s) => (
                        <option key={s.label} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* =================================================
                  MERCHANT & BILLER
              ================================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Merchant & Biller Mapping
                    </h3>

                    <p className="text-xs text-slate-500">
                      Assign merchants and billers to this scheme
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Merchant */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Merchant
                      </label>
                    </div>

                    <Select
                      options={merchentOptions}
                      isMulti
                      value={merchentValue}
                      onChange={setMerchentValue}
                      placeholder="Select Merchants"
                      classNamePrefix="merchant-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: "46px",
                          borderRadius: "12px",
                          borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
                          boxShadow: state.isFocused
                            ? "0 0 0 4px rgba(59,130,246,0.10)"
                            : "none",
                          backgroundColor: "#ffffff",
                        }),

                        multiValue: (base) => ({
                          ...base,
                          borderRadius: "8px",
                          backgroundColor: "#eff6ff",
                        }),

                        multiValueLabel: (base) => ({
                          ...base,
                          color: "#1d4ed8",
                          fontWeight: 600,
                        }),

                        menu: (base) => ({
                          ...base,
                          zIndex: 100,
                        }),
                      }}
                    />
                  </div>

                  {/* Biller */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Biller
                      </label>
                    </div>

                    <Select
                      options={billerOptions}
                      isMulti
                      value={billerValue}
                      onChange={setBillerValue}
                      placeholder="Select Billers"
                      classNamePrefix="biller-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: "46px",
                          borderRadius: "12px",
                          borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
                          boxShadow: state.isFocused
                            ? "0 0 0 4px rgba(59,130,246,0.10)"
                            : "none",
                          backgroundColor: "#ffffff",
                        }),

                        multiValue: (base) => ({
                          ...base,
                          borderRadius: "8px",
                          backgroundColor: "#eef2ff",
                        }),

                        multiValueLabel: (base) => ({
                          ...base,
                          color: "#4338ca",
                          fontWeight: 600,
                        }),

                        menu: (base) => ({
                          ...base,
                          zIndex: 100,
                        }),
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="mt-0.5 text-blue-500"
                  />

                  <span>
                    The selected merchants and billers will be mapped to this
                    commission scheme.
                  </span>
                </div>
              </div>

              {/* =================================================
                  COMMISSION FEE
              ================================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FontAwesomeIcon icon={faPercent} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Commission Fee
                    </h3>

                    <p className="text-xs text-slate-500">
                      Configure the commission structure
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Commission Type */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Commission Type
                    </label>

                    <select
                      value={commissionType}
                      onChange={(e) => setCommissionType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Select Type</option>

                      <option value="flat">Flat</option>

                      <option value="percent">Percent</option>
                    </select>
                  </div>

                  {/* Amount */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Amount / %
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <FontAwesomeIcon
                          icon={
                            commissionType === "flat"
                              ? faIndianRupeeSign
                              : faPercent
                          }
                        />
                      </span>

                      <input
                        type="text"
                        value={chargeValue}
                        placeholder="Enter value"
                        onChange={(e) => setChargeValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  {/* GST */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      GST Value
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <FontAwesomeIcon icon={faPercent} />
                      </span>

                      <input
                        type="text"
                        value={chargeGSTValue}
                        placeholder="Enter GST"
                        onChange={(e) => setChargeGSTValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              ERROR
          ==================================================== */}

          {isError && (
            <div className="px-4 pb-4 sm:px-6">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {isError}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FontAwesomeIcon icon={faCheck} />
              </span>

              <span>Configure the scheme and submit to save changes.</span>
            </div>

            <div className="flex w-full gap-3 sm:w-auto">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 sm:flex-none"
              >
                <FontAwesomeIcon icon={faCheck} />
                Submit Scheme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSchemeForm;
