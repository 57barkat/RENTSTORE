import type { Metadata } from "next";
import { Suspense } from "react";

import PublicVerifyPhoneScreen from "@/app/components/public/PublicVerifyPhoneScreen";

export const metadata: Metadata = {
  title: "Verify Phone | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

function VerifyPhoneFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--admin-primary-soft)] border-t-[var(--admin-primary)]" />
    </div>
  );
}

export default function PublicVerifyPhonePage() {
  return (
    <Suspense fallback={<VerifyPhoneFallback />}>
      <PublicVerifyPhoneScreen />
    </Suspense>
  );
}
