"use client";

import Link from "next/link";
import {
  Building2,
  Headphones,
  Heart,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

type PublicAccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const PUBLIC_ACCOUNT_NAV_ITEMS: PublicAccountNavItem[] = [
  { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/properties", label: "My Properties", icon: Building2 },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/profile", label: "Settings", icon: Settings },
  { href: "/account/support", label: "24/7 Support", icon: Headphones },
];

export function isAccountNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicAccountNavItems({
  pathname,
  onNavigate,
  surface = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  surface?: boolean;
}) {
  return (
    <>
      {PUBLIC_ACCOUNT_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isAccountNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`inline-flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,0,128,0.22)] ${
              active
                ? "bg-[#000080] text-white shadow-[0_18px_36px_-28px_rgba(0,0,128,0.65)]"
                : `${surface ? "bg-[var(--admin-card)]" : ""} text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[#000080]`
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
