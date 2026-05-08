import type { Metadata } from "next";

import PublicSupportScreen from "@/app/components/public/PublicSupportScreen";

export const metadata: Metadata = {
  title: "Support | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicSupportPage() {
  return <PublicSupportScreen />;
}
