import type { Metadata } from "next";

import PublicLoginScreen from "@/app/components/public/PublicLoginScreen";

export const metadata: Metadata = {
  title: "Login | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicLoginPage() {
  return <PublicLoginScreen />;
}
