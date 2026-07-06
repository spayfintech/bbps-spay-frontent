import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useState, useEffect, useRef } from "react";

export const Layout = () => {
  const breakpoint = 768;

  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        </main>
      </div>
    </div>
  );
};
