import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import TableSkeleton from "../components/TableSkeleton";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import SearchBar from "../components/SearchBar";
import logo from "../images/logo.png";
import { FaClockRotateLeft } from "react-icons/fa6";
import { usePost } from "../hooks/usePost";

const AdminReport = () => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    category: "",
    status: "",
    billNumber: "",
  });

  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;

  const {
    execute: fetchPayments,
    data: apiResponse,
    isLoading: apiLoading,
  } = usePost(`/bbps/all-bill-payments/json`);

  useEffect(() => {
    setLoading(true);
    fetchPayments();
  }, []);

  /* ---------------- MAP API DATA ---------------- */
  useEffect(() => {
    if (apiResponse) {
      const mappedData = apiResponse.map((item, index) => ({
        SrNo: index + 1,
        UserName: item.user_name || "-",
        // UserId: item.user_id || "-",
        Mobile: item.mobile_no || "-",
        Category: item.category || "-",
        BillerName: item.biller_name || "-",
        TransactionID: item.txnRefID || "-",
        RequestID: item.request_id || "-",
        Amount: item.amount || "-",
        Charge: item.charge || "-",
        Profit: item.profit || "-",
        Description: item.description || "-",
        OpeningBalance: item.opening_balance || "-",
        ClosingBalance: item.closing_balance || "-",
        Status: item.txnStatus === "000" ? "Successful" : "Failed",

        Date: item.created_at
          ? new Date(item.created_at).toLocaleString()
          : "-",
      }));

      setRawData(mappedData);
      setData(mappedData);
      setLoading(false);
    }
  }, [apiResponse]);

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    { label: "Sr No", key: "SrNo" },
    { label: "User Name", key: "UserName" },
    // { label: "User ID", key: "UserId" },
    { label: "Mobile", key: "Mobile" },
    { label: "Category", key: "Category" },
    { label: "Biller Name", key: "BillerName" },
    { label: "Transaction ID", key: "TransactionID" },
    { label: "Request ID", key: "RequestID" },
    { label: "Amount", key: "Amount" },
    { label: "Charge", key: "Charge" },
    { label: "Profit", key: "Profit" },
    { label: "Description", key: "Description" },
    { label: "Opening Balance", key: "OpeningBalance" },
    { label: "Closing Balance", key: "ClosingBalance" },

    {
      label: "Status",
      key: "Status",
      render: (row) => (
        <span
          className={
            row.Status === "Successful"
              ? "bg-green-200 text-green-800 px-2 py-1 rounded-full"
              : "bg-red-200 text-red-800 px-2 py-1 rounded-full"
          }
        >
          {row.Status}
        </span>
      ),
    },

    { label: "Date", key: "Date" },
  ];

  /* ---------------- FILTERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const filteredData = rawData.filter((item) => {
        const itemDate =
          item.Date !== "-"
            ? new Date(item.Date.split("/").reverse().join("-"))
            : null;

        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        return (
          (!fromDate || (itemDate && itemDate >= fromDate)) &&
          (!toDate || (itemDate && itemDate <= toDate)) &&
          (!filters.category || item.Category === filters.category) &&
          (!filters.status || item.Status === filters.status) &&
          (!filters.billNumber ||
            item.TransactionID?.includes(filters.billNumber))
        );
      });

      setData(filteredData);
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      category: "",
      status: "",
      billNumber: "",
    });
    setData(rawData);
  };

  /* ---------------- EXPORT EXCEL ---------------- */
  const exportExcel = () => {
    if (!data.length) return alert("No data to export.");

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admin Report");
    XLSX.writeFile(wb, "Admin_Report.xlsx");
  };

  /* ---------------- EXPORT PDF ---------------- */
  const exportPDF = () => {
    if (!data.length) return alert("No data to export.");

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(16);
    doc.text("Admin Transaction Report", 14, 15);

    const tableColumns = [
      "Sr No",
      "User Name",
      "User ID",
      "Mobile",
      "Category",
      "Biller",
      "Transaction ID",
      "Amount",
      "Status",
      "Date",
    ];

    const tableRows = data.map((item) => [
      item.SrNo,
      item.UserName,
      // item.UserId,
      item.Mobile,
      item.Category,
      item.BillerName,
      item.TransactionID,
      item.Amount,
      item.Status,
      item.Date,
    ]);

    autoTable(doc, {
      startY: 25,
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
      },
    });

    doc.save("Admin_Report.pdf");
  };

  /* ---------------- STYLES ---------------- */
  const tableStyles = {
    tableClass:
      "min-w-full bg-white rounded-2xl shadow-xl border border-gray-200 text-gray-700",
    headerClass:
      "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white text-sm font-semibold uppercase text-center",
    rowClass: "bg-white even:bg-gray-50 hover:bg-indigo-50 transition-all",
    cellClass: "py-3 px-4 text-sm font-medium text-center",
    paginationClass: "mt-4 flex justify-center",
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Transaction History
        </h1>
        <img src={logo} alt="Logo" className="w-40" />
      </div>

      <SearchBar
        filters={filters}
        handleChange={handleChange}
        handleSearch={handleSearch}
        handleReset={handleReset}
        exportExcel={exportExcel}
        exportPDF={exportPDF}
        filterFields={[
          { name: "fromDate", label: "From Date", type: "date" },
          { name: "toDate", label: "To Date", type: "date" },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              "Agent Collection",
              "Broadband Postpaid",
              "Cable TV",
              "Clubs and Associations",
              "Credit Card",
              "Donation",
              "DTH",
              "eChallan",
              "Education Fees",
              "Electricity",
              "EV Recharge",
              "Fastag",
              "Gas",
              "Housing Society",
              "Insurance",
              "Landline Postpaid",
              "Loan Repayment",
              "LPG Gas",
              "Mobile Postpaid",
              "Mobile Prepaid",
              "Municipal Services",
              "Municipal Taxes",
              "National Pension System",
              "NCMC Recharge",
              "Prepaid Meter",
              "Recurring Deposit",
              "Rental",
              "Subscription",
              "Water",
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Failed", "Successful"],
          },
          { name: "billNumber", label: "Transaction ID", type: "text" },
        ]}
      />

      {loading || apiLoading ? (
        <TableSkeleton rows={rowsPerPage} columns={columns.length} />
      ) : (
        <Table
          columns={columns}
          data={data}
          rowsPerPage={10}
          isPaginationRequired
          {...tableStyles}
        />
      )}
    </div>
  );
};

export default AdminReport;
