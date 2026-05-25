import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCookies } from "react-cookie";

import {
  faBars,
  faBell,
  faCaretDown,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";

import profilePic from "../images/avatars/1.png";

import { ProfileSidebar } from "./ProfileSidebar";

export const Header = ({ isMobile = false, setIsMobileSidebarOpen }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const [cookies] = useCookies(["user", "role"]);

  return (
    <>
      <header className="h-[74px] bg-white border-b border-[#E8EDF5] flex items-center justify-between px-6 xl:px-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] relative z-30">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-5">
          {/* MENU BUTTON */}
          <button
            onClick={() => {
              setIsMobileSidebarOpen((prev) => !prev);
            }}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F4F7FC] transition-all duration-300"
          >
            <FontAwesomeIcon
              icon={faBars}
              className="text-[18px] text-[#1E3A8A]"
            />
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center w-[340px] h-[42px] bg-[#F8FAFD] border border-[#E8EDF5] rounded-xl px-4 shadow-sm">
            <input
              type="text"
              placeholder="Search for transactions, users..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#1F2937] placeholder:text-[#94A3B8]"
            />

            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-[#94A3B8] text-[14px]"
            />
          </div>

          {/* NOTIFICATION */}
          <button className="group relative w-10 h-10 rounded-2xl border border-[#E8EDF5] bg-white flex items-center justify-center shadow-sm hover:shadow-md hover:bg-[#F8FAFD] transition-all duration-300 cursor-pointer">
            {/* ICON */}
            <FontAwesomeIcon
              icon={faBell}
              className="text-[16px] text-[#1E3A8A] group-hover:scale-110 transition-all duration-300"
            />

            {/* BADGE */}
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold flex items-center justify-center border-[3px] border-white shadow-md">
              12
            </span>

            {/* GLOW EFFECT */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300" />
          </button>

          {/* PROFILE */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-2xl hover:bg-[#F8FAFD] transition-all duration-300"
          >
            {/* AVATAR */}
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#E8EDF5] shadow-sm">
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* USER INFO */}
            <div className="hidden lg:flex flex-col items-start leading-tight cursor-pointer">
              <h4 className="text-[13px] font-semibold text-[#111827] max-w-[120px] truncate">
                {cookies?.user?.name || "Admin User"}
              </h4>

              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                {cookies?.role === 1 ? "Super Admin" : "User"}
              </p>
            </div>

            {/* DROPDOWN ICON */}
            <FontAwesomeIcon
              icon={faCaretDown}
              className="text-[#64748B] text-[13px] ml-1"
            />
          </button>
        </div>
      </header>

      {/* PROFILE SIDEBAR */}
      <ProfileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};
