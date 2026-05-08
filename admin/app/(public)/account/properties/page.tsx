import type { Metadata } from "next";

import PublicMyPropertiesScreen from "@/app/components/public/PublicMyPropertiesScreen";

export const metadata: Metadata = {
  title: "My Properties | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicMyPropertiesPage() {
  return <PublicMyPropertiesScreen />;
}
