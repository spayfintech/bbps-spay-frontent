import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faMagnifyingGlass,
  faBuildingColumns,
  faMoneyCheckDollar,
  faTriangleExclamation,
  faCog,
  faCircleExclamation,
  faUsers,
  faDiagramProject,
  faChevronDown,
  faChevronRight,
  faIdCard,
  faWallet,
  faMoneyBillTransfer,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";

import { faFileLines } from "@fortawesome/free-regular-svg-icons";

import { Link, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

import Dashboard from "../pages/Dashboard";
import MainServices from "../pages/MainServices";

import Report from "../pages/Report";

import LoadWallet from "../pages/LoadWallet";
// import Payinsettlement from "../pages/Payinsettlement";
// import Payoutstatement from "../pages/Payoutstatement";

import ComplaintPage from "../pages/ComplaintPage";
import commissions from "../pages/commissions";
import Users from "../pages/Users";
import MerchantOnboarding from "../pages/MerchantOnboarding";
import MerchantKycPage from "../pages/MerchantKycPage";
import AddFundOverview from "../pages/AddFundOverview";
import CommissionSelection from "../pages/CommissionSelection";
import { useAuth } from "../contexts/AuthContext";
import Scheme from "../pages/Scheme/Scheme";
import Qrscheme from "../pages/Scheme/Qrscheme";
import { useNavigate } from "react-router-dom";

import logo from "../images/spaylogo.png";

export const navItems = [
  {
    icon: faGauge,
    label: "Dashboard",
    path: "/dashboard",
    roles: ["admin", "user"],
    component: Dashboard,
  },
  // {
  //   icon: faDiagramProject,
  //   label: "Scheme",
  //   path: "",
  //   roles: ["admin"],
  //   component: Scheme,
  // },

  {
    icon: faDiagramProject,
    label: "Scheme Manager",
    roles: ["admin"],
    children: [
      {
        label: "BBPS Scheme",
        path: "/scheme",
        component: Scheme,
      },
      {
        label: "QR Scheme",
        path: "/Qrscheme",
        component: Qrscheme,
      },
    ],
  },

  {
    icon: faUsers,
    label: "Members",
    roles: ["admin"],
    children: [
      {
        label: "Users",
        path: "/users",
        component: Users,
      },
      {
        label: "Merchant Onboarding",
        path: "/merchant-onboarding",
        component: MerchantOnboarding,
      },
    ],
  },

  {
    icon: faBuildingColumns,
    label: "Services",
    path: "/all-services",
    roles: ["admin", "user"],
    component: MainServices,
  },

  {
    icon: faMoneyBillTransfer,
    label: "Funds",
    roles: ["admin"],
    children: [
      {
        label: "Load Wallet",
        path: "/load-wallet",
        component: LoadWallet,
      },
      {
        label: "Payin Settlement",
        path: "/payin-settlement",
        component: LoadWallet,
      },
    ],
  },

  {
    icon: faFileLines,
    label: "Report",
    roles: ["admin", "user"],
    children: [
      {
        label: "Transaction History",
        path: "/report",
        component: Report,
      },
      {
        label: "Payout Statement",
        path: "/payout-statement",
        component: LoadWallet,
      },
    ],
  },

  {
    icon: faIdCard,
    label: "Update KYC",
    path: "/merchant/kyc",
    roles: ["user"],
    component: MerchantKycPage,
  },
  {
    icon: faWallet,
    label: "Add Fund",
    path: "/add-funds",
    roles: ["user"],
    component: AddFundOverview,
  },
  {
    icon: faPercent,
    label: "Commision plan",
    path: "/commission",
    roles: ["user"],
    component: CommissionSelection,
  },
  {
    icon: faTriangleExclamation,
    label: "Support Ticket",
    path: "/complaint",
    roles: ["admin", "user"],
    component: ComplaintPage,
  },
  {
    icon: faCog,
    label: "Settings",
    roles: ["admin"],
    children: [
      {
        label: "Commission & Charges",
        path: "/setting-commissions",
        component: commissions,
      },
    ],
  },
];

export const Sidebar = ({
  isMobile = false,
  isMobileSidebarOpen = false,
  sidebarRef = null,
  setIsMobileSidebarOpen,
}) => {
  const [cookie] = useCookies();
  const { user } = useAuth();
  const location = useLocation();

  const role = cookie.role === 1 ? "admin" : "user";

  let filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  if (role === "user") {
    const kycStatus = Number(user?.kyc?.status);

    // Pending
    if (kycStatus === 1) {
      filteredNavItems = filteredNavItems.filter((item) =>
        ["Dashboard", "Complaint"].includes(item.label),
      );
    }

    // Rejected
    else if (kycStatus === 3) {
      filteredNavItems = filteredNavItems.filter((item) =>
        ["Update KYC"].includes(item.label),
      );
    }
  }

  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState({
    Members: false,
  });

  return (
    <div
      className={
        isMobile
          ? `fixed inset-0 z-50 bg-black/40 transition-opacity duration-300
            ${
              isMobileSidebarOpen
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`
          : ""
      }
    >
      <div
        ref={sidebarRef}
        className={`
          flex flex-col
          bg-[linear-gradient(180deg,#0a43c2_0%,#062b7a_65%,#0b57f0_100%)]
          text-white
          shadow-2xl
          h-full
          relative
          overflow-hidden
          transform
          transition-transform
          duration-300
          ease-in-out

          ${
            isMobile
              ? `w-[250px] ${
                  isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "w-[250px]"
          }
        `}
      >
        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_bottom,_white,_transparent_40%)]" />

        {/* NAVIGATION */}
        <nav className="relative z-10 grow px-4 pt-5">
          <ul className="space-y-1">
            {filteredNavItems.map((item, index) => {
              const hasChildren = item.children?.length;

              if (hasChildren) {
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenus((prev) => ({
                          ...prev,
                          [item.label]: !prev[item.label],
                        }))
                      }
                      className="group flex items-center justify-between w-full h-11 px-4 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="text-blue-100 group-hover:text-white"
                        />

                        <span className="text-[13px] font-medium text-blue-50 group-hover:text-white">
                          {item.label}
                        </span>
                      </div>

                      <FontAwesomeIcon
                        icon={
                          openMenus[item.label] ? faChevronDown : faChevronRight
                        }
                        className="text-xs text-blue-100"
                      />
                    </button>

                    {openMenus[item.label] && (
                      <ul className="ml-7 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const active = location.pathname === child.path;

                          return (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                className={`block px-4 py-2 rounded-lg text-sm transition ${
                                  active
                                    ? "bg-[#1F6BFF] text-white"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              const isActive = location.pathname === item.path;

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`group flex items-center h-11 px-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-[#1F6BFF] shadow-lg shadow-blue-900/40"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={
                          isActive
                            ? "text-white"
                            : "text-blue-100 group-hover:text-white"
                        }
                      />

                      <span
                        className={
                          isActive
                            ? "text-white text-[13px] font-medium"
                            : "text-blue-50 text-[13px] font-medium group-hover:text-white"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* WALLET CARD */}
        <div className="relative z-10 px-4 pb-5 mt-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-blue-100 font-medium">
                Wallet Balance
              </p>

              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold">
                ₹
              </div>
            </div>

            <h2 className="text-[24px] font-bold tracking-tight leading-none">
              ₹x,xxx<span className="text-lg">.xx</span>
            </h2>
          </div>

          {/* FOOTER */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-[12px] text-blue-100 font-medium">
              © 2026 Spay Fintech
            </p>

            <p className="text-[11px] text-blue-200/70 mt-1">
              All rights reserved
            </p>
          </div>
        </div>

        {/* BOTTOM DESIGN */}
        <div className="absolute bottom-0 left-0 w-full opacity-[0.06]">
          <svg
            viewBox="0 0 500 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120V80L30 70V50H50V90H70V30H110V70H130V10H170V90H210V40H240V80H280V20H320V60H350V45H390V90H420V35H460V70H500V120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
