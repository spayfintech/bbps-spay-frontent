import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profilePic from "../images/avatars/1.png";
import { useCookies } from "react-cookie";
import { usePost } from "../hooks/usePost";

export const ProfileSidebar = ({ isOpen, onClose }) => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["token", "role"]);
  const { data, execute } = usePost("/bbps/deposit-enquiry/json");
  // const
  // Handle click outside

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        overlayRef.current &&
        overlayRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const featchBalance = async () => {
    const body = {
      fromDate: "2025-01-01",
      toDate: "2025-01-31",
      transType: "CR",
      agentId: "CC01RA16AGTBAL101515",
    };
    const accountDetail = await execute(body);
    if (accountDetail) {
      setBalance(accountDetail.data.currentBalance);
    }
  };
  useEffect(() => {
    featchBalance();
  }, [isOpen == true]);

  const logoutHandler = () => {
    // Properly remove cookies
    removeCookie("token", { path: "/" });
    removeCookie("role", { path: "/" });
    removeCookie("user", { path: "/" });
    navigate("/");
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose} // Close sidebar when clicking overlay
      ></div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 mb-10">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold transition"
          >
            ×
          </button>
        </div>

        {/* Profile section */}
        <div className="flex flex-col items-center text-center px-4">
          <div className="relative">
            <img
              src={profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-md object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-blue-600 p-1.5 rounded-full cursor-pointer shadow hover:bg-blue-700 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 11l3-3 6 6-3 3H9v-3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-3 font-semibold text-gray-800 text-lg">
            {cookies.user?.name}
          </h3>
          <p className="text-sm text-gray-500">{cookies.user?.email}</p>
        </div>

        <hr className="my-6 mx-4 border-gray-200" />

        {/* Balance section (role-based) */}
        {cookies?.role === 1 && (
          <div className="flex flex-col space-y-3 px-6 mb-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 w-full">
              <p className="text-gray-700 font-medium">Balance:</p>
              <span className="text-gray-900 font-semibold">{balance}</span>
            </div>
          </div>
        )}

        {/* Sidebar menu items */}
        <SidebarItem
          icon="fas fa-phone-alt"
          text="Contact Us"
          gradient="from-blue-300 via-blue-400 to-blue-500"
          onClick={() => {
            navigate("/contact-us");
            onClose();
          }}
        />
        <SidebarItem
          icon="fas fa-sign-out-alt"
          text="Logout"
          gradient="from-purple-300 via-pink-400 to-pink-500"
          onClick={logoutHandler}
        />
      </div>
    </>
  );
};

const SidebarItem = ({ icon, text, gradient, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center space-x-4 cursor-pointer p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-blue-50 hover:translate-x-2 group"
  >
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr ${gradient} group-hover:scale-105 transition-transform duration-300`}
    >
      <i className={`${icon} text-white text-lg`}></i>
    </div>
    <span className="text-gray-700 font-medium group-hover:text-blue-600">
      {text}
    </span>
  </div>
);
