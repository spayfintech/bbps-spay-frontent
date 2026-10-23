import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faRotate,
  faPlus,
  faPen,
  faTrash,
  faXmark,
  faCheck,
  faArrowLeft,
  faArrowRight,
  faIndianRupeeSign,
} from "@fortawesome/free-solid-svg-icons";

import { useGet } from "../../hooks/useGet";
import { usePost } from "../../hooks/usePost";

// import BankManagementModel from "./BankManagementModel";
import BankManagementModel from "../../components/QR/BankManagementModel";

const Qrscheme = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [refreshKey, setRefreshKey] = useState(0);

  const [tableData, setTableData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [selectedScheme, setSelectedScheme] = useState(null);

  const [showBankModal, setShowBankModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status: true,

    payin_commision_type_below: "percent",
    payin_commision_amount_below: "",

    payin_commision_type_above: "percent",
    payin_commision_amount_above: "",

    payout_commision_type_below: "percent",
    payout_commision_amount_below: "",

    payout_commision_type_above: "percent",
    payout_commision_amount_above: "",

    rolling_payin_amount: "",
    rolling_payin_type: "percent",

    rolling_fixed_amount: "",
    rolling_fixed_type: "flat",

    gst_amount: "",
    gst_type: "percent",
  });

  const [createStep, setCreateStep] = useState(1);

  // ============================================================
  // GET SCHEMES
  // ============================================================

  const {
    data: response,
    loading,
    error,
  } = useGet(`/get-scheme?refresh=${refreshKey}`);

  // ============================================================
  // UPDATE API
  // ============================================================

  const { execute: updateScheme, loading: updateLoading } = usePost(
    selectedScheme ? `/update-scheme/${selectedScheme.id}` : "/update-scheme",
  );

  // ============================================================
  // DELETE API
  // ============================================================

  const { execute: deleteScheme, loading: deleteLoading } =
    usePost("/delete-scheme");

  const { execute: createScheme, loading: createLoading } =
    usePost("/create-scheme");
  // ============================================================
  // status API
  // ============================================================

  const { execute: updateSchemeStatus, loading: statusLoading } = usePost(
    "/update-scheme-status",
  );

  // ============================================================
  // LOAD API DATA
  // ============================================================

  useEffect(() => {
    if (!response) {
      setTableData([]);
      return;
    }

    try {
      let data = response?.data || response;

      if (!Array.isArray(data)) {
        data = data?.data || [];
      }

      setTableData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Scheme response error:", err);
      setTableData([]);
    }
  }, [response]);

  // ============================================================
  // REFRESH
  // ============================================================

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // ============================================================
  // OPEN UPDATE
  // ============================================================

  const openCreateModal = () => {
    setSelectedScheme(null);

    setFormData({
      name: "",
      status: true,

      payin_commision_type_below: "percent",
      payin_commision_amount_below: "",

      payin_commision_type_above: "percent",
      payin_commision_amount_above: "",

      payout_commision_type_below: "percent",
      payout_commision_amount_below: "",

      payout_commision_type_above: "percent",
      payout_commision_amount_above: "",

      rolling_payin_amount: "",
      rolling_payin_type: "percent",

      rolling_fixed_amount: "",
      rolling_fixed_type: "flat",

      gst_amount: "",
      gst_type: "percent",
    });

    setCreateStep(1);
    setModalType("create");
    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEditModal = (scheme) => {
    setSelectedScheme(scheme);

    setFormData({
      name: scheme?.name || "",
      status:
        scheme?.status === true ||
        scheme?.status === 1 ||
        scheme?.status === "1" ||
        scheme?.status === "true",

      payin_commision_type_below:
        scheme?.payin_commision_type_below || "percent",
      payin_commision_amount_below: scheme?.payin_commision_amount_below || "",

      payin_commision_type_above:
        scheme?.payin_commision_type_above || "percent",
      payin_commision_amount_above: scheme?.payin_commision_amount_above || "",

      payout_commision_type_below:
        scheme?.payout_commision_type_below || "percent",
      payout_commision_amount_below:
        scheme?.payout_commision_amount_below || "",

      payout_commision_type_above:
        scheme?.payout_commision_type_above || "percent",
      payout_commision_amount_above:
        scheme?.payout_commision_amount_above || "",

      rolling_payin_amount: scheme?.rolling_payin_amount || "",
      rolling_payin_type: scheme?.rolling_payin_type || "percent",

      rolling_fixed_amount: scheme?.rolling_fixed_amount || "",
      rolling_fixed_type: scheme?.rolling_fixed_type || "flat",

      gst_amount: scheme?.gst_amount || "",
      gst_type: scheme?.gst_type || "percent",
    });

    setCreateStep(1);
    setModalType("edit");
    setShowModal(true);
  };

  // ============================================================
  // OPEN DELETE
  // ============================================================

  const openDeleteModal = (scheme) => {
    setSelectedScheme(scheme);

    setModalType("delete");
    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedScheme(null);

    setCreateStep(1);

    setFormData({
      name: "",
      status: true,

      payin_commision_type_below: "percent",
      payin_commision_amount_below: "",

      payin_commision_type_above: "percent",
      payin_commision_amount_above: "",

      payout_commision_type_below: "percent",
      payout_commision_amount_below: "",

      payout_commision_type_above: "percent",
      payout_commision_amount_above: "",

      rolling_payin_amount: "",
      rolling_payin_type: "percent",

      rolling_fixed_amount: "",
      rolling_fixed_type: "flat",

      gst_amount: "",
      gst_type: "percent",
    });
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  // ============================================================
  // STATUS UPDATE SCHEME
  // ============================================================

  const handleStatusToggle = async (scheme) => {
    if (!scheme?.id || statusLoading) return;

    const currentStatus =
      scheme.status === true ||
      scheme.status === 1 ||
      scheme.status === "1" ||
      scheme.status === "true";

    const newStatus = !currentStatus;

    try {
      const result = await updateSchemeStatus({
        scheme_id: scheme.id,
        status: newStatus,
      });

      console.log("Status update response:", result);

      refresh();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // ============================================================
  // CREATE SCHEME
  // ============================================================

  const handleCreate = async (e) => {
    e.preventDefault();

    // Step 1 -> Step 2
    // Step 2 -> Step 3
    if (createStep < 3) {
      setCreateStep((prev) => prev + 1);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        status: formData.status,

        payin_commision_type_below: formData.payin_commision_type_below,
        payin_commision_amount_below:
          formData.payin_commision_amount_below || null,

        payin_commision_type_above: formData.payin_commision_type_above,
        payin_commision_amount_above:
          formData.payin_commision_amount_above || null,

        payout_commision_type_below: formData.payout_commision_type_below,
        payout_commision_amount_below:
          formData.payout_commision_amount_below || null,

        payout_commision_type_above: formData.payout_commision_type_above,
        payout_commision_amount_above:
          formData.payout_commision_amount_above || null,

        rolling_payin_amount: formData.rolling_payin_amount || null,
        rolling_payin_type: formData.rolling_payin_type,

        rolling_fixed_amount: formData.rolling_fixed_amount || null,
        rolling_fixed_type: formData.rolling_fixed_type,

        gst_amount: formData.gst_amount || null,
        gst_type: formData.gst_type,
      };

      console.log("Create Scheme Payload:", payload);

      const result = await createScheme(payload);

      console.log("Create Scheme Response:", result);

      closeModal();
      refresh();
    } catch (err) {
      console.error("Create Scheme Error:", err);
    }
  };

  // ============================================================
  // UPDATE SCHEME
  // ============================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (createStep < 3) {
      setCreateStep((prev) => prev + 1);
      return;
    }

    if (!selectedScheme?.id) return;

    try {
      const payload = {
        name: formData.name,
        status: formData.status,

        payin_commision_type_below: formData.payin_commision_type_below,
        payin_commision_amount_below:
          formData.payin_commision_amount_below || null,

        payin_commision_type_above: formData.payin_commision_type_above,
        payin_commision_amount_above:
          formData.payin_commision_amount_above || null,

        payout_commision_type_below: formData.payout_commision_type_below,
        payout_commision_amount_below:
          formData.payout_commision_amount_below || null,

        payout_commision_type_above: formData.payout_commision_type_above,
        payout_commision_amount_above:
          formData.payout_commision_amount_above || null,

        rolling_payin_amount: formData.rolling_payin_amount || null,
        rolling_payin_type: formData.rolling_payin_type,

        rolling_fixed_amount: formData.rolling_fixed_amount || null,
        rolling_fixed_type: formData.rolling_fixed_type,

        gst_amount: formData.gst_amount || null,
        gst_type: formData.gst_type,
      };

      console.log("Update Scheme Payload:", payload);

      const result = await updateScheme(payload);

      console.log("Update Scheme Response:", result);

      closeModal();
      refresh();
    } catch (err) {
      console.error("Update Scheme Error:", err);
    }
  };

  // ============================================================
  // DELETE SCHEME
  // ============================================================

  const handleDelete = async () => {
    if (!selectedScheme?.id) {
      return;
    }

    try {
      const result = await deleteScheme(selectedScheme.id);

      console.log("Delete scheme response:", result);

      closeModal();
      refresh();
    } catch (err) {
      console.error("Delete scheme error:", err);
    }
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (status) => {
    const isActive =
      status === true ||
      status === 1 ||
      status === "1" ||
      status === "true" ||
      status === "active";

    return isActive ? (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Inactive
      </span>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FontAwesomeIcon icon={faQrcode} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">QR Schemes</h1>

            <p className="text-sm text-slate-500">Manage QR payment schemes</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRotate} spin={loading} />
            Refresh
          </button>

          {/* Add Scheme */}

          <button
            type="button"
            onClick={() => setShowBankModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Bank
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Scheme
          </button>
        </div>
      </div>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {typeof error === "string" ? error : "Unable to fetch schemes."}
        </div>
      )}

      {/* ========================================================
          TABLE
      ======================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            {/* ==================================================
                HEADER
            ================================================== */}

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Scheme ID
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Name
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  Delete
                </th>
              </tr>
            </thead>

            {/* ==================================================
                BODY
            ================================================== */}

            <tbody className="divide-y divide-slate-100">
              {/* LOADING */}

              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-5">
                      <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-5">
                      <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-5">
                      <div className="mx-auto h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                    </td>

                    <td className="px-5 py-5">
                      <div className="mx-auto h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
                    </td>

                    <td className="px-5 py-5">
                      <div className="mx-auto h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : tableData.length === 0 ? (
                /* EMPTY */

                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                      <FontAwesomeIcon icon={faQrcode} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-700">
                      No schemes found
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      There are no QR schemes available.
                    </p>
                  </td>
                </tr>
              ) : (
                /* DATA */

                tableData.map((scheme) => (
                  <tr
                    key={scheme?.id}
                    className="transition hover:bg-blue-50/40"
                  >
                    {/* SCHEME ID */}

                    <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                      #{scheme?.id || "-"}
                    </td>

                    {/* NAME */}

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <FontAwesomeIcon icon={faQrcode} />
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {scheme?.name || "-"}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(scheme)}
                        disabled={statusLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                          scheme?.status === true ||
                          scheme?.status === 1 ||
                          scheme?.status === "1" ||
                          scheme?.status === "true"
                            ? "bg-blue-600"
                            : "bg-slate-300"
                        } ${
                          statusLoading
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                        title={
                          scheme?.status
                            ? "Deactivate Scheme"
                            : "Activate Scheme"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            scheme?.status === true ||
                            scheme?.status === 1 ||
                            scheme?.status === "1" ||
                            scheme?.status === "true"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    {/* ACTION / EDIT */}

                    <td className="px-5 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(scheme)}
                        title="Edit Scheme"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white active:scale-95"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>

                    {/* DELETE */}

                    <td className="px-5 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => openDeleteModal(scheme)}
                        title="Delete Scheme"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white active:scale-95"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL
      ======================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {modalType === "create"
                    ? "Create QR Scheme"
                    : modalType === "edit"
                      ? "Edit QR Scheme"
                      : "Delete QR Scheme"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {modalType === "create"
                    ? "Configure scheme and transaction charges"
                    : modalType === "edit"
                      ? "Update scheme details"
                      : "Confirm scheme deletion"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* ==================================================
                EDIT
            ================================================== */}

            {/* {modalType === "edit" && (
              <form onSubmit={handleUpdate} className="p-5">

                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Scheme ID
                  </label>

                  <input
                    type="text"
                    value={selectedScheme?.id || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Enter scheme name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={String(formData.status)}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="true">Active</option>

                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faCheck} />

                    {updateLoading ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            )} */}

            {/* ==================================================
                CREATE
            ================================================== */}
            {modalType !== "delete" && (
              <form
                onSubmit={modalType === "create" ? handleCreate : handleUpdate}
              >
                {/* STEP HEADER */}
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center">
                    {[1, 2, 3].map((step, index) => (
                      <React.Fragment key={step}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              createStep >= step
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {step}
                          </div>

                          <span
                            className={`hidden text-xs font-semibold sm:block ${
                              createStep >= step
                                ? "text-slate-700"
                                : "text-slate-400"
                            }`}
                          >
                            {step === 1
                              ? "Basic"
                              : step === 2
                                ? "Charges"
                                : "GST"}
                          </span>
                        </div>

                        {index < 2 && (
                          <div
                            className={`mx-3 h-px flex-1 ${
                              createStep > step ? "bg-blue-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* BODY */}
                <div className="max-h-[55vh] overflow-y-auto px-5 py-5">
                  {/* ================= STEP 1 ================= */}
                  {createStep === 1 && (
                    <div className="space-y-5">
                      {/* NAME */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Scheme Name
                        </label>

                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter scheme name"
                          required
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      {/* STATUS */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Scheme Status
                          </p>

                          {modalType === "create"
                            ? "Activate scheme after creation"
                            : "Update scheme status"}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              status: !prev.status,
                            }))
                          }
                          className={`relative h-6 w-11 rounded-full transition ${
                            formData.status ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                              formData.status ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= STEP 2 ================= */}
                  {createStep === 2 && (
                    <div className="space-y-5">
                      {/* PAY-IN */}
                      <div>
                        <h3 className="mb-1 text-sm font-bold text-slate-700">
                          Pay-In Charges
                        </h3>

                        <p className="mb-3 text-xs text-slate-400">
                          Configure Pay-In commission
                        </p>

                        <div className="space-y-2">
                          {/* BELOW */}
                          <div className="grid grid-cols-[1fr_90px_1fr] items-center gap-2 rounded-xl bg-slate-50 p-3">
                            <span className="text-xs font-semibold text-slate-600">
                              Below
                            </span>

                            <select
                              value={formData.payin_commision_type_below}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payin_commision_type_below: e.target.value,
                                }))
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500"
                            >
                              <option value="percent">%</option>
                              <option value="flat">₹</option>
                            </select>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payin_commision_amount_below}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payin_commision_amount_below: e.target.value,
                                }))
                              }
                              placeholder="Amount"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* ABOVE */}
                          <div className="grid grid-cols-[1fr_90px_1fr] items-center gap-2 rounded-xl bg-slate-50 p-3">
                            <span className="text-xs font-semibold text-slate-600">
                              Above
                            </span>

                            <select
                              value={formData.payin_commision_type_above}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payin_commision_type_above: e.target.value,
                                }))
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500"
                            >
                              <option value="percent">%</option>
                              <option value="flat">₹</option>
                            </select>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payin_commision_amount_above}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payin_commision_amount_above: e.target.value,
                                }))
                              }
                              placeholder="Amount"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PAYOUT */}
                      <div className="border-t border-slate-100 pt-5">
                        <h3 className="mb-1 text-sm font-bold text-slate-700">
                          Payout Charges
                        </h3>

                        <p className="mb-3 text-xs text-slate-400">
                          Configure Payout commission
                        </p>

                        <div className="space-y-2">
                          {/* BELOW */}
                          <div className="grid grid-cols-[1fr_90px_1fr] items-center gap-2 rounded-xl bg-slate-50 p-3">
                            <span className="text-xs font-semibold text-slate-600">
                              Below
                            </span>

                            <select
                              value={formData.payout_commision_type_below}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payout_commision_type_below: e.target.value,
                                }))
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500"
                            >
                              <option value="percent">%</option>
                              <option value="flat">₹</option>
                            </select>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payout_commision_amount_below}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payout_commision_amount_below: e.target.value,
                                }))
                              }
                              placeholder="Amount"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* ABOVE */}
                          <div className="grid grid-cols-[1fr_90px_1fr] items-center gap-2 rounded-xl bg-slate-50 p-3">
                            <span className="text-xs font-semibold text-slate-600">
                              Above
                            </span>

                            <select
                              value={formData.payout_commision_type_above}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payout_commision_type_above: e.target.value,
                                }))
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500"
                            >
                              <option value="percent">%</option>
                              <option value="flat">₹</option>
                            </select>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payout_commision_amount_above}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  payout_commision_amount_above: e.target.value,
                                }))
                              }
                              placeholder="Amount"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= STEP 3 ================= */}
                  {createStep === 3 && (
                    <div className="space-y-5">
                      {/* ROLLING PAYIN */}
                      <div>
                        <h3 className="mb-3 text-sm font-bold text-slate-700">
                          Rolling Charges
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Rolling Pay-In
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={formData.rolling_payin_amount}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  rolling_payin_amount: e.target.value,
                                }))
                              }
                              placeholder="Amount"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Type
                            </label>

                            <select
                              value={formData.rolling_payin_type}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  rolling_payin_type: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="percent">Percent</option>
                              <option value="flat">Flat</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* FIXED */}
                      <div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Fixed Rolling
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={formData.rolling_fixed_amount}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  rolling_fixed_amount: e.target.value,
                                }))
                              }
                              placeholder="Amount"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Type
                            </label>

                            <select
                              value={formData.rolling_fixed_type}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  rolling_fixed_type: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="flat">Flat</option>
                              <option value="percent">Percent</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* GST */}
                      <div className="border-t border-slate-100 pt-5">
                        <h3 className="mb-3 text-sm font-bold text-slate-700">
                          GST
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              GST Amount
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={formData.gst_amount}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gst_amount: e.target.value,
                                }))
                              }
                              placeholder="18"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Type
                            </label>

                            <select
                              value={formData.gst_type}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gst_type: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="percent">Percent</option>
                              <option value="flat">Flat</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (createStep === 1) {
                        closeModal();
                      } else {
                        setCreateStep((prev) => prev - 1);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    {createStep === 1 ? "Cancel" : "Back"}
                  </button>

                  <button
                    type="submit"
                    disabled={createLoading || updateLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createLoading || updateLoading ? (
                      modalType === "create" ? (
                        "Creating..."
                      ) : (
                        "Updating..."
                      )
                    ) : createStep === 3 ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        {modalType === "create"
                          ? "Create Scheme"
                          : "Update Scheme"}
                      </>
                    ) : (
                      <>
                        Continue
                        <FontAwesomeIcon icon={faArrowRight} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ==================================================
                DELETE
            ================================================== */}

            {modalType === "delete" && (
              <div className="p-5">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm leading-6 text-red-700">
                    Are you sure you want to delete{" "}
                    <strong>{selectedScheme?.name}</strong>?
                  </p>

                  <p className="mt-1 text-xs text-red-500">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} />

                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showBankModal && (
        <BankManagementModel onClose={() => setShowBankModal(false)} />
      )}
    </div>
  );
};

export default Qrscheme;
