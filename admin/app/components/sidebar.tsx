"use client";

import {
  Home,
  PieChart,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MailWarning,
} from "lucide-react";
import { destroyCookie } from "nookies";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    destroyCookie(null, "admin_token", { path: "/" });
    destroyCookie(null, "refresh_token", { path: "/" });
    router.push("/login");
  };

  const menuItems = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <PieChart size={20} />, label: "Properties", path: "/properties" },
    { icon: <Users size={20} />, label: "Users", path: "/users" },
    { icon: <MailWarning size={20} />, label: "Reports", path: "/reports" },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--admin-shadow)] backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 h-screen
          ${collapsed ? "w-20" : "w-64"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col border-r border-[var(--admin-primary-strong)] bg-sidebar text-[var(--admin-background)] transition-all duration-300 ease-in-out
        `}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--admin-primary-strong)] px-6">
          {(!collapsed || mobileOpen) && (
            <span
              className="cursor-pointer text-xl font-bold tracking-tight text-[var(--admin-background)]"
              onClick={() => router.push("/dashboard")}
            >
              AnganStay
            </span>
          )}

          <button
            onClick={() =>
              mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)
            }
            className="rounded-lg bg-[var(--admin-primary-strong)] p-1.5 transition-colors hover:bg-[var(--admin-secondary-strong)]"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-2 overflow-y-auto p-4 custom-scrollbar">
          {menuItems.map((item, i) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + "/");

            return (
              <div
                key={i}
                onClick={() => {
                  router.push(item.path);
                  setMobileOpen(false);
                }}
                className={`
                  flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all
                  ${
                    isActive
                      ? "bg-[var(--admin-background)] text-[var(--admin-primary)] shadow-[0_18px_40px_-28px_var(--admin-shadow)]"
                      : "text-[rgba(255,255,255,0.78)] hover:bg-[var(--admin-primary-strong)] hover:text-[var(--admin-background)]"
                  }
                `}
              >
                <div className="shrink-0">{item.icon}</div>
                {(!collapsed || mobileOpen) && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--admin-primary-strong)] p-4">
          <button
            onClick={handleLogout}
            className={`
              flex w-full items-center gap-4 rounded-xl p-3 text-[rgba(255,255,255,0.78)] transition-all
              hover:bg-[var(--admin-danger-soft)] hover:text-[var(--admin-background)]
              ${collapsed && !mobileOpen ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {(!collapsed || mobileOpen) && (
              <span className="font-bold truncate">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
