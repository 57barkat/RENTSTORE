import type { Metadata } from "next";

import PublicProfileScreen from "@/app/components/public/PublicProfileScreen";

export const metadata: Metadata = {
  title: "Profile | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicProfilePage() {
  return <PublicProfileScreen />;
}
