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
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-accent rounded-full transition-colors"
        >
          <Menu size={20} className="text-foreground" />
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-black text-xs">
              RS
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground leading-none">
              Anganstay
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
              {role || "Management"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="p-2 hover:bg-accent rounded-full relative transition-all active:scale-95">
          <Bell
            size={18}
            className="text-muted-foreground hover:text-foreground"
          />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
        </button>

        <div className="h-6 w-[1px] bg-border/60 mx-2" />

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-semibold text-foreground leading-none">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              {user?.email || "admin@rentstore.com"}
            </p>
          </div>

          <div className="relative">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
