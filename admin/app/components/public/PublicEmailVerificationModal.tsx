"use client";

import { Loader2, ShieldCheck, X } from "lucide-react";

export default function PublicEmailVerificationModal({
  open,
  email,
  code,
  loading,
  title = "Verify your email",
  description = "Enter the 6 digit code we sent to your email address.",
  actionLabel = "Verify email",
  onCodeChange,
  onVerify,
  onCancel,
}: {
  open: boolean;
  email: string;
  code: string;
  loading: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.65)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-5">
          <div className="flex gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-[var(--admin-text)]">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close verification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-5 px-5 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            onVerify();
          }}
        >
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--admin-muted)]">
              Email
            </p>
            <p className="mt-1 truncate text-sm font-bold text-[var(--admin-text)]">
              {email}
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
              Verification code
            </span>
            <input
              value={code}
              onChange={(event) =>
                onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="admin-input h-12 w-full rounded-2xl px-4 text-center text-lg font-bold tracking-[0.2em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Verifying..." : actionLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
