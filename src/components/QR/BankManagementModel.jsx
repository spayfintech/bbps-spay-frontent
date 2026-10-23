import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faPlus,
  faXmark,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

import { useGet } from "../../hooks/useGet";
import { usePost } from "../../hooks/usePost";

const BankManagementModel = ({ onClose }) => {
  // ============================================================
  // AUTH
  // ============================================================

  const [cookie] = useCookies(["token"]);

  // ============================================================
  // STATE
  // ============================================================

  const [activeTab, setActiveTab] = useState("payin");

  const [bankData, setBankData] = useState([]);

  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const [bankName, setBankName] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage] = useState(10);

  const [deleteLoading, setDeleteLoading] = useState(null);

  // ============================================================
  // GET PAYIN BANKS
  // ============================================================

  const {
    data: payinbanks,
    refetch: payinRefetch,
    loading: payinLoading,
  } = useGet("/payinbanks-List");

  // ============================================================
  // GET PAYOUT BANKS
  // ============================================================

  const {
    data: payoutbanks,
    refetch: payoutRefetch,
    loading: payoutLoading,
  } = useGet("/payoutbanks-List");

  // ============================================================
  // STATUS APIs
  // ============================================================

  const { execute: updatePayinToggle } = usePost("/update-payin-bank-status");

  const { execute: updatePayoutToggle } = usePost("/update-payout-bank-status");

  // ============================================================
  // ADD BANK API
  // ============================================================

  const addBankEndpoint =
    activeTab === "payin" ? "/onboard-payinbank" : "/onboard-payoutbank";

  const {
    execute: onBoardBank,
    loading: addBankLoading,
    error: addBankError,
    setError: setAddBankError,
  } = usePost(addBankEndpoint);

  // ============================================================
  // LOADING
  // ============================================================

  const loading = activeTab === "payin" ? payinLoading : payoutLoading;

  // ============================================================
  // FORMAT API DATA
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);

    if (activeTab === "payin") {
      const mapped =
        payinbanks?.data?.data?.map((item, index) => ({
          sqno: index + 1,
          id: item.id,
          bank_name: item.onboard_payin_bank,
          status:
            item.onboarded_payin_bank_status === 1 ? "Active" : "Inactive",
        })) || [];

      setBankData(mapped);
    } else {
      const mapped =
        payoutbanks?.data?.data?.map((item, index) => ({
          sqno: index + 1,
          id: item.id,
          bank_name: item.onboard_payout_bank,
          status:
            item.onboarded_payout_bank_status === 1 ? "Active" : "Inactive",
        })) || [];

      setBankData(mapped);
    }
  }, [activeTab, payinbanks, payoutbanks]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return bankData;
    }

    return bankData.filter((item) =>
      item.bank_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [bankData, search]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshCurrentTab = () => {
    if (activeTab === "payin") {
      payinRefetch();
    } else {
      payoutRefetch();
    }
  };

  // ============================================================
  // TAB CHANGE
  // ============================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setCurrentPage(1);
  };

  // ============================================================
  // OPEN ADD BANK
  // ============================================================

  const openAddBankModal = () => {
    setBankName("");
    setAddBankError(null);
    setShowAddBankModal(true);
  };

  // ============================================================
  // CLOSE ADD BANK
  // ============================================================

  const closeAddBankModal = () => {
    setShowAddBankModal(false);
    setBankName("");
    setAddBankError(null);
  };

  // ============================================================
  // ADD BANK
  // ============================================================

  const handleAddBank = async (e) => {
    e.preventDefault();

    const trimmedName = bankName.trim();

    if (!trimmedName) {
      return;
    }

    const payload =
      activeTab === "payin"
        ? {
            onboard_payin_bank: trimmedName,
          }
        : {
            onboard_payout_bank: trimmedName,
          };

    try {
      const response = await onBoardBank(payload);

      if (response) {
        closeAddBankModal();
        refreshCurrentTab();
      }
    } catch (error) {
      console.error("Add bank error:", error);
    }
  };

  // ============================================================
  // STATUS TOGGLE
  // ============================================================

  const handleStatusToggle = async (id, checked) => {
    try {
      let response;

      if (activeTab === "payin") {
        response = await updatePayinToggle({
          id,
          onboarded_payin_bank_status: checked,
        });
      } else {
        response = await updatePayoutToggle({
          id,
          onboarded_payout_bank_status: checked,
        });
      }

      if (response) {
        setBankData((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: checked ? "Active" : "Inactive",
                }
              : item,
          ),
        );

        refreshCurrentTab();
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // ============================================================
  // DELETE BANK
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bank?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(id);

      const bearerToken = cookie.token?.includes("|")
        ? cookie.token.split("|").pop()
        : cookie.token;

      const endpoint =
        activeTab === "payin"
          ? `/delete-payinbank/${id}`
          : `/delete-payoutbank/${id}`;

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (response?.data) {
        refreshCurrentTab();
      }
    } catch (error) {
      console.error(
        "Delete bank error:",
        error?.response?.data || error?.message || error,
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      {/* ======================================================
          MAIN MODAL
      ====================================================== */}

      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6"
          style={{
            background: "linear-gradient(135deg, #1d77ff 0%, #00418c 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <FontAwesomeIcon icon={faBuildingColumns} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Bank Management
              </h2>

              <p className="text-xs text-blue-100 sm:text-sm">
                Manage Payin and Payout banks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* ====================================================
            BODY
        ==================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {/* ==================================================
              TOP BAR
          ================================================== */}

          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            {/* TABS */}

            <div className="flex w-full gap-2 lg:w-auto">
              <button
                type="button"
                onClick={() => handleTabChange("payin")}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                  activeTab === "payin"
                    ? "bg-blue-600 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Payin Bank List
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("payout")}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                  activeTab === "payout"
                    ? "bg-blue-600 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Payout Bank List
              </button>
            </div>

            {/* RIGHT ACTIONS */}

            <div className="flex w-full gap-2 lg:w-auto">
              <button
                type="button"
                onClick={refreshCurrentTab}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 lg:flex-none"
              >
                <FontAwesomeIcon icon={faRotate} spin={loading} />
                Refresh
              </button>

              <button
                type="button"
                onClick={openAddBankModal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95 lg:flex-none"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Bank
              </button>
            </div>
          </div>

          {/* ==================================================
              SEARCH + INFO
          ================================================== */}

          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">
                {activeTab === "payin" ? "Payin Banks" : "Payout Banks"}
              </p>

              <p className="text-xs text-slate-500">
                {filteredData.length} bank
                {filteredData.length !== 1 ? "s" : ""} available
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search bank..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-64"
            />
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex animate-pulse gap-4">
                    <div className="h-10 w-16 rounded-lg bg-slate-100" />
                    <div className="h-10 flex-1 rounded-lg bg-slate-100" />
                    <div className="h-10 w-24 rounded-lg bg-slate-100" />
                    <div className="h-10 w-16 rounded-lg bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : bankData.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <FontAwesomeIcon icon={faBuildingColumns} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-700">
                  No Banks Found
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  No {activeTab} banks are currently available.
                </p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No matching banks found
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                {/* ==================================================
                    DESKTOP TABLE
                ================================================== */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          SQ No
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Bank Name
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.map((bank, index) => (
                        <tr
                          key={bank.id}
                          className="transition hover:bg-blue-50/40"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <FontAwesomeIcon icon={faBuildingColumns} />
                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {bank.bank_name || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusToggle(
                                    bank.id,
                                    bank.status !== "Active",
                                  )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                  bank.status === "Active"
                                    ? "bg-blue-600"
                                    : "bg-slate-300"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                    bank.status === "Active"
                                      ? "left-6"
                                      : "left-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDelete(bank.id)}
                              disabled={deleteLoading === bank.id}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete Bank"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ==================================================
                    MOBILE CARDS
                ================================================== */}

                <div className="space-y-3 p-3 md:hidden">
                  {paginatedData.map((bank, index) => (
                    <div
                      key={bank.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FontAwesomeIcon icon={faBuildingColumns} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase text-slate-400">
                              Bank #
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </p>

                            <p className="truncate text-sm font-bold text-slate-700">
                              {bank.bank_name || "-"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusToggle(
                              bank.id,
                              bank.status !== "Active",
                            )
                          }
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            bank.status === "Active"
                              ? "bg-blue-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                              bank.status === "Active" ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            bank.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {bank.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDelete(bank.id)}
                          disabled={deleteLoading === bank.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ==================================================
                    PAGINATION
                ================================================== */}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4">
                    <p className="text-xs text-slate-500">
                      Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ====================================================
            ADD BANK MODAL
        ==================================================== */}

        {showAddBankModal && (
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={closeAddBankModal}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}

              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background:
                    "linear-gradient(135deg, #55abe9 0%, #00418c 100%)",
                }}
              >
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeTab === "payin"
                      ? "Add Payin Bank"
                      : "Add Payout Bank"}
                  </h3>

                  <p className="mt-0.5 text-xs text-blue-100">
                    Enter bank details to onboard
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAddBankModal}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* FORM */}

              <form onSubmit={handleAddBank} className="p-5 sm:p-6">
                {/* BANK NAME */}

                <div className="mb-5">
                  <label
                    htmlFor="bank_name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Bank Name
                  </label>

                  <input
                    id="bank_name"
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    required
                    autoFocus
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                      addBankError?.error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />

                  {addBankError?.error && (
                    <p className="mt-2 text-sm font-medium text-red-500">
                      {addBankError.error}
                    </p>
                  )}
                </div>

                {/* BANK TYPE  */}

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Bank Type
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {activeTab === "payin" ? "Payin" : "Payout"}
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeAddBankModal}
                    disabled={addBankLoading}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={addBankLoading || !bankName.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addBankLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} />
                        Save Bank
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankManagementModel;
