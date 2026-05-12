import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowUpRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  CircleDot,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  SquareDashedBottom,
  Wallet,
} from "lucide-react";

import PublicFavoriteButton from "@/app/components/public/PublicFavoriteButton";
import PropertyCard from "@/app/components/properties/PropertyCard";
import PropertyGallery from "@/app/components/properties/PropertyGallery";
import {
  formatPromotionDate,
  isActiveBoostedPromotion,
  isActiveFeaturedPromotion,
} from "@/app/lib/promotion";
import { PropertyService } from "@/app/lib/PropertyService";
import {
  buildBreadcrumbJsonLd,
  buildPropertyBreadcrumbs,
  serializeJsonLd,
} from "@/app/lib/seo";
import type {
  PropertyCategory,
  PublicProperty,
} from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyImageAlt,
  buildListingPath,
  buildPropertyMetadataDescription,
  formatCurrency,
  getCanonicalCategorySegment,
  getCategoryLabel,
  getPropertyAddresses,
  getPropertyCity,
  getPropertyContactPhone,
  getPropertyHighlights,
  getPropertyLocation,
  getPropertyPriceDisplay,
  getPropertyPriceInfo,
  getPropertyPricingOptions,
  getPropertyTitle,
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

const getAmenityItems = (property: PublicProperty) =>
  (property.amenities || []).filter(Boolean);

