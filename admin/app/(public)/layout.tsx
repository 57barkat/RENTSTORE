// layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import PublicAuthProvider from "@/app/components/public/PublicAuthProvider";
import PublicFavoritesProvider from "@/app/components/public/PublicFavoritesProvider";
import PublicFooter from "@/app/components/public/PublicFooter";
import PublicHeader from "@/app/components/public/PublicHeader";
import { getPublicStructuredData, serializeJsonLd } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Find verified rentals in Pakistan | AnganStay",
    template: "%s",
  },

  description:
    "Browse verified houses, apartments, hostels, shops, and offices with real-time availability, location details, and pricing on AnganStay.",

  openGraph: {
    title: "Find verified rentals in Pakistan | AnganStay",
    description:
      "Browse verified houses, apartments, hostels, shops, and offices with real-time availability, location details, and pricing on AnganStay.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Find verified rentals in Pakistan | AnganStay",
    description:
      "Browse verified houses, apartments, hostels, shops, and offices with real-time availability, location details, and pricing on AnganStay.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = getPublicStructuredData();

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#ffffff_0%,_var(--admin-background)_18%,_var(--admin-background)_100%)] text-[var(--admin-text)]">
      {/* Organization Structured Data */}
      <Script
        id="public-organization-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(structuredData.organization)}
      </Script>

      {/* Website Structured Data */}
      <Script
        id="public-website-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(structuredData.website)}
      </Script>

      <PublicAuthProvider>
        <PublicFavoritesProvider>
          {/* Toast Notifications */}
          <Toaster position="top-right" />

          {/* Header */}
          <PublicHeader />

          {/* Main Content */}
          <main className="flex flex-1 flex-col">
            <div className="flex min-h-[calc(100vh-180px)] flex-1 flex-col">
              {children}
            </div>
          </main>

          {/* Footer */}
          <PublicFooter />
        </PublicFavoritesProvider>
      </PublicAuthProvider>
    </div>
  );
}
