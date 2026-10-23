import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

import { useAuth } from "../contexts/AuthContext";
import KycPendingModal from "./KycPendingModal";

export const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const breakpoint = 768;

  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const kycStatus = Number(user?.kyc?.status);

  const showKycModal =
    location.pathname !== "/merchant/kyc" &&
    (kycStatus === 1 || kycStatus === 3);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobileSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileSidebarOpen]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F5F7FB] overflow-hidden">
      {/* HEADER TOP */}
      <Header
        isMobile={isMobile}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* SIDEBAR + CONTENT */}
      <div className="flex h-[calc(100vh-74px)]">
        <Sidebar
          isMobile={isMobile}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          sidebarRef={sidebarRef}
        />

        <main className="flex-1 overflow-y-auto p-6 xl:p-7 bg-[#F5F7FB]">
          <Outlet />

          <KycPendingModal
            open={showKycModal}
            status={kycStatus}
            remarks={user?.kyc?.remarks}
          />
        </main>
      </div>
    </div>
  );
};
