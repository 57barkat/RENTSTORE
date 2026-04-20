"use client";

import { useState } from "react";

import Sidebar from "@/app/components/sidebar";
import DashboardHeader from "@/app/components/header";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--admin-background)] text-[var(--admin-text)]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
          isCollapsed={collapsed}
        />

        <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
            {children}
          </div>
        </main>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--admin-shadow)] backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
