import { useState, useEffect, useMemo } from "react";
import Table from "../components/Table";
import { TopUpModal } from "../components/TopUpModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { Download, Search, RefreshCw, QrCode } from "lucide-react";
import TableSkeleton from "../components/TableSkeleton";

import QRManagementModal from "../components/QR/QRManagementModal";

/* ------------------ CONFIRMATION BOX ------------------ */
const ConformationBox = ({ onYes, onNo, userName }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-80 text-center p-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Are you sure?
      </h2>

      {/* Message */}
      <p className="text-gray-600 mb-6">
        You want to delete{" "}
        <span className="font-semibold text-red-600">{userName}</span>'s
        records.
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onYes}
          className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={onNo}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-colors"
        >
          No
        </button>
      </div>
    </div>
  </div>
);

/* ------------------ EDIT MODAL ------------------ */
const EditModel = ({ user, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-80 p-6 rounded-xl shadow-xl text-center">
      <h2 className="text-lg font-semibold mb-4">Edit User</h2>
      <p className="mb-4">
        You can add your edit form here for user: {user.name}
      </p>
      <div className="flex justify-center gap-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">
          Close
        </button>
      </div>
    </div>
  </div>
);

/* ------------------ PERMISSIONS MODAL ------------------ */
const PermissionsModal = ({ userId, onClose, refreshUsers }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { data, isLoading, error, refetch } = useGet(
    userId ? `/user/${userId}/categories` : null,
  );

  const { execute: postCategories, isLoading: isAdding } = usePost(
    `/user/${userId}/categories`,
  );

  const { execute: removeCategory } = usePost(
    `/user/${userId}/categories/remove`,
  );

  const allCategories = [
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
  ];

  const availableCategories = useMemo(
    () =>
      data?.categories
        ? allCategories.filter((c) => !data.categories.includes(c))
        : allCategories,
    [data],
  );

  const handleAddCategories = async () => {
    if (selectedCategories.length === 0) return;

    try {
      await postCategories({ categories: selectedCategories });
      refetch();
      setSelectedCategories([]);
      onClose();
      refreshUsers?.();
      alert("Categories added successfully!");
    } catch (err) {
      alert("Failed to add categories!");
    }
  };

  const handleRemoveCategory = async (category) => {
    if (!window.confirm(`Remove category "${category}"?`)) return;

    try {
      await removeCategory({ category });
      refetch();
      refreshUsers?.();
      alert(`Category "${category}" removed successfully!`);
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-xl shadow-xl relative">
        <h2 className="text-lg font-semibold mb-4">Manage Categories</h2>

        {isLoading && <p>Loading categories...</p>}
        {error && <p className="text-red-500">Error loading categories</p>}

        <ul className="mb-4 max-h-40 overflow-y-auto border p-2 rounded">
          {data?.categories?.map((cat, i) => (
            <li
              key={i}
              className="py-1 border-b last:border-b-0 flex justify-between"
            >
              <span>{cat}</span>
              <button
                onClick={() => handleRemoveCategory(cat)}
                className="text-red-500 font-bold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mb-4">
          <select
            multiple
            className="flex-1 border p-2 rounded h-32"
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(
                [...e.target.selectedOptions].map((o) => o.value),
              )
            }
          >
            {availableCategories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            className="bg-blue-600 text-white px-4 rounded"
            onClick={handleAddCategories}
            disabled={isAdding || selectedCategories.length === 0}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>

        <button
          className="absolute top-2 right-2 text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/* ------------------ MAIN USERS COMPONENT ------------------ */

const Users = () => {
  const navigate = useNavigate();
  // const { getData, deleteData } = useAuth();

  const [openTopUpModal, setOpenTopUpModal] = useState(false);
  const [topUpModalData, setTopUpModalData] = useState(null);

  const [isAlert, setIsAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState(null);
  const [permissionsUser, setPermissionsUser] = useState(null);

  const [qrManagementUser, setQrManagementUser] = useState(null);

  const [originalData, setOriginalData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState({ name: "", email: "" });

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((p) => p + 1);

  const {
    data: merchantsData,
    loading: loadingMerchants,
    error,
  } = useGet(`/get-merchants?refresh=${refreshKey}`);

  const { execute: updateStatus } = usePost("/update-user-statuses");
  const { execute: deleteUser } = usePost(`/delete-merchant/${deleteId}`);

  const { execute: updatePaymentMode } = usePost("/update-payment-mode");

  const handlePaymentMode = async (userId, paymentMode) => {
    try {
      await updatePaymentMode({
        user_id: userId,
        payment_mode: paymentMode,
      });

      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update payment mode");
    }
  };

  // --------------------------------STATUS UPDATE---------------------
  const handleToggleStatus = async (item) => {
    const newStatus = item.account_status ? 0 : 1;

    try {
      await updateStatus({ user_id: item.id, account_status: newStatus });

      setOriginalData((prev) =>
        prev.map((u) =>
          u.id === item.id ? { ...u, account_status: newStatus } : u,
        ),
      );

      clearFilters();
      refresh();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  /* ------------------ BUILD TABLE ROWS ------------------ */

  const buildTableRows = (data) =>
    data.map((item, index) => ({
      user_id: item.id || index + 1,
      name: item.name,
      email: item.email,
      account_status: (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={item.account_status === true}
            onChange={() => handleToggleStatus(item)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-red-400 rounded-full peer peer-checked:bg-green-500 transition-all duration-300"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
        </label>
      ),
      amount: `₹ ${Number(item.merchant_bbps_wallet || 0).toFixed(2)}`,
      actions: (
        <div className="flex items-center gap-3">
          <button
            className="p-2 bg-green-600 text-white rounded-md"
            onClick={() => setPermissionsUser(item)}
          >
            <FontAwesomeIcon icon={faShieldAlt} />
          </button>

          <button
            className="p-2 bg-blue-600 text-white rounded-md"
            onClick={() => navigate("/UpdateUser", { state: { item } })}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>

          <button
            className="p-2 bg-red-600 text-white rounded-md"
            onClick={() => handleDelete(item.id, item.name)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),

      top_up: (
        <button
          onClick={() => {
            setOpenTopUpModal(true);
            setTopUpModalData({ merchantId: item.id });
          }}
          className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition-all
            hover:bg-blue-700
            cursor-pointer
          "
        >
          Top Up
        </button>
      ),

      payment_method: (
        <select
          value={item.payment_mode || "QR"}
          onChange={(e) => handlePaymentMode(item.id, e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="QR">QR</option>
          <option value="DIRECT">DIRECT</option>
        </select>
      ),

      qr_management: (
        <button
          onClick={() => setQrManagementUser(item)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
        >
          <QrCode size={16} />
          Manage QR
        </button>
      ),
    }));

  /* ------------------ FILTER INPUT HANDLER ------------------   */
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  /* ------------------ FILTERING LOGIC ------------------ */
  const filteredUsers = useMemo(() => {
    return originalData.filter((u) => {
      const matchName = filters.name
        ? u.name.toLowerCase().includes(filters.name.toLowerCase())
        : true;

      const matchEmail = filters.email
        ? u.email.toLowerCase().includes(filters.email.toLowerCase())
        : true;

      return matchName && matchEmail;
    });
  }, [filters, originalData]);

  /* ------------------ BUILD TABLE WHEN FILTER CHANGES ------------------ */
  useEffect(() => {
    setTableData(buildTableRows(filteredUsers));
  }, [filteredUsers]);

  /* ------------------ ON LOAD ------------------ */
  useEffect(() => {
    if (merchantsData?.status) {
      let finalData = [...merchantsData.data];

      // const stored = getData("postSubmitData");
      // if (stored?.newUser) {
      //   deleteData("postSubmitData");
      //   finalData.push(stored.newUser);
      // }

      setOriginalData(finalData);
      setTableData(buildTableRows(finalData));
    }
  }, [merchantsData]);

  /* ------------------ DELETE HANDLERS ------------------ */

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setIsAlert(true);
  };

  const confirmDelete = async () => {
    const res = await deleteUser();
    setIsAlert(false);
    if (res?.status) refresh();
  };

  /* ------------------ CLEAR FILTERS ------------------ */
  const clearFilters = () => setFilters({ name: "", email: "" });

  /* ------------------ STYLES ------------------ */
  const tstyle = {
    tableClass:
      "min-w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-gray-700",
    headerClass:
      "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white text-sm font-semibold uppercase tracking-wide shadow-inner sticky top-0 text-center",
    rowClass:
      "bg-white even:bg-gray-50 hover:bg-indigo-50/60 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl mb-2 cursor-pointer",
    cellClass:
      "py-3 px-4 text-sm font-medium first:rounded-l-xl last:rounded-r-xl text-center",
    paginationClass:
      "bg-white/60 shadow-inner rounded-lg px-4 py-2 text-gray-700 flex items-center justify-center gap-2 mt-4",
  };

  // return (
  //   <>
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">Members</span>

            <span>/</span>

            <span>Users</span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Users Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage merchant accounts, permissions, wallet top-up and payment
            methods.
          </p>
        </div>

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
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Users</h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage merchant accounts, wallet balance and permissions.
            </p>
          </div>

          <button
            onClick={() => navigate("/addUser")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Add User
          </button>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
              <tr className="text-left text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                <th className="px-6 py-5">User ID</th>

                <th className="px-4 py-5">User</th>

                <th className="px-4 py-5 text-center">Wallet</th>

                <th className="px-4 py-5 text-center">Status</th>

                <th className="px-4 py-5 text-center">BBPS Payment</th>

                <th className="px-4 py-5 text-center">QR Management</th>

                <th className="px-4 py-5 text-center">Top Up</th>

                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableData.length > 0 ? (
                tableData.map((user, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    {/* User ID */}

                    <td className="px-6 py-6 text-sm font-medium text-slate-700">
                      {user.user_id}
                    </td>

                    {/* User */}

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            {user.name}
                          </h3>

                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Wallet */}

                    <td className="px-4 py-5 text-center">
                      <span className="font-semibold text-emerald-600">
                        {user.amount}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-4 py-5 text-center">
                      {user.account_status}
                    </td>

                    {/* Payment */}

                    <td className="px-4 py-5 text-center">
                      {user.payment_method}
                    </td>

                    {/* QR Management */}

                    <td className="px-4 py-5 text-center">
                      {user.qr_management}
                    </td>

                    {/* Topup */}

                    <td className="px-4 py-5 text-center">{user.top_up}</td>

                    {/* Actions */}

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {user.actions}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-20 text-center text-lg text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION */}
      {isAlert && (
        <ConformationBox
          onYes={confirmDelete}
          onNo={() => setIsAlert(false)}
          userName={deleteName}
        />
      )}

      {permissionsUser && (
        <PermissionsModal
          userId={permissionsUser.id}
          onClose={() => setPermissionsUser(null)}
          refreshUsers={refresh}
        />
      )}

      {qrManagementUser && (
        <QRManagementModal
          user={qrManagementUser}
          onClose={() => setQrManagementUser(null)}
        />
      )}

      {openTopUpModal && (
        <TopUpModal
          data={topUpModalData}
          onClose={() => setOpenTopUpModal(false)}
          isOpen={openTopUpModal} // ✅ YE ADD KARO
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default Users;
