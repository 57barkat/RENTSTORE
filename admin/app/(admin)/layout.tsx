import AdminShell from "@/app/components/admin/AdminShell";
import { requireAdminSession } from "@/app/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return <AdminShell>{children}</AdminShell>;
}
