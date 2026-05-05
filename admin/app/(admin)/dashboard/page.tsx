import DashboardScreen, {
  type DashboardData,
} from "@/app/components/admin/DashboardScreen";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { serverApiRequest } from "@/app/lib/server-api";

type DashboardPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const normalizeDashboardRange = (
  value: string | string[] | undefined,
): 7 | 30 => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === "30" ? 30 : 7;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await requireAdminSession();
  const resolvedSearchParams = (await searchParams) || {};
  const selectedRange = normalizeDashboardRange(resolvedSearchParams.range);
  const data = await serverApiRequest<DashboardData>("/admin/stats", {
    token: session.token,
    searchParams: {
      range: selectedRange,
    },
  });

  return (
    <DashboardScreen initialData={data} selectedRange={selectedRange} />
  );
}
