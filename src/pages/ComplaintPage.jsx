import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import TableSkeleton from "../components/TableSkeleton";
import Support from "../components/Support";
import {
  FaClipboardList,
  FaExchangeAlt,
  FaUserTie,
  FaFileAlt,
  FaCommentDots,
  FaEye,
} from "react-icons/fa";

// import { toast } from "react-toastify";
import { ChevronRight } from "lucide-react";

import { MdMiscellaneousServices } from "react-icons/md";
import { BsCheck2Circle } from "react-icons/bs";
import { useAuth } from "../contexts/AuthContext";
import BharatConnectLogo from "../images/logo.png";
import { usePost } from "../hooks/usePost";
import { toast, Toaster } from "react-hot-toast";

const ComplaintPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const role = isAdmin ? "admin" : "merchant";

  const [complaintType, setComplaintType] = useState("");
  const [complaintId, setComplaintId] = useState("");
  const [complaintResponse, setComplaintResponse] = useState(null);
  const [showTxnModal, setShowTxnModal] = useState(false);
  //production
  // const { execute: fetchPayment } = usePost("/bbps/complaint-register/json");
  //testing
  const { execute: fetchPayment } = usePost("/bbps/complaint-register/json");

  const {
    error: statusError,
    loading: statusLoading,
    execute: checkComplaintStatus,
  } = usePost("/bbps/complaint-status/json");

  const [formData, setFormData] = useState({
    complaintType: "",
    transactionId: "",
    participationType: "",
    complaintDisposition: "",
    complaintDescription: "",
    serviceComplaint: "",
    billerId: "", // <-- added
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("raise");

  const { execute: fetchComplaints } = usePost(
    "/bbps/all-complaints-test/json",
  );
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await fetchComplaints(); // call API once
        const apiData = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        const mapped = apiData.map((item) => ({
          ComplaintID: item.register_complaint_id,
          TxnReferenceID: item.txn_ref_id,
          ComplaintType: item.complaint_type,
          ParticipationType: item.participation_type,
          BillerID: item.biller_id,
          ComplaintReason: item.complaint_desc,
          ComplaintDisposition: item.complaint_disposition,
          ComplaintStatus: item.complaint_status.replace(/_/g, " "),
        }));
        setData(mapped);
      } catch (error) {
        console.error("Error loading complaint data:", error);
      }
    };

    loadComplaints();
  }, []); // empty dependency array ensures one-time fetch

  // const [data] = useState([
  //   { ComplaintID: "CC0125270014750", TxnReferenceID: "CC015270BAAG00021064", ComplaintType: "Transaction", ParticipationType: "BILLER", BillerID: "OTME00005XXZ43", ComplaintReason: "-", ComplaintDisposition: "Transaction Successful, account not updated", ComplaintStatus: "ASSIGNED" },
  //   { ComplaintID: "CC0125270014751", TxnReferenceID: "CC015270BAAG00021065", ComplaintType: "Service", ParticipationType: "AGENT", BillerID: "OTME00006YYZ12", ComplaintReason: "Service not working properly", ComplaintDisposition: "IN REVIEW", ComplaintStatus: "Pending" },
  //   { ComplaintID: "CC0125270014752", TxnReferenceID: "CC015270BAAG00021066", ComplaintType: "Transaction", ParticipationType: "AGENT", BillerID: "OTME00007ZZZ34", ComplaintReason: "-", ComplaintDisposition: "Resolved", ComplaintStatus: "Resolved" },
  //   { ComplaintID: "CC0125270014753", TxnReferenceID: "CC015270BAAG00021067", ComplaintType: "Service", ParticipationType: "BILLER", BillerID: "OTME00008AAA12", ComplaintReason: "Delay in service", ComplaintDisposition: "IN REVIEW", ComplaintStatus: "Pending" },
  //   { ComplaintID: "CC0125270014754", TxnReferenceID: "CC015270BAAG00021068", ComplaintType: "Transaction", ParticipationType: "BILLER", BillerID: "OTME00009BBB23", ComplaintReason: "-", ComplaintDisposition: "Transaction Successful, account not updated", ComplaintStatus: "ASSIGNED" },
  //   { ComplaintID: "CC0125270014755", TxnReferenceID: "CC015270BAAG00021069", ComplaintType: "Service", ParticipationType: "AGENT", BillerID: "OTME00010CCC34", ComplaintReason: "Incorrect info displayed", ComplaintDisposition: "IN REVIEW", ComplaintStatus: "Pending" },
  // ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      complaintType:
        formData.complaintType === "transaction" ? "Transaction" : "Service",
      participationType: formData.participationType.toUpperCase(),
      agentId: formData.participationType === "agent" ? user?.id || "" : "",
      billerId: formData.participationType === "biller" ? user?.id || "" : "",
      servReason: formData.serviceComplaint || "",
      complainDesc: formData.complaintDescription,
      txnRefId: formData.transactionId || "",
      complaintDisposition: formData.complaintDisposition,
    };

    try {
      const response = await fetchPayment(payload); // ✅ using your hook

      toast.success("Complaint submitted successfully!");
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to submit complaint! Check console.");
    }
  };

  const handleViewDetails = (row) => setSelectedComplaint(row);
  const handleCloseModal = () => setSelectedComplaint(null);

  /// ✅ Complaint Status (keep slightly bold for importance)
  const renderStatusLabel = (status) => {
    const base =
      "px-3 py-1 text-xs font-semibold rounded-full shadow-sm border transition-all duration-300";
    const styles = {
      ASSIGNED:
        "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
      Pending:
        "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",
      Resolved: "bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200",
    };
    return (
      <span
        className={`${base} ${styles[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}
      >
        {status}
      </span>
    );
  };

  // ✅ Participation Type — soft pastel tones for readability
  const renderParticipationType = (type) => {
    if (!type) {
      return <span>-</span>;
    }
    const base =
      "px-2 py-1 text-xs font-semibold rounded-full border shadow-sm transition-all duration-300";
    const styles = {
      BILLER:
        "bg-violet-100 text-violet-800 border-violet-300 hover:bg-violet-200",
      AGENT:
        "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
    };
    return (
      <span
        className={`${base} ${styles[type] || "bg-gray-100 text-gray-700 border-gray-300"}`}
      >
        {type}
      </span>
    );
  };

  // ✅ Complaint Type — softer blue/green pastel tones
  const renderComplaintType = (type) => {
    const base =
      "px-2 py-1 text-xs font-semibold rounded-full border shadow-sm transition-all duration-300";
    const styles = {
      Transaction:
        "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
      Service:
        "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
    };
    return (
      <span
        className={`${base} ${styles[type] || "bg-gray-100 text-gray-700 border-gray-300"}`}
      >
        {type}
      </span>
    );
  };

  const statusColumns = [
    "Complaint ID",
    "Complaint Status",
    "Remarks",
    "Complaint Assigned",
    "Complaint Response Reason",
  ];

  const handleCheckStatus = async () => {
    if (!complaintType || !complaintId) {
      toast.error("Please select complaint type and enter Complaint ID.");
      return;
    }

    setComplaintResponse(null);

    const res = await checkComplaintStatus({
      complaintType,
      complaintId,
    });

    if (res) {
      setComplaintResponse({
        id: res.complaintId ?? "N/A",
        status: res.complaintStatus ?? "N/A",
        remarks: res.complaintRemarks ?? "N/A",
        complaintAssigned: res.complaintAssigned ?? "N/A",
        complaintResponseReason: res.complaintResponseReason ?? "N/A",
      });
    }
  };

  const statusTableData = complaintResponse
    ? [
        {
          "Complaint ID": complaintResponse.id,
          "Complaint Status": complaintResponse.status,
          Remarks: complaintResponse.remarks,
          "Complaint Assigned": complaintResponse.complaintAssigned,
          "Complaint Response Reason":
            complaintResponse.complaintResponseReason,
        },
      ]
    : [];

  const columns = [
    { label: "Complaint ID", key: "ComplaintID" },
    { label: "Txn Reference ID", key: "TxnReferenceID" },
    {
      label: "Complaint Type",
      key: "ComplaintType",
      render: (row) => renderComplaintType(row.ComplaintType),
    },
    {
      label: "Participation Type",
      key: "ParticipationType",
      render: (row) => renderParticipationType(row.ParticipationType),
    },
    { label: "Biller ID", key: "BillerID" },
    { label: "Complaint Reason", key: "ComplaintReason" },
    { label: "Disposition", key: "ComplaintDisposition" },
    {
      label: "Status",
      key: "ComplaintStatus",
      render: (row) => renderStatusLabel(row.ComplaintStatus),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="bg-blue-100 text-blue-600 p-2 rounded-md hover:bg-blue-500 hover:text-white"
        >
          <FaEye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mb-10 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>

            <span>/</span>

            <span>Support</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Complaint & Transaction Activity
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View transaction details, monitor recent activity, and review
            Complaint status.
          </p>
        </div>
        <button
          onClick={() => setShowTxnModal(true)}
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
          cursor-pointer
        "
        >
          Check TXN
          <ChevronRight size={16} />
        </button>
      </div>
      {/* Merchant Form */}

      {role === "merchant" && (
        <div className="mx-auto mb-6 flex w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("raise")}
            className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "raise"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Raise Transaction Complaint
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "status"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Check Complaint Status
          </button>
        </div>
      )}

      {role === "merchant" && activeTab === "raise" && (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-10 w-full max-w-5xl"
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <FaClipboardList className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Raise Transaction Complaint
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submit a complaint for transaction or service related
                    issues.
                  </p>
                </div>
              </div>

              <img
                src={BharatConnectLogo}
                alt="BharatConnect"
                className="h-10 object-contain"
              />
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2">
              {/* LEFT COLUMN */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaExchangeAlt className="text-gray-500" /> Complaint Type
                  </label>
                  <select
                    name="complaintType"
                    value={formData.complaintType}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                  >
                    <option value="">Select Complaint Type</option>
                    <option value="transaction">Transaction</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                {formData.complaintType === "transaction" && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaFileAlt className="text-gray-500" /> Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      placeholder="Enter Transaction ID"
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                    />
                  </div>
                )}

                {formData.complaintType === "service" && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <MdMiscellaneousServices className="text-gray-500" />{" "}
                      Service Complaint Reason
                    </label>
                    <input
                      type="text"
                      name="serviceComplaint"
                      value={formData.serviceComplaint}
                      onChange={handleChange}
                      placeholder="Enter Service Complaint Reason"
                      className="border h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaUserTie className="text-gray-500" /> Participation Type
                  </label>
                  <select
                    name="participationType"
                    value={formData.participationType}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                  >
                    <option value="">Select Type</option>
                    <option value="agent">Agent</option>
                    <option value="biller">Biller</option>
                  </select>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-5">
                {/* Transaction Id */}
                {/* Participation Type */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <BsCheck2Circle className="text-gray-500" /> Complaint
                    Disposition
                  </label>
                  <select
                    name="complaintDisposition"
                    value={formData.complaintDisposition}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                  >
                    <option value="">Select Disposition</option>
                    <option value="Bill Paid but Amount not adjusted or still showing due amount">
                      Bill Paid but Amount not adjusted or still showing due
                      amount
                    </option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaCommentDots className="text-gray-500" /> Complaint
                    Description
                  </label>
                  <textarea
                    name="complaintDescription"
                    value={formData.complaintDescription}
                    onChange={handleChange}
                    placeholder="Enter complaint details..."
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-700 transition"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <FaClipboardList />
                    Submit Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === "status" && (
        <div className="mx-auto mb-10 w-full max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Check Complaint Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track the latest status of your registered complaint.
                </p>
              </div>

              <img
                src={BharatConnectLogo}
                alt="Bharat Connect"
                className="h-10"
              />
            </div>

            <div className="p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Complaint Type
                  </label>

                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <option value="">Select Type</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Complaint ID
                  </label>

                  <input
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    placeholder="Enter Complaint ID"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCheckStatus}
                  disabled={statusLoading}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                  {statusLoading ? "Checking..." : "Check Status"}
                </button>
              </div>

              <div className="mt-8">
                {statusLoading && <TableSkeleton rows={1} columns={5} />}

                {statusError && (
                  <p className="text-red-500">
                    Failed to fetch complaint status.
                  </p>
                )}

                {complaintResponse && (
                  <Table columns={statusColumns} data={statusTableData} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 max-w-full mx-auto">
        {/* Table Header */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Complaints
        </h3>

        <Table
          columns={columns}
          data={data}
          rowsPerPage={5}
          isPaginationRequired
          tableClass="min-w-full border border-gray-400 text-sm text-gray-700 font-sans overflow-x-auto"
          headerClass="bg-blue-600 text-white font-semibold text-left uppercase border-b border-gray-400"
          rowClass="bg-white hover:bg-blue-100 border-b border-gray-300 transition-colors duration-200"
          cellClass="py-3 px-4 text-gray-700 whitespace-nowrap"
          paginationClass="flex justify-center gap-2 mt-4 text-gray-700 font-medium"
        />
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          {/* Dimmed but visible background */}
          <div className="absolute inset-0 bg-black/30"></div>
          {/* bg-black/30 = 30% opacity black, dims background but keeps it visible */}

          {/* Modal content */}
          <div className="relative bg-white w-full sm:w-[90%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center font-semibold text-lg shadow-md">
              <h3>Complaint Details</h3>
              <button
                className="text-white text-2xl leading-none hover:text-gray-200 transition"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm border border-gray-300 rounded-lg">
                <tbody>
                  {Object.entries(selectedComplaint).map(([key, value]) => (
                    <tr key={key} className="border-b last:border-b-0">
                      <td className="font-semibold text-gray-700 py-2 px-3 sm:px-4 w-1/2 border-r bg-blue-50 whitespace-nowrap">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </td>
                      <td className="text-gray-800 py-2 px-3 sm:px-4 w-1/2 break-words">
                        {value || "-"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b last:border-b-0">
                    <td className="font-semibold text-gray-700 py-2 px-3 sm:px-4 w-1/2 border-r bg-blue-50 whitespace-nowrap">
                      Assigned To
                    </td>
                    <td className="text-gray-800 py-2 px-3 sm:px-4 w-1/2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showTxnModal && <Support onClose={() => setShowTxnModal(false)} />}
    </div>
  );
};

export default ComplaintPage;
