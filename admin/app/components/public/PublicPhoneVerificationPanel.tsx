"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import publicApiClient from "@/app/lib/public-api-client";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const normalizeRedirectPath = (value?: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account/dashboard";
  }

  return value;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as ApiError).response?.data?.message || fallback;
  }

  return fallback;
};

export default function PublicPhoneVerificationPanel({
  redirectPath,
}: {
  redirectPath?: string | null;
}) {
  const router = useRouter();
  const { user, updateUser, refreshSession } = usePublicAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const nextPath = useMemo(
    () => normalizeRedirectPath(redirectPath),
    [redirectPath],
  );

  useEffect(() => {
    setPhone(user?.phone || "");
  }, [user?.phone]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    setSending(true);
    try {
      const response = await publicApiClient.post("/auth/send-otp", {
        phone: phone.trim(),
      });
      toast.success(response.data?.message || "Verification code sent.");
      setOtpSent(true);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Unable to send OTP."));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 6) {
      toast.error("Enter the 6 digit verification code.");
      return;
    }

    setVerifying(true);
    try {
      const response = await publicApiClient.post("/auth/verify-otp", {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      updateUser({ phone: phone.trim(), isPhoneVerified: true });
      await refreshSession();
      toast.success(response.data?.message || "Phone verified successfully.");
      router.push(nextPath);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Phone verification failed."));
    } finally {
      setVerifying(false);
    }
  };

  if (user?.isPhoneVerified) {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-[0_24px_70px_-56px_var(--admin-shadow)]">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-[var(--admin-text)]">
          Phone verified
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
          Your phone number is verified and your upload access is active.
        </p>
        <button
          type="button"
          onClick={() => router.push(nextPath)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-95"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_24px_70px_-56px_var(--admin-shadow)]">
      <div className="border-b border-[var(--admin-border)] bg-[var(--admin-primary-soft)] px-5 py-6 sm:px-7">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)] shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-[var(--admin-text)]">
          Verify your phone number
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
          Property uploads are available after your phone number is verified.
        </p>
      </div>

      <div className="grid gap-5 px-5 py-6 sm:px-7">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
            Phone number
          </span>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="admin-input h-12 w-full rounded-2xl pl-11 pr-4 text-sm"
              autoComplete="tel"
              placeholder="03xx..."
              disabled={sending || verifying || otpSent}
              required
            />
          </div>
        </label>

        {otpSent ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
              Verification code
            </span>
            <input
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="admin-input h-12 w-full rounded-2xl px-4 text-center text-lg font-bold tracking-[0.2em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              disabled={verifying}
              required
            />
          </label>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={sending || verifying}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending || verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {otpSent
              ? verifying
                ? "Verifying..."
                : "Verify phone"
              : sending
                ? "Sending..."
                : "Send code"}
          </button>

          {otpSent ? (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
              }}
              disabled={verifying}
              className="inline-flex items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 py-3.5 text-sm font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Edit number
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
