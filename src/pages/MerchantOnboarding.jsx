import { useMemo, useState } from "react";
import { useGet } from "../hooks/useGet";
import {
  Search,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

import StatsCard from "../components/MerchantOnboarding/StatsCard";
import MerchantTable from "../components/MerchantOnboarding/MerchantTable";

export default function MerchantOnboarding() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [businessType, setBusinessType] = useState("All");
  const [submittedDate, setSubmittedDate] = useState("");

  //----------
  const { data, loading, refetch } = useGet("/admin/merchant-onboarding");

  const merchantsData = data?.data || [];

  const merchants = merchantsData.map((item) => ({
    id: item.id,

    merchantId: `SPM${String(item.id).padStart(5, "0")}`,

    name: item.contact_name,

    mobile: item.mobile,

    email: item.email,

    business: item.business_type,

    submitted: new Date(item.created_at).toLocaleDateString("en-IN"),

    documents: "10/10",

    status: Number(item.status),
  }));
  //----------

  const itemsPerPage = 6;

  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        merchant.name.toLowerCase().includes(keyword) ||
        merchant.email.toLowerCase().includes(keyword) ||
        merchant.mobile.includes(keyword) ||
        merchant.merchantId.toLowerCase().includes(keyword) ||
        merchant.business.toLowerCase().includes(keyword);

      const matchStatus =
        status === "All" || merchant.status === Number(status);

      return matchSearch && matchStatus;
    });
  }, [merchants, search, status]);

  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);

  const currentMerchants = filteredMerchants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const total = merchants.length;

  // const pending = merchants.filter((item) => item.status === "Pending").length;

  // const approved = merchants.filter(
  //   (item) => item.status === "Approved",
  // ).length;

  // const rejected = merchants.filter(
  //   (item) => item.status === "Rejected",
  // ).length;
  const pending = merchants.filter((item) => item.status === 1).length;

  const approved = merchants.filter((item) => item.status === 2).length;

  const rejected = merchants.filter((item) => item.status === 3).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="text-blue-600 font-medium">Members</span>

            <span>/</span>

            <span>Merchant Onboarding</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Pending Verification
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            List of merchants who have completed onboarding and are waiting for
            admin verification.
          </p>
        </div>

        {/* Export */}

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
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Merchants"
          value={total}
          icon={<Users size={28} />}
          color="blue"
          subtitle="Registered merchants"
        />

        <StatsCard
          title="Pending Verification"
          value={pending}
          icon={<Clock3 size={28} />}
          color="yellow"
          subtitle="Waiting for admin"
        />

        <StatsCard
          title="Approved"
          value={approved}
          icon={<CheckCircle2 size={28} />}
          color="green"
          subtitle="Successfully onboarded"
        />

        <StatsCard
          title="Rejected"
          value={rejected}
          icon={<XCircle size={28} />}
          color="red"
          subtitle="Verification failed"
        />
      </div>
      {/* Filters */}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Search */}

          <div className="relative lg:col-span-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Merchant ID, Name, Mobile, Email..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                pl-11
                pr-4
                text-sm
                outline-none
                transition-all
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>

          {/* Status */}

          <div className="lg:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                outline-none
                transition-all
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
            >
              <option value="All">All Status</option>
              <option value="1">Pending</option>
              <option value="2">Approved</option>
              <option value="3">Rejected</option>
            </select>
          </div>

          {/* Date */}
          <div className="relative lg:col-span-2">
            <CalendarDays
              size={18}
              className="absolute right-4 bottom-3 text-slate-400 pointer-events-none"
            />

            <input
              type="date"
              value={submittedDate}
              onChange={(e) => {
                setSubmittedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Reset */}
          <div className="flex items-end lg:col-span-2">
            <button
              onClick={() => {
                setSearch("");
                setBusinessType("All");
                setSubmittedDate("");
                setCurrentPage(1);
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Merchant Table */}

      {loading ? (
        <div className="mt-10 text-center">Loading...</div>
      ) : (
        <MerchantTable
          merchants={currentMerchants}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}
