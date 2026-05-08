"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import PublicPropertyForm, {
  buildFormFromProperty,
} from "@/app/components/public/PublicPropertyForm";
import type { DraftListing } from "@/app/lib/public-account-types";
import publicApiClient from "@/app/lib/public-api-client";
import type { PublicProperty } from "@/app/lib/property-types";

export default function PublicUploadPropertyScreen() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const [initialDraft, setInitialDraft] = useState<PublicProperty | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(!!draftId);

  useEffect(() => {
    if (!draftId) {
      setLoadingDraft(false);
      return;
    }

    const loadDraft = async () => {
      try {
        const response = await publicApiClient.get("/properties/drafts");
        const match = Array.isArray(response.data)
          ? response.data.find((draft: DraftListing) => draft._id === draftId)
          : null;
        setInitialDraft(match || null);
      } finally {
        setLoadingDraft(false);
      }
    };

    void loadDraft();
  }, [draftId]);

  return (
    <PublicAccountShell
      title={draftId ? "Continue draft" : "Upload property"}
      description="Create or continue a public listing using the same field structure the mobile app sends to the backend."
    >
      {loadingDraft ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-[var(--admin-border)] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
        </div>
      ) : (
        <PublicPropertyForm
          mode="create"
          draftId={draftId || undefined}
          initialForm={buildFormFromProperty(initialDraft || undefined)}
        />
      )}
    </PublicAccountShell>
  );
}
