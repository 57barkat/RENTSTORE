"use client";

import { useSearchParams } from "next/navigation";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import PublicPhoneVerificationPanel from "@/app/components/public/PublicPhoneVerificationPanel";

export default function PublicVerifyPhoneScreen() {
  const searchParams = useSearchParams();

  return (
    <PublicAccountShell
      title="Phone verification"
      description="Verify the phone number connected to your account before publishing property listings."
    >
      <PublicPhoneVerificationPanel redirectPath={searchParams.get("redirect")} />
    </PublicAccountShell>
  );
}
