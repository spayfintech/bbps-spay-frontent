// import React, { useState, useEffect } from "react";
// import Table from "../components/Table";
// import SearchBar from "../components/SearchBar";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { usePost } from "../hooks/usePost";
// import TableSkeleton from "../components/TableSkeleton";

// import { Download } from "lucide-react";

// const Report = () => {
//   const [filters, setFilters] = useState({
//     service: "BBPS",
//     fromDate: "",
//     toDate: "",
//     category: "",
//     status: "",
//     billNumber: "",
//   });

//   const [data, setData] = useState([]);
//   const [apiData, setApiData] = useState([]);
//   const rowsPerPage = 10;

//   /* ---------------- API CALL ---------------- */
//   const {
//     execute: fetchPayments,
//     data: apiResponse,
//     isLoading,
//   } = usePost(`/bbps/transactions`);

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   /* ---------------- STATUS MAPPER ---------------- */
//   // const mapTxnStatus = (code) => {
//   //   switch (code) {
//   //     case "000":
//   //       return "Successful";
//   //     case "001":
//   //       return "Failed";
//   //     case "102":
//   //       return "Pending";
//   //     case "200":
//   //       return "Failed";
//   //     case "204":
//   //       return "Processing";
//   //     case "205":
//   //       return "Processing";
//   //     default:
//   //       return "Unknown";
//   //   }
//   // };
//   const mapTxnStatus = (code) => {
//     const status = String(code ?? "").toUpperCase();

//     switch (status) {
//       case "000":
//       case "SUCCESS":
//       case "COMPLETED":
//         return "Successful";

//       case "001":
//       case "200":
//       case "FAILED":
//         return "Failed";

//       case "102":
//       case "PENDING":
//         return "Pending";

//       case "204":
//       case "205":
//       case "PROCESSING":
//         return "Processing";

//       default:
//         return "Unknown";
//     }
//   };

//   /* ---------------- MAP API DATA ---------------- */
//   useEffect(() => {
//     if (!apiResponse) return;

//     const list = Array.isArray(apiResponse)
//       ? apiResponse
//       : Array.isArray(apiResponse.data)
//         ? apiResponse.data
//         : [];

//     // const mappedRows = list.map((item, index) => ({
//     //   SrNo: index + 1,

//     //   UserName: item.user_name ?? "-",
//     //   Mobile: item.mobile ?? "-",

//     //   RequestId: item.request_id ?? "-",

//     //   TransactionId: item.transaction_id ?? "-",

//     //   Category: item.category ?? "-",

//     //   BillerName: item.biller_name ?? "-",

//     //   Amount: Number(item.amount) || 0,

//     //   Charge: Number(item.charge) || 0,

//     //   Profit: Number(item.profit) || 0,

//     //   GST: Number(item.gst) || 0,

//     //   TDS: Number(item.tds) || 0,

//     //   OpeningBalance: item.opening_balance ?? "-",

//     //   ClosingBalance: item.closing_balance ?? "-",

//     //   Response: item.response_reason ?? "-",

//     //   Description: item.description ?? "-",

//     //   Status: mapTxnStatus(item.status, item.response_reason),

//     //   Date: item.created_at
//     //     ? new Date(item.created_at).toLocaleString("en-IN")
//     //     : "-",
//     // }));

//     const mappedRows = list.map((item, index) => ({
//       SrNo: index + 1,

//       // Transaction Source
//       TransactionSource: item.transaction_source ?? "BBPS",

//       UserName: item.user_name ?? "-",
//       Mobile: item.mobile ?? "-",

//       RequestId: item.request_id ?? "-",

//       TransactionId: item.transaction_id ?? "-",

//       // BBPS Details
//       Category: item.category ?? "-",

//       BillerName: item.biller_name ?? "-",

//       // Common Details
//       Amount: Number(item.amount) || 0,

//       Charge: Number(item.charge) || 0,

//       Profit: Number(item.profit) || 0,

//       GST: Number(item.gst) || 0,

//       TDS: Number(item.tds) || 0,

//       OpeningBalance: item.opening_balance ?? "-",

//       ClosingBalance: item.closing_balance ?? "-",

//       Response: item.response_reason ?? "-",

//       Description: item.description ?? "-",

//       Remark: item.remark ?? "-",

//       PaymentPlatform: item.payment_platform ?? "-",

//       PaymentMode: item.payment_mode ?? "-",

//       PaymentChannel: item.payment_channel ?? "-",

//       TransactionType: item.transaction_type ?? "-",

//       ProductType: item.product_type ?? "-",

//       Status: mapTxnStatus(item.status, item.response_reason),

//       Date: item.created_at
//         ? new Date(item.created_at).toLocaleString("en-IN")
//         : "-",
//     }));

//     // setApiData(mappedRows);
//     // setData(mappedRows);
//     setApiData(mappedRows);
//     setData(mappedRows.filter((item) => item.TransactionSource === "BBPS"));
//   }, [apiResponse]);

