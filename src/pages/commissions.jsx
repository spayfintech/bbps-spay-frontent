import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUser,
  faChevronDown,
  faMagnifyingGlass,
  faPercent,
  faIndianRupeeSign,
  faPlus,
  faTrash,
  faPen,
  faCheck,
  faXmark,
  faSliders,
  faCircleInfo,
  faBolt,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

/* =========================================================
   MOCK DATA
   Replace these with API data later
========================================================= */

const USERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "Arsalan Khan",
    email: "arsalan@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 4,
    name: "Vishal Kumar",
    email: "vishal@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 5,
    name: "Neha Enterprises",
    email: "neha@example.com",
    role: "User",
    status: "Active",
  },
];

const SERVICES = [
  "Agent Collection",
  "Broadband Postpaid",
  "Cable TV",
  "Clubs and Associations",
  "Credit Card",
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
  "LPG Gas",
  "Mobile Postpaid",
  "Mobile Prepaid",
  "Municipal Services",
  "Municipal Taxes",
  "National Pension System",
  "NCMC Recharge",
  "Prepaid Meter",
  "Rental",
  "Subscription",
];

const BILLERS = {
  Electricity: [
    { id: "ADANI001", name: "Adani Electricity" },
    { id: "TATA001", name: "Tata Power" },
    { id: "MSEDCL001", name: "MSEDCL" },
    { id: "BESCOM001", name: "BESCOM" },
  ],

  DTH: [
    { id: "TATAPLAY001", name: "Tata Play" },
    { id: "AIRTELDTH001", name: "Airtel Digital TV" },
    { id: "DISH001", name: "Dish TV" },
    { id: "VIDEOCON001", name: "Videocon D2H" },
  ],

  "Mobile Prepaid": [
    { id: "AIRTEL001", name: "Airtel" },
    { id: "JIO001", name: "Jio" },
    { id: "VI001", name: "Vi" },
    { id: "BSNL001", name: "BSNL" },
  ],

  "Mobile Postpaid": [
    { id: "AIRTELPOST001", name: "Airtel Postpaid" },
    { id: "JIOPOST001", name: "Jio Postpaid" },
    { id: "VIPOST001", name: "Vi Postpaid" },
  ],

  Gas: [
    { id: "MAHAGAS001", name: "Mahanagar Gas" },
    { id: "IGL001", name: "Indraprastha Gas" },
    { id: "ADANIGAS001", name: "Adani Gas" },
  ],

  "LPG Gas": [
    { id: "HPCL001", name: "HP Gas" },
    { id: "IOCL001", name: "Indane Gas" },
    { id: "BPCL001", name: "Bharat Gas" },
  ],

  Fastag: [
    { id: "HDFCFASTAG001", name: "HDFC FASTag" },
    { id: "ICICIFASTAG001", name: "ICICI FASTag" },
    { id: "AXISFASTAG001", name: "Axis FASTag" },
  ],

  Insurance: [
    { id: "LIC001", name: "LIC" },
    { id: "STAR001", name: "Star Health Insurance" },
    { id: "HDFCINS001", name: "HDFC Life" },
  ],
};

/* =========================================================
   COMPONENT
========================================================= */

