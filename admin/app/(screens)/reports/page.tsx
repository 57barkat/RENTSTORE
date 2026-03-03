"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ReportsService } from "@/app/services/reports.service";
import { toast, Toaster } from "react-hot-toast";
import {
  CheckCircle,
  Trash2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

// --- Types ---
interface Property {
  _id: string;
  title: string;
  ownerId: string;
}

interface Reporter {
  email: string;
}

interface Report {
  _id: string;
  propertyId: Property;
  reporterId: Reporter;
  reason: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchReports();
  }, []);

  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === "PENDING"),
    [reports],
  );
  const resolvedReports = useMemo(
    () => reports.filter((r) => r.status !== "PENDING"),
    [reports],
  );
  const displayedReports =
    activeTab === "PENDING" ? pendingReports : resolvedReports;

  const toggleSelect = (id: string) => {
    const copy = new Set(selected);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelected(copy);
  };

  const handleBulkAction = async (action: "approve" | "delete" | "reject") => {
    if (!selected.size) return toast.error("Select at least one report");
    try {
      await Promise.all(
        Array.from(selected).map((id) => {
          const report = reports.find((r) => r._id === id);
          if (!report) return Promise.resolve();
          if (action === "approve")
            return ReportsService.approveProperty(report.propertyId._id);
          if (action === "delete")
            return ReportsService.deleteProperty(report.propertyId._id);
          if (action === "reject")
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

  // eslint-disable-next-line
  const handleAction = async (promise: Promise<any>, msg: string) => {
    try {
      await promise;
      toast.success(msg);
      fetchReports();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-gray-700">
        Loading Moderation Queue...
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Moderation Center
          </h1>
          <p className="text-gray-500 text-sm">
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

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["PENDING", "RESOLVED"].map((tab) => (
          <button
            key={tab}
            // eslint-disable-next-line
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card-bg)] border border-[var(--border)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {activeTab === "PENDING" && selected.size > 0 && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleBulkAction("approve")}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction("delete")}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Delete Selected
          </button>
          <button
            onClick={() => handleBulkAction("reject")}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm"
          >
            Reject Selected
          </button>
        </div>
      )}

      {/* Kanban / Card List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedReports.map((report) => (
          <div
            key={report._id}
            className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm relative"
          >
            {activeTab === "PENDING" && (
              <input
                type="checkbox"
                checked={selected.has(report._id)}
                onChange={() => toggleSelect(report._id)}
                className="absolute top-3 right-3 w-4 h-4"
              />
            )}

            <h3 className="font-semibold text-[var(--foreground)] text-lg mb-1">
              {report.propertyId?.title || "Deleted Property"}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Reported by: {report.reporterId?.email || "Unknown"}
            </p>
            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md mb-3 inline-block">
              {report.reason}
            </span>

            <div className="mt-2 flex gap-2 flex-wrap">
              {activeTab === "PENDING" && (
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
              )}
              {activeTab !== "PENDING" && (
                <span className="text-sm text-gray-500 font-medium">
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

// --- Subcomponents ---
const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border)] shadow-sm flex items-center gap-3">
    <div className="p-2 bg-[var(--muted)] rounded-md">{icon}</div>
    <div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
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
  const bg =
    color === "green"
      ? "bg-green-600 hover:bg-green-700"
      : color === "red"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-gray-600 hover:bg-gray-700";

  return (
    <button
      onClick={onClick}
      className={`${bg} text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1`}
    >
      {icon} {label}
    </button>
  );
};
