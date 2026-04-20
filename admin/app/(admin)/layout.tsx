import type { Metadata } from "next";

import AdminShell from "@/app/components/admin/AdminShell";
import AuthHydrator from "@/app/components/AuthHydrator";
import { requireAdminSession } from "@/app/lib/admin-auth";

export const metadata: Metadata = {
  title: "AnganStay Admin",
  description: "Protected administration routes for AnganStay operations.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <AuthHydrator>
      <AdminShell>{children}</AdminShell>
    </AuthHydrator>
  );
}
