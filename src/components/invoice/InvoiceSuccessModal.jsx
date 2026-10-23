import { CheckCircle2, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InvoiceSuccessModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // GENERATE & DOWNLOAD PDF
  // =========================================================
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("SPAY Fintech", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Payment Invoice", 105, 28, { align: "center" });

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 35, 195, 35);

    // Table with invoice details
    autoTable(doc, {
      startY: 45,
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 4 },
      columnStyles: {
        0: { textColor: [100, 116, 139], fontStyle: "normal" },
        1: { textColor: [15, 23, 42], fontStyle: "bold", halign: "right" },
      },
      body: [
        ["Invoice No.", invoice.invoice_no || "-"],
        ["Merchant Order ID", invoice.merchant_order_id || "-"],
        ["Beneficiary Name", invoice.beneficiary_name || "-"],
        ["Beneficiary Mobile", invoice.beneficiary_mobile || "-"],
        ["Bank Account", invoice.bank_account || "-"],
        ["Amount", `Rs. ${formatAmount(invoice.amount)}`],
        ["Payment Mode", invoice.payment_mode || "-"],
        ["Payment Status", invoice.payment_status || "-"],
        [
          "Date",
          invoice.payment_date
            ? new Date(invoice.payment_date).toLocaleString("en-IN")
            : "-",
        ],
      ],
      didParseCell: (data) => {
        data.cell.styles.lineWidth = 0;
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Securely processed by Spay Fintech",
      105,
      doc.internal.pageSize.height - 15,
      { align: "center" },
    );

    doc.save(`${invoice.invoice_no || "invoice"}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Success Icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Payment Successful
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Invoice generated successfully
          </p>
        </div>

        {/* Invoice Details */}
        <div className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Invoice No.</span>
              <span className="text-sm font-semibold text-slate-900">
                {invoice.invoice_no}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Beneficiary</span>
              <span className="text-sm font-semibold text-slate-900">
                {invoice.beneficiary_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Amount</span>
              <span className="text-sm font-semibold text-slate-900">
                ₹{formatAmount(invoice.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Bank Account</span>
              <span className="text-sm font-semibold text-slate-900">
                {invoice.bank_account}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Payment Mode</span>
              <span className="text-sm font-semibold text-slate-900">
                {invoice.payment_mode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Date</span>
              <span className="text-sm font-semibold text-slate-900">
                {new Date(invoice.payment_date).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Download size={16} />
            Download Invoice PDF
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSuccessModal;