const toReadableLabel = (value: string) =>
  value
    .replace(/[_-]+/g, " / ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((part) =>
      part === "/"
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join(" ")
    .replace(/\s\/\s/g, " / ");

const getHostInitials = (name?: string) =>
  (name || "PM")
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "PM";

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
  const imageAlt = buildPropertyImageAlt(property);
  const addressLine = renderAddress(property);
  const highlights = getPropertyHighlights(property);
  const contactPhone = getPropertyContactPhone(property);
  const uploaderProfile =
    await PropertyService.getPropertyUploaderProfileByProperty(property._id);
  const priceInfo = getPropertyPriceInfo(property);
  const pricingOptions = getPropertyPricingOptions(property);
  const amenityItems = getAmenityItems(property);
  const host = uploaderProfile?.uploader || property.owner;
  const city = getPropertyCity(property);
  const area = getPropertyLocation(property);
  const categoryLabel = getCategoryLabel(category);
  const categoryPlural = getCategoryLabel(category, true);
  const isFeatured = isActiveFeaturedPromotion(property);
  const isBoosted = !isFeatured && isActiveBoostedPromotion(property);
  const primaryAddress = addressLine || [area, city].filter(Boolean).join(", ");
  const mapQuery = encodeURIComponent(primaryAddress || title);
  const securityDeposit =
    property.SecuritybasePrice && property.SecuritybasePrice > 0
      ? formatCurrency(property.SecuritybasePrice)
      : "Ask for details";
  const cityHref = city
    ? buildListingPath(
        {
          category,
          purpose: "rent",
          city,
          location: "",
          title: "",
          minRent: "",
          maxRent: "",
          minSize: "",
          maxSize: "",
          sizeUnit: "",
          amenities: [],
          hostelType: "",
          sortBy: "newest",
          page: 1,
          limit: 12,
        },
        { preferSeo: true, rootForProperty: true },
      )
    : "";
  const areaHref =
    city && area
      ? buildListingPath(
          {
            category,
            purpose: "rent",
            city,
            location: area,
            title: "",
            minRent: "",
            maxRent: "",
            minSize: "",
            maxSize: "",
            sizeUnit: "",
            amenities: [],
            hostelType: "",
            sortBy: "newest",
            page: 1,
            limit: 12,
          },
          { preferSeo: true, rootForProperty: true },
        )
      : "";

  const cameraDescription =
    property.safetyDetailsData?.cameraDescription &&
    !["yes", "true", "active"].includes(
      String(property.safetyDetailsData.cameraDescription).toLowerCase(),
    )
      ? property.safetyDetailsData.cameraDescription
      : "";
  const displayAmenities = amenityItems.map((item) => toReadableLabel(item));
  const displayHighlights = highlights.map((item) => toReadableLabel(item));
  const trustSignals = [
    property.isApproved ? "Verified listing" : "",
    property.moderationStatus?.toLowerCase() === "active" ? "Active" : "",
  ].filter(Boolean);
  const hasActivePromotion = isFeatured || isBoosted;
  const promotionLabel = isFeatured ? "Featured" : isBoosted ? "Boosted" : "";
  const promotionUntil = isFeatured
    ? property.featuredUntil
    : isBoosted
      ? property.boostedUntil
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
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    buildPropertyBreadcrumbs(category, city, area, canonicalHref, title),
  );

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <Script
        id={`property-jsonld-${property._id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(jsonLd)}
      </Script>
      <Script
        id={`property-breadcrumbs-jsonld-${property._id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(breadcrumbJsonLd)}
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
              {cityHref ? (
                <Link
                  href={cityHref}
                  className="transition hover:text-[var(--admin-primary)]"
                >
                  {city}
                </Link>
              ) : (
                <span>{city}</span>
              )}
            </>
          )}
          {area && (
            <>
              <span>/</span>
              {areaHref ? (
                <Link
                  href={areaHref}
                  className="line-clamp-1 transition hover:text-[var(--admin-primary)]"
                >
                  {area}
                </Link>
              ) : (
                <span className="line-clamp-1">{area}</span>
              )}
            </>
          )}
        </div>

        <div className="mb-6 max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--admin-primary)] shadow-sm">
              <MapPin size={13} />
              {[categoryLabel, city, area].filter(Boolean).join(" · ")}
            </span>

            {isFeatured && (
              <span className="inline-flex rounded-full bg-[var(--admin-accent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                Featured
              </span>
            )}
            {!isFeatured && isBoosted && (
              <span className="inline-flex rounded-full bg-[var(--admin-secondary)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                Boosted
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
            <h1 className="max-w-5xl text-[2rem] font-bold leading-[1.12] tracking-[-0.025em] text-[var(--admin-text)] sm:text-4xl sm:font-semibold lg:text-5xl">
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

        <PropertyGallery
          galleryImages={galleryImages}
          imageAltBase={imageAlt}
          isFeatured={isFeatured}
          isBoosted={isBoosted}
          isVerified={Boolean(property.isApproved)}
        />

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

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {displayAmenities.length > 0 && (
              <section className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[var(--admin-primary)]">
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                      Amenities
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                      Available features from this listing.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {displayAmenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-[var(--admin-text)]"
                    >
                      <CircleDot
                        size={14}
                        className="text-[var(--admin-primary)]"
                      />
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {displayHighlights.length > 0 && (
              <section className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#D97706]">
                    <CheckCircle2 size={19} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                      Key Highlights
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                      Quick reasons this listing stands out.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {displayHighlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-[#FCD9A6] bg-[#FFF9F1] px-4 py-2.5 text-sm font-medium text-[#B45309]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {primaryAddress && (
              <section className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[var(--admin-secondary)]">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                      Where You&apos;ll Be
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                      Location details from the property listing.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.25rem] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                    Location Summary
                  </p>
                  <p className="mt-3 break-words text-lg font-semibold text-[var(--admin-text)]">
                    {primaryAddress}
                  </p>
                  {(area || city) && (
                    <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                      {[area, city].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary)] hover:text-white"
                  >
                    Open in Maps
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-[90px] xl:self-start">
            <section className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.14)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                    {priceInfo.label}
                  </p>
                  <p className="mt-3 whitespace-nowrap text-3xl font-semibold tracking-tight text-[var(--admin-primary)]">
                    {getPropertyPriceDisplay(property)}
                  </p>
                </div>

                {property.isApproved && (
                  <span className="shrink-0 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[var(--admin-secondary)]">
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <PublicFavoriteButton property={property} variant="inline" />

                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Phone size={18} />
                    Contact Host
                  </a>
                ) : (
                  <div className="rounded-[1rem] border border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4 text-center text-sm font-medium text-[var(--admin-muted)]">
                    Contact details available on request
                  </div>
                )}

                <Link
                  href={`/uploader/${property._id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                >
                  View Profile
                  <ArrowUpRight size={17} />
                </Link>
              </div>

              {hasActivePromotion && (
                <dl className="mt-6 space-y-4 border-t border-[#E5E7EB] pt-5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--admin-muted)]">Promotion</dt>
                    <dd className="text-right font-semibold text-[var(--admin-text)]">
                      {promotionLabel}
                    </dd>
                  </div>
                  {promotionUntil && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[var(--admin-muted)]">
                        Promotion Until
                      </dt>
                      <dd className="text-right font-semibold text-[var(--admin-text)]">
                        {formatPromotionDate(promotionUntil)}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </section>

            {host && (
              <section className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--admin-text)]">
                  Property Manager
                </h2>

                <div className="mt-4 flex items-center gap-4 rounded-[1.25rem] bg-[#F8FAFC] p-4">
                  {host.profileImage ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-full">
                      <Image
                        src={host.profileImage || DEFAULT_PROPERTY_IMAGE}
                        alt={host.name || "Host"}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-semibold text-[var(--admin-primary)]">
                      {getHostInitials(host.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[var(--admin-text)]">
                      {host.name || "Property host"}
                    </p>
                    {uploaderProfile?.uploader?.planLabel && (
                      <p className="mt-1 truncate text-sm text-[var(--admin-muted)]">
                        {uploaderProfile.uploader.planLabel}
                      </p>
                    )}
                    {contactPhone && (
                      <p className="mt-2 text-sm font-semibold text-[var(--admin-primary)]">
                        {contactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {trustSignals.length > 0 && (
              <section className="rounded-[1.5rem] border border-[#D1FAE5] bg-[#F0FDF4] p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--admin-secondary)]">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-text)]">
                      Verified Secure
                    </h2>
                    <p className="text-sm text-[var(--admin-muted)]">
                      Trust signals from listing data.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trustSignals.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#BBF7D0] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--admin-secondary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* {cameraDescription && (
                  <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
                    {cameraDescription}
                  </p>
                )} */}
              </section>
            )}
          </aside>
        </div>

        {relatedProperties.length > 0 && (
          <section className="mt-16 border-t border-[var(--admin-border)] pt-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
                  You may also like
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  Similar listings nearby
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                  Compare more {categoryPlural.toLowerCase()}
                  {city ? ` in ${city}` : ""}.
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
