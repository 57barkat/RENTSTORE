"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Loader2, Sparkles, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";

import PublicAuthCard from "@/app/components/public/PublicAuthCard";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";

type PublicSignupRole = "user" | "agent";

const accountTypes: Array<{
  value: PublicSignupRole;
  label: string;
  description: string;
}> = [
  {
    value: "user",
    label: "User",
    description: "For renters and regular marketplace users.",
  },
  {
    value: "agent",
    label: "Agent",
    description: "For independent property agents managing their own listings.",
  },
];

export default function PublicSignupScreen() {
  const router = useRouter();
  const { refreshSession } = usePublicAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    role: "user" as PublicSignupRole,
    name: "",
    email: "",
    phone: "",
    cnic: "",
    password: "",
    acceptedTerms: true,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/public-auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          isAgencyPerson: false,
          agencyName: "",
          agencyLicense: "",
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Signup failed.");
      }

      await refreshSession();
      toast.success(
        form.role === "agent"
          ? "Agent account created successfully."
          : "Account created successfully.",
      );
      router.push("/account/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Signup failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicAuthCard
      title="Create your account"
      description="Join the public marketplace as a renter or an agent. Public signup stays limited to user and agent roles only."
      aside={
        <div className="space-y-4">
          {[
            {
              icon: UserRound,
              title: "Choose your account type",
              description: "Start as a normal user or an agent. Agency and admin creation remain unavailable here.",
            },
            {
              icon: Sparkles,
              title: "Publish from the web",
              description: "List homes, hostels, apartments, offices, and shops through a responsive web dashboard.",
            },
            {
              icon: BadgeCheck,
              title: "Real backend validation",
              description: "Your signup goes through the same backend DTO checks and auth flow as the mobile app.",
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
        <div>
          <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
            Account type
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {accountTypes.map((option) => {
              const active = form.role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, role: option.value }))}
                  className={`rounded-3xl border p-4 text-left transition ${
                    active
                      ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]/5 shadow-sm"
                      : "border-[var(--admin-border)] bg-white hover:border-[var(--admin-primary)]/40"
                  }`}
                >
                  <p className="text-sm font-bold text-[var(--admin-text)]">
                    {option.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--admin-muted)]">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { key: "name", label: "Full name", autoComplete: "name" },
            { key: "email", label: "Email", autoComplete: "email" },
            { key: "phone", label: "Phone", autoComplete: "tel" },
            { key: "cnic", label: "CNIC", autoComplete: "off" },
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
                {field.label}
              </span>
              <input
                value={form[field.key as keyof typeof form] as string}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                autoComplete={field.autoComplete}
                required
              />
            </label>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
            Password
          </span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                acceptedTerms: event.target.checked,
              }))
            }
            className="mt-1 h-4 w-4 rounded border-[var(--admin-border)]"
            required
          />
          <span>I accept the marketplace terms and conditions.</span>
        </label>

        <button
          type="submit"
          disabled={submitting || !form.acceptedTerms}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--admin-muted)]">
        Already have an account?{" "}
        <Link
          href="/account/login"
          className="font-semibold text-[var(--admin-primary)] hover:underline"
        >
          Log in
        </Link>
      </p>
    </PublicAuthCard>
  );
}
