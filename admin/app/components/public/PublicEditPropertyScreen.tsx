"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import PublicPropertyForm, {
  buildFormFromProperty,
} from "@/app/components/public/PublicPropertyForm";
import publicApiClient from "@/app/lib/public-api-client";
import type { PublicProperty } from "@/app/lib/property-types";

export default function PublicEditPropertyScreen() {
  const params = useParams<{ id: string }>();
  const propertyId = typeof params?.id === "string" ? params.id : "";
  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApiClient.get(`/properties/${propertyId}`);
        setProperty(response.data);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      void load();
    } else {
      setLoading(false);
    }
  }, [propertyId]);

  return (
    <PublicAccountShell
      title="Edit property"
      description="Update your own listing while leaving promotion and moderation fields under backend control."
    >
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-[var(--admin-border)] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
        </div>
      ) : (
        <PublicPropertyForm
          mode="edit"
          propertyId={propertyId}
          initialForm={buildFormFromProperty(property || undefined)}
        />
      )}
    </PublicAccountShell>
  );
}
