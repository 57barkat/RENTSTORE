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
      className={`group overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${className || "border-slate-200 hover:shadow-slate-200/80"}`}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/5" />
        {badges && <div className="absolute left-3 top-3 flex flex-wrap gap-2">{badges}</div>}
        {overlay && <div className="absolute right-3 top-3">{overlay}</div>}
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          {titleHref || (
            <h2 className="line-clamp-1 text-lg font-semibold tracking-tight text-slate-950">
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
