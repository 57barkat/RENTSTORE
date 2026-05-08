import type { Metadata } from "next";

import PublicFavoritesScreen from "@/app/components/public/PublicFavoritesScreen";

export const metadata: Metadata = {
  title: "Favorites | AnganStay",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicFavoritesPage() {
  return <PublicFavoritesScreen />;
}
