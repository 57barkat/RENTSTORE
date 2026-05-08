import type { Metadata } from "next";

import PublicSignupScreen from "@/app/components/public/PublicSignupScreen";

export const metadata: Metadata = {
  title: "Create Account | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicSignupPage() {
  return <PublicSignupScreen />;
}
