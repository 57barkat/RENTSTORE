"use client";

import { useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  CheckCircle,
  Trash2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { ReportsService } from "@/app/services/reports.service";

interface Property {
  _id: string;
  title: string;
  ownerId: string;
}

interface Reporter {
  email: string;
}

export interface Report {
  _id: string;
  propertyId: Property;
  reporterId: Reporter;
  reason: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
}

export default function ReportsScreen({
  initialReports,
}: {
  initialReports: Report[];
}) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"PENDING" | "RESOLVED">("PENDING");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await ReportsService.getAll();
      setReports(res.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === "PENDING"),
    [reports],
  );
  const resolvedReports = useMemo(
    () => reports.filter((report) => report.status !== "PENDING"),
    [reports],
  );
  const displayedReports =
    activeTab === "PENDING" ? pendingReports : resolvedReports;

  const toggleSelect = (id: string) => {
    const nextSelected = new Set(selected);

    if (nextSelected.has(id)) {
      nextSelected.delete(id);
    } else {
      nextSelected.add(id);
    }

    setSelected(nextSelected);
  };

  const handleBulkAction = async (action: "approve" | "delete" | "reject") => {
    if (!selected.size) return toast.error("Select at least one report");

    try {
      await Promise.all(
        Array.from(selected).map((id) => {
          const report = reports.find((item) => item._id === id);
          if (!report) return Promise.resolve();
          if (action === "approve") {
            return ReportsService.approveProperty(report.propertyId._id);
          }
          if (action === "delete") {
            return ReportsService.deleteProperty(report.propertyId._id);
          }
          return ReportsService.updateStatus(report._id, "REJECTED");
        }),
      );
      toast.success("Action completed successfully");
      setSelected(new Set());
      fetchReports();
    } catch {
      toast.error("Failed to complete bulk action");
    }
  };

  const handleAction = async (promise: Promise<any>, message: string) => {
    try {
      await promise;
      toast.success(message);
      fetchReports();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-medium text-gray-700">
        Loading Moderation Queue...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <Toaster position="top-right" />

      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Moderation Center
          </h1>
          <p className="text-sm text-gray-500">
            Review and manage reported properties.
          </p>
        </div>

        <div className="flex gap-4">
          <StatCard
            icon={<AlertTriangle className="text-yellow-500" />}
            label="Pending"
            value={pendingReports.length}
          />
          <StatCard
            icon={<ShieldCheck className="text-green-500" />}
            label="Resolved"
            value={resolvedReports.length}
          />
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        {["PENDING", "RESOLVED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "PENDING" | "RESOLVED")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)] bg-[var(--card-bg)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "PENDING" && selected.size > 0 && (
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => handleBulkAction("approve")}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction("delete")}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
          >
            Delete Selected
          </button>
          <button
            onClick={() => handleBulkAction("reject")}
            className="rounded-lg bg-gray-600 px-3 py-2 text-sm text-white"
          >
            Reject Selected
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedReports.map((report) => (
          <div
            key={report._id}
            className="relative rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm"
          >
            {activeTab === "PENDING" && (
              <input
                type="checkbox"
                checked={selected.has(report._id)}
                onChange={() => toggleSelect(report._id)}
                className="absolute right-3 top-3 h-4 w-4"
              />
            )}

            <h3 className="mb-1 text-lg font-semibold text-[var(--foreground)]">
              {report.propertyId?.title || "Deleted Property"}
            </h3>
            <p className="mb-2 text-sm text-gray-500">
              Reported by: {report.reporterId?.email || "Unknown"}
            </p>
            <span className="mb-3 inline-block rounded-md bg-red-50 px-2 py-1 text-xs text-red-600">
              {report.reason}
            </span>

            <div className="mt-2 flex flex-wrap gap-2">
              {activeTab === "PENDING" ? (
                <>
                  <ActionButton
                    onClick={() =>
                      handleAction(
                        ReportsService.approveProperty(report.propertyId._id),
                        "Property approved",
                      )
                    }
                    color="green"
                    icon={<CheckCircle size={16} />}
                    label="Approve"
                  />
                  <ActionButton
                    onClick={() =>
                      handleAction(
                        ReportsService.deleteProperty(report.propertyId._id),
                        "Property deleted",
                      )
                    }
                    color="red"
                    icon={<Trash2 size={16} />}
                    label="Delete"
                  />
                  <ActionButton
                    onClick={() =>
                      handleAction(
                        ReportsService.updateStatus(report._id, "REJECTED"),
                        "Report rejected",
                      )
                    }
                    color="gray"
                    icon={<XCircle size={16} />}
                    label="Reject"
                  />
                </>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  Status: {report.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-sm">
    <div className="rounded-md bg-[var(--muted)] p-2">{icon}</div>
    <div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);

const ActionButton = ({
  onClick,
  label,
  color,
  icon,
}: {
  onClick: () => void;
  label: string;
  color: "green" | "red" | "gray";
  icon: React.ReactNode;
}) => {
  const backgroundClass =
    color === "green"
      ? "bg-green-600 hover:bg-green-700"
      : color === "red"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-gray-600 hover:bg-gray-700";

  return (
    <button
      onClick={onClick}
      className={`${backgroundClass} flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white`}
    >
      {icon} {label}
    </button>
  );
};
