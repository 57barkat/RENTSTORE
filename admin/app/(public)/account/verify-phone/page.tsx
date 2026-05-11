import type { Metadata } from "next";

import PublicVerifyPhoneScreen from "@/app/components/public/PublicVerifyPhoneScreen";

export const metadata: Metadata = {
  title: "Verify Phone | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicVerifyPhonePage() {
  return <PublicVerifyPhoneScreen />;
}