//   /* ---------------- FILTER HANDLERS ---------------- */
//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   // const handleSearch = () => {
//   //   const filtered = apiData.filter((item) => {
//   //     // SERVICE FILTER
//   //     let serviceMatch = true;

//   //     if (filters.service === "BBPS") {
//   //       serviceMatch = item.TransactionSource === "BBPS";
//   //     }

//   //     if (filters.service === "Vendor Payment") {
//   //       serviceMatch = item.TransactionSource === "VENDOR_PAYMENT";
//   //     }

//   //     return (
//   //       serviceMatch &&
//   //       (!filters.fromDate || item.Date >= filters.fromDate) &&
//   //       (!filters.toDate || item.Date <= filters.toDate) &&
//   //       (!filters.category || item.Category === filters.category) &&
//   //       (!filters.status || item.Status === filters.status) &&
//   //       (!filters.billNumber ||
//   //         item.TransactionId?.toLowerCase().includes(
//   //           filters.billNumber.toLowerCase(),
//   //         ))
//   //     );
//   //   });

//   //   setData(filtered);
//   // };

//   const handleSearch = () => {
//     const filtered = apiData.filter((item) => {
//       // SERVICE FILTER
//       let serviceMatch = true;

//       if (filters.service === "BBPS") {
//         serviceMatch = item.TransactionSource === "BBPS";
//       }

//       if (filters.service === "Vendor Payment") {
//         serviceMatch = item.TransactionSource === "VENDOR_PAYMENT";
//       }

//       return (
//         serviceMatch &&
//         (!filters.fromDate || item.Date.includes(filters.fromDate)) &&
//         (!filters.toDate || item.Date.includes(filters.toDate)) &&
//         (filters.service !== "BBPS" ||
//           !filters.category ||
//           item.Category === filters.category) &&
//         (!filters.status || item.Status === filters.status) &&
//         (!filters.billNumber ||
//           item.TransactionId?.toLowerCase().includes(
//             filters.billNumber.toLowerCase(),
//           ))
//       );
//     });

//     setData(filtered);
//   };

//   const handleReset = () => {
//     setFilters({
//       service: "BBPS",
//       fromDate: "",
//       toDate: "",
//       category: "",
//       status: "",
//       billNumber: "",
//     });
//     // setData(apiData);
//     setData(apiData.filter((item) => item.TransactionSource === "BBPS"));
//   };

//   /* ---------------- EXPORT EXCEL ---------------- */
//   const exportExcel = () => {
//     if (!data.length) return alert("No data to export.");

//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Transaction Report");
//     XLSX.writeFile(wb, "Transaction_Report.xlsx");
//   };

//   /* ---------------- EXPORT PDF ---------------- */
//   const exportPDF = () => {
//     if (!data.length) return alert("No data to export.");

//     const doc = new jsPDF("l", "mm", "a4");

//     const tableColumn = [
//       "Sr No",
//       "User Name",
//       "Mobile",
//       "Category",
//       "Biller",
//       "Transaction ID",
//       "Request ID",
//       "Amount",
//       "Charge",
//       "Profit",
//       "GST",
//       "TDS",
//       "Opening",
//       "Closing",
//       "Status",
//       "Date",
//     ];

//     const tableRows = data.map((item) => [
//       item.SrNo,
//       item.UserName,
//       item.Mobile,
//       item.Category,
//       item.BillerName,
//       item.TransactionId,
//       item.RequestId,
//       formatCurrency(item.Amount),
//       formatCurrency(item.Charge),
//       formatCurrency(item.Profit),
//       formatCurrency(item.GST),
//       formatCurrency(item.TDS),
//       item.OpeningBalance !== "-" ? formatCurrency(item.OpeningBalance) : "-",
//       item.ClosingBalance !== "-" ? formatCurrency(item.ClosingBalance) : "-",
//       item.Status,
//       item.Date,
//     ]);

//     autoTable(doc, {
//       startY: 25,
//       head: [tableColumn],
//       body: tableRows,
//       theme: "grid",
//       styles: {
//         fontSize: 7,
//         cellPadding: 3,
//         halign: "center",
//       },
//       headStyles: {
//         fillColor: [37, 99, 235],
//         textColor: 255,
//         fontStyle: "bold",
//       },
//       columnStyles: {
//         0: { cellWidth: 10 },
//         1: { cellWidth: 30 },
//         2: { cellWidth: 30 },
//         3: { cellWidth: 30 },
//         4: { cellWidth: 25 },
//         5: { cellWidth: 25 },
//         6: { cellWidth: 30 },
//       },
//     });

//     doc.save("Transaction_Report.pdf");
//   };

//   /* ---------------- STATUS BADGE ---------------- */
//   const renderStatusLabel = (status) => {
//     let className = "";

