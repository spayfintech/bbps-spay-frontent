import React, { useRef, useState } from "react";
import {
  QrCode,
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  Store,
  User,
  Smartphone,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  MoreVertical,
  Maximize2,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Wallet,
  IndianRupee,
  Zap,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { useGet } from "../hooks/useGet";

import logo from "../images/spaylogo.png";
import "../css/QRServices.css";

const QRServices = () => {
  const qrRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [qrActive, setQrActive] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: merchantResponse,
    loading: merchantLoading,
    error: merchantError,
    refetch: refetchMerchant,
  } = useGet("/qr/merchant");

  const merchant = merchantResponse?.data;

  const qrValue = merchant?.payment_url || "";

  // ----------------------------------------------------------------
  // Download QR
  // ----------------------------------------------------------------
  const handleDownload = async () => {
    try {
      const svg = qrRef.current?.querySelector("svg");

      if (!svg) {
        toast.error("QR code not found");
        return;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1000;
      canvas.height = 1000;

      const img = new Image();

      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 100, 100, 800, 800);

        const link = document.createElement("a");
        link.download = `${merchant?.merchant_name}-QR.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("QR downloaded successfully");
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgString)));
    } catch (error) {
      console.error(error);
      toast.error("Unable to download QR");
    }
  };

  // ----------------------------------------------------------------
  // Print QR
  // ----------------------------------------------------------------

  const handlePrint = () => {
    if (!merchant?.payment_url) {
      toast.error("QR code not available");
      return;
    }

    window.print();
  };

  // ----------------------------------------------------------------
  // Copy UPI
  // ----------------------------------------------------------------
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(merchant?.payment_url);

      setCopied(true);

      toast.success("Payment link copied");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Unable to copy UPI ID");
    }
  };

  // ----------------------------------------------------------------
  // Share QR
  // ----------------------------------------------------------------
  const handleShare = async () => {
    const shareData = {
      title: `${merchant?.merchant_name} QR`,
      text: `Pay ${merchant?.merchant_name} using UPI.\nPayment Link: ${merchant?.payment_url}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `Pay ${merchant?.merchant_name}\nPayment Link: ${merchant?.payment_url}`,
        );

        toast.success("Payment details copied");
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  if (merchantLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-sm text-slate-500">Loading your QR...</p>
        </div>
      </div>
    );
  }

  if (merchantError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Unable to load your QR.</p>

          <button
            onClick={refetchMerchant}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F6F8FC] px-4 py-5 sm:px-6 lg:px-8">
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="mx-auto mb-6 max-w-[1400px]">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>

            <span>/</span>

            <span>Services</span>

            <span>/</span>

            <span className="text-slate-700">QR Services</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                  <QrCode size={23} className="text-white" strokeWidth={2} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    QR Services
                  </h1>

                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Manage your merchant QR and receive digital payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}

            <div
              className={`flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                qrActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  qrActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />

              {qrActive ? "QR Active" : "QR Inactive"}
            </div>
          </div>
        </div>

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}

        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_minmax(0,1fr)]">
            {/* ========================================================
                LEFT QR CARD
            ======================================================== */}

            <div className="overflow-hidden rounded-3xl border border-[#E4EAF3] bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              {/* QR Header */}

              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Your Merchant QR
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Display this QR at your store.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    title="Preview QR"
                  >
                    <Maximize2 size={17} />
                  </button>
                </div>
              </div>

              {/* QR Area */}

              <div className="px-5 pb-5 pt-6 sm:px-8">
                <div className="rounded-2xl bg-gradient-to-br from-[#F7FAFF] to-[#EEF4FF] p-5">
                  <div className="flex flex-col items-center">
                    {/* Merchant Logo */}

                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-md">
                      <Store size={22} className="text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {merchant?.merchant_name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Scan & Pay using UPI
                    </p>

                    {/* QR */}

                    <div
                      ref={qrRef}
                      className={`mt-5 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ${
                        !qrActive ? "opacity-40 grayscale" : ""
                      }`}
                    >
                      <QRCode value={qrValue} size={210} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                RIGHT SIDE
            ======================================================== */}

            <div className="space-y-6">
              {/* ======================================================
                  QUICK ACTIONS
              ====================================================== */}

              <div className="rounded-3xl border border-[#E4EAF3] bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900">
                    QR Actions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage and share your merchant QR.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <ActionButton
                    icon={<Download size={19} />}
                    title="Download"
                    description="Save QR"
                    onClick={handleDownload}
                  />

                  <ActionButton
                    icon={<Printer size={19} />}
                    title="Print"
                    description="Print QR"
                    onClick={handlePrint}
                  />

                  <ActionButton
                    icon={<Share2 size={19} />}
                    title="Share"
                    description="Share QR"
                    onClick={handleShare}
                  />

                  <ActionButton
                    icon={<Maximize2 size={19} />}
                    title="Preview"
                    description="View QR"
                    onClick={() => setShowPreview(true)}
                  />
                </div>
              </div>

              {/* ======================================================
                  MERCHANT DETAILS
              ====================================================== */}

              <div className="rounded-3xl border border-[#E4EAF3] bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Merchant Details
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Information linked to your QR.
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Store size={17} className="text-blue-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<Store size={17} />}
                    label="Business Name"
                    value={merchant?.merchant_name}
                  />

                  <InfoBox
                    icon={<User size={17} />}
                    label="Owner Name"
                    value={merchant?.owner_name}
                  />

                  <InfoBox
                    icon={<CreditCard size={17} />}
                    label="Merchant ID"
                    value={merchant?.merchant_id}
                  />

                  <InfoBox
                    icon={<Smartphone size={17} />}
                    label="Registered Mobile"
                    value={merchant?.mobile}
                  />
                </div>
              </div>

              {/* ======================================================
                  HOW IT WORKS
              ====================================================== */}

              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                    <ShieldCheck size={19} className="text-white" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      How QR Payments Work
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Customers can scan your QR using any supported UPI
                      application and complete the payment directly to your
                      account.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Step
                    number="01"
                    title="Display"
                    description="Keep your QR visible at the store."
                  />

                  <Step
                    number="02"
                    title="Scan"
                    description="Customer scans the QR."
                  />

                  <Step
                    number="03"
                    title="Receive"
                    description="Payment is credited securely."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================================
              BOTTOM INFO
          ========================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <BottomFeature
              icon={<ShieldCheck size={19} />}
              title="Secure Payments"
              description="Payments are processed securely through UPI."
            />

            <BottomFeature
              icon={<Wallet size={19} />}
              title="Easy Collection"
              description="Accept digital payments without handling cash."
            />

            <BottomFeature
              icon={<RefreshCw size={19} />}
              title="Always Available"
              description="Your merchant QR is available whenever you need it."
            />
          </div>
        </div>
      </div>

      {/* ==============================================================
          FULL SCREEN QR PREVIEW
      ============================================================== */}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">QR Preview</h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {merchant?.merchant_name}
                </p>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR */}

            <div className="flex flex-col items-center px-6 py-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Store size={23} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {merchant?.merchant_name}
              </h3>

              <p className="mt-1 text-xs text-slate-500">Scan to Pay</p>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <QRCode value={qrValue} size={250} />
              </div>

              <p className="mt-5 text-xs font-medium text-slate-500">
                Payment Link
              </p>

              <p className="mt-1 max-w-full truncate text-sm font-bold text-slate-800">
                {merchant?.payment_url}
              </p>

              <button
                onClick={handleDownload}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Download size={17} />
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          PROFESSIONAL SPAY PRINT TEMPLATE
      ============================================================ */}

      <div className="spay-print-only">
        <div className="spay-print-page">
          <div className="spay-top-wave spay-top-wave-one"></div>

          <div className="spay-top-wave spay-top-wave-two"></div>

          <div className="spay-print-header">
            {/* SPAY LOGO */}

            <div className="spay-print-logo-wrap">
              <img src={logo} alt="SPAY" className="spay-print-logo" />
            </div>

            {/* TRUST BLOCK */}

            <div className="spay-trust-block">
              <div className="spay-trust-line"></div>

              <div className="spay-trust-text">
                <div>TRUSTED</div>
                <div>SECURE</div>
                <div>SMART</div>
                <div>PAYMENTS</div>
              </div>
            </div>
          </div>

          <div className="spay-scan-heading">
            <h1>
              SCAN <span>&amp;</span> <strong>PAY</strong>
            </h1>

            <div className="spay-scan-subtitle">
              <span className="spay-heading-line"></span>

              <span>WITH ANY UPI APP</span>

              <span className="spay-heading-line"></span>
            </div>
          </div>

          <div className="spay-main-content">
            <div className="spay-left-features">
              <div className="spay-feature">
                <div className="spay-feature-icon">
                  <Zap size={29} strokeWidth={2.4} />
                </div>

                <div className="spay-feature-title">
                  INSTANT
                  <br />
                  PAYMENTS
                </div>
              </div>

              <div className="spay-feature">
                <div className="spay-feature-icon">
                  <ShieldCheck size={30} strokeWidth={2.2} />
                </div>

                <div className="spay-feature-title">
                  SAFE &amp;
                  <br />
                  SECURE
                </div>
              </div>

              <div className="spay-feature">
                <div className="spay-feature-icon">
                  <Users size={29} strokeWidth={2.2} />
                </div>

                <div className="spay-feature-title">
                  TRUSTED
                  <br />
                  BY BUSINESSES
                </div>
              </div>
            </div>

            <div className="spay-qr-card">
              <div className="spay-qr-image-wrapper">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=10&data=${encodeURIComponent(
                    qrValue,
                  )}`}
                  alt="Merchant QR"
                  className="spay-print-qr"
                />

                {/* SPAY CENTER MARK */}

                <div className="spay-qr-center-logo">
                  <img src={logo} alt="SPAY" />
                </div>
              </div>

              {/* MERCHANT NAME */}

              <div className="spay-merchant-name">
                {merchant?.merchant_name || "Spay Merchant"}
              </div>

              {/* MERCHANT ID LABEL */}

              <div className="spay-merchant-id-label">MERCHANT ID</div>

              {/* MERCHANT ID */}

              <div className="spay-merchant-id">
                {merchant?.slug?.toUpperCase() ||
                  merchant?.merchant_id ||
                  "SPAY-MERCHANT"}
              </div>
            </div>

            <div className="spay-right-message">
              <div className="spay-script">Payments</div>

              <div className="spay-script">for a</div>

              <div className="spay-script">Smarter</div>

              <div className="spay-script">Tomorrow</div>

              <div className="spay-script-underline"></div>
            </div>
          </div>

          <div className="spay-supported-section">
            <div className="spay-supported-heading">
              <span></span>

              <strong>SUPPORTED UPI APPS</strong>

              <span></span>
            </div>

            <div className="spay-apps">
              {/* GOOGLE PAY */}

              <div className="spay-app">
                <div className="spay-app-circle">
                  <div className="spay-gpay-icon">G</div>
                </div>

                <div className="spay-app-name">Google Pay</div>
              </div>

              {/* PHONEPE */}

              <div className="spay-app">
                <div className="spay-app-circle">
                  <div className="spay-phonepe-icon">पे</div>
                </div>

                <div className="spay-app-name">PhonePe</div>
              </div>

              {/* BHIM */}

              <div className="spay-app">
                <div className="spay-app-circle">
                  <div className="spay-bhim-icon">
                    <span>B</span>
                  </div>
                </div>

                <div className="spay-app-name">BHIM</div>
              </div>

              {/* AMAZON PAY */}

              <div className="spay-app">
                <div className="spay-app-circle">
                  <div className="spay-amazon-icon">a</div>
                </div>

                <div className="spay-app-name">Amazon Pay</div>
              </div>

              {/* ANY UPI */}

              <div className="spay-app">
                <div className="spay-app-circle">
                  <div className="spay-upi-icon">UPI</div>
                </div>

                <div className="spay-app-name">Any UPI App</div>
              </div>
            </div>
          </div>

          <div className="spay-footer">
            {/* CURVES */}

            <div className="spay-footer-curve curve-one"></div>

            <div className="spay-footer-curve curve-two"></div>

            {/* FOOTER CONTENT */}

            <div className="spay-footer-content">
              {/* LEFT */}

              <div className="spay-footer-block">
                <Store size={47} strokeWidth={1.6} />

                <div>
                  <div>EMPOWERING</div>
                  <div>BUSINESSES</div>
                  <div>DIGITALLY</div>
                </div>
              </div>

              {/* DIVIDER */}

              <div className="spay-footer-divider"></div>

              {/* RIGHT */}

              <div className="spay-footer-block">
                <ShieldCheck size={49} strokeWidth={1.6} />

                <div>
                  <div>YOUR PAYMENTS</div>
                  <div>OUR PRIORITY</div>
                </div>
              </div>
            </div>

            {/* SMALL SPAY MARK */}

            <div className="spay-footer-mark">
              <img src={logo} alt="SPAY" />
            </div>

            {/* WEBSITE */}

            <div className="spay-website">www.spay.live</div>
          </div>
        </div>
      </div>
    </>
  );
};

