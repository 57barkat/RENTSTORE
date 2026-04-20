import Link from "next/link";
import { notFound } from "next/navigation";

import PropertyCard from "@/app/components/properties/PropertyCard";
import { PropertyService } from "@/app/lib/PropertyService";
import { DEFAULT_PROPERTY_IMAGE } from "@/app/lib/property-utils";

interface UploaderPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function UploaderPage({ params }: UploaderPageProps) {
  const resolvedParams = await params;
  console.log("[Admin UploaderPage] Incoming params", resolvedParams);

  const profile = await PropertyService.getPropertyUploaderProfileByProperty(
    resolvedParams.propertyId,
  );

  console.log("[Admin UploaderPage] Loaded profile", {
    propertyId: resolvedParams.propertyId,
    hasUploader: Boolean(profile?.uploader),
    listingsCount: profile?.listings?.length ?? 0,
  });

  if (!profile?.uploader) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_var(--admin-surface)_0%,_var(--admin-card)_28%,_var(--admin-background)_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-[var(--admin-muted)]">
          <Link
            href={`/houses`}
            className="font-medium text-[var(--admin-primary)] hover:text-[var(--admin-text)]"
          >
            Back to listings
          </Link>
          <span>/</span>
          <span>Uploader profile</span>
        </div>

        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_92%,transparent)] p-6 shadow-[0_18px_40px_-28px_var(--admin-shadow)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={
                  profile.uploader.profileImage || DEFAULT_PROPERTY_IMAGE
                }
                alt={profile.uploader.name || "Uploader"}
                className="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  {profile.uploader.name}
                </h1>
                <p className="mt-2 text-sm font-medium text-[var(--admin-primary)]">
                  {profile.uploader.planLabel}
                </p>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  {profile.uploader.phone || "Phone not available"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
              <div className="rounded-[1.25rem] bg-[var(--admin-card)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  Total
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  {profile.stats.totalProperties}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-[var(--admin-card)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  Houses
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  {profile.stats.homes}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-[var(--admin-card)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  Shops
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  {profile.stats.shops}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--admin-primary)]">
              Uploader listings
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
              Published properties
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {profile.listings.map((listing) => (
              <PropertyCard key={listing._id} property={listing} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
