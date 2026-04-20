/* eslint-disable */
"use client";
import { useSelector } from "react-redux";
import { Menu, Bell } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { RootState } from "../store";

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed?: boolean;
}

export default function Header({ onMenuClick, isCollapsed }: HeaderProps) {
  const { user, role } = useSelector((state: RootState) => state.auth);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] px-6 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="rounded-full p-2 transition-colors hover:bg-[var(--admin-surface)] lg:hidden"
        >
          <Menu size={20} className="text-[var(--admin-text)]" />
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--admin-primary)] shadow-[0_18px_40px_-24px_var(--admin-primary-strong)]">
            <span className="text-xs font-black text-[var(--admin-background)]">
              RS
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none tracking-tight text-[var(--admin-text)]">
              AnganStay
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-[var(--admin-muted)]">
              {role || "Management"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="relative rounded-full p-2 transition-all active:scale-95 hover:bg-[var(--admin-surface)]">
          <Bell
            size={18}
            className="text-[var(--admin-icon)] hover:text-[var(--admin-primary)]"
          />
          <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full border-2 border-[var(--admin-background)] bg-[var(--admin-danger)]"></span>
        </button>

        <div className="mx-2 h-6 w-[1px] bg-[var(--admin-border)]" />

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-semibold leading-none text-[var(--admin-text)]">
              {user?.name || "Administrator"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-[var(--admin-muted)]">
              {user?.email || "admin@anganstay.com"}
            </p>
          </div>

          <div className="relative">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="avatar"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--admin-border)] transition-all group-hover:ring-[var(--admin-primary-strong)]"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--admin-primary),var(--admin-secondary))] text-sm font-bold text-[var(--admin-background)] shadow-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--admin-background)] bg-[var(--admin-success)]"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