const Commissions = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [selectedService, setSelectedService] = useState("");
  const [selectedBiller, setSelectedBiller] = useState("");

  const [ruleType, setRuleType] = useState("commission");
  const [valueType, setValueType] = useState("percentage");

  const [commissionValue, setCommissionValue] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [billerIdentifier, setBillerIdentifier] = useState("");

  const [rules, setRules] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [filterService, setFilterService] = useState("all");

  const availableBillers = useMemo(() => {
    if (!selectedService) return [];
    return BILLERS[selectedService] || [];
  }, [selectedService]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.toLowerCase().trim();

    if (!search) return USERS;

    return USERS.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    );
  }, [userSearch]);

  const filteredRules = useMemo(() => {
    if (filterService === "all") return rules;

    return rules.filter((rule) => rule.service === filterService);
  }, [rules, filterService]);

  const resetForm = () => {
    setSelectedService("");
    setSelectedBiller("");
    setRuleType("commission");
    setValueType("percentage");
    setCommissionValue("");
    setMinAmount("");
    setMaxAmount("");
    setBillerIdentifier("");
    setEditingId(null);
  };

  const handleServiceChange = (value) => {
    setSelectedService(value);
    setSelectedBiller("");
    setBillerIdentifier("");
  };

  const handleSaveRule = () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    if (!selectedService) {
      alert("Please select a service.");
      return;
    }

    if (!commissionValue || Number(commissionValue) < 0) {
      alert("Please enter a valid commission/charge value.");
      return;
    }

    if (valueType === "percentage" && Number(commissionValue) > 100) {
      alert("Percentage cannot be greater than 100.");
      return;
    }

    if (minAmount && maxAmount && Number(minAmount) > Number(maxAmount)) {
      alert("Minimum amount cannot be greater than maximum amount.");
      return;
    }

    const billerData = availableBillers.find(
      (biller) => biller.id === selectedBiller,
    );

    const rule = {
      id: editingId || Date.now(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      service: selectedService,
      billerId: selectedBiller || null,
      billerName: billerData?.name || "All Billers",
      billerIdentifier: billerIdentifier || null,
      ruleType,
      valueType,
      value: Number(commissionValue),
      minAmount: minAmount ? Number(minAmount) : null,
      maxAmount: maxAmount ? Number(maxAmount) : null,
      status: "active",
    };

    if (editingId) {
      setRules((prev) =>
        prev.map((item) => (item.id === editingId ? rule : item)),
      );
    } else {
      setRules((prev) => [rule, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (rule) => {
    const user = USERS.find((item) => item.id === rule.userId);

    setSelectedUser(user);
    setSelectedService(rule.service);
    setSelectedBiller(rule.billerId || "");
    setRuleType(rule.ruleType);
    setValueType(rule.valueType);
    setCommissionValue(String(rule.value));
    setMinAmount(rule.minAmount ?? "");
    setMaxAmount(rule.maxAmount ?? "");
    setBillerIdentifier(rule.billerIdentifier || "");
    setEditingId(rule.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this commission rule?",
    );

    if (!confirmDelete) return;

    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const handleToggleStatus = (id) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              status: rule.status === "active" ? "inactive" : "active",
            }
          : rule,
      ),
    );
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearch("");
    setShowUserDropdown(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 md:p-6 lg:p-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Home</span>

            <span>/</span>

            <span>Commission</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Commission & Charges
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure service-wise commission and charges for individual users.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={faUsers}
          title="Total Users"
          value={USERS.length}
          description="Available users"
        />

        <SummaryCard
          icon={faSliders}
          title="Configured Rules"
          value={rules.length}
          description="Commission rules"
        />

        <SummaryCard
          icon={faCheck}
          title="Active Rules"
          value={rules.filter((r) => r.status === "active").length}
          description="Currently active"
        />

        <SummaryCard
          icon={faBolt}
          title="Services"
          value={SERVICES.length}
          description="BBPS services"
        />
      </div>

      {/* =====================================================
          CONFIGURATION PANEL
      ====================================================== */}

      <div className="mb-6 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FontAwesomeIcon icon={faSliders} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Configure Commission
              </h2>

              <p className="text-xs text-slate-500">
                Select a user and configure service-level or biller-level rules.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          {/* USER SELECTOR */}

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Select User
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="flex min-h-[56px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {selectedUser.name.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedUser.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <FontAwesomeIcon icon={faUser} />
                    <span className="text-sm">Select a user</span>
                  </div>
                )}

                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-xs text-slate-400"
                />
              </button>

              {showUserDropdown && (
                <div className="absolute left-0 right-0 top-[62px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 p-3">
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                      />

                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search user..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredUsers.length === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-slate-400">
                        No users found
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUser(user)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-blue-50 ${
                            selectedUser?.id === user.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {user.name.charAt(0)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {user.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>

                          {selectedUser?.id === user.id && (
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-sm text-blue-600"
                            />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SELECTED USER INFO */}

          {selectedUser && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {selectedUser.name.charAt(0)}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedUser.name}
                  </p>

                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {selectedUser.status}
              </span>
            </div>
          )}

          {/* CONFIG FORM */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* SERVICE */}

            <FormField label="BBPS Service" required>
              <select
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="input-style"
              >
                <option value="">Select service</option>

                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </FormField>

            {/* BILLER */}

            <FormField label="Biller">
              <select
                value={selectedBiller}
                onChange={(e) => setSelectedBiller(e.target.value)}
                disabled={!selectedService}
                className="input-style disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">All Billers / Default</option>

                {availableBillers.map((biller) => (
                  <option key={biller.id} value={biller.id}>
                    {biller.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* RULE TYPE */}

            <FormField label="Rule Type" required>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRuleType("commission")}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    ruleType === "commission"
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  Commission
                </button>

                <button
                  type="button"
                  onClick={() => setRuleType("charge")}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    ruleType === "charge"
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  Charge
                </button>
              </div>
            </FormField>

            {/* VALUE TYPE */}

            <FormField label="Calculation Type" required>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValueType("percentage")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    valueType === "percentage"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <FontAwesomeIcon icon={faPercent} />
                  Percentage
                </button>

                <button
                  type="button"
                  onClick={() => setValueType("fixed")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    valueType === "fixed"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <FontAwesomeIcon icon={faIndianRupeeSign} />
                  Fixed
                </button>
              </div>
            </FormField>

            {/* VALUE */}

            <FormField
              label={
                ruleType === "commission" ? "Commission Value" : "Charge Value"
              }
              required
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {valueType === "percentage" ? "%" : "₹"}
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  placeholder={
                    valueType === "percentage" ? "e.g. 1.25" : "e.g. 5"
                  }
                  className="input-style pl-9"
                />
              </div>
            </FormField>

            {/* MIN */}

            <FormField label="Minimum Amount">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  className="input-style pl-8"
                />
              </div>
            </FormField>

            {/* MAX */}

            <FormField label="Maximum Amount">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="No limit"
                  className="input-style pl-8"
                />
              </div>
            </FormField>

            {/* SPECIFIC IDENTIFIER */}

            <FormField
              label="Specific Biller / Customer Identifier"
              hint="Optional"
            >
              <input
                type="text"
                value={billerIdentifier}
                onChange={(e) => setBillerIdentifier(e.target.value)}
                placeholder="e.g. BILLER123 / Customer ID"
                className="input-style"
              />
            </FormField>
          </div>

          {/* RULE PREVIEW */}

          {selectedService && commissionValue && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="text-blue-600"
                />

                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Rule Preview
                </p>
              </div>

              <p className="text-sm text-slate-700">
                User{" "}
                <span className="font-semibold">
                  {selectedUser?.name || "selected user"}
                </span>{" "}
                will receive{" "}
                <span className="font-semibold text-blue-600">
                  {valueType === "percentage"
                    ? `${commissionValue}%`
                    : `₹${commissionValue}`}
                </span>{" "}
                {ruleType} for{" "}
                <span className="font-semibold">{selectedService}</span> on{" "}
                <span className="font-semibold">
                  {selectedBiller
                    ? availableBillers.find((b) => b.id === selectedBiller)
                        ?.name
                    : "all billers"}{" "}
                </span>
                {billerIdentifier && (
                  <>
                    with identifier{" "}
                    <span className="font-semibold">{billerIdentifier}</span>
                  </>
                )}
                .
              </p>
            </div>
          )}

          {/* BUTTONS */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faRotate} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSaveRule}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={editingId ? faCheck : faPlus} />

              {editingId ? "Update Rule" : "Save Commission Rule"}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          RULES TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between md:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Configured Rules
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Commission rules configured for users.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="all">All Services</option>

              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* EMPTY STATE */}

        {filteredRules.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FontAwesomeIcon icon={faSliders} size="lg" />
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              No commission rules yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              Select a user and service above to create the first commission or
              charge rule.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Service
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Biller
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Value
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Amount Range
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRules.map((rule) => (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggleStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredRules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggleStatus}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({ icon, title, value, description }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({ label, required, hint, children }) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {hint && (
          <span className="text-[10px] font-medium text-slate-400">{hint}</span>
        )}
      </div>

      {children}
    </div>
  );
};

/* =========================================================
   DESKTOP RULE ROW
========================================================= */

const RuleRow = ({ rule, onEdit, onDelete, onToggle }) => {
  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
            {rule.userName.charAt(0)}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {rule.userName}
            </p>

            <p className="text-[11px] text-slate-400">User ID: {rule.userId}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
          {rule.service}
        </span>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {rule.billerName}
          </p>

          {rule.billerId && (
            <p className="mt-0.5 text-[10px] text-slate-400">{rule.billerId}</p>
          )}

          {rule.billerIdentifier && (
            <p className="mt-1 text-[10px] font-medium text-blue-600">
              ID: {rule.billerIdentifier}
            </p>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            rule.ruleType === "commission"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          {rule.ruleType === "commission" ? "Commission" : "Charge"}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-bold text-slate-800">
          {rule.valueType === "percentage"
            ? `${rule.value}%`
            : `₹${rule.value}`}
        </p>

        <p className="text-[10px] text-slate-400">
          {rule.valueType === "percentage" ? "Percentage" : "Fixed"}
        </p>
      </td>

      <td className="px-5 py-4 text-xs text-slate-600">
        {rule.minAmount !== null || rule.maxAmount !== null ? (
          <>
            ₹{rule.minAmount ?? 0} -{" "}
            {rule.maxAmount ? `₹${rule.maxAmount}` : "No limit"}
          </>
        ) : (
          "All amounts"
        )}
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onToggle(rule.id)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            rule.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {rule.status === "active" ? "Active" : "Inactive"}
        </button>
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(rule)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            title="Edit"
          >
            <FontAwesomeIcon icon={faPen} size="xs" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(rule.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} size="xs" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* =========================================================
   MOBILE RULE CARD
========================================================= */

const RuleCard = ({ rule, onEdit, onDelete, onToggle }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
            {rule.userName.charAt(0)}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {rule.userName}
            </p>

            <p className="text-xs text-slate-400">{rule.service}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(rule.id)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            rule.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {rule.status}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoItem label="Biller" value={rule.billerName} />

        <InfoItem
          label="Type"
          value={rule.ruleType === "commission" ? "Commission" : "Charge"}
        />

        <InfoItem
          label="Value"
          value={
            rule.valueType === "percentage"
              ? `${rule.value}%`
              : `₹${rule.value}`
          }
        />

        <InfoItem
          label="Amount"
          value={
            rule.minAmount !== null || rule.maxAmount !== null
              ? `₹${rule.minAmount ?? 0} - ${
                  rule.maxAmount ? `₹${rule.maxAmount}` : "No limit"
                }`
              : "All amounts"
          }
        />
      </div>

      {rule.billerIdentifier && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <span className="font-semibold">Identifier:</span>{" "}
          {rule.billerIdentifier}
        </div>
      )}

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onEdit(rule)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FontAwesomeIcon icon={faPen} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(rule.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
};

export default Commissions;
