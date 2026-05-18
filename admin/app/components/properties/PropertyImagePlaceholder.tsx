import { Building2, ImageOff } from "lucide-react";

interface PropertyImagePlaceholderProps {
  compact?: boolean;
  className?: string;
}

export default function PropertyImagePlaceholder({
  compact = false,
  className = "",
}: PropertyImagePlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#F8FAFC_0%,#EEF2FF_52%,#ECFDF5_100%)] p-5 text-center ${className}`}
    >
      <div className="flex max-w-[220px] flex-col items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-white shadow-[0_18px_34px_-24px_var(--admin-primary)]">
          <Building2 className="h-6 w-6" />
        </span>

        {!compact && (
          <span className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)]">
            <ImageOff className="h-4 w-4" />
          </span>
        )}

        <p className={`${compact ? "mt-3" : "mt-4"} text-sm font-black text-[var(--admin-text)]`}>
          AnganStay
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--admin-muted)]">
          Photos coming soon
        </p>
      </div>
    </div>
  );
}
