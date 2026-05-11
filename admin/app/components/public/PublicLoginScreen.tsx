"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldCheck, UploadCloud, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";

import PublicAuthCard from "@/app/components/public/PublicAuthCard";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import PublicEmailVerificationModal from "@/app/components/public/PublicEmailVerificationModal";

type AuthPayload = {
  message?: string | { message?: string; email?: string };
  email?: string;
  isphoneverified?: boolean;
  isPhoneVerified?: boolean;
  user?: {
    isphoneverified?: boolean;
    isPhoneVerified?: boolean;
  } | null;
};

const getPayloadMessage = (payload: AuthPayload | null) => {
  const message = payload?.message;
  return typeof message === "string" ? message : message?.message;
};

const getPayloadEmail = (payload: AuthPayload | null) => {
  const message = payload?.message;
  return payload?.email || (typeof message === "object" ? message?.email : "");
};

const getPayloadPhoneVerified = (payload: AuthPayload | null) => {
  const user = payload?.user || {};
  return (
    payload?.isphoneverified ??
    payload?.isPhoneVerified ??
    user?.isPhoneVerified ??
    user?.isphoneverified
  );
};

export default function PublicLoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = usePublicAuth();
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/account/dashboard";

  const completeLogin = async (
    payload: AuthPayload | null,
    message = "Welcome back.",
  ) => {
    await refreshSession();

    if (message) {
      toast.success(message);
    }

    if (getPayloadPhoneVerified(payload) === false) {
      toast.error("Please verify your phone number to continue.");
      router.push(
        `/account/verify-phone?redirect=${encodeURIComponent(redirectPath)}`,
      );
    } else {
      router.push(redirectPath);
    }

    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/public-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as AuthPayload | null;
      if (!response.ok) {
        const message = getPayloadMessage(payload);
        if (message === "VERIFY_EMAIL_REQUIRED") {
          setVerificationEmail(
            getPayloadEmail(payload) ||
              (form.emailOrPhone.includes("@") ? form.emailOrPhone.trim() : ""),
          );
          setVerificationCode("");
          setShowEmailModal(true);
          toast.success("Verification code sent to your email.");
          return;
        }

        throw new Error(
          message ||
            (response.status === 403
              ? "This login is reserved for public user and agent accounts."
              : "Login failed."),
        );
      }

      await completeLogin(payload);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationEmail) {
      toast.error("Please log in with your email address to verify it.");
      return;
    }

    setVerifyingEmail(true);

    try {
      const verifyResponse = await fetch("/api/public-auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      });

      const verifyPayload = (await verifyResponse.json().catch(
        () => null,
      )) as AuthPayload | null;
      if (!verifyResponse.ok) {
        throw new Error(
          getPayloadMessage(verifyPayload) || "Email verification failed.",
        );
      }

      const loginResponse = await fetch("/api/public-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const loginPayload = (await loginResponse.json().catch(
        () => null,
      )) as AuthPayload | null;
      if (!loginResponse.ok) {
        throw new Error(getPayloadMessage(loginPayload) || "Login failed.");
      }

      setShowEmailModal(false);
      setVerificationCode("");
      await completeLogin(loginPayload, "Email verified.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Email verification failed. Please try again.",
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  return (
    <>
      <PublicAuthCard
        title="Login to your account"
        description="Manage your uploads, favorites, and profile from the same verified account system used in the mobile app."
        aside={
          <div className="space-y-4">
            {[
              {
                icon: UploadCloud,
                title: "Manage listings",
                description: "Upload, edit, and monitor your approved or pending rental properties.",
              },
              {
                icon: UserRound,
                title: "Access your profile",
                description: "Keep your contact details and public profile information in one place.",
              },
              {
                icon: ShieldCheck,
                title: "Separate from admin",
                description: "Public user and agent accounts stay isolated from the secure admin panel.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-[var(--admin-border)] bg-white p-4"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-base font-bold text-[var(--admin-text)]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
              Email or phone
            </span>
            <input
              value={form.emailOrPhone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  emailOrPhone: event.target.value,
                }))
              }
              className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="you@example.com or 03xx..."
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
              Password
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting || verifyingEmail}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--admin-muted)]">
          Need an account?{" "}
          <Link
            href="/account/signup"
            className="font-semibold text-[var(--admin-primary)] hover:underline"
          >
            Create one here
          </Link>
        </p>
      </PublicAuthCard>

      <PublicEmailVerificationModal
        open={showEmailModal}
        email={verificationEmail}
        code={verificationCode}
        loading={verifyingEmail}
        onCodeChange={setVerificationCode}
        onVerify={handleVerifyEmail}
        onCancel={() => {
          setShowEmailModal(false);
          setVerificationCode("");
        }}
      />
    </>
  );
}
