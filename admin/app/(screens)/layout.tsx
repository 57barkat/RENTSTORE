/* eslint-disable */
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

// Define your public categories to match your folder structure
const PUBLIC_CATEGORIES = ["home", "house", "hostel", "apartment"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();

  // 1. Updated Logic: Identify if the current route is public
  // It's public if it's the root "/" OR if it starts with one of our categories
  const isPublicView =
    pathname === "/" ||
    PUBLIC_CATEGORIES.some((cat) => pathname.startsWith(`/${cat}`));

  // Close mobile sidebar automatically when navigating between pages
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-foreground transition-colors duration-300">
      {/* Sidebar is only rendered for dashboard/internal routes */}
      {!isPublicView && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      )}

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isPublicView ? "ml-0" : collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header visibility logic - hidden on public listing/details pages */}
        {!isPublicView && (
          <Header
            onMenuClick={() => setMobileOpen(true)}
            isCollapsed={collapsed}
          />
        )}

        <main
          className={`flex-1 flex flex-col ${
            isPublicView ? "p-0" : "p-4 md:p-6 lg:p-8"
          }`}
        >
          <div
            className={`w-full mx-auto flex-1 flex flex-col ${
              isPublicView ? "max-w-full" : "max-w-[1600px]"
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay for Sidebar - only for dashboard */}
      {!isPublicView && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
