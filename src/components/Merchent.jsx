import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "./Table";
import { FaRegCopy } from "react-icons/fa";

import Service1 from "../images/logo.png";
import Service2 from "../images/1.png";
import Service3 from "../images/2.png";
import Service4 from "../images/3.png";
import { useGet } from "../hooks/useGet";
import { useAuth } from "../contexts/AuthContext";
import TableSkeleton from "../components/TableSkeleton";

const Merchent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { loading: dashboardLoading, data: dashboardData } = useGet(
    "/merchant/dashboard",
  );

  const wallet = dashboardData?.wallet;
  const kyc = dashboardData?.kyc;
  const permissions = dashboardData?.permissions;

  // const { loading: dataLoding, data: merchantsData } = useGet(
  //   // `/reports/user/${userId}`
  //   `/bbps/user-bill-payments/json/${userId}`,
  // );

  const { loading: dataLoading, data: merchantsData } = useGet(
    "/bbps/user-bill-payments/json",
  );

  // const handelServiceClick = () => {
  //   navigate("/services");
  // };

  const handelServiceClick = () => {
    if (!permissions?.bbps) {
      return;
    }

    navigate("/services");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };
  const renderStatusLabel = (status) => {
    const normalized = status?.toLowerCase(); // normalize

    const base =
      "inline-block px-3 py-1 text-sm font-semibold rounded-full shadow-sm w-20 text-center";

    const styles = {
      success: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
      initiated: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        className={`${base} ${
          styles[normalized] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };
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
  // const dateTime = "2025-12-02 10:57:27";

  const mapTxnStatus = (code) => {
    if (code === "000") return "Successful";
    if (code === "205" || code === "001") return "Failed";
    if (code === "102") return "Pending";
    return "Initiated";
  };

  const tData =
    merchantsData?.data?.map((item) => ({
      id: item.id,
      user_name: item.user_name,
      request_id: item.spay_txn_id || "-",
      category: item.biller_category,
      mobile_no: item.mobile,
      respAmount: item.amount,
      txnStatus: mapTxnStatus(item.txnStatus),
      responseReason: item.description,
      payout_opening_balance: item.payout_opening_balance,
      payout_closing_balance: item.payout_closing_balance,
      payment_mode: item.payment_mode,
      created_at: item.created_at,
    })) || [];

  const tColumns = [
    { label: "Sr No", key: "id" },
    { label: "User Name", key: "user_name" },
    { label: "Request ID", key: "request_id" },
    { label: "Category", key: "category" },
    { label: "Mobile Number", key: "mobile_no" },
    { label: "Amount", key: "respAmount" },
    {
      label: "Status",
      key: "txnStatus",
      render: (item) => renderStatusLabel(mapTxnStatus(item.txnStatus)),
    },

    {
      label: "Date",
      key: "created_at",
      render: (item) => dateFormat(item.created_at),
    },

    // {label:"NONE",key:"trikj"}
  ];

  if (dashboardLoading) {
    return <TableSkeleton />;
  }

  return (
    <span>
      <section className="flex flex-col md:flex-row bg-gray-50 p-6 rounded-lg shadow-md gap-6">
        {/* Account Details */}
        <div
          className="flex flex-col items-center justify-center text-center w-full md:w-1/3 bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl shadow-sm border border-blue-200 
        hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Virtual Account
          </h3>

          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            ₹{wallet?.bbps_wallet}
          </h2>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-sm text-gray-600">
              Account No: 54654XFDERRDSR
            </span>
            <button
              onClick={() => handleCopy("54654XFDERRDSR")}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaRegCopy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">IFSC: HJFHH86868</span>
            <button
              onClick={() => handleCopy("HJFHH86868")}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaRegCopy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-shrink-0 w-full md:w-1/3 bg-white rounded-2xl shadow-md overflow-hidden border border-blue-200 hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300">
          <div className="text-white text-center py-5 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-[35%]">
            <h2 className="text-lg font-semibold mb-1">
              Welcome, {user?.name}
            </h2>
            <p className="text-sm opacity-90">Your personalized dashboard</p>
          </div>

          <div className="p-6 bg-gray-50 flex flex-col justify-center">
            <p className="mb-2">
              <span className="font-semibold text-gray-800">User Name:</span>{" "}
              <span className="text-gray-700">{user?.name}</span>
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-800">Email:</span>{" "}
              <span className="text-gray-700">{user?.email}</span>
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-800">Entity Type:</span>{" "}
              <span className="text-gray-700">Proprietor</span>
            </p>
            <p>
              <span className="font-semibold text-gray-800">Contact:</span>{" "}
              <span className="text-gray-700">{user?.mobile_no}</span>
            </p>
          </div>
        </div>

        {/* Services */}
        <div
          className="flex-1 bg-white p-6 rounded-lg shadow-md border border-blue-200 
        hover:shadow-md hover:-translate-y-1 transform transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Services</h2>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={`flex flex-col items-center p-4 rounded-lg transition-all shadow-sm duration-300
              ${
                permissions?.bbps
                  ? "bg-blue-50 hover:bg-green-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  : "bg-gray-100 opacity-60 cursor-not-allowed"
              }`}
              onClick={handelServiceClick}
            >
              <img src={Service1} className="w-10 h-10 mb-2" />
              <span className="text-gray-700 text-sm font-medium">
                Bill Payment
              </span>
            </div>

            <div
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-yellow-200 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 transform duration-300 cursor-pointer"
              onClick={handelServiceClick}
            >
              <img src={Service2} className="w-10 h-10 mb-2" />
              <span className="text-gray-700 text-sm font-medium">
                Post Paid
              </span>
            </div>

            <div
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-200 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 transform duration-300 cursor-pointer"
              onClick={handelServiceClick}
            >
              <img src={Service3} className="w-10 h-10 mb-2" />
              <span className="text-gray-700 text-sm font-medium">
                Recharge
              </span>
            </div>

            <div className="flex flex-col items-center p-4 bg-gray-200 rounded-lg cursor-not-allowed opacity-70">
              <img src={Service4} className="w-10 h-10 mb-2" />
              <span className="text-gray-500 text-sm">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Transactions */}
      <section className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
          Latest Transaction List
        </h2>
        {dataLoading ? (
          <TableSkeleton />
        ) : (
          <Table
            isPaginationRequired={10}
            rowsPerPage={10}
            columns={tColumns}
            data={tData}
            currentPage={1}
            tableClass="min-w-full border border-gray-400 text-sm text-gray-700 font-sans overflow-x-auto"
            headerClass="bg-blue-600 text-white font-semibold text-left uppercase border-b border-gray-400"
            rowClass="bg-white hover:bg-blue-100 border-b border-gray-300 transition-colors duration-200"
            cellClass="py-3 px-4 text-gray-700 whitespace-nowrap"
            paginationClass="flex justify-center gap-2 mt-4 text-gray-700 font-medium"
          />
        )}
      </section>
    </span>
  );
};

export default Merchent;
