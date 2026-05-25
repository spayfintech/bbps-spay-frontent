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
    <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        isMobile={isMobile}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        sidebarRef={sidebarRef}
      />

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* HEADER */}
        <Header
          isMobile={isMobile}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 xl:p-7 bg-[#F5F7FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
