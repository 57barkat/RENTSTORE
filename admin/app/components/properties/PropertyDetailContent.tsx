/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Script from "next/script";
import {
  ArrowUpRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  SquareDashedBottom,
  Wallet,
} from "lucide-react";

import PropertyCard from "@/app/components/properties/PropertyCard";
import PropertyGallery from "@/app/components/properties/PropertyGallery";
import { PropertyService } from "@/app/lib/PropertyService";
import type {
  PropertyCategory,
  PublicProperty,
} from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyMetadataDescription,
  formatCurrency,
  getCanonicalCategorySegment,
  getCategoryLabel,
  getPropertyAddresses,
  getPropertyCity,
  getPropertyContactPhone,
  getPropertyDescriptionText,
  getPropertyHighlights,
  getPropertyLocation,
  getPropertyPriceDisplay,
  getPropertyPriceInfo,
  getPropertyPricingOptions,
  getPropertyTitle,
  hasAllBillsIncluded,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface PropertyDetailContentProps {
  category: PropertyCategory;
  property: PublicProperty;
  canonicalHref: string;
}

const renderAddress = (property: PublicProperty) => {
  const address = getPropertyAddresses(property)[0];

  return [
    address?.aptSuiteUnit,
    address?.street,
    address?.city,
    address?.stateTerritory,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const formatFloorLevel = (floorLevel: unknown) => {
  if (floorLevel === undefined || floorLevel === null || floorLevel === "") {
    return "Not specified";
  }

  const numericFloor = Number(floorLevel);

  if (!Number.isNaN(numericFloor)) {
    if (numericFloor === 0) {
      return "Ground floor";
    }

    return `Floor ${numericFloor}`;
  }

  return String(floorLevel);
};

const getFactRows = (property: PublicProperty, category: PropertyCategory) =>
  [
    {
      label: "Property Type",
      value: getCategoryLabel(category),
    },
    {
      label: "City",
      value: getPropertyCity(property),
    },
    {
      label: "Area",
      value: getPropertyLocation(property),
    },
    {
      label: "Security Deposit",
      value:
        property.SecuritybasePrice && property.SecuritybasePrice > 0
          ? formatCurrency(property.SecuritybasePrice)
          : "Ask for details",
    },
    {
      label: "Apartment Type",
      value: property.apartmentType || "",
    },
    {
      label: "Furnishing",
      value: property.furnishing || "",
    },
    {
      label: "Parking",
      value: property.parking ? "Available" : "",
    },
    {
      label: "Bills",
      value: hasAllBillsIncluded(property)
        ? property.ALL_BILLS?.join(", ")
        : "",
    },
    {
      label: "Hostel Type",
      value: property.hostelType || "",
    },
  ].filter((item) => item.value);

const getAmenityItems = (property: PublicProperty) =>
  (property.amenities || []).filter(Boolean);

const getTrustItems = (property: PublicProperty) => {
  const items: string[] = [];

  if (property.isApproved) {
    items.push("Verified listing");
  }

  if (property.safetyDetailsData?.safetyDetails?.length) {
    items.push(...property.safetyDetailsData.safetyDetails);
  }

  if (property.moderationStatus) {
    items.push(property.moderationStatus);
  }

  return Array.from(new Set(items.filter(Boolean)));
};

export default async function PropertyDetailContent({
  category,
  property,
  canonicalHref,
}: PropertyDetailContentProps) {
  const galleryImages =
    property.photos && property.photos.length > 0
      ? property.photos
      : [DEFAULT_PROPERTY_IMAGE];

  let relatedProperties: PublicProperty[] = [];

  try {
    relatedProperties = await PropertyService.getRelatedProperties(property);
  } catch {
    relatedProperties = [];
  }

  const title = getPropertyTitle(property);
  const overviewText = getPropertyDescriptionText(property, 520);
  const addressLine = renderAddress(property);
  const highlights = getPropertyHighlights(property);
  const contactPhone = getPropertyContactPhone(property);
  const uploaderProfile =
    await PropertyService.getPropertyUploaderProfileByProperty(property._id);
  const priceInfo = getPropertyPriceInfo(property);
  const pricingOptions = getPropertyPricingOptions(property);
  const trustItems = getTrustItems(property);
  const amenityItems = getAmenityItems(property);
  const host = uploaderProfile?.uploader || property.owner;
  const city = getPropertyCity(property);
  const area = getPropertyLocation(property);
  const categoryLabel = getCategoryLabel(category);
  const categoryPlural = getCategoryLabel(category, true);
  const primaryAddress = addressLine || [area, city].filter(Boolean).join(", ");
  const mapQuery = encodeURIComponent(primaryAddress || title);
  const listingFacts = getFactRows(property, category);
  const securityDeposit =
    property.SecuritybasePrice && property.SecuritybasePrice > 0
      ? formatCurrency(property.SecuritybasePrice)
      : "Ask for details";

  const cameraDescription =
    property.safetyDetailsData?.cameraDescription &&
    !["yes", "true", "active"].includes(
      String(property.safetyDetailsData.cameraDescription).toLowerCase(),
    )
      ? property.safetyDetailsData.cameraDescription
      : "";

  const stats = [
    {
      label: "Bedrooms",
      value:
        property.capacityState?.bedrooms ||
        property.capacityState?.beds ||
        "Not specified",
      icon: BedDouble,
    },
    {
      label: "Bathrooms",
      value: property.capacityState?.bathrooms || "Not specified",
      icon: Bath,
    },
    {
      label: "Floor Level",
      value: formatFloorLevel(property.capacityState?.floorLevel),
      icon: Building2,
    },
    {
      label: property.size?.unit || "Area Size",
      value: property.size?.value
        ? String(property.size.value)
        : "Not specified",
      icon: SquareDashedBottom,
    },
  ];

  const schemaOffers = pricingOptions.map((option) => ({
    "@type": "Offer",
    price: option.amount,
    priceCurrency: "PKR",
    availability: "https://schema.org/InStock",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: option.amount,
      priceCurrency: "PKR",
      unitText: option.schemaUnitText,
      unitCode: option.schemaUnitCode,
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description: buildPropertyMetadataDescription(category, property),
    url: toAbsoluteUrl(canonicalHref),
    image: galleryImages.map((image) => toAbsoluteUrl(image)),
    datePosted: property.createdAt,
    ...(schemaOffers.length > 0 ? { offers: schemaOffers } : {}),
    itemOffered: {
      "@type": "Residence",
      name: title,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        streetAddress: getPropertyAddresses(property)[0]?.street,
        addressRegion: getPropertyAddresses(property)[0]?.stateTerritory,
        postalCode: getPropertyAddresses(property)[0]?.zipCode,
        addressCountry: getPropertyAddresses(property)[0]?.country,
      },
      numberOfRooms:
        property.capacityState?.bedrooms || property.capacityState?.beds,
    },
  };

  const serializedJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <Script
        id={`property-jsonld-${property._id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializedJsonLd}
      </Script>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--admin-muted)] sm:text-sm">
          <Link
            href="/"
            className="text-[var(--admin-primary)] transition hover:text-[var(--admin-text)]"
          >
            All Properties
          </Link>
          <span>/</span>
          <Link
            href={`/${getCanonicalCategorySegment(category)}`}
            className="text-[var(--admin-primary)] transition hover:text-[var(--admin-text)]"
          >
            {categoryPlural}
          </Link>
          {city && (
            <>
              <span>/</span>
              <span>{city}</span>
            </>
          )}
          {area && (
            <>
              <span>/</span>
              <span className="line-clamp-1">{area}</span>
            </>
          )}
        </div>

        <div className="mb-6 max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--admin-primary)] shadow-sm">
              <MapPin size={13} />
              {[categoryLabel, city, area].filter(Boolean).join(" · ")}
            </span>

            {property.featured && (
              <span className="inline-flex rounded-full bg-[var(--admin-accent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                Featured
              </span>
            )}

            {property.isApproved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--admin-secondary-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--admin-secondary)]">
                <BadgeCheck size={14} />
                Verified
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="max-w-5xl text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            {primaryAddress && (
              <p className="flex max-w-4xl items-start gap-2 text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
                <MapPin
                  size={17}
                  className="mt-1 shrink-0 text-[var(--admin-primary)]"
                />
                <span>{primaryAddress}</span>
              </p>
            )}
          </div>
        </div>

        <PropertyGallery galleryImages={galleryImages} title={title} />

        <section className="mt-6 rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_18px_40px_-34px_var(--admin-shadow)] sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-4 py-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                    <Icon size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-base font-black text-[var(--admin-text)]">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {amenityItems.length > 0 && (
              <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_40px_-34px_var(--admin-shadow)] sm:p-6">
                <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
                      Boutique Amenities
                    </h2>
                    <p className="text-sm text-[var(--admin-muted)]">
                      Available features from this listing.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {amenityItems.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-xl border border-[var(--admin-border)] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[var(--admin-text)]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {highlights.length > 0 && (
              <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_40px_-34px_var(--admin-shadow)] sm:p-6">
                <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--admin-accent-soft)] text-[var(--admin-warning)]">
                    <CheckCircle2 size={19} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
                      Key Highlights
                    </h2>
                    <p className="text-sm text-[var(--admin-muted)]">
                      Quick reasons this listing stands out.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-xl border border-[rgba(245,159,11,0.28)] bg-[rgba(245,159,11,0.08)] px-3.5 py-2 text-sm font-semibold text-[var(--admin-warning)]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {primaryAddress && (
              <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_40px_-34px_var(--admin-shadow)] sm:p-6">
                <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--admin-secondary-soft)] text-[var(--admin-secondary)]">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
                      Where You&apos;ll Be
                    </h2>
                    <p className="text-sm text-[var(--admin-muted)]">
                      Location details from the property listing.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[var(--admin-border)] bg-[#f8fafc] p-5">
                  <p className="break-words text-lg font-black text-[var(--admin-text)]">
                    {primaryAddress}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--admin-muted)]">
                    Open the location in maps for route, nearby areas, and
                    neighborhood context.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Open in Maps
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_24px_48px_-34px_var(--admin-shadow)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                    {priceInfo.label}
                  </p>
                  <p className="mt-2 whitespace-nowrap text-2xl font-black tracking-tight text-[var(--admin-primary)] sm:text-3xl">
                    {getPropertyPriceDisplay(property)}
                  </p>
                </div>

                {property.isApproved && (
                  <span className="shrink-0 rounded-full bg-[var(--admin-secondary-soft)] px-3 py-1 text-xs font-bold text-[var(--admin-secondary)]">
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-4 text-sm font-black text-white transition hover:opacity-90"
                  >
                    <Phone size={18} />
                    Contact Host
                  </a>
                ) : (
                  <div className="rounded-xl border border-[var(--admin-border)] bg-[#f8fafc] px-5 py-4 text-center text-sm font-semibold text-[var(--admin-muted)]">
                    Contact details available on request
                  </div>
                )}

                <Link
                  href={`/uploader/${property._id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-white px-5 py-4 text-sm font-black text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                >
                  View Profile
                  <ArrowUpRight size={17} />
                </Link>
              </div>

              <dl className="mt-5 space-y-4 border-t border-[var(--admin-border)] pt-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[var(--admin-muted)]">
                    <Wallet size={16} />
                    Security Deposit
                  </dt>
                  <dd className="font-bold text-[var(--admin-text)]">
                    {securityDeposit}
                  </dd>
                </div>
                {area && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--admin-muted)]">Area</dt>
                    <dd className="text-right font-bold text-[var(--admin-text)]">
                      {area}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {host && (
              <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_40px_-34px_var(--admin-shadow)]">
                <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                  Property Manager
                </h2>

                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[var(--admin-border)] bg-[#f8fafc] p-4">
                  <img
                    src={host.profileImage || DEFAULT_PROPERTY_IMAGE}
                    alt={host.name || "Host"}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-[var(--admin-text)]">
                      {host.name || "Property host"}
                    </p>
                    <p className="truncate text-sm text-[var(--admin-muted)]">
                      {uploaderProfile?.uploader?.planLabel ||
                        "Listing manager"}
                    </p>
                    {contactPhone && (
                      <p className="mt-1 text-sm font-bold text-[var(--admin-primary)]">
                        {contactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {trustItems.length > 0 && (
              <section className="rounded-[1.5rem] border border-[rgba(5,150,105,0.18)] bg-[rgba(5,150,105,0.08)] p-5 shadow-[0_16px_30px_-28px_var(--admin-secondary)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--admin-secondary)]">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                      Verified Secure
                    </h2>
                    <p className="text-sm text-[var(--admin-muted)]">
                      Trust signals from listing data.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trustItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[var(--admin-secondary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {cameraDescription && (
                  <p className="mt-4 text-sm leading-7 text-[var(--admin-muted)]">
                    {cameraDescription}
                  </p>
                )}
              </section>
            )}

            <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_40px_-34px_var(--admin-shadow)]">
              <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                Listing Facts
              </h2>

              <dl className="mt-5 divide-y divide-[var(--admin-border)] text-sm">
                {listingFacts.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(120px,auto)] items-start gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <dt className="text-[var(--admin-muted)]">{item.label}</dt>
                    <dd className="min-w-0 break-words text-right font-bold text-[var(--admin-text)]">
                      {item.value}
                    </dd>
                  </div>
                ))}

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,auto)] items-start gap-4 py-3 last:pb-0">
                  <dt className="text-[var(--admin-muted)]">Views</dt>
                  <dd className="text-right font-bold text-[var(--admin-text)]">
                    {property.views || 0}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        {relatedProperties.length > 0 && (
          <section className="mt-16 border-t border-[var(--admin-border)] pt-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-primary)]">
                  Related Listings
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--admin-text)]">
                  Similar Premium Listings
                </h2>
                <p className="mt-2 text-sm text-[var(--admin-muted)]">
                  Explore more {categoryPlural.toLowerCase()} in {city}.
                </p>
              </div>

              <Link
                href={`/${getCanonicalCategorySegment(category)}`}
                className="inline-flex items-center gap-2 text-sm font-black text-[var(--admin-primary)] transition hover:text-[var(--admin-text)]"
              >
                View All
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {relatedProperties.map((listing) => (
                <PropertyCard key={listing._id} property={listing} />
              ))}
            </div>
          </section>
        )}
      </section>

      {contactPhone && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--admin-border)] bg-white/95 p-3 shadow-[0_-18px_40px_-30px_var(--admin-shadow)] backdrop-blur lg:hidden">
          <a
            href={`tel:${contactPhone}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-4 text-sm font-black text-white"
          >
            <Phone size={18} />
            Contact Host
          </a>
        </div>
      )}
    </main>
  );
}
