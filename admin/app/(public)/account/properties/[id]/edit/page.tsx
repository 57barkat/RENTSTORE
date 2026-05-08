import type { Metadata } from "next";

import PublicEditPropertyScreen from "@/app/components/public/PublicEditPropertyScreen";

export const metadata: Metadata = {
  title: "Edit Property | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicEditPropertyPage() {
  return <PublicEditPropertyScreen />;
}
