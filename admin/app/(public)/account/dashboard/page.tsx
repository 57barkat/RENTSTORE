import type { Metadata } from "next";

import PublicDashboardScreen from "@/app/components/public/PublicDashboardScreen";

export const metadata: Metadata = {
  title: "My Dashboard | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicDashboardPage() {
  return <PublicDashboardScreen />;
}
