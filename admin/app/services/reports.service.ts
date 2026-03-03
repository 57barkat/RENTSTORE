import apiClient from "@/app/lib/api-client";

export const ReportsService = {
  getAll: () => apiClient.get("/reports"),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/reports/${id}/status`, { status }),
  approveProperty: (id: string) =>
    apiClient.patch(`/reports/property/${id}/approve`),
  deleteProperty: (id: string) =>
    apiClient.patch(`/reports/property/${id}/delete`),
  reactivateUser: (id: string) =>
    apiClient.patch(`/reports/user/${id}/reactivate`),
};
