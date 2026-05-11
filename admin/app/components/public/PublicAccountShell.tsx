"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { PublicAccountNavItems } from "@/app/components/public/PublicAccountNavigation";

function AccountSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-2 shadow-[0_18px_36px_-30px_var(--admin-shadow)]">
        <nav aria-label="Account navigation" className="grid gap-1">
          <PublicAccountNavItems pathname={pathname} />
        </nav>
      </div>
    </aside>
  );
}

export default function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      {/* Hero Section */}
      <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white/90 p-4 shadow-[0_28px_60px_-48px_var(--admin-shadow)] backdrop-blur sm:p-6 lg:rounded-[2rem]">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--admin-muted)]">
          <Link
            href="/"
            className="transition hover:text-[var(--admin-primary)]"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Account</span>
        </div>

        {/* Title and Description area - Primary Action Button Removed */}
        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-[1.7rem] font-bold leading-[1.12] tracking-[-0.025em] text-[var(--admin-text)] sm:text-4xl sm:font-semibold">
              {title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--admin-muted)] sm:text-[15px]">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)]">
        <AccountSidebar pathname={pathname} />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </section>
  );
}
