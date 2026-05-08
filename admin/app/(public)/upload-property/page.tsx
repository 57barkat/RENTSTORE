import type { Metadata } from "next";

import PublicUploadPropertyScreen from "@/app/components/public/PublicUploadPropertyScreen";

export const metadata: Metadata = {
  title: "Upload Property | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicUploadPropertyPage() {
  return <PublicUploadPropertyScreen />;
}
