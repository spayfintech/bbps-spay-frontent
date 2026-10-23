import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePost } from "../hooks/usePost";
import { useGet } from "../hooks/useGet";
import { useCookies } from "react-cookie";

import InvoiceSuccessModal from "../components/invoice/InvoiceSuccessModal";

const Vendorpayment = () => {
  const [cookie] = useCookies(["token"]);

  const {
    execute: addBeneficiary,
    loading: addLoading,
    error: addError,
  } = usePost("/store-beneficiary-detail");

  const {
    execute: addBeneficiaryCard,
    loading: addCardLoading,
    error: addCardError,
  } = usePost("/beneficiary/cards");

  const {
    execute: initiatePhonePePayment,
    loading: phonePeLoading,
    error: phonePeError,
  } = usePost("/phonepe/initiate");

  const {
    data: beneficiaryResponse,
    loading: beneficiaryLoading,
    refetch: refetchBeneficiaries,
  } = useGet("/beneficiary-List");

  const { execute: deleteBeneficiary, loading: deleteLoading } = usePost(
    "/delete-Beneficiary",
  );

  const [showPhonePeModal, setShowPhonePeModal] = useState(false);
  const [phonePeUrl, setPhonePeUrl] = useState("");
  const [phonePeOrderId, setPhonePeOrderId] = useState("");
  const [phonePePaymentChecking, setPhonePePaymentChecking] = useState(false);
  const [phonePePaymentSuccess, setPhonePePaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const latestDataRef = useRef({});
  const processedOrderIdRef = useRef(null);
  const [invoiceModalData, setInvoiceModalData] = useState(null);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (beneficiaryResponse?.data) {
      setTableData(beneficiaryResponse.data);
    }
  }, [beneficiaryResponse]);

  useEffect(() => {
    const handlePhonePeMessage = async (event) => {
      console.log("PHONEPE MESSAGE RECEIVED:", event.data);

      if (event.data?.type !== "PHONEPE_PAYMENT_COMPLETE") {
        return;
      }

      const merchantOrderId = event.data?.merchantOrderId;

      console.log("PHONEPE MERCHANT ORDER ID:", merchantOrderId);

      // if (!merchantOrderId) {
      //   toast.error("Payment order ID not found.");
      //   // Save invoice data to show success modal
      //   setInvoiceModalData(invoiceResponse.invoice);

      //   // 3. Close PhonePe popup
      //   setShowPhonePeModal(false);
      //   setPhonePeUrl("");
      //   setPhonePeOrderId("");
      //   return;
      // }
      if (!merchantOrderId) {
        toast.error("Payment order ID not found.");
        setShowPhonePeModal(false);
        setPhonePeUrl("");
        setPhonePeOrderId("");
        return;
      }

      await handlePhonePePaymentSuccess(merchantOrderId);
    };

    window.addEventListener("message", handlePhonePeMessage);

    return () => {
      window.removeEventListener("message", handlePhonePeMessage);
    };
  }, []);

  const [showCardModal, setShowCardModal] = useState(false);
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false);
  const [cardBeneficiaryId, setCardBeneficiaryId] = useState("");

  const [beneficiaryCards, setBeneficiaryCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const [cardForm, setCardForm] = useState({
    card_holder_name: "",
    card_bank: "",
    card_number: "",
    expiry_date: "",
    cvv: "",
  });

  const fetchBeneficiaryCards = async (beneficiaryId) => {
    if (!beneficiaryId) {
      setBeneficiaryCards([]);
      return;
    }

    try {
      setCardsLoading(true);

      const token = cookie.token;

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/beneficiary/${beneficiaryId}/cards`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      console.log("===== BENEFICIARY CARDS =====");
      console.log("Beneficiary ID:", beneficiaryId);
      console.log("Status:", response.status);
      console.log("Full Response:", result);
      console.log("Cards Data:", result?.data);
      console.log("=============================");

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch beneficiary cards.",
        );
      }

      setBeneficiaryCards(result?.data || []);
    } catch (error) {
      console.error("Fetch Beneficiary Cards Error:", error);
      setBeneficiaryCards([]);
      toast.error("Failed to load beneficiary cards.");
    } finally {
      setCardsLoading(false);
    }
  };

  // =========================================================
  // SEND PAYMENT MODAL
  // =========================================================
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState(1);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    invoice: null,
  });

  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    latestDataRef.current = { selectedBeneficiary, paymentForm, selectedBank };
  }, [selectedBeneficiary, paymentForm, selectedBank]);

  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: "",
    mobile: "",
    email: "",
    bank_name: "",
    account_number: "",
    confirm_account_number: "",
    ifsc: "",
    pan: "",
    account_type: "",
  });

  const calculatePayableAmount = (amount, chargePercent = 2.419) => {
    const numericAmount = Number(amount) || 0;

    const charge = (numericAmount * chargePercent) / 100;

    return numericAmount + charge;
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================
  const handleBeneficiaryChange = (e) => {
    const { name, value } = e.target;

    setBeneficiaryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    setCardForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();

    if (!cardBeneficiaryId) {
      toast.error("Please select a beneficiary.");
      return;
    }

    const payload = {
      beneficiary_id: cardBeneficiaryId,
      card_holder_name: cardForm.card_holder_name,
      card_bank: cardForm.card_bank,
      card_number: cardForm.card_number.replace(/\s/g, ""),
      expiry_date: cardForm.expiry_date,
      cvv: cardForm.cvv,
    };

    try {
      const response = await addBeneficiaryCard(payload);

      if (!response) {
        toast.error(
          addCardError?.message || addCardError?.error || "Failed to add card.",
        );
        return;
      }

      toast.success(response?.message || "Card added successfully.");

      // Reset form
      setCardForm({
        card_holder_name: "",
        card_bank: "",
        card_number: "",
        expiry_date: "",
        cvv: "",
      });

      setCardBeneficiaryId("");
      setShowCardModal(false);
    } catch (error) {
      console.error("Add Card Error:", error);
      toast.error("Failed to add card.");
    }
  };

  // =========================================================
  // ADD BENEFICIARY
  // =========================================================
  const handleBeneficiarySubmit = async (e) => {
    e.preventDefault();

    if (
      beneficiaryForm.account_number !== beneficiaryForm.confirm_account_number
    ) {
      toast.error("Account numbers do not match.");
      return;
    }

    const payload = {
      bank_name: beneficiaryForm.bank_name,
      account_no: beneficiaryForm.account_number,
      ifsc_code: beneficiaryForm.ifsc,
      beneficiary_name: beneficiaryForm.name,
      beneficiary_mobile_no: beneficiaryForm.mobile,
      beneficiary_email_id: beneficiaryForm.email,
      beneficiary_address: beneficiaryForm.pan,
      account_type: beneficiaryForm.account_type,
    };

    // const response = await addBeneficiary(payload);

    // if (!response) {
    //   toast.error(
    //     addError?.message || addError?.error || "Failed to add beneficiary.",
    //   );
    //   return;
    // }

    // toast.success(response?.message || "Beneficiary added successfully.");

    const response = await addBeneficiary(payload);

    if (!response) {
      toast.error(
        addError?.message || addError?.error || "Failed to add beneficiary.",
      );
      return;
    }

    toast.success("Beneficiary added successfully.");

    setBeneficiaryForm({
      name: "",
      mobile: "",
      email: "",
      bank_name: "",
      account_number: "",
      confirm_account_number: "",
      ifsc: "",
      pan: "",
      account_type: "",
    });

    setShowBeneficiaryForm(false);

    await refetchBeneficiaries();
  };

  // =========================================================
  // DELETE BENEFICIARY
  // =========================================================
  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid beneficiary ID.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this beneficiary?",
    );

    if (!confirmDelete) {
      return;
    }

    const response = await deleteBeneficiary(id);

    if (!response) {
      toast.error("Failed to delete beneficiary.");
      return;
    }

    toast.success(response?.message || "Beneficiary deleted successfully.");

    await refetchBeneficiaries();
  };

  const handleCloseSendModal = () => {
    setShowSendModal(false);
    setSendStep(1);
    setSelectedBeneficiary(null);
    setSelectedBank(null);

    setPaymentForm({
      amount: "",
      invoice: null,
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInvoiceChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG or PNG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Invoice size must be less than 5 MB.");
      return;
    }

    setPaymentForm((prev) => ({
      ...prev,
      invoice: file,
    }));
  };

  const handlePaymentStepOne = () => {
    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    // Move to Step 2
    setSendStep(2);
  };

  useEffect(() => {
    if (showSendModal && sendStep === 2 && selectedBeneficiary?.id) {
      fetchBeneficiaryCards(selectedBeneficiary.id);
    }
  }, [showSendModal, sendStep, selectedBeneficiary?.id]);

  const verifyPhonePePayment = async (merchantOrderId) => {
    const PAYMENT_EXPIRY_SECONDS = 1200; // PhonePe expireAfter = 1200 sec
    const startedAt = Date.now();

    try {
      setPhonePePaymentChecking(true);

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      const isExpired = () => {
        const elapsedSeconds = (Date.now() - startedAt) / 1000;
        return elapsedSeconds >= PAYMENT_EXPIRY_SECONDS;
      };

      const checkStatus = async () => {
        console.log(`Checking PhonePe payment status: ${merchantOrderId}`);

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/phonepe/status/${merchantOrderId}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            },
          );

          const result = await response.json();

          console.log("PHONEPE BACKEND STATUS:", result);

          if (!result?.success) {
            console.warn(
              "PhonePe status API temporary error:",
              result?.message,
            );

            // Don't mark payment failed because of temporary API/network issue
            return "PENDING";
          }

          if (
            result.payment_status === "SUCCESS" ||
            result.payment_status === "COMPLETED"
          ) {
            console.log("PHONEPE PAYMENT SUCCESS");
            return "SUCCESS";
          }

          if (result.payment_status === "FAILED") {
            console.log("PHONEPE PAYMENT FAILED");
            return "FAILED";
          }

          return "PENDING";
        } catch (error) {
          console.warn(
            "PhonePe status request failed, continuing polling:",
            error,
          );

          return "PENDING";
        }
      };

      const waitAndCheck = async (milliseconds) => {
        if (isExpired()) {
          return "EXPIRED";
        }

        await sleep(milliseconds);

        if (isExpired()) {
          return "EXPIRED";
        }

        return await checkStatus();
      };

      // =========================================================
      // 1. FIRST CHECK: AFTER 20 SECONDS
      // =========================================================
      let status = await waitAndCheck(20000);

      if (status === "SUCCESS") return true;

      if (status === "FAILED") {
        toast.error("Payment failed.");
        return false;
      }

      if (status === "EXPIRED") {
        toast.error("Payment verification expired.");
        return false;
      }

      // =========================================================
      // 2. NEXT 30 SECONDS: EVERY 3 SECONDS
      // =========================================================
      for (let i = 0; i < 10; i++) {
        status = await waitAndCheck(3000);

        if (status === "SUCCESS") return true;

        if (status === "FAILED") {
          toast.error("Payment failed.");
          return false;
        }

        if (status === "EXPIRED") {
          toast.error("Payment verification expired.");
          return false;
        }
      }

      // =========================================================
      // 3. NEXT 60 SECONDS: EVERY 6 SECONDS
      // =========================================================
      for (let i = 0; i < 10; i++) {
        status = await waitAndCheck(6000);

        if (status === "SUCCESS") return true;

        if (status === "FAILED") {
          toast.error("Payment failed.");
          return false;
        }

        if (status === "EXPIRED") {
          toast.error("Payment verification expired.");
          return false;
        }
      }

      // =========================================================
      // 4. NEXT 60 SECONDS: EVERY 10 SECONDS
      // =========================================================
      for (let i = 0; i < 6; i++) {
        status = await waitAndCheck(10000);

        if (status === "SUCCESS") return true;

        if (status === "FAILED") {
          toast.error("Payment failed.");
          return false;
        }

        if (status === "EXPIRED") {
          toast.error("Payment verification expired.");
          return false;
        }
      }

      // =========================================================
      // 5. NEXT 60 SECONDS: EVERY 30 SECONDS
      // =========================================================
      for (let i = 0; i < 2; i++) {
        status = await waitAndCheck(30000);

        if (status === "SUCCESS") return true;

        if (status === "FAILED") {
          toast.error("Payment failed.");
          return false;
        }

        if (status === "EXPIRED") {
          toast.error("Payment verification expired.");
          return false;
        }
      }

      // =========================================================
      // 6. AFTER THAT: EVERY 1 MINUTE
      //    UNTIL SUCCESS / FAILED / 1200 SEC EXPIRY
      // =========================================================
      while (!isExpired()) {
        status = await waitAndCheck(60000);

        if (status === "SUCCESS") return true;

        if (status === "FAILED") {
          toast.error("Payment failed.");
          return false;
        }

        if (status === "EXPIRED") {
          break;
        }
      }

      // =========================================================
      // PAYMENT EXPIRED
      // =========================================================
      toast.error(
        "Payment verification timed out. Please check the transaction status.",
      );

      return false;
    } catch (error) {
      console.error("PhonePe Status Error:", error);

      toast.error(error?.message || "Unable to verify payment status.");

      return false;
    } finally {
      setPhonePePaymentChecking(false);
    }
  };

  const generateSpayInvoice = async (merchantOrderId) => {
    try {
      const { selectedBeneficiary, paymentForm, selectedBank } =
        latestDataRef.current;

      const amount = Number(paymentForm.amount);

      const formData = new FormData();

      formData.append("merchant_order_id", merchantOrderId);

      formData.append("amount", String(amount));

      formData.append("payment_mode", "Credit/Debit Card");

      formData.append("payment_status", "SUCCESSFUL");

      formData.append(
        "vendor_name",
        selectedBeneficiary?.vendor_name ||
          selectedBeneficiary?.beneficiary_name ||
          "",
      );

      formData.append(
        "beneficiary_name",
        selectedBeneficiary?.beneficiary_name || "",
      );

      formData.append(
        "beneficiary_id",
        String(
          selectedBeneficiary?.id || selectedBeneficiary?.beneficiary_id || "",
        ),
      );

      formData.append(
        "beneficiary_mobile",
        selectedBeneficiary?.beneficiary_mobile_no || "",
      );

      formData.append(
        "bank_account",
        selectedBank?.account_number || selectedBank?.account_no || "",
      );

      formData.append(
        "ifsc",
        selectedBank?.ifsc || selectedBank?.ifsc_code || "",
      );

      console.log("Generating SPAY Invoice:", {
        merchant_order_id: merchantOrderId,
        amount,
        payment_mode: "Credit/Debit Card",
        payment_status: "SUCCESSFUL",
      });

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/phonepe/generate-invoice`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      console.log("SPAY Invoice Response:", result);

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Payment successful but invoice generation failed.",
        );

        return null;
      }

      return result;
    } catch (error) {
      console.error("Invoice Generation Error:", error);

      toast.error("Payment successful, but invoice generation failed.");

      return null;
    }
  };

  const handlePhonePePaymentSuccess = async (merchantOrderId) => {
    if (!merchantOrderId) {
      toast.error("Payment order ID not found.");
      return;
    }

    if (processedOrderIdRef.current === merchantOrderId) {
      console.log("Already processed this order, skipping duplicate call.");
      return;
    }

    try {
      setPaymentProcessing(true);

      // Save order ID
      setPhonePeOrderId(merchantOrderId);

      // 1. Verify PhonePe payment
      const isPaymentSuccessful = await verifyPhonePePayment(merchantOrderId);

      if (!isPaymentSuccessful) {
        // ✅ Popup ko fail hone par bhi band karo, warna stuck reh jaayega
        setShowPhonePeModal(false);
        setPhonePeUrl("");
        setPhonePeOrderId("");
        return;
      }

      processedOrderIdRef.current = merchantOrderId;

      // 2. Generate SPAY invoice
      const invoiceResponse = await generateSpayInvoice(merchantOrderId);

      if (!invoiceResponse?.success) {
        toast.error(invoiceResponse?.message || "Invoice generation failed.");
        // ✅ Yahan bhi popup band karo
        setShowPhonePeModal(false);
        setPhonePeUrl("");
        setPhonePeOrderId("");
        return;
      }

      // Save invoice data to show success modal
      setInvoiceModalData(invoiceResponse.invoice);

      // 3. Close PhonePe popup
      setShowPhonePeModal(false);
      setPhonePeUrl("");
      setPhonePeOrderId("");

      // 4. Close payment modal
      setShowSendModal(false);
      setSendStep(1);

      // 5. Clear payment form
      setPaymentForm({
        amount: "",
        invoice: null,
      });

      // 6. Success message
      toast.success(
        invoiceResponse?.invoice_no
          ? `Payment successful. Invoice ${invoiceResponse.invoice_no} generated.`
          : "Payment successful and SPAY invoice generated.",
      );
    } catch (error) {
      console.error("Payment Success / Invoice Error:", error);

      // ✅ Error case mein bhi popup band karo
      setShowPhonePeModal(false);
      setPhonePeUrl("");
      setPhonePeOrderId("");

      toast.error("Payment was successful but invoice generation failed.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedBank) {
      toast.error("Please select a payment account.");
      return;
    }

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount.");
      return;
    }

    try {
      console.log("Initiating PhonePe Payment:", {
        amount,
        phone: selectedBeneficiary?.beneficiary_mobile_no || "",
      });

      const response = await initiatePhonePePayment({
        amount,
        phone: selectedBeneficiary?.beneficiary_mobile_no || "",
      });

      console.log("PhonePe Initiate Response:", response);

      if (!response?.success || !response?.redirectUrl) {
        toast.error(response?.message || "Unable to initiate PhonePe payment.");
        return;
      }

      // Save PhonePe checkout URL
      setPhonePeUrl(response.redirectUrl);

      // Save merchant order ID
      setPhonePeOrderId(response.merchantOrderId);

      // Open PhonePe popup
      setShowPhonePeModal(true);
    } catch (error) {
      console.error("PhonePe Payment Error:", error);

      toast.error("Unable to initiate payment.");
    }
  };

  // =========================================================
  // OPEN SEND PAYMENT MODAL
  // =========================================================
  const handleOpenSendModal = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);

    setPaymentForm({
      amount: "",
      invoice: null,
    });

    setBeneficiaryCards([]);
    setSelectedBank(null);
    setSendStep(1);
    setShowSendModal(true);
  };

  // =========================================================
  // FILTER
  // =========================================================
  const handleFilterChange = (e) => {
    const { id, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      email: "",
    });
  };

  // =========================================================
  // FILTERED DATA
  // =========================================================
  const filteredData = tableData.filter((user) => {
    // Show only verified beneficiaries
    if (user.verification_status !== "verified") {
      return false;
    }

    const name = user.beneficiary_name || "";
    const email = user.beneficiary_email_id || "";

    const nameMatch = name.toLowerCase().includes(filters.name.toLowerCase());

    const emailMatch = email
      .toLowerCase()
      .includes(filters.email.toLowerCase());

    return nameMatch && emailMatch;
  });

  const selectedCardBeneficiary = tableData.find(
    (beneficiary) => String(beneficiary.id) === String(cardBeneficiaryId),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>
            <span>/</span>
            <span>Vendor Payment</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Vendor Payment
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Payout service for processing vendor payments and managing outgoing
            transactions.
          </p>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Search Name */}
          <div className="relative lg:col-span-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by Name..."
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

          {/* Search Email */}
          <div className="relative lg:col-span-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Search by Email..."
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

          {/* Reset */}
          <div className="flex items-end lg:col-span-2">
            <button
              onClick={clearFilters}
              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-100
                text-sm
                font-medium
                text-slate-700
                transition-all
                hover:bg-slate-200
              "
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* USERS LIST */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Beneficiaries
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage beneficiaries for payout transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                cursor-pointer
              "
            >
              + Add Card
            </button>

            <button
              type="button"
              onClick={() => setShowBeneficiaryForm(true)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                cursor-pointer
              "
            >
              + Add Beneficiary
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
              <tr className="text-left text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                <th className="px-6 py-5">Beneficiary ID</th>

                <th className="px-4 py-5">Bank Details</th>

                <th className="px-4 py-5">Beneficiary Details</th>

                <th className="px-4 py-5 text-center">Action</th>

                <th className="px-4 py-5 text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {beneficiaryLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <RefreshCw
                      size={24}
                      className="mx-auto animate-spin text-blue-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading beneficiaries...
                    </p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    {/* BENEFICIARY ID */}
                    <td className="px-4 py-5">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                        {user.id}
                      </span>
                    </td>

                    {/* BANK DETAILS */}
                    <td className="px-4 py-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {user.bank_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          A/C: {user.account_no}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          IFSC: {user.ifsc_code}
                        </p>
                      </div>
                    </td>

                    {/* BENEFICIARY DETAILS */}
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            {user.beneficiary_name}
                          </h3>

                          <p className="text-xs text-slate-500">
                            {user.beneficiary_email_id || "No email"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {user.beneficiary_mobile_no}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {user.beneficiary_address}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenSendModal(user)}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-blue-50
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-blue-600
                            transition
                            hover:bg-blue-100
                        "
                      >
                        Send
                      </button>
                    </td>

                    {/* DELETE */}
                    <td className="px-4 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          rounded-lg
                          bg-red-50
                          p-2
                          text-red-600
                          transition
                          hover:bg-red-100
                        "
                        title="Delete Beneficiary"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <Search size={24} className="text-slate-400" />
                      </div>

                      <p className="text-base font-semibold text-slate-700">
                        No beneficiaries found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Add a beneficiary to start making payout transactions.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showBeneficiaryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Beneficiary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter beneficiary and bank account details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBeneficiaryForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleBeneficiarySubmit}>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                {/* BENEFICIARY INFORMATION */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Beneficiary Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Beneficiary Name *
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={beneficiaryForm.name}
                        onChange={handleBeneficiaryChange}
                        placeholder="Enter beneficiary name"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Mobile Number *
                      </label>

                      <input
                        type="tel"
                        name="mobile"
                        value={beneficiaryForm.mobile}
                        onChange={handleBeneficiaryChange}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={beneficiaryForm.email}
                        onChange={handleBeneficiaryChange}
                        placeholder="Enter email address"
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {/* BANK INFORMATION */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Bank Account Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Account Number */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Account Number *
                      </label>

                      <input
                        type="password"
                        name="account_number"
                        value={beneficiaryForm.account_number}
                        onChange={handleBeneficiaryChange}
                        placeholder="Enter account number"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Confirm Account */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Confirm Account Number *
                      </label>

                      <input
                        type="text"
                        name="confirm_account_number"
                        value={beneficiaryForm.confirm_account_number}
                        onChange={handleBeneficiaryChange}
                        placeholder="Re-enter account number"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* IFSC */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        IFSC Code *
                      </label>

                      <input
                        type="text"
                        name="ifsc"
                        value={beneficiaryForm.ifsc}
                        onChange={handleBeneficiaryChange}
                        placeholder="e.g. SBIN0001234"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* PAN */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        PAN *
                      </label>

                      <input
                        type="text"
                        name="pan"
                        value={beneficiaryForm.pan}
                        onChange={handleBeneficiaryChange}
                        placeholder="Enter PAN number"
                        maxLength={10}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Beneficiary Type *
                      </label>

                      <select
                        name="account_type"
                        value={beneficiaryForm.account_type}
                        onChange={handleBeneficiaryChange}
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Select Type</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Customer">Customer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <p className="text-sm font-sm text-red-500">
                    Note: Self account is not allowed.
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowBeneficiaryForm(false)}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addLoading ? "Adding..." : "Add Beneficiary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add Credit Card
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add a card for a beneficiary.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCardSubmit} className="space-y-5 p-6">
              {/* Beneficiary */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Beneficiary
                </label>

                <select
                  value={cardBeneficiaryId}
                  onChange={(e) => {
                    const beneficiaryId = e.target.value;

                    setCardBeneficiaryId(beneficiaryId);
                    setSelectedBank(null);
                  }}
                  className="
                    w-full rounded-xl border border-slate-300 bg-white
                    px-4 py-3 text-sm text-slate-700 outline-none
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  "
                  required
                >
                  <option value="">Select Beneficiary</option>

                  {tableData
                    .filter(
                      (beneficiary) =>
                        beneficiary.verification_status === "verified",
                    )
                    .map((beneficiary) => (
                      <option key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.beneficiary_name}
                        {beneficiary.beneficiary_mobile_no
                          ? ` - ${beneficiary.beneficiary_mobile_no}`
                          : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Card Holder Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Card Holder Name
                </label>

                <input
                  type="text"
                  name="card_holder_name"
                  value={cardForm.card_holder_name}
                  onChange={handleCardChange}
                  placeholder="Enter card holder name"
                  className="
                    w-full rounded-xl border border-slate-300
                    bg-white px-4 py-3 text-sm text-slate-700
                    outline-none
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-100
                  "
                  required
                />
              </div>

              {/* Card Bank */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Card Bank
                </label>

                <input
                  type="text"
                  name="card_bank"
                  value={cardForm.card_bank}
                  onChange={handleCardChange}
                  placeholder="Enter card bank name"
                  required
                  className="
                    w-full rounded-xl border border-slate-300
                    bg-white px-4 py-3 text-sm text-slate-700
                    outline-none
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-100
                  "
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Card Number
                </label>

                <input
                  type="text"
                  name="card_number"
                  value={cardForm.card_number}
                  onChange={handleCardChange}
                  maxLength={19}
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Expiry Date
                  </label>

                  <input
                    type="text"
                    name="expiry_date"
                    value={cardForm.expiry_date}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    CVV
                  </label>

                  <input
                    type="password"
                    name="cvv"
                    value={cardForm.cvv}
                    onChange={handleCardChange}
                    maxLength={4}
                    placeholder="CVV"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="
                    rounded-xl
                    border
                    border-slate-300
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addCardLoading}
                  className="
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {addCardLoading ? "Adding..." : "Add Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* =========================================================
          SEND PAYMENT MODAL
      ========================================================= */}
      {showSendModal && selectedBeneficiary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* =====================================================
                MODAL HEADER
            ===================================================== */}
            <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Send Payment
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Payment to {selectedBeneficiary.beneficiary_name}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseSendModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              {/* =================================================
                  STEPPER
              ================================================= */}
              <div className="mt-6 flex items-center">
                {/* STEP 1 */}
                <div className="flex items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      sendStep >= 1
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {sendStep > 1 ? <CheckCircle2 size={18} /> : "1"}
                  </div>

                  <div className="ml-3">
                    <p className="text-xs font-medium text-slate-500">STEP 1</p>

                    <p className="text-sm font-semibold text-slate-800">
                      Payment Details
                    </p>
                  </div>
                </div>

                {/* LINE */}
                <div className="mx-5 h-px flex-1 bg-slate-200" />

                {/* STEP 2 */}
                <div className="flex items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      sendStep === 2
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    2
                  </div>

                  <div className="ml-3">
                    <p className="text-xs font-medium text-slate-500">STEP 2</p>

                    <p className="text-sm font-semibold text-slate-800">
                      Select Account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                MODAL BODY
            ===================================================== */}
            <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
              {/* ===================================================
                  STEP 1
              =================================================== */}
              {sendStep === 1 && (
                <div className="space-y-6">
                  {/* BENEFICIARY */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Beneficiary</p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedBeneficiary.beneficiary_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {selectedBeneficiary.beneficiary_mobile_no}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500">Account</p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedBeneficiary.account_no}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {selectedBeneficiary.ifsc_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AMOUNT */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Enter Amount *
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-500">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="amount"
                        value={paymentForm.amount}
                        onChange={handlePaymentChange}
                        placeholder="Enter payment amount"
                        min="1"
                        step="0.01"
                        className="
                    h-14
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-4
                    text-lg
                    font-semibold
                    text-slate-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                  "
                      />
                    </div>
                  </div>

                  {/* INVOICE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Upload Invoice{" "}
                      <span className="font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <label
                      htmlFor="payment-invoice"
                      className="
                        flex
                        min-h-[150px]
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border-2
                        border-dashed
                        border-slate-200
                        bg-slate-50
                        px-6
                        py-8
                        text-center
                        transition
                        hover:border-blue-300
                        hover:bg-blue-50/40
                      "
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <Upload size={21} className="text-blue-600" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        {paymentForm.invoice
                          ? paymentForm.invoice.name
                          : "Upload invoice"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PDF, JPG, JPEG or PNG • Max 5 MB
                      </p>

                      <input
                        id="payment-invoice"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleInvoiceChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* ===================================================
                  STEP 2
              =================================================== */}
              {sendStep === 2 && (
                <div className="space-y-5">
                  {/* AMOUNT SUMMARY */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Payment Amount
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          ₹{formatAmount(paymentForm.amount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-blue-600">
                          Beneficiary
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedBeneficiary.beneficiary_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNT OPTIONS */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Select Payment Account
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Select the bank account/card from which payment will be
                        processed.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {cardsLoading ? (
                        <div className="py-8 text-center text-sm text-slate-500">
                          Loading cards...
                        </div>
                      ) : beneficiaryCards.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                          <CreditCard
                            size={28}
                            className="mx-auto text-slate-400"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No cards found
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            This beneficiary has no saved cards.
                          </p>
                        </div>
                      ) : (
                        beneficiaryCards.map((card) => {
                          const isSelected = selectedBank?.id === card.id;

                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => setSelectedBank(card)}
                              className={`
                              w-full
                              rounded-2xl
                              border
                              p-4
                              text-left
                              transition-all
                              ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50/40 ring-4 ring-blue-50"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                              }
                            `}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                  <CreditCard
                                    size={22}
                                    className="text-slate-600"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <h4 className="text-sm font-semibold capitalize text-slate-900">
                                        {card.card_bank || "Unknown Bank"}
                                      </h4>

                                      <p className="mt-1 text-xs text-slate-500">
                                        **** **** ****{" "}
                                        {card.card_number?.slice(-4)}
                                      </p>
                                    </div>

                                    <div
                                      className={`
                                      flex
                                      h-6
                                      w-6
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-full
                                      border-2
                                      ${isSelected ? "border-blue-600" : "border-slate-300"}
                                    `}
                                    >
                                      {isSelected && (
                                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4">
                                    <div className="mt-3 flex items-center gap-2">
                                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                                        {card.card_brand || "CARD"}
                                      </span>

                                      <span className="inline-flex rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold uppercase text-green-600">
                                        {card.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* SELECTED ACCOUNT SUMMARY */}
                  {/* {selectedBank && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-emerald-600">
                            Selected Account
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selectedBank.bank_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {selectedBank.account_no}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            Total Payable
                          </p>

                          <p className="mt-1 text-xl font-bold text-emerald-700">
                            ₹
                            {formatAmount(
                              calculatePayableAmount(
                                paymentForm.amount,
                                selectedBank.charge_percent,
                              ),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
              )}
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              {/* LEFT */}
              <div>
                {sendStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setSendStep(1)}
                    className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                text-slate-700
                ring-1
                ring-slate-200
                transition
                hover:bg-slate-100
              "
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseSendModal}
                  className="
                    rounded-xl
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-700
                    ring-1
                    ring-slate-200
                    transition
                    hover:bg-slate-100
                  "
                >
                  Cancel
                </button>

                {sendStep === 1 ? (
                  <button
                    type="button"
                    onClick={handlePaymentStepOne}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-6
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-blue-700
                    "
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={!selectedBank || phonePeLoading}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-6
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-blue-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {phonePeLoading ? "Opening Payment..." : "Confirm Payment"}
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PHONEPE PAYMENT MODAL
      ========================================================= */}
      {showPhonePeModal && phonePeUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Complete Payment
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Secure Debit/Credit Card Payment
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPhonePeModal(false);
                  setPhonePeUrl("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="relative flex-1 bg-slate-50">
              <iframe
                src={phonePeUrl}
                title="PhonePe Payment"
                className="h-full w-full border-0"
                allow="payment"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          INVOICE SUCCESS MODAL
      ========================================================= */}
      <InvoiceSuccessModal
        invoice={invoiceModalData}
        onClose={() => setInvoiceModalData(null)}
      />
    </div>
  );
};

export default Vendorpayment;
