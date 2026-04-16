import DashboardScreen, {
  type DashboardData,
} from "@/app/components/admin/DashboardScreen";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { serverApiRequest } from "@/app/lib/server-api";

export default async function DashboardPage() {
  const session = await requireAdminSession();
  const data = await serverApiRequest<DashboardData>("/admin/stats", {
    token: session.token,
  });

  return <DashboardScreen initialData={data} />;
}
