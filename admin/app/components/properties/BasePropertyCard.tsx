/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

interface BasePropertyCardProps {
  image: string;
  title: string;
  badges?: ReactNode;
  overlay?: ReactNode;
  meta?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleHref?: ReactNode;
}

export default function BasePropertyCard({
  image,
  title,
  badges,
  overlay,
  meta,
  summary,
  actions,
  className,
  titleHref,
}: BasePropertyCardProps) {
  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border bg-[var(--admin-background)] shadow-[0_18px_40px_-30px_var(--admin-shadow)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-34px_var(--admin-shadow)] ${className || "border-[var(--admin-border)]"}`}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--admin-card)]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.4)] via-transparent to-[rgba(15,23,42,0.08)]" />
        {badges && <div className="absolute left-3 top-3 flex flex-wrap gap-2">{badges}</div>}
        {overlay && <div className="absolute right-3 top-3">{overlay}</div>}
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          {titleHref || (
            <h2 className="line-clamp-1 text-lg font-semibold tracking-tight text-[var(--admin-text)]">
              {title}
            </h2>
          )}
          {meta}
        </div>

        {summary}
        {actions}
      </div>
    </article>
  );
}
