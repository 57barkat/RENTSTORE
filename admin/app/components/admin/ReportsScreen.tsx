"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";

import {
  ReportsService,
  type ReportQueueStatus,
} from "@/app/services/reports.service";

interface UserSummary {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  accountStatus?: string;
  isBlocked?: boolean;
}

interface PropertySummary {
  _id?: string;
  title?: string;
  ownerId?: string | UserSummary;
  status?: boolean;
  isVisible?: boolean;
  moderationStatus?: string;
}

export interface Report {
  _id: string;
  id?: string;
  propertyId?: string | PropertySummary | null;
  listingId?: string;
  reportReason: string;
  reason?: string;
  details?: string;
  description?: string;
  reporterUserId?: string | UserSummary | null;
  reporterId?: string | UserSummary | null;
  listingOwnerId?: string | UserSummary | null;
  status: ReportQueueStatus;
  adminNotes?: string;
  actionTaken?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedByAdminId?: string | UserSummary | null;
}

export interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_FILTERS: Array<{
  label: string;
  value: ReportQueueStatus;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "Pending", value: "pending", icon: AlertTriangle },
  { label: "Reviewed", value: "reviewed", icon: CheckCircle2 },
  { label: "Dismissed", value: "dismissed", icon: XCircle },
  { label: "Removed", value: "removed", icon: Trash2 },
];

const REASON_LABELS: Record<string, string> = {
  fake_property: "Fake property",
  wrong_price: "Wrong price",
  wrong_location: "Wrong location",
  already_rented_unavailable: "Already rented / unavailable",
  duplicate_listing: "Duplicate listing",
  misleading_photos: "Misleading photos",
  suspicious_owner_agent: "Suspicious owner/agent",
  offensive_or_illegal_content: "Offensive or illegal content",
  other: "Other",
};

const STATUS_STYLES: Record<ReportQueueStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  reviewed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  dismissed: "border-slate-200 bg-slate-100 text-slate-600",
  removed: "border-red-200 bg-red-50 text-red-700",
};

const getEntityId = (
  value?: string | UserSummary | PropertySummary | null,
): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || "";
};

const getProperty = (report: Report): PropertySummary | null =>
  report.propertyId &&
  typeof report.propertyId === "object" &&
  "_id" in report.propertyId
    ? report.propertyId
    : null;

