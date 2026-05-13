import apiClient from "@/app/lib/api-client";

export type ReportQueueStatus = "pending" | "reviewed" | "dismissed" | "removed";

export interface ReportUpdatePayload {
  status?: ReportQueueStatus;
  adminNotes?: string;
  actionTaken?: string;
}

export const ReportsService = {
  getAll: (status?: ReportQueueStatus) =>
    apiClient.get("/reports", {
      params: status ? { status } : undefined,
    }),
  update: (id: string, payload: ReportUpdatePayload) =>
    apiClient.patch(`/reports/${id}`, payload),
  updateStatus: (id: string, status: ReportQueueStatus) =>
    apiClient.patch(`/reports/${id}/status`, { status }),
  removeListing: (id: string, payload: ReportUpdatePayload = {}) =>
    apiClient.patch(`/reports/${id}/remove-listing`, payload),
  suspendOwner: (id: string, payload: ReportUpdatePayload = {}) =>
    apiClient.patch(`/reports/${id}/suspend-owner`, payload),
  approveProperty: (id: string) =>
    apiClient.patch(`/reports/property/${id}/approve`),
  deleteProperty: (id: string) =>
    apiClient.patch(`/reports/property/${id}/delete`),
  reactivateUser: (id: string) =>
    apiClient.patch(`/reports/user/${id}/reactivate`),
};
