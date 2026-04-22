import ReportsScreen, {
  type ReportsResponse,
} from "@/app/components/admin/ReportsScreen";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { serverApiRequest } from "@/app/lib/server-api";

export default async function ReportsPage() {
  const session = await requireAdminSession();
  const reports = await serverApiRequest<ReportsResponse>("/reports", {
    token: session.token,
  });

  return <ReportsScreen initialReports={reports.data} />;
}
