"use client";

import {
  Home,
  PieChart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 h-screen
          ${collapsed ? "w-20" : "w-64"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-sidebar text-white transition-all duration-300 ease-in-out flex flex-col
          border-r border-white/5
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          {(!collapsed || mobileOpen) && (
            <span
              className="font-bold text-xl tracking-tight text-white cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              RentStore
            </span>
          )}

          <button
            onClick={() =>
              mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)
            }
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
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
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "hover:bg-white/5 text-gray-400 hover:text-white"
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

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 
              w-full p-3 rounded-xl transition-all
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
