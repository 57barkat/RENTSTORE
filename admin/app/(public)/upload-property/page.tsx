import type { Metadata } from "next";
import { Suspense } from "react";

import PublicUploadPropertyScreen from "@/app/components/public/PublicUploadPropertyScreen";

export const metadata: Metadata = {
  title: "Upload Property | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

function UploadPropertyFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--admin-primary-soft)] border-t-[var(--admin-primary)]" />
    </div>
  );
}

export default function PublicUploadPropertyPage() {
  return (
    <Suspense fallback={<UploadPropertyFallback />}>
      <PublicUploadPropertyScreen />
    </Suspense>
  );
}
