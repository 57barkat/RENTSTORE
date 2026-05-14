"use client";

import axios from "axios";
import { Flag, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import { useReportedProperties } from "@/app/components/public/ReportedPropertiesProvider";
import publicApiClient from "@/app/lib/public-api-client";

type ReportReasonValue =
  | "fake_property"
  | "wrong_price"
  | "wrong_location"
  | "already_rented_unavailable"
  | "duplicate_listing"
  | "misleading_photos"
  | "suspicious_owner_agent"
  | "offensive_or_illegal_content"
  | "other";

interface ReportReasonOption {
  label: string;
  value: ReportReasonValue;
}

interface ReportListingButtonProps {
  propertyId: string;
  listingTitle: string;
  variant?: "icon" | "inline";
}

type ErrorPayload = {
  message?: string | string[];
};

type ReportResponse = {
  reportId?: string;
  propertyId?: string;
  undoExpiresAt?: string;
  undoWindowSeconds?: number;
};

const REPORT_REASONS: ReportReasonOption[] = [
  { label: "Fake property", value: "fake_property" },
  { label: "Wrong price", value: "wrong_price" },
  { label: "Wrong location", value: "wrong_location" },
  {
    label: "Already rented / unavailable",
    value: "already_rented_unavailable",
  },
  { label: "Duplicate listing", value: "duplicate_listing" },
  { label: "Misleading photos", value: "misleading_photos" },
  { label: "Suspicious owner/agent", value: "suspicious_owner_agent" },
  {
    label: "Offensive or illegal content",
    value: "offensive_or_illegal_content",
  },
  { label: "Other", value: "other" },
];

const SUCCESS_MESSAGE =
  "Thanks. Our team will review this listing. If it violates AnganStay rules, we may remove it or contact the owner.";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;
    const message = payload?.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    if (message) {
      return message;
    }
  }

  return "We couldn't submit the report. Please try again.";
};

export default function ReportListingButton({
  propertyId,
  listingTitle,
  variant = "inline",
}: ReportListingButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = usePublicAuth();
  const { hideProperty, unhideProperty } = useReportedProperties();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReasonValue | "">(
    "",
  );
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const undoReport = async (reportId: string, toastId: string) => {
    try {
      await publicApiClient.delete(`/reports/${reportId}`);
      unhideProperty(propertyId);
      toast.dismiss(toastId);
      toast.success("Report undone. The listing is visible again.");
    } catch (undoError) {
      toast.error(getErrorMessage(undoError));
    }
  };

  const showUndoToast = (report: ReportResponse) => {
    const reportId = report.reportId ? String(report.reportId) : "";
    const undoWindowMs = Math.max(
      10_000,
      (report.undoWindowSeconds || 30) * 1000,
    );

    if (!reportId) {
      toast.success("Report submitted. This listing is hidden for you.");
      return;
    }

    toast.custom(
      (toastInstance) => (
        <div className="w-[min(92vw,420px)] rounded-2xl border border-[var(--admin-border)] bg-white p-4 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
          <p className="text-sm font-black text-[var(--admin-text)]">
            Report submitted
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
            This listing is now hidden for you. You can undo this report for a
            short time.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void undoReport(reportId, toastInstance.id)}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[var(--admin-primary)] px-4 text-sm font-black text-white transition hover:opacity-95"
            >
              Undo Report
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(toastInstance.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-white px-4 text-sm font-black text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      { duration: undoWindowMs },
    );
  };

  const openReportFlow = () => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const redirectPath =
        typeof window === "undefined"
          ? "/"
          : `${window.location.pathname}${window.location.search}`;

      router.push(`/account/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    setOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setOpen(false);
    setError("");
    setSuccessMessage("");
  };

  const submitReport = async () => {
    if (!propertyId) {
      setError("Listing/property ID is required.");
      return;
    }

    if (!selectedReason) {
      setError("Please choose a reason.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await publicApiClient.post<ReportResponse>("/reports", {
        propertyId,
        reportReason: selectedReason,
        details: details.trim() || undefined,
      });
      hideProperty(propertyId);
      setOpen(false);
      setSelectedReason("");
      setDetails("");
      setSuccessMessage(SUCCESS_MESSAGE);
      showUndoToast(response.data);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openReportFlow}
        disabled={isLoading}
        title="Report Listing"
        aria-label={`Report listing ${listingTitle}`}
        className={
          variant === "icon"
            ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--admin-muted)] shadow-sm backdrop-blur transition hover:bg-white hover:text-[var(--admin-danger)] disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-danger)] hover:text-[var(--admin-danger)] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        <Flag className={variant === "icon" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {variant === "inline" ? "Report Listing" : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`report-listing-title-${propertyId}`}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/55 px-4 py-5 backdrop-blur-sm sm:items-center"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[1.5rem] bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h2
                  id={`report-listing-title-${propertyId}`}
                  className="text-xl font-black text-[var(--admin-text)]"
                >
                  Report this listing
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                  Help us keep AnganStay safe and reliable. Tell us what looks
                  wrong with this listing.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-background)] text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
                aria-label="Close report form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold leading-6 text-emerald-700">
                  {successMessage}
                </div>
              ) : (
                <>
                  <fieldset>
                    <legend className="text-sm font-black text-[var(--admin-text)]">
                      Reason
                    </legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {REPORT_REASONS.map((reason) => {
                        const active = selectedReason === reason.value;

                        return (
                          <label
                            key={reason.value}
                            className={`flex min-h-11 cursor-pointer items-center rounded-xl border px-3 text-sm font-semibold transition ${
                              active
                                ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                                : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`report-reason-${propertyId}`}
                              value={reason.value}
                              checked={active}
                              onChange={() => setSelectedReason(reason.value)}
                              className="sr-only"
                            />
                            {reason.label}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <label className="block">
                    <span className="text-sm font-black text-[var(--admin-text)]">
                      Optional details
                    </span>
                    <textarea
                      value={details}
                      onChange={(event) => setDetails(event.target.value)}
                      className="mt-3 min-h-28 w-full rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10"
                      maxLength={2000}
                      placeholder="Tell us what looks wrong."
                    />
                  </label>

                  {error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void submitReport()}
                    disabled={submitting}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Submit report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
