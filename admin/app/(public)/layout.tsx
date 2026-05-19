// layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import PublicAuthProvider from "@/app/components/public/PublicAuthProvider";
import PublicFavoritesProvider from "@/app/components/public/PublicFavoritesProvider";
import PublicFooter from "@/app/components/public/PublicFooter";
import PublicHeader from "@/app/components/public/PublicHeader";
import { PublicScrollHeaderProvider } from "@/app/components/public/PublicScrollHeaderContext";
import ReportedPropertiesProvider from "@/app/components/public/ReportedPropertiesProvider";
import { getPublicStructuredData, serializeJsonLd } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Find verified rentals in Islamabad  | AnganStay",
    template: "%s",
  },

  description:
    "Browse verified houses, apartments, hostels, shops, and offices in Islamabad  with location details and pricing on AnganStay.",

  openGraph: {
    title: "Find verified rentals in Islamabad  | AnganStay",
    description:
      "Browse verified houses, apartments, hostels, shops, and offices in Islamabad  with location details and pricing on AnganStay.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Find verified rentals in Islamabad  | AnganStay",
    description:
      "Browse verified houses, apartments, hostels, shops, and offices in Islamabad  with location details and pricing on AnganStay.",
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
    <div
      className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-background)_18%,_var(--admin-background)_100%)] text-[var(--admin-text)]"
      style={
        {
          "--public-header-height": "74px",
        } as React.CSSProperties
      }
    >
      <Script
        id="public-organization-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(structuredData.organization)}
      </Script>

      <Script
        id="public-website-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(structuredData.website)}
      </Script>

      <PublicAuthProvider>
        <ReportedPropertiesProvider>
          <PublicFavoritesProvider>
            <PublicScrollHeaderProvider>
              <Toaster position="top-right" />

              <PublicHeader />

              <main className="flex flex-1 flex-col">
                <div className="flex min-h-[calc(100vh-180px)] flex-1 flex-col">
                  {children}
                </div>
              </main>

              <PublicFooter />
            </PublicScrollHeaderProvider>
          </PublicFavoritesProvider>
        </ReportedPropertiesProvider>
      </PublicAuthProvider>
    </div>
  );
}
