import type { Metadata } from "next";

import PublicHeader from "@/app/components/public/PublicHeader";

export const metadata: Metadata = {
  title: {
    default: "Find verified rentals in Pakistan | AnganStay",
    template: "%s",
  },
  description:
    "Browse verified houses, apartments, hostels, shops, and offices with real-time availability, location details, and pricing on AnganStay.",
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
  return (
    <div className="min-h-screen bg-[var(--admin-background)] text-[var(--admin-text)]">
      <PublicHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-full flex-1 flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
