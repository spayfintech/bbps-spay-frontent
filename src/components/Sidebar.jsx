import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faMagnifyingGlass,
  faBuildingColumns,
  faTriangleExclamation,
  faCircleExclamation,
  faUsers,
  faDiagramProject,
} from "@fortawesome/free-solid-svg-icons";

import { faFileLines } from "@fortawesome/free-regular-svg-icons";

import { Link, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

import Dashboard from "../pages/Dashboard";
import { ServicePage } from "../pages/ServicePage";
import Report from "../pages/Report";
import Support from "../pages/Support";
import ComplaintPage from "../pages/ComplaintPage";
import CheckTransactionComplaint from "../pages/CheckTransactionComplaint";
import Users from "../pages/Users";
import CheckTransactionStatus from "../pages/CheckTransactionStatus";
import { useAuth } from "../contexts/AuthContext";
import Scheme from "../pages/Scheme";
import { useNavigate } from "react-router-dom";

export const navItems = [
  {
    icon: faGauge,
    label: "Dashboard",
    path: "/dashboard",
    roles: ["admin", "user"],
    component: Dashboard,
  },
  {
    icon: faDiagramProject,
    label: "Scheme",
    path: "/scheme",
    roles: ["admin"],
    component: Scheme,
  },
  {
    icon: faUsers,
    label: "Users",
    path: "/users",
    roles: ["admin"],
    component: Users,
  },
  {
    icon: faBuildingColumns,
    label: "Services",
    path: "/services",
    roles: ["admin", "user"],
    component: ServicePage,
  },
  {
    icon: faFileLines,
    label: "Report",
    path: "/report",
    roles: ["admin", "user"],
    component: Report,
  },
  {
    icon: faMagnifyingGlass,
    label: "Support",
    path: "/support",
    roles: ["user", "admin"],
    component: Support,
  },
  {
    icon: faTriangleExclamation,
    label: "Complaint",
    path: "/complaint",
    roles: ["admin", "user"],
    component: ComplaintPage,
  },
  {
    icon: faCircleExclamation,
    label: "Check Complaint",
    path: "/checkcomplaint",
    roles: ["user", "admin"],
    component: CheckTransactionComplaint,
  },

  // {
  //   icon: faCircleExclamation,
  //   label: "Check Transaction Status",
  //   path: "/checktransactionstatus",
  //   roles: ["admin"],
  //   component: CheckTransactionStatus,
  // },
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

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  const navigate = useNavigate();

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
          bg-gradient-to-b
          from-[#052B7A]
          via-[#0637A4]
          to-[#0B57F0]
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

        {/* LOGO */}
        <div className="relative z-10 px-6 pt-6 pb-7">
          <h1
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(true);
              else navigate("/dashboard"); // navigate to dashboard
            }}
            className="text-[42px] font-black leading-none tracking-tight cursor-pointer"
          >
            S<span className="font-light">Pay</span>
          </h1>

          <p className="text-[12px] text-blue-100 font-medium mt-1 ml-1">
            BBPS Dashboard
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="relative z-10 grow px-4 py-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`
                      group
                      flex
                      items-center
                      h-11
                      px-4
                      rounded-xl
                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "bg-[#1F6BFF] shadow-lg shadow-blue-900/40"
                          : "hover:bg-white/10"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`
                          text-[16px]
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? "text-white"
                              : "text-blue-100 group-hover:text-white"
                          }
                        `}
                      />

                      <span
                        className={`
                          text-[13px]
                          font-medium
                          tracking-[0.2px]

                          ${
                            isActive
                              ? "text-white"
                              : "text-blue-50 group-hover:text-white"
                          }
                        `}
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
              ₹78,450<span className="text-lg">.75</span>
            </h2>
          </div>

          {/* FOOTER */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-[12px] text-blue-100 font-medium">
              © 2026 SPay Fintech
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
