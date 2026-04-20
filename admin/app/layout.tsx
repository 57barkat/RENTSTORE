import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import StoreProvider from "./store/StoreProvider";
import { SITE_ORIGIN } from "./lib/site-config";

export const metadata: Metadata = {
  metadataBase: SITE_ORIGIN,
  applicationName: "AnganStay",
  title: {
    default: "AnganStay",
    template: "%s",
  },
  description:
    "AnganStay helps people discover verified rental properties and gives administrators a secure workflow for managing listings, users, and reports.",
  openGraph: {
    siteName: "AnganStay",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="admin-theme" suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