const getUserLabel = (value?: string | UserSummary | null) => {
  if (!value) {
    return "Unknown";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.email || value.name || value._id || "Unknown";
};

const getUserId = (value?: string | UserSummary | null) =>
  typeof value === "string" ? value : value?._id || "";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeReasonLabel = (value: string) =>
  REASON_LABELS[value] ||
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ReportsScreen({
  initialReports,
  initialStatus = "pending",
}: {
  initialReports: Report[];
  initialStatus?: ReportQueueStatus;
}) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [activeStatus, setActiveStatus] =
    useState<ReportQueueStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialReports.map((report) => [
        report._id,
        report.adminNotes || "",
      ]),
    ),
  );

  const statusCounts = useMemo(() => {
    return STATUS_FILTERS.reduce(
      (counts, item) => ({
        ...counts,
        [item.value]: reports.filter((report) => report.status === item.value)
          .length,
      }),
      {} as Record<ReportQueueStatus, number>,
    );
  }, [reports]);

  const fetchReports = async (status: ReportQueueStatus = activeStatus) => {
    setLoading(true);
    try {
      const response = await ReportsService.getAll(status);
      const nextReports = response.data.data as Report[];
      setReports(nextReports);
      setNotes(
        Object.fromEntries(
          nextReports.map((report) => [
            report._id,
            report.adminNotes || "",
          ]),
        ),
      );
    } catch {
      toast.error("Failed to load reported listings");
    } finally {
      setLoading(false);
    }
  };

  const switchStatus = (status: ReportQueueStatus) => {
    setActiveStatus(status);
    void fetchReports(status);
  };

  const runReportAction = async (
    reportId: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    setPendingAction(reportId);
    try {
      await action();
      toast.success(successMessage);
      await fetchReports(activeStatus);
    } catch {
      toast.error("Action failed");
    } finally {
      setPendingAction(null);
    }
  };

  const displayedReports = reports.filter(
    (report) => report.status === activeStatus,
  );

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <Toaster position="top-right" />

      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Reported Listings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--admin-muted)]">
            Review listing reports, add notes, and take safe moderation actions
            using live report data from the backend.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchReports(activeStatus)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATUS_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const active = activeStatus === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => switchStatus(filter.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                  : "border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-2xl font-black">
                  {statusCounts[filter.value] || 0}
                </span>
              </div>
              <p className="mt-3 text-sm font-black">{filter.label}</p>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-10 text-center text-sm font-medium text-[var(--admin-muted)]">
          Loading reported listings...
        </div>
      ) : displayedReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card)] p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-[var(--admin-muted)]" />
          <h2 className="mt-4 text-lg font-black text-[var(--admin-text)]">
            No {activeStatus} reports
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--admin-muted)]">
            Reported listings will appear here when users submit concerns from
            real public property pages.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {displayedReports.map((report) => {
            const property = getProperty(report);
            const propertyId =
              getEntityId(report.propertyId) || report.listingId || "";
            const reporter = report.reporterUserId || report.reporterId;
            const owner = report.listingOwnerId || property?.ownerId || null;
            const ownerId = getUserId(owner);
            const reportNotes = notes[report._id] ?? "";
            const isBusy = pendingAction === report._id;

            return (
              <article
                key={report._id}
                className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${STATUS_STYLES[report.status]}`}
                      >
                        {report.status}
                      </span>
                      <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-1 text-xs font-bold text-[var(--admin-muted)]">
                        {normalizeReasonLabel(report.reportReason)}
                      </span>
                    </div>

                    <h2 className="mt-3 line-clamp-2 text-xl font-black text-[var(--admin-text)]">
                      {property?.title || propertyId || "Listing unavailable"}
                    </h2>

                    <p className="mt-2 text-xs font-semibold text-[var(--admin-muted)]">
                      Reported {formatDateTime(report.createdAt)}
                    </p>
                  </div>

                  {propertyId ? (
                    <Link
                      href={`/property/${propertyId}`}
                      target="_blank"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-white px-3 py-2 text-xs font-black text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
                    >
                      Listing
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                  <InfoBlock label="Report ID" value={report._id} />
                  <InfoBlock label="Listing ID" value={propertyId || "Unknown"} />
                  <InfoBlock label="Reporter" value={getUserLabel(reporter)} />
                  <InfoBlock label="Reporter user ID" value={getUserId(reporter) || "Unknown"} />
                  <InfoBlock label="Owner" value={getUserLabel(owner)} />
                  <InfoBlock label="Listing owner ID" value={ownerId || "Unknown"} />
                  <InfoBlock
                    label="Listing status"
                    value={[
                      property?.moderationStatus,
                      property?.isVisible === false ? "hidden" : "",
                      property?.status === false ? "inactive" : "",
                    ]
                      .filter(Boolean)
                      .join(" / ") || "Unknown"}
                  />
                  <InfoBlock
                    label="Action taken"
                    value={report.actionTaken || "None yet"}
                  />
                </div>

                {report.details ? (
                  <div className="mt-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-background)] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[var(--admin-muted)]">
                      Details
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--admin-text)]">
                      {report.details}
                    </p>
                  </div>
                ) : null}

                <label className="mt-4 block">
                  <span className="text-xs font-black uppercase tracking-wide text-[var(--admin-muted)]">
                    Admin notes
                  </span>
                  <textarea
                    value={reportNotes}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [report._id]: event.target.value,
                      }))
                    }
                    className="mt-2 min-h-24 w-full rounded-xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition focus:border-[var(--admin-primary)]"
                    placeholder="Add review notes or moderation context."
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton
                    disabled={isBusy}
                    icon={<FileText className="h-4 w-4" />}
                    label="Save notes"
                    onClick={() =>
                      void runReportAction(
                        report._id,
                        () =>
                          ReportsService.update(report._id, {
                            adminNotes: reportNotes,
                          }),
                        "Notes saved",
                      )
                    }
                  />
                  <ActionButton
                    disabled={isBusy}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Mark reviewed"
                    onClick={() =>
                      void runReportAction(
                        report._id,
                        () =>
                          ReportsService.update(report._id, {
                            status: "reviewed",
                            adminNotes: reportNotes,
                            actionTaken: "reviewed",
                          }),
                        "Report marked reviewed",
                      )
                    }
                  />
                  <ActionButton
                    disabled={isBusy}
                    icon={<XCircle className="h-4 w-4" />}
                    label="Dismiss"
                    variant="muted"
                    onClick={() =>
                      void runReportAction(
                        report._id,
                        () =>
                          ReportsService.update(report._id, {
                            status: "dismissed",
                            adminNotes: reportNotes,
                            actionTaken: "dismissed",
                          }),
                        "Report dismissed",
                      )
                    }
                  />
                  <ActionButton
                    disabled={isBusy || !propertyId}
                    icon={<Trash2 className="h-4 w-4" />}
                    label="Hide listing"
                    variant="danger"
                    onClick={() =>
                      void runReportAction(
                        report._id,
                        () =>
                          ReportsService.removeListing(report._id, {
                            adminNotes: reportNotes,
                          }),
                        "Listing hidden",
                      )
                    }
                  />
                  <ActionButton
                    disabled={isBusy || !ownerId}
                    icon={<UserX className="h-4 w-4" />}
                    label="Suspend owner"
                    variant="warning"
                    onClick={() =>
                      void runReportAction(
                        report._id,
                        () =>
                          ReportsService.suspendOwner(report._id, {
                            adminNotes: reportNotes,
                          }),
                        "Owner suspended",
                      )
                    }
                  />
                </div>

                {isBusy ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--admin-muted)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating report...
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-[var(--admin-muted)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--admin-text)]">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  disabled,
  icon,
  label,
  onClick,
  variant = "primary",
}: {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "muted" | "danger" | "warning";
}) {
  const className =
    variant === "danger"
      ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
      : variant === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300"
        : variant === "muted"
          ? "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          : "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:opacity-90";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