//     switch (status) {
//       case "Successful":
//         className = "bg-green-100 text-green-700";
//         break;

//       case "Pending":
//       case "Processing":
//         className = "bg-yellow-100 text-yellow-700";
//         break;

//       default:
//         className = "bg-red-100 text-red-700";
//     }

//     return (
//       <span
//         className={`inline-block px-2 py-1 text-xs font-semibold rounded-full shadow-sm w-24 text-center ${className}`}
//       >
//         {status}
//       </span>
//     );
//   };

//   /* ---------------- FORMAT CURRENCY ---------------- */
//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//     }).format(amount);

//   /* ---------------- TABLE COLUMNS ---------------- */
//   // const columns = [
//   //   { label: "Sr No", render: (item) => item.SrNo },

//   //   { label: "User Name", render: (item) => item.UserName },

//   //   { label: "Mobile", render: (item) => item.Mobile },

//   //   { label: "Category", render: (item) => item.Category },

//   //   { label: "Biller Name", render: (item) => item.BillerName },

//   //   { label: "Transaction ID", render: (item) => item.TransactionId },

//   //   { label: "Request ID", render: (item) => item.RequestId },

//   //   {
//   //     label: "Amount",
//   //     render: (item) => formatCurrency(item.Amount),
//   //   },

//   //   {
//   //     label: "Charge",
//   //     render: (item) => formatCurrency(item.Charge),
//   //   },

//   //   {
//   //     label: "Profit",
//   //     render: (item) => formatCurrency(item.Profit),
//   //   },

//   //   {
//   //     label: "GST",
//   //     render: (item) => formatCurrency(item.GST),
//   //   },

//   //   {
//   //     label: "TDS",
//   //     render: (item) => formatCurrency(item.TDS),
//   //   },

//   //   {
//   //     label: "Opening Balance",
//   //     render: (item) =>
//   //       item.OpeningBalance !== "-" ? formatCurrency(item.OpeningBalance) : "-",
//   //   },

//   //   {
//   //     label: "Closing Balance",
//   //     render: (item) =>
//   //       item.ClosingBalance !== "-" ? formatCurrency(item.ClosingBalance) : "-",
//   //   },

//   //   {
//   //     label: "Response",
//   //     render: (item) => (
//   //       <div className="max-w-[220px] truncate" title={item.Response}>
//   //         {item.Response}
//   //       </div>
//   //     ),
//   //   },

//   //   {
//   //     label: "Description",
//   //     render: (item) => (
//   //       <div className="max-w-[220px] truncate" title={item.Description}>
//   //         {item.Description}
//   //       </div>
//   //     ),
//   //   },

//   //   {
//   //     label: "Status",
//   //     render: (item) => renderStatusLabel(item.Status),
//   //   },

//   //   { label: "Date", render: (item) => item.Date },
//   // ];

//   const columns = [
//     {
//       label: "Sr No",
//       render: (item) => item.SrNo,
//     },

//     {
//       label: "User Name",
//       render: (item) => item.UserName,
//     },

//     {
//       label: "Mobile",
//       render: (item) => item.Mobile,
//     },

//     // BBPS ONLY
//     ...(filters.service === "BBPS"
//       ? [
//           {
//             label: "Category",
//             render: (item) => item.Category,
//           },

//           {
//             label: "Biller Name",
//             render: (item) => item.BillerName,
//           },
//         ]
//       : []),

//     {
//       label: "Transaction ID",
//       render: (item) => (
//         <div className="max-w-[220px] truncate" title={item.TransactionId}>
//           {item.TransactionId}
//         </div>
//       ),
//     },

//     {
//       label: "Request ID",
//       render: (item) => (
//         <div className="max-w-[220px] truncate" title={item.RequestId}>
//           {item.RequestId}
//         </div>
//       ),
//     },

//     {
//       label: "Amount",
//       render: (item) => formatCurrency(item.Amount),
//     },

//     {
//       label: "Charge",
//       render: (item) => formatCurrency(item.Charge),
//     },

//     {
//       label: "Profit",
//       render: (item) => formatCurrency(item.Profit),
//     },

//     {
//       label: "GST",
//       render: (item) => formatCurrency(item.GST),
//     },

//     {
//       label: "TDS",
//       render: (item) => formatCurrency(item.TDS),
//     },

//     // BBPS ONLY
//     ...(filters.service === "BBPS"
//       ? [
//           {
//             label: "Opening Balance",
//             render: (item) =>
//               item.OpeningBalance !== "-"
//                 ? formatCurrency(item.OpeningBalance)
//                 : "-",
//           },

//           {
//             label: "Closing Balance",
//             render: (item) =>
//               item.ClosingBalance !== "-"
//                 ? formatCurrency(item.ClosingBalance)
//                 : "-",
//           },

//           {
//             label: "Response",
//             render: (item) => (
//               <div className="max-w-[220px] truncate" title={item.Response}>
//                 {item.Response}
//               </div>
//             ),
//           },
//         ]
//       : []),