/* =====================================================================
   QR CODE COMPONENT
   ===================================================================== */

const QRCode = ({ value, size = 200 }) => {
  /*
    This uses an external QR generation endpoint only for demo purposes.

    Later you can replace this component with:
    - qrcode.react
    - react-qr-code
    - your backend generated QR image
  */

  const encoded = encodeURIComponent(value);

  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`}
      alt="Merchant QR Code"
      width={size}
      height={size}
      className="block"
    />
  );
};

/* =====================================================================
   ACTION BUTTON
   ===================================================================== */

const ActionButton = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-[0_8px_25px_rgba(37,99,235,0.08)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <p className="mt-3 text-xs font-bold text-slate-800">{title}</p>

      <p className="mt-1 text-[10px] text-slate-500">{description}</p>
    </button>
  );
};

/* =====================================================================
   INFO BOX
   ===================================================================== */

const InfoBox = ({ icon, label, value }) => {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};

/* =====================================================================
   STEP
   ===================================================================== */

const Step = ({ number, title, description }) => {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-3">
      <span className="text-[10px] font-bold text-blue-600">{number}</span>

      <h4 className="mt-1 text-xs font-bold text-slate-800">{title}</h4>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">{description}</p>
    </div>
  );
};

/* =====================================================================
   BOTTOM FEATURE
   ===================================================================== */

const BottomFeature = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default QRServices;
