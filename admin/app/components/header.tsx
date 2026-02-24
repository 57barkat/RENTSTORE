"use client";
import { useSelector } from "react-redux";
import { Menu, Bell, Search } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { RootState } from "../store";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, role } = useSelector((state: RootState) => state.auth);

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-accent rounded-lg"
        >
          <Menu size={22} />
        </button>
        <div className="hidden md:flex items-center bg-background border border-border px-4 py-2 rounded-2xl gap-3 w-72">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Quick Search..."
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="p-2 hover:bg-accent rounded-xl cursor-pointer relative">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
        </div>

        <div className="h-10 w-[1px] bg-border mx-2 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-none">
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-gray-400 uppercase mt-1 tracking-wider">
              {role || "Staff"}
            </p>
          </div>

          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-12 h-12 rounded-2xl object-cover shadow-md border-2 border-primary/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
              {user?.name?.charAt(0) || "A"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