//     // VENDOR PAYMENT ONLY
//     ...(filters.service === "Vendor Payment"
//       ? [
//           {
//             label: "Payment Mode",
//             render: (item) => item.PaymentMode,
//           },

//           {
//             label: "Payment Channel",
//             render: (item) => item.PaymentChannel,
//           },

//           {
//             label: "Transaction Type",
//             render: (item) => item.TransactionType,
//           },

//           {
//             label: "Product Type",
//             render: (item) => item.ProductType,
//           },

//           {
//             label: "Description",
//             render: (item) => (
//               <div className="max-w-[220px] truncate" title={item.Description}>
//                 {item.Description}
//               </div>
//             ),
//           },

//           {
//             label: "Remark",
//             render: (item) => (
//               <div className="max-w-[250px] truncate" title={item.Remark}>
//                 {item.Remark}
//               </div>
//             ),
//           },
//         ]
//       : []),

//     {
//       label: "Status",
//       render: (item) => renderStatusLabel(item.Status),
//     },

//     {
//       label: "Date",
//       render: (item) => item.Date,
//     },
//   ];

//   /* ---------------- RENDER ---------------- */
//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           {/* Breadcrumb */}

//           <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
//             <span className="text-blue-600 font-medium">Home</span>

//             <span>/</span>

//             <span>Transaction History</span>
//           </div>

//           {/* Heading */}

//           <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//             Transaction History
//           </h1>

//           <p className="mt-1 text-sm text-slate-500">
//             View and manage all your transactions, including payment status,
//             service type, and transaction details in one place.
//           </p>
//         </div>

//         {/* Export */}

//         <button
//           className="
//           inline-flex
//           items-center
//           gap-2
//           rounded-xl
//           border
//           border-slate-200
//           bg-white
//           px-5
//           py-2.5
//           text-sm
//           font-medium
//           text-slate-700
//           shadow-sm
//           transition-all
//           hover:border-blue-200
//           hover:bg-blue-50
//           hover:text-blue-600
//         "
//         >
//           <Download size={16} />
//           Export
//         </button>
//       </div>

//       <SearchBar
//         filters={filters}
//         handleChange={handleChange}
//         handleSearch={handleSearch}
//         handleReset={handleReset}
//         exportExcel={exportExcel}
//         exportPDF={exportPDF}
//         filterFields={[
//           {
//             name: "service",
//             label: "Service",
//             type: "select",
//             options: [
//               "BBPS",
//               "Vendor Payment",
//               "AEPS",
//               "DMT",
//               "Recharge",
//               "mPOS",
//               "Aadhaar Pay",
//               "Aadhaar ATM",
//               "FASTag",
//               "Insurance",
//               "Air Ticket",
//               "Bus Ticket",
//               "Hotel",
//               "PAN Card",
//               "CMS",
//             ],
//           },
//           {
//             name: "category",
//             label: "Category",
//             type: "select",
//             options: [
//               "Agent Collection",
//               "Broadband Postpaid",
//               "Cable TV",
//               "Clubs and Associations",
//               "Credit Card",
//               "Donation",
//               "DTH",
//               "eChallan",
//               "Education Fees",
//               "Electricity",
//               "EV Recharge",
//               "Fastag",
//               "Gas",
//               "Housing Society",
//               "Insurance",
//               "Landline Postpaid",
//               "Loan Repayment",
//               "LPG Gas",
//               "Mobile Postpaid",
//               "Mobile Prepaid",
//               "Municipal Services",
//               "Municipal Taxes",
//               "National Pension System",
//               "NCMC Recharge",
//               "Prepaid Meter",
//               "Recurring Deposit",
//               "Rental",
//               "Subscription",
//               "Water",
//             ],
//           },
//           {
//             name: "status",
//             label: "Status",
//             type: "select",
//             options: [
//               "Successful",
//               "Failed",
//               "Pending",
//               "Processing",
//               "Unknown",
//             ],
//           },
//           { name: "fromDate", label: "From Date", type: "date" },
//           { name: "toDate", label: "To Date", type: "date" },
//           { name: "billNumber", label: "Bill Number", type: "text" },
//         ]}
//       />

//       <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//         <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
//           <div>
//             <h2 className="text-l font-semibold text-slate-900">
//               {filters.service} Transaction History
//             </h2>

//             <p className="text-sm text-slate-500">
//               View and manage all {filters.service.toLowerCase()} transactions.
//             </p>
//           </div>
//         </div>

//         {isLoading ? (
//           <TableSkeleton />
//         ) : data.length === 0 ? (
//           <div className="py-20 text-center">
//             <h3 className="text-xl font-semibold text-gray-700">
//               No Transactions Found
//             </h3>

