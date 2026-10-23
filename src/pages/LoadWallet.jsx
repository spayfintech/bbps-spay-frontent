import { useEffect, useMemo, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  RefreshCw,
  Search,
  ArrowDownToLine,
  RotateCcw,
  Users,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

import Table from "../components/Table";
import Button from "../components/Button";
import { TableSkeleton } from "../components/TableSkeletonn";
import WalletModal from "../components/WalletModal";
import { useGet } from "../hooks/useGet";

const LoadWallet = () => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [modalMode, setModalMode] = useState("load");

  const [rawData, setRawData] = useState([]);
  const [search, setSearch] = useState("");

  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);

  const [requestEndpoint, setRequestEndpoint] = useState(
    "/get-merchants?per_page=50",
  );

  const loadingRef = useRef(false);
  const appendNextRef = useRef(false);

  const token = cookies.token;

  // Use the existing shared GET hook.
  const {
    data: merchantsResponse,
    loading,
    error: apiError,
    refetch,
  } = useGet(requestEndpoint);

  const baseEndpoint = `/get-merchants?per_page=${entriesPerPage}`;

  // Keep the loading ref synchronized with the shared hook.
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Process each successful API response.
  useEffect(() => {
    if (!merchantsResponse) return;

    if (!merchantsResponse.status || !Array.isArray(merchantsResponse.data)) {
      setPageError(
        merchantsResponse.message ||
          "Invalid response received from the server.",
      );
      appendNextRef.current = false;
      loadingRef.current = false;
      setRefreshing(false);
      return;
    }

    const pageData = merchantsResponse.data;
    const shouldAppend = appendNextRef.current;

    appendNextRef.current = false;
    setPageError("");

    setRawData((previous) => {
      if (!shouldAppend) {
        return pageData;
      }

      const existingIds = new Set(previous.map((item) => item.id));
      const uniqueItems = pageData.filter((item) => !existingIds.has(item.id));

      return [...previous, ...uniqueItems];
    });

    const nextCursor = merchantsResponse.next_cursor ?? null;

    setCursor(nextCursor);
    setHasMore(Boolean(nextCursor));
    loadingRef.current = false;
    setRefreshing(false);
  }, [merchantsResponse]);

  // Display API errors without modifying the shared hook.
  useEffect(() => {
    if (!apiError) return;

    setPageError(
      typeof apiError === "string"
        ? apiError
        : apiError.message || "Unable to load merchants.",
    );

    appendNextRef.current = false;
    loadingRef.current = false;
    setRefreshing(false);
  }, [apiError]);

  const displayError =
    pageError ||
    (!token ? "Authentication token not found. Please log in again." : "");

  // Reset pagination and fetch the first page.
  const refreshMerchants = () => {
    if (loadingRef.current || loading) return;

    appendNextRef.current = false;
    loadingRef.current = true;

    setPageError("");
    setRawData([]);
    setCursor(null);
    setHasMore(true);
    setRefreshing(true);

    if (requestEndpoint !== baseEndpoint) {
      setRequestEndpoint(baseEndpoint);
      return;
    }

    if (!token) {
      loadingRef.current = false;
      setRefreshing(false);
      setPageError("Authentication token not found. Please log in again.");
      return;
    }

    Promise.resolve(refetch())
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
        setRefreshing(false);
      });
  };

  const handleRefresh = () => {
    refreshMerchants();
  };

  // Load the next cursor page through useGet.
  const handleLoadMore = () => {
    if (loadingRef.current || loading || !hasMore || !cursor) return;

    appendNextRef.current = true;
    loadingRef.current = true;
    setPageError("");

    const params = new URLSearchParams({
      per_page: String(entriesPerPage),
      cursor: cursor,
    });

    setRequestEndpoint(`/get-merchants?${params.toString()}`);
  };

  // Change page size and restart pagination.
  const handleEntriesPerPageChange = (value) => {
    const newPageSize = Number(value);

    if (!Number.isFinite(newPageSize) || newPageSize <= 0) return;

    appendNextRef.current = false;
    loadingRef.current = false;

    setEntriesPerPage(newPageSize);
    setRawData([]);
    setCursor(null);
    setHasMore(true);
    setPageError("");
    setRefreshing(false);

    setRequestEndpoint(`/get-merchants?per_page=${newPageSize}`);
  };

  const walletData = useMemo(
    () =>
      rawData.map((item, index) => ({
        sqno: index + 1,
        id: item.id,
        name: item.name,
        payout_wallet: Number(item.payout_wallet ?? 0),
      })),
    [rawData],
  );

  const filteredWalletData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return walletData;

    return walletData.filter(
      (merchant) =>
        String(merchant.id).toLowerCase().includes(query) ||
        String(merchant.name ?? "")
          .toLowerCase()
          .includes(query),
    );
  }, [walletData, search]);

  const totalWalletBalance = useMemo(
    () =>
      walletData.reduce(
        (total, merchant) => total + (Number(merchant.payout_wallet) || 0),
        0,
      ),
    [walletData],
  );

  const openWalletModal = (merchant, mode) => {
    setSelectedMerchant(merchant);
    setModalMode(mode);
    setWalletModalOpen(true);
  };

  const handleWalletSuccess = () => {
    refreshMerchants();
  };

  //   const memberColumns = [
  //     { header: "User ID", accessor: "id" },
  //     { header: "Merchant", accessor: "name" },
  //     { header: "Payout Wallet", accessor: "payout_wallet" },
  //     { header: "Actions", accessor: "action" },
  //   ];

  const memberColumns = [
    {
      label: "User ID",
      render: (row) => row.id ?? "-",
    },
    {
      label: "Merchant",
      render: (row) => row.name ?? "-",
    },
    {
      label: "Payout Wallet",
      render: (row) => row.payout_wallet,
    },
    {
      label: "Actions",
      render: (row) => row.action,
    },
  ];

  const tableDataWithActions = filteredWalletData.map((row) => ({
    ...row,

    payout_wallet: (
      <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <IndianRupee size={14} />
        </span>

        <span className="font-semibold tabular-nums text-slate-800">
          {row.payout_wallet.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    ),

    action: (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => openWalletModal(row, "load")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
        >
          <ArrowDownToLine size={15} />
          Load Wallet
        </Button>

        <Button
          onClick={() => openWalletModal(row, "reverse")}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-100"
        >
          <RotateCcw size={15} />
          Reverse Top-up
        </Button>
      </div>
    ),
  }));

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-600">Funds</span>
            <span>/</span>
            <span>Load Wallet</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Load Wallet
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage merchant payout balances and wallet top-ups.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Loaded Merchants
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {walletData.length.toLocaleString("en-IN")}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Merchants fetched so far
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
              <Users size={23} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Combined Payout Wallet
              </p>
              <h2 className="mt-2 break-words text-2xl font-bold text-slate-900">
                ₹
                {totalWalletBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Balance of currently loaded merchants
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <Wallet size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Merchant table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Merchant Wallets
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Load funds or reverse a previous top-up.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by merchant or user ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {displayError && (
          <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>

            {displayError.toLowerCase().includes("log in") ||
            displayError.toLowerCase().includes("unauthenticated") ? (
              <Button
                onClick={() => navigate("/")}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Go to Login
              </Button>
            ) : (
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                Try Again
              </Button>
            )}
          </div>
        )}

        {loading && walletData.length === 0 ? (
          <div className="p-5">
            <TableSkeleton />
          </div>
        ) : (
          <div className="p-3 sm:p-5">
            <Table
              columns={memberColumns}
              data={tableDataWithActions}
              showStatusFilter={false}
              showDateFilter={false}
              showDeleteColumn={false}
              showExport={false}
              className="overflow-hidden rounded-xl"
              isServerPaginated
              hasMore={hasMore && !search.trim()}
              isLoadingMore={loading}
              onLoadNext={handleLoadMore}
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={handleEntriesPerPageChange}
            />

            {!loading && filteredWalletData.length === 0 && !displayError && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search size={22} />
                </div>

                <p className="font-semibold text-slate-700">
                  No merchants found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try searching with another name or user ID.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load / reverse modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        merchant={selectedMerchant}
        defaultMode={modalMode}
        onSuccess={handleWalletSuccess}
      />
    </div>
  );
};

export default LoadWallet;
