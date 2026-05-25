import React, { useState, useEffect } from "react";
import TableSkeleton from "./TableSkeleton";
import Table from "./Table";
import BarChart from "./BarChart";
import GraphSkeleton from "../components/GraphSkeleton";
import { useGet } from "../hooks/useGet";

import {
  faChartSimple,
  faCircleCheck,
  faCircleXmark,
  faUsers,
  faIndianRupeeSign,
  faWallet,
  faMoneyBillWave,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Admin = () => {
  /* ---------------------- API Call ---------------------- */
  const { data: merchantsData, loading } = useGet("/admin/dashboard-data");
  // console.log("data : ",merchantsData);
  const [topUsers, setTopUsers] = useState([]);
  const [latestTransactions, setLatestTransactions] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [summary, setSummary] = useState({
    total_reports: 0,
    success_count: 0,
    failed_count: 0,
    total_users: 0,
  });

  useEffect(() => {
    if (merchantsData) {
      setTopUsers(
        Array.isArray(merchantsData.top_users) ? merchantsData.top_users : [],
      );
      setLatestTransactions(
        Array.isArray(merchantsData.successful_reports)
          ? merchantsData.successful_reports
          : [],
      );
      setMonthlyEarnings(
        Array.isArray(merchantsData.month_wise_earnings)
          ? merchantsData.month_wise_earnings
          : [],
      );
      setSummary(merchantsData.summary || summary);
    }
  }, [merchantsData]);

  /* ---------------------- Top User Data ---------------------- */
  const userColumns = ["name", "total_payout"];

  const userRows =
    merchantsData?.top_users?.map((user) => ({
      name: user.user_name,
      total_payout: `₹ ${Number(user.total_payout).toLocaleString()}`,
    })) || [];

  /* ---------------------- Status Renderer ---------------------- */
  const renderStatus = (status) => {
    const color =
      status === "SUCCESS"
        ? "bg-green-100 text-green-700"
        : status === "FAILED"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  /*to format date  */
  const dateFormat = (dateTime) => {
    const dateObj = new Date(dateTime.replace(" ", "T"));

    const formatted =
      dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " | " +
      dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    return formatted;
  };
  /* ---------------------- Transaction Column Objects ---------------------- */
  const tColumns = [
    { label: "ID", key: "id" },
    { label: "User Name", key: "user_name" },
    { label: "Request ID", key: "request_id" },
    { label: "Category", key: "category" },
    { label: "Mobile Number", key: "mobile_no" },
    { label: "Amount", key: "respAmount" },
    {
      label: "Status",
      key: "txnStatus",

      render: (row) => {
        const status = row.txnStatus?.toLowerCase();

        return (
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide
          
          ${
            status === "success"
              ? "bg-[#E8F8EE] text-[#16A34A]"
              : "bg-[#FDECEC] text-[#DC2626]"
          }
        `}
          >
            {status}
          </span>
        );
      },
    },
    {
      label: "Response Reason",
      key: "responseReason",
      render: (row) => renderStatus(row.responseReason),
    },

    { label: "Created At", key: "created_at" },
    { label: "Updated At", key: "updated_at" },
    // {label:"NONE",key:"trikj"}
  ];
  // Map the API 'successful_reports' to the table rows
  // Map the API 'successful_reports' to table rows
  const mappedTransactions =
    merchantsData?.successful_reports?.map((item) => ({
      id: item.id,
      user_name: item.user_name,
      request_id: item.spay_txn_id || "-",
      category: item.product_type,
      mobile_no: item.mobile,
      respAmount: item.amount,
      txnStatus: item.status,
      responseReason: item.description,
      created_at: dateFormat(item.created_at),
      updated_at: dateFormat(item.updated_at),
    })) || [];

  /* ---------------------- Chart Data ---------------------- */
  // Get last 6 months of data
  const lastSixMonths = merchantsData?.month_wise_earnings
    ?.slice(0, 6) // adjust if your data is descending
    .reverse(); // reverse to show oldest first

  // Month names for display
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartCategories =
    lastSixMonths?.map((item) => {
      const [year, month] = item.month_year.split("-");
      return `${monthNames[parseInt(month, 10) - 1]}-${year}`; // e.g., "Dec-2025"
    }) || [];

  const dataArray =
    lastSixMonths?.map((item) => parseFloat(item.total_earning)) || [];

  const chartId = "monthlySalesChart";
  const chartName = "Total Earnings";

  return (
    <div>
      {/* ================= Admin Dashboard Summary ================= */}
      <section className="px-4 py-4 bg-[#F7F9FC]">
        <h1 className="text-[28px] font-bold text-[#0F172A] mb-5">
          Dashboard Summary
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <DashboardCard
            title="Total Amount Used"
            value={summary.total_amount_used}
            color="bg-blue-50"
            icon={
              <FontAwesomeIcon
                icon={faChartSimple}
                className="text-[#2563EB] text-[20px]"
              />
            }
          />
          <DashboardCard
            title="Today Amount Used"
            value={summary.today_amount_used}
            color="bg-blue-50"
            icon={
              <FontAwesomeIcon
                // icon={faCircleCheck}
                icon={faChartLine}
                className="text-[#4d80f0] text-[20px]"
              />
            }
          />
          <DashboardCard
            title="Total Profit"
            value={summary.total_profit}
            color="bg-blue-50"
            icon={
              <FontAwesomeIcon
                icon={faWallet}
                className="text-[#2563EB] text-[20px]"
              />
            }
          />
          <DashboardCard
            title="Today Profit"
            value={summary.today_profit}
            color="bg-blue-50"
            icon={
              <FontAwesomeIcon
                icon={faIndianRupeeSign}
                className="text-[#4d80f0] text-[18px]"
              />
            }
          />
          <DashboardCard
            title="Total User"
            value={summary.total_users}
            graphColor="#8B5CF6"
            color="bg-violet-50"
            icon={
              <FontAwesomeIcon
                icon={faUsers}
                className="text-[#8B5CF6] text-[20px]"
              />
            }
          />
        </div>
      </section>

      {/* ================= Analytics Section ================= */}
      <section className="px-4 pb-4 bg-[#F7F9FC]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* ================= GRAPH ================= */}
          <div className="xl:col-span-6 bg-white border border-[#EEF2F7] rounded-[20px] p-4 shadow-sm">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-semibold text-[#0F172A]">
                  Revenue Overview
                </h2>

                <p className="text-[11px] text-[#64748B] mt-1">
                  Monthly commission analytics
                </p>
              </div>

              <button className="h-8 px-3 rounded-lg border border-[#E2E8F0] text-[11px] font-medium text-[#475569]">
                This Month
              </button>
            </div>

            {/* CHART */}
            <div className="h-[250px]">
              {loading ? (
                <GraphSkeleton />
              ) : (
                <BarChart
                  chartId={chartId}
                  chartCategories={chartCategories}
                  chartName={chartName}
                  dataArray={dataArray}
                  chartType="line"
                />
              )}
            </div>
          </div>

          {/* ================= PIE CHART ================= */}
          <div className="xl:col-span-3 bg-white border border-[#E8EEF9] rounded-[20px] p-5 shadow-sm">
            {/* HEADER */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[17px] font-semibold text-[#0F172A]">
                  Transaction Status
                </h2>

                <p className="text-[12px] text-[#64748B] mt-1">
                  Overall analytics
                </p>
              </div>

              <div className="w-9 h-9 rounded-2xl bg-[#EEF4FF] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              </div>
            </div>

            {/* BODY */}
            <div className="flex flex-col items-center justify-center">
              {/* DONUT */}
              <div className="relative flex items-center justify-center group">
                {/* OUTER RING */}
                <div
                  className="w-[160px] h-[160px] rounded-full transition-all duration-300 hover:scale-[1.03]"
                  style={{
                    background: `
                      conic-gradient(
                        #2ab86d 0% ${(summary.success_count / summary.total_reports) * 100}%,

                        #e48087 ${(summary.success_count / summary.total_reports) * 100}% 100%
                      )
                    `,
                  }}
                />

                {/* TOOLTIP */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0F172A] text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg">
                  Success: {summary.success_count} <br />
                  Failed: {summary.failed_count}
                </div>

                {/* INNER */}
                <div className="absolute w-[104px] h-[104px] rounded-full bg-white border border-[#EFF4FC] shadow-sm flex flex-col items-center justify-center">
                  <h2 className="text-[30px] font-bold text-[#0F172A] leading-none">
                    {summary.total_reports}
                  </h2>

                  <p className="text-[11px] text-[#64748B] mt-1">Total</p>
                </div>
              </div>

              {/* STATUS CARDS */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                {/* SUCCESS */}
                <div className="rounded-2xl border border-[#EAF1FB] bg-[#F8FBFF] px-4 py-3 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2ab86d]" />

                    <span className="text-[12px] font-medium text-[#64748B]">
                      Successful
                    </span>
                  </div>

                  <h3 className="text-[24px] font-semibold text-[#0F172A] mt-3 leading-none">
                    {summary.success_count}
                  </h3>
                </div>

                {/* FAILED */}
                <div className="rounded-2xl border border-[#EAF1FB] bg-[#F8FBFF] px-4 py-3 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#fd4c4f]" />

                    <span className="text-[12px] font-medium text-[#64748B]">
                      Failed
                    </span>
                  </div>

                  <h3 className="text-[24px] font-semibold text-[#0F172A] mt-3 leading-none">
                    {summary.failed_count}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TOP USERS ================= */}
          <div className="xl:col-span-3 bg-white border border-[#EEF2F7] rounded-[20px] p-4 shadow-sm">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                Top Users
              </h2>

              <button className="text-[11px] font-medium text-[#2563EB]">
                View All
              </button>
            </div>

            {/* USERS */}
            <div className="space-y-2.5">
              {userRows.slice(0, 5).map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#F1F5F9] hover:bg-[#FAFBFC] transition-all duration-200"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* AVATAR */}
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] text-[13px] font-semibold shrink-0">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* NAME */}
                    <h3 className="text-[13px] font-medium text-[#0F172A] truncate">
                      {user.name}
                    </h3>
                  </div>

                  {/* AMOUNT */}
                  <h2 className="text-[13px] font-semibold text-[#2563EB] shrink-0">
                    {user.total_payout}
                  </h2>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Latest Transactions Table ================= */}
      <section className="p-6 bg-gray-50">
        <div className="bg-white rounded-[20px] border border-[#EEF2F7] shadow-sm p-5">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#EEF2F7]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#0F172A]">
                Latest Transactions
              </h2>

              <p className="text-[12px] text-[#64748B] mt-1">
                Recent BBPS transaction activity
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-[#EEF4FF] flex items-center justify-center"></div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <Table
              data={mappedTransactions}
              columns={tColumns}
              currentPage={1}
              rowsPerPage={10}
              isPaginationRequired={true}
            />
          )}
        </div>
      </section>
    </div>
  );
};

/* ===================================================================
   Dashboard Card Component
=================================================================== */

const DashboardCard = ({ title, value, icon, color, growth, graphColor }) => {
  return (
    <div className="relative bg-white border border-[#EEF2F7] rounded-[18px] px-4 py-3 overflow-hidden min-h-[118px] hover:shadow-sm transition-all duration-300">
      {/* TOP */}
      <div className="flex items-start justify-between">
        {/* ICON */}
        <div
          className={`w-[42px] h-[42px] rounded-[14px] flex items-center justify-center ${color}`}
        >
          {icon}
        </div>

        {/* GROWTH */}
        <span
          className={`text-[11px] font-semibold ${
            growth?.includes("-") ? "text-red-500" : "text-green-500"
          }`}
        >
          {growth}
        </span>
      </div>

      {/* CONTENT */}
      <div className="mt-3">
        <p className="text-[12px] text-[#64748B] font-medium leading-none">
          {title}
        </p>

        <h2 className="text-[28px] font-bold text-[#0F172A] mt-2 tracking-tight leading-none">
          {value}
        </h2>
      </div>

      {/* MINI GRAPH */}
      <div className="absolute bottom-0 left-0 w-full px-3 pb-2">
        <svg
          viewBox="0 0 180 32"
          className="w-full h-[30px]"
          preserveAspectRatio="none"
        >
          <path
            d="
              M0 24
              C18 24, 26 25, 40 20
              C54 15, 66 28, 82 18
              C96 10, 108 14, 122 11
              C138 7, 152 2, 180 8
            "
            fill="none"
            stroke={graphColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="
              M0 24
              C18 24, 26 25, 40 20
              C54 15, 66 28, 82 18
              C96 10, 108 14, 122 11
              C138 7, 152 2, 180 8
              L180 40
              L0 40
              Z
            "
            fill={graphColor}
            opacity="0.06"
          />
        </svg>
      </div>
    </div>
  );
};

export default Admin;