//             <p className="mt-2 text-gray-500">
//               No transactions are available for {filters.service}.
//             </p>
//           </div>
//         ) : (
//           <Table
//             columns={columns}
//             data={data}
//             rowsPerPage={rowsPerPage}
//             isPaginationRequired
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Report;

import React, { useEffect, useMemo, useState } from "react";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ReceiptText,
  RefreshCw,
  Filter,
  ChevronRight,
  Search,
  Download,
} from "lucide-react";

import { usePost } from "../hooks/usePost";

const Report = () => {
  /* =========================================================
     STATE
  ========================================================= */

  const [selectedService, setSelectedService] = useState("");

  const [filters, setFilters] = useState({
    service: "",
    fromDate: "",
    toDate: "",
    category: "",
    status: "",
    billNumber: "",
  });

  const [apiData, setApiData] = useState([]);
  const [data, setData] = useState([]);

  const [mobilePage, setMobilePage] = useState(1);

  const rowsPerPage = 10;

  /* =========================================================
     API
  ========================================================= */

  const {
    execute: fetchPayments,
    data: apiResponse,
    isLoading,
  } = usePost("/bbps/transactions");

  useEffect(() => {
    fetchPayments();
  }, []);

  /* =========================================================
     STATUS
  ========================================================= */

  const mapTxnStatus = (code) => {
    const status = String(code ?? "").toUpperCase();

    switch (status) {
      case "000":
      case "SUCCESS":
      case "SUCCESSFUL":
      case "COMPLETED":
      case "COMPLETE":
        return "Successful";

      case "001":
      case "200":
      case "FAILED":
      case "FAILURE":
        return "Failed";

      case "102":
      case "PENDING":
        return "Pending";

      case "204":
      case "205":
      case "PROCESSING":
        return "Processing";

      case "REVERSED":
        return "Reversed";

      case "REFUNDED":
        return "Refunded";

      default:
        return "Unknown";
    }
  };

  /* =========================================================
     SERVICE MAPPER
  ========================================================= */

  const getServiceName = (item) => {
    const remark = String(item?.remark ?? "")
      .trim()
      .toLowerCase();

    /*
      PAYTM / PAYTM QR
      ----------------
      Always show as QR Payment
    */

    if (remark === "paytm" || remark === "paytm qr") {
      return "QR Payment";
    }

    const source = String(item?.transaction_source ?? "")
      .trim()
      .toUpperCase();

    switch (source) {
      case "BBPS":
        return "BBPS";

      case "VENDOR_PAYMENT":
        return "Vendor Payment";

      case "AEPS":
        return "AEPS";

      case "DMT":
        return "DMT";

      case "RECHARGE":
        return "Recharge";

      case "MPOS":
        return "mPOS";

      case "AADHAAR_PAY":
        return "Aadhaar Pay";

      case "AADHAAR_ATM":
        return "Aadhaar ATM";

      case "FASTAG":
        return "FASTag";

      case "INSURANCE":
        return "Insurance";

      case "AIR_TICKET":
        return "Air Ticket";

      case "BUS_TICKET":
        return "Bus Ticket";

      case "HOTEL":
        return "Hotel";

      case "PAN_CARD":
        return "PAN Card";

      case "CMS":
        return "CMS";

      default:
        return item?.transaction_source || "Other";
    }
  };

  /* =========================================================
     MAP API DATA
  ========================================================= */

  useEffect(() => {
    if (!apiResponse) return;

    const list = Array.isArray(apiResponse)
      ? apiResponse
      : Array.isArray(apiResponse?.data)
        ? apiResponse.data
        : [];

    const mappedRows = list.map((item, index) => ({
      SrNo: index + 1,

      Service: getServiceName(item),

      TransactionSource: item?.transaction_source ?? "-",

      UserName: item?.user_name ?? "-",

      Mobile: item?.mobile ?? "-",

      RequestId: item?.request_id ?? "-",

      TransactionId:
        item?.transaction_id ??
        item?.payment_ref_id ??
        item?.spay_txn_id ??
        "-",

      Category: item?.category ?? "-",

      BillerName: item?.biller_name ?? "-",

      Amount: Number(item?.amount) || 0,

      Charge: Number(item?.charge) || 0,

      Profit: Number(item?.profit) || 0,

      GST: Number(item?.gst) || 0,

      TDS: Number(item?.tds) || 0,

      OpeningBalance: item?.opening_balance ?? "-",

      ClosingBalance: item?.closing_balance ?? "-",

      Response: item?.response_reason ?? "-",

      Description: item?.description ?? "-",

      Remark: item?.remark ?? "-",

      PaymentPlatform: item?.payment_platform ?? "-",

      PaymentMode: item?.payment_mode ?? "-",

      PaymentChannel: item?.payment_channel ?? "-",

      TransactionType: item?.transaction_type ?? "-",

      ProductType: item?.product_type ?? "-",

      Status: mapTxnStatus(item?.status),

      Date: item?.created_at
        ? new Date(item.created_at).toLocaleString("en-IN")
        : "-",
    }));

    setApiData(mappedRows);

    /*
      Important:
      Don't show transactions initially.
    */

    setData([]);
    setSelectedService("");
  }, [apiResponse]);

  /* =========================================================
     SERVICES
  ========================================================= */

  const serviceList = useMemo(() => {
    const services = apiData.map((item) => item.Service).filter(Boolean);

    return [...new Set(services)];
  }, [apiData]);

  /* =========================================================
     SERVICE SELECT
  ========================================================= */

  const handleServiceSelect = (service) => {
    setSelectedService(service);

    setFilters({
      service,
      fromDate: "",
      toDate: "",
      category: "",
      status: "",
      billNumber: "",
    });

    const filtered = apiData.filter((item) => item.Service === service);

    setData(filtered);

    setMobilePage(1);
  };

  /* =========================================================
     CHANGE SERVICE
  ========================================================= */

  const changeService = () => {
    setSelectedService("");

    setFilters({
      service: "",
      fromDate: "",
      toDate: "",
      category: "",
      status: "",
      billNumber: "",
    });

    setData([]);

    setMobilePage(1);
  };

  /* =========================================================
     FILTER CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = () => {
    if (!selectedService) {
      setData([]);
      return;
    }

    const filtered = apiData.filter((item) => {
      if (item.Service !== selectedService) {
        return false;
      }

      const categoryMatch =
        selectedService !== "BBPS" ||
        !filters.category ||
        item.Category === filters.category;

      const statusMatch = !filters.status || item.Status === filters.status;

      const billSearch = String(filters.billNumber ?? "")
        .trim()
        .toLowerCase();

      const transactionId = String(item.TransactionId ?? "").toLowerCase();

      const requestId = String(item.RequestId ?? "").toLowerCase();

      const transactionMatch =
        !billSearch ||
        transactionId.includes(billSearch) ||
        requestId.includes(billSearch);

      let fromDateMatch = true;
      let toDateMatch = true;

      if (filters.fromDate) {
        fromDateMatch = item.Date.includes(filters.fromDate);
      }

      if (filters.toDate) {
        toDateMatch = item.Date.includes(filters.toDate);
      }

      return (
        categoryMatch &&
        statusMatch &&
        transactionMatch &&
        fromDateMatch &&
        toDateMatch
      );
    });

    setData(filtered);
    setMobilePage(1);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    if (!selectedService) {
      setData([]);
      return;
    }

    setFilters({
      service: selectedService,
      fromDate: "",
      toDate: "",
      category: "",
      status: "",
      billNumber: "",
    });

    const filtered = apiData.filter((item) => item.Service === selectedService);

    setData(filtered);
    setMobilePage(1);
  };

  /* =========================================================
     CURRENCY
  ========================================================= */

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);

  /* =========================================================
     STATUS BADGE
  ========================================================= */

  const renderStatusLabel = (status) => {
    const styles = {
      Successful: "bg-emerald-50 text-emerald-700 border-emerald-200",

      Pending: "bg-amber-50 text-amber-700 border-amber-200",

      Processing: "bg-amber-50 text-amber-700 border-amber-200",

      Failed: "bg-red-50 text-red-700 border-red-200",

      Reversed: "bg-purple-50 text-purple-700 border-purple-200",

      Refunded: "bg-blue-50 text-blue-700 border-blue-200",

      Unknown: "bg-slate-50 text-slate-600 border-slate-200",
    };

    return (
      <span
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${
          styles[status] || styles.Unknown
        }`}
      >
        {status}
      </span>
    );
  };

  /* =========================================================
     DESKTOP TABLE COLUMNS
  ========================================================= */

  const columns = [
    {
      label: "Sr No",
      render: (item) => item.SrNo,
    },

    {
      label: "Service",
      render: (item) => (
        <span className="font-semibold text-blue-600">{item.Service}</span>
      ),
    },

    {
      label: "User Name",
      render: (item) => item.UserName,
    },

    {
      label: "Mobile",
      render: (item) => item.Mobile,
    },

    {
      label: "Transaction ID",
      render: (item) => (
        <div
          className="max-w-[220px] truncate font-medium"
          title={item.TransactionId}
        >
          {item.TransactionId}
        </div>
      ),
    },

    {
      label: "Request ID",
      render: (item) => (
        <div className="max-w-[220px] truncate" title={item.RequestId}>
          {item.RequestId}
        </div>
      ),
    },

    {
      label: "Amount",
      render: (item) => formatCurrency(item.Amount),
    },

    {
      label: "Charge",
      render: (item) => formatCurrency(item.Charge),
    },

    {
      label: "Profit",
      render: (item) => formatCurrency(item.Profit),
    },

    {
      label: "GST",
      render: (item) => formatCurrency(item.GST),
    },

    {
      label: "Remark",
      render: (item) => (
        <span
          className={
            item.Remark?.toLowerCase().includes("paytm")
              ? "font-semibold text-blue-600"
              : ""
          }
        >
          {item.Remark}
        </span>
      ),
    },

    {
      label: "Status",
      render: (item) => renderStatusLabel(item.Status),
    },

    {
      label: "Date",
      render: (item) => item.Date,
    },
  ];

  /* =========================================================
     MOBILE PAGINATION
  ========================================================= */

  const mobileTotalPages = Math.ceil(data.length / rowsPerPage);

  const mobileStartIndex = (mobilePage - 1) * rowsPerPage;

  const mobileData = data.slice(
    mobileStartIndex,
    mobileStartIndex + rowsPerPage,
  );

  const goMobileNext = () => {
    if (mobilePage < mobileTotalPages) {
      setMobilePage((prev) => prev + 1);
    }
  };

  const goMobilePrev = () => {
    if (mobilePage > 1) {
      setMobilePage((prev) => prev - 1);
    }
  };

  /* =========================================================
     MOBILE TRANSACTION CARD
  ========================================================= */

  const MobileTransactionCard = ({ item }) => {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* TOP */}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ReceiptText size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Service
              </p>

              <h3 className="truncate text-sm font-bold text-slate-900">
                {item.Service}
              </h3>
            </div>
          </div>

          {renderStatusLabel(item.Status)}
        </div>

        {/* AMOUNT */}

        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Amount</span>

            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(item.Amount)}
            </span>
          </div>
        </div>

        {/* TRANSACTION */}

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Transaction ID
            </p>

            <p className="mt-1 break-all text-[11px] font-semibold leading-4 text-slate-700">
              {item.TransactionId}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Request ID
            </p>

            <p className="mt-1 break-all text-[11px] leading-4 text-slate-600">
              {item.RequestId}
            </p>
          </div>
        </div>

        {/* USER INFO */}

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              User
            </p>

            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {item.UserName}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Mobile
            </p>

            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {item.Mobile}
            </p>
          </div>
        </div>

        {/* MONEY */}

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-400">
              Charge
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-700">
              {formatCurrency(item.Charge)}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-400">
              Profit
            </p>

            <p className="mt-1 text-xs font-semibold text-emerald-600">
              {formatCurrency(item.Profit)}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wide text-slate-400">
              GST
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-700">
              {formatCurrency(item.GST)}
            </p>
          </div>
        </div>

        {/* REMARK + DATE */}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Remark
            </p>

            <p
              className={`mt-1 truncate text-xs font-semibold ${
                item.Remark?.toLowerCase().includes("paytm")
                  ? "text-blue-600"
                  : "text-slate-700"
              }`}
            >
              {item.Remark}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Date
            </p>

            <p className="mt-1 text-[9px] font-medium text-slate-500">
              {item.Date}
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}

        {item.Description && item.Description !== "-" && (
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Description
            </p>

            <p className="mt-1 text-[11px] leading-4 text-slate-600">
              {item.Description}
            </p>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     MOBILE PAGINATION UI
  ========================================================= */

  const MobilePagination = () => {
    if (mobileTotalPages <= 1) {
      return null;
    }

    return (
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4">
        <button
          type="button"
          disabled={mobilePage === 1}
          onClick={goMobilePrev}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-xs font-medium text-slate-500">
          Page {mobilePage} of {mobileTotalPages}
        </span>

        <button
          type="button"
          disabled={mobilePage === mobileTotalPages}
          onClick={goMobileNext}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

  const exportExcel = () => {
    if (!data.length) {
      alert("No data to export.");
      return;
    }

    const exportData = data.map((item) => ({
      Service: item.Service,
      "User Name": item.UserName,
      Mobile: item.Mobile,
      "Transaction ID": item.TransactionId,
      "Request ID": item.RequestId,
      Amount: item.Amount,
      Charge: item.Charge,
      Profit: item.Profit,
      GST: item.GST,
      TDS: item.TDS,
      Status: item.Status,
      Remark: item.Remark,
      Description: item.Description,
      Date: item.Date,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    XLSX.writeFile(wb, `${selectedService}_Transactions.xlsx`);
  };

  /* =========================================================
     EXPORT PDF
  ========================================================= */

  const exportPDF = () => {
    if (!data.length) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF("l", "mm", "a4");

    const tableColumn = [
      "Sr No",
      "Service",
      "User",
      "Mobile",
      "Transaction ID",
      "Request ID",
      "Amount",
      "Charge",
      "Profit",
      "GST",
      "Status",
      "Remark",
      "Date",
    ];

    const tableRows = data.map((item) => [
      item.SrNo,
      item.Service,
      item.UserName,
      item.Mobile,
      item.TransactionId,
      item.RequestId,
      formatCurrency(item.Amount),
      formatCurrency(item.Charge),
      formatCurrency(item.Profit),
      formatCurrency(item.GST),
      item.Status,
      item.Remark,
      item.Date,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",

      styles: {
        fontSize: 7,
        cellPadding: 2,
        halign: "center",
      },

      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    doc.save(`${selectedService}_Transactions.pdf`);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500 sm:text-xs">
            <span className="font-semibold text-blue-600">Home</span>

            <span>/</span>

            <span>Transaction History</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Transaction History
          </h1>

          <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm">
            Select a service first to view and manage its transactions.
          </p>
        </div>

        {selectedService && (
          <button
            onClick={changeService}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:w-auto"
          >
            <RefreshCw size={16} />
            Change Service
          </button>
        )}
      </div>

      {/* =====================================================
          SERVICE SELECTION
      ===================================================== */}

      {!selectedService && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
          <div className="mb-6 flex items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-12 sm:w-12">
              <ReceiptText size={22} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Select Service
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Choose a service to view its transaction history.
              </p>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : serviceList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center">
              <ReceiptText size={38} className="mx-auto mb-3 text-slate-300" />

              <h3 className="font-semibold text-slate-700">
                No Services Available
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                No transaction services were found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {serviceList.map((service) => {
                const count = apiData.filter(
                  (item) => item.Service === service,
                ).length;

                return (
                  <button
                    key={service}
                    onClick={() => handleServiceSelect(service)}
                    className="group rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white sm:h-11 sm:w-11">
                        <ReceiptText size={18} />
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-slate-300 transition group-hover:text-blue-500"
                      />
                    </div>

                    <h3 className="mt-4 truncate text-xs font-bold text-slate-900 sm:mt-5 sm:text-sm">
                      {service}
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                      {count} transaction
                      {count !== 1 ? "s" : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          SELECTED SERVICE
      ===================================================== */}

      {selectedService && (
        <>
          {/* SERVICE HEADER */}

          <div className="mb-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md sm:h-12 sm:w-12">
                  <ReceiptText size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-600 sm:text-[10px]">
                    Selected Service
                  </p>

                  <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                    {selectedService}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {data.length} transaction
                    {data.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              <button
                onClick={changeService}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:w-auto sm:text-sm"
              >
                <RefreshCw size={15} />
                Change Service
              </button>
            </div>
          </div>

          {/* =================================================
              SEARCH / FILTER
          ================================================= */}

          <SearchBar
            filters={filters}
            handleChange={handleChange}
            handleSearch={handleSearch}
            handleReset={handleReset}
            exportExcel={exportExcel}
            exportPDF={exportPDF}
            filterFields={[
              ...(selectedService === "BBPS"
                ? [
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
                  ]
                : []),

              {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  "Successful",
                  "Failed",
                  "Pending",
                  "Processing",
                  "Unknown",
                  "Reversed",
                  "Refunded",
                ],
              },

              {
                name: "fromDate",
                label: "From Date",
                type: "date",
              },

              {
                name: "toDate",
                label: "To Date",
                type: "date",
              },

              {
                name: "billNumber",
                label: "Transaction / Request ID",
                type: "text",
              },
            ]}
          />

          {/* =================================================
              TRANSACTION CONTAINER
          ================================================= */}

          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER */}

            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  {selectedService} Transactions
                </h2>

                <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                  Showing transactions for {selectedService}.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 sm:text-xs">
                <Filter size={13} />
                {data.length} Records
              </div>
            </div>

            {/* LOADING */}

            {isLoading ? (
              <TableSkeleton />
            ) : data.length === 0 ? (
              <div className="py-16 text-center sm:py-20">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={22} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-700">
                  No Transactions Found
                </h3>

                <p className="mt-2 px-5 text-xs text-slate-500">
                  No transactions are available for{" "}
                  <span className="font-semibold">{selectedService}</span>.
                </p>
              </div>
            ) : (
              <>
                {/* ==========================================
                    DESKTOP TABLE
                ========================================== */}

                <div className="hidden md:block overflow-x-auto">
                  <Table
                    columns={columns}
                    data={data}
                    rowsPerPage={rowsPerPage}
                    isPaginationRequired
                  />
                </div>

                {/* ==========================================
                    MOBILE CARDS
                ========================================== */}

                <div className="block md:hidden">
                  <div className="space-y-3 bg-slate-50 p-3">
                    {mobileData.map((item, index) => (
                      <MobileTransactionCard
                        key={`${item.RequestId}-${index}`}
                        item={item}
                      />
                    ))}
                  </div>

                  {/* MOBILE PAGINATION */}

                  {mobileTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-4">
                      <button
                        type="button"
                        disabled={mobilePage === 1}
                        onClick={goMobilePrev}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <span className="text-[11px] font-semibold text-slate-500">
                        Page {mobilePage} of {mobileTotalPages}
                      </span>

                      <button
                        type="button"
                        disabled={mobilePage === mobileTotalPages}
                        onClick={goMobileNext}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
