import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

export function PublicAccountPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_36px_-30px_var(--admin-shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PublicAccountSectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--admin-secondary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--admin-text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PublicAccountStatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <PublicAccountPanel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)]">
            {value}
          </p>
        </div>
        {Icon ? (
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-3 text-sm leading-6 text-[var(--admin-muted)]">{hint}</p>
      ) : null}
    </PublicAccountPanel>
  );
}

export function PublicQuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4 transition hover:border-[var(--admin-primary)]/35 hover:bg-white hover:shadow-[0_18px_36px_-30px_var(--admin-shadow)]"
    >
      <div className="flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] transition group-hover:bg-[var(--admin-primary)] group-hover:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[var(--admin-text)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function PublicMetricPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.2rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">{value}</p>
    </div>
  );
}

export function PublicEmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
  icon: Icon,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  icon: LucideIcon;
}) {
  return (
    <PublicAccountPanel className="border-dashed px-6 py-12 text-center">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-primary)]">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[var(--admin-text)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--admin-muted)]">
        {description}
      </p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-semibold text-white"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </PublicAccountPanel>
  );
}
