import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  CircleDot,
  Home,
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
import ReportedPropertyGate from "@/app/components/properties/ReportedPropertyGate";
import ReportListingButton from "@/app/components/properties/ReportListingButton";
import PropertyShareButton from "@/app/components/properties/PropertyShareButton";
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
  NearbyPlace,
  PropertyCategory,
  PublicProperty,
} from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyImageAlt,
  buildListingPath,
  buildPropertyMetadataDescription,
  formatCurrency,
  formatReadableLabel,
  getCategoryLabel,
  getPropertyAddresses,
  getPropertyCity,
  getPropertyContactPhone,
  getPropertyDescriptionText,
  getPropertyHighlights,
  getPropertyImageUrls,
  getPropertyLocation,
  getPropertyPhotoUrls,
  getPropertyPriceDisplay,
  getPropertyPriceInfo,
  getPropertyPricingOptions,
  getPropertyTitle,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";
import { getPropertyCoordinates } from "@/app/lib/property-coordinates";
import PropertyLocationMap from "./PropertyLocationMap";

interface PropertyDetailContentProps {
  category: PropertyCategory;
  property: PublicProperty;
  canonicalHref: string;
}

type PropertyDetailExtras = PublicProperty & {
  description?: unknown;
  rules?: unknown[];
  houseRules?: unknown[];
};

const stringifyDisplayValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(stringifyDisplayValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return (
      stringifyDisplayValue(record.highlighted) ||
      stringifyDisplayValue(record.label) ||
      stringifyDisplayValue(record.name) ||
      stringifyDisplayValue(record.title) ||
      stringifyDisplayValue(record.value) ||
      ""
    );
  }

  return "";
};

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

const getHostInitials = (name?: string) =>
  (name || "PM")
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "PM";

const getDetailDescription = (
  _category: PropertyCategory,
  property: PublicProperty,
) => {
  return (
    getPropertyDescriptionText(property, 600) ||
    buildPropertyMetadataDescription(_category, property)
  );
};

const getHouseRules = (property: PublicProperty) => {
  const extendedProperty = property as PropertyDetailExtras;

  return [
    ...(extendedProperty.houseRules || []),
    ...(extendedProperty.rules || []),
  ]
    .map(formatReadableLabel)
    .filter(Boolean);
};

export default async function PropertyDetailContent({
  category,
  property,
  canonicalHref,
}: PropertyDetailContentProps) {
  const galleryImages = getPropertyPhotoUrls(property);

  let relatedProperties: PublicProperty[] = [];
  let nearbyPlaces: NearbyPlace[] = [];

  try {
    relatedProperties = await PropertyService.getRelatedProperties(property);
  } catch {
    relatedProperties = [];
  }

  try {
    nearbyPlaces = await PropertyService.getNearbyPlacesByProperty(
      property._id,
    );
  } catch {
    nearbyPlaces = [];
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
  const categoryHref = buildListingPath(
    {
      category,
      purpose: "rent",
    },
    { preferSeo: true, rootForProperty: true },
  );
  const detailDescription = getDetailDescription(category, property);
  const { latitude, longitude } = getPropertyCoordinates(property);
  const displayRules = getHouseRules(property);
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

  const displayAmenities = amenityItems
    .map(formatReadableLabel)
    .filter(Boolean);
  const displayHighlights = highlights.map(formatReadableLabel).filter(Boolean);
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
      label: "Floor",
      value: formatFloorLevel(property.capacityState?.floorLevel),
      icon: Building2,
    },
    {
      label: property.size?.unit || "Area",
      value: property.size?.value
        ? String(property.size.value)
        : "Not specified",
      icon: SquareDashedBottom,
    },
  ].filter((item) => item.value !== "Not specified");

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
    image: getPropertyImageUrls(property).map((image) => toAbsoluteUrl(image)),
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
    <ReportedPropertyGate propertyId={property._id}>
      <main className="min-h-screen bg-[linear-gradient(180deg,var(--admin-card)_0%,var(--admin-background)_42%,var(--admin-card)_100%)]">
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
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--admin-muted)]">
            <Link
              href="/"
              className="text-[var(--admin-primary)] transition hover:text-[var(--admin-text)]"
            >
              All Properties
            </Link>

            <span>/</span>

            <Link
              href={categoryHref}
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

          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-5xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-primary)] bg-[var(--admin-primary)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-sm">
                  <Home size={13} />
                  {categoryLabel}
                </span>

                {area && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-secondary)] bg-[var(--admin-secondary)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-sm">
                    <MapPin size={13} />
                    {[city, area].filter(Boolean).join(" · ")}
                  </span>
                )}

                {isFeatured && (
                  <span className="inline-flex rounded-full bg-[var(--admin-accent)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
                    Featured
                  </span>
                )}

                {!isFeatured && isBoosted && (
                  <span className="inline-flex rounded-full bg-[var(--admin-secondary)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
                    Boosted
                  </span>
                )}

                {property.isApproved && (
                  <span
                    title="Verification means limited platform checks only. It does not guarantee ownership, legal title, condition, availability, or transaction safety."
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--admin-secondary-soft)] px-3 py-1.5 text-[11px] font-black text-[var(--admin-secondary)]"
                  >
                    <BadgeCheck size={14} />
                    Verified
                  </span>
                )}
              </div>

              <div>
                <h1 className="max-w-5xl text-[2rem] font-semibold leading-[1.14] tracking-[-0.02em] text-[var(--admin-text)] sm:text-[2.5rem] lg:text-[3.15rem]">
                  {title}
                </h1>

                {primaryAddress && (
                  <p className="mt-4 flex max-w-4xl items-start gap-2 text-sm font-medium leading-7 text-[var(--admin-muted)] sm:text-base">
                    <MapPin
                      size={17}
                      className="mt-1 shrink-0 text-[var(--admin-primary)]"
                    />
                    <span>{primaryAddress}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <PropertyShareButton title={title} url={canonicalHref} />

              <Suspense fallback={null}>
                <PublicFavoriteButton property={property} variant="inline" />
              </Suspense>
            </div>
          </div>

          <PropertyGallery
            galleryImages={galleryImages}
            imageAltBase={imageAlt}
            isFeatured={isFeatured}
            isBoosted={isBoosted}
            isVerified={Boolean(property.isApproved)}
          />

          {stats.length > 0 && (
            <section className="mt-5 rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.24)]">
              <div
                className={`grid gap-3 ${
                  stats.length === 1
                    ? "grid-cols-1"
                    : stats.length === 2
                      ? "grid-cols-2"
                      : stats.length === 3
                        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                }`}
              >
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-4 py-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                        <Icon size={19} />
                      </span>

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--admin-muted)]">
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
          )}

          <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              {displayAmenities.length > 0 && (
                <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                      <Sparkles size={19} />
                    </span>

                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
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
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)]"
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
                <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-accent-soft)] text-[var(--admin-warning)]">
                      <CheckCircle2 size={19} />
                    </span>

                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
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
                        className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {detailDescription && (
                <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-secondary-soft)] text-[var(--admin-secondary)]">
                      <Building2 size={19} />
                    </span>

                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
                        Description
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                        Details shared by the listing owner.
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 max-w-4xl text-sm font-medium leading-8 text-[var(--admin-muted)]">
                    {detailDescription}
                  </p>
                </section>
              )}

              {primaryAddress && (
                <section className="mt-8 rounded-[2rem] border border-[var(--admin-border)] bg-white p-10">
                  <div className="mb-8 flex items-start gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                      <MapPin size={30} />
                    </span>

                    <div>
                      <h2 className="text-4xl font-black tracking-tight text-[var(--admin-text)]">
                        Location & nearby places
                      </h2>

                      <p className="mt-2 text-lg font-medium text-[var(--admin-muted)]">
                        See the property location and nearby essentials such as
                        masjid, schools, hospitals, shops, and transport.
                      </p>
                    </div>
                  </div>

                  <PropertyLocationMap
                    address={primaryAddress}
                    latitude={latitude}
                    longitude={longitude}
                    nearbyPlaces={nearbyPlaces}
                  />
                </section>
              )}

              {displayRules.length > 0 && (
                <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                      <ShieldCheck size={19} />
                    </span>

                    <div>
                      <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                        Rules shared by the property owner.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {displayRules.map((rule) => (
                      <span
                        key={rule}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)]"
                      >
                        <CircleDot
                          size={14}
                          className="text-[var(--admin-primary)]"
                        />
                        {rule}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-[90px] xl:self-start">
              <section className="overflow-hidden rounded-[1.75rem] border border-[var(--admin-border)] bg-white shadow-[0_24px_60px_-35px_rgba(15,23,42,0.3)]">
                <div className="bg-[linear-gradient(135deg,var(--admin-primary),#2563eb)] p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
                        {priceInfo.label}
                      </p>

                      <p className="mt-3 whitespace-nowrap text-3xl font-black tracking-tight">
                        {getPropertyPriceDisplay(property)}
                      </p>
                    </div>

                    {property.isApproved && (
                      <span className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80">
                    <Wallet size={16} />
                    <span>Security deposit: {securityDeposit}</span>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  {contactPhone ? (
                    <a
                      href={`tel:${contactPhone}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-24px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95"
                    >
                      <Phone size={18} />
                      Contact Host
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-[var(--admin-border)] bg-[#F8FAFC] px-5 py-4 text-center text-sm font-semibold text-[var(--admin-muted)]">
                      Contact details available on request
                    </div>
                  )}

                  <ReportListingButton
                    propertyId={property._id}
                    listingTitle={title}
                    variant="inline"
                  />

                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800">
                    Do not send token money, rent, or deposits before verifying
                    the property and the person you are dealing with. AnganStay
                    is not responsible for payments or agreements made directly
                    between users.
                  </p>

                  <Link
                    href={`/uploader/${property._id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-5 py-3.5 text-sm font-black text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  >
                    View Full Profile
                    <ArrowUpRight size={17} />
                  </Link>

                  {hasActivePromotion && (
                    <dl className="space-y-4 border-t border-[var(--admin-border)] pt-5 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[var(--admin-muted)]">Promotion</dt>
                        <dd className="text-right font-black text-[var(--admin-text)]">
                          {promotionLabel}
                        </dd>
                      </div>

                      {promotionUntil && (
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-[var(--admin-muted)]">
                            Promotion Until
                          </dt>
                          <dd className="text-right font-black text-[var(--admin-text)]">
                            {formatPromotionDate(promotionUntil)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </section>

              {host && (
                <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                    Property Manager
                  </h2>

                  <div className="mt-4 flex items-center gap-4 rounded-[1.35rem] bg-[#F8FAFC] p-4">
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
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-sm font-black text-[var(--admin-primary)]">
                        {getHostInitials(host.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-black text-[var(--admin-text)]">
                        {host.name || "Property host"}
                      </p>

                      {uploaderProfile?.uploader?.planLabel && (
                        <p className="mt-1 truncate text-sm font-medium text-[var(--admin-muted)]">
                          {uploaderProfile.uploader.planLabel}
                        </p>
                      )}

                      {contactPhone && (
                        <p className="mt-2 text-sm font-black text-[var(--admin-primary)]">
                          {contactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {trustSignals.length > 0 && (
                <section className="rounded-[1.75rem] border border-[color:color-mix(in_srgb,var(--admin-secondary)_28%,var(--admin-border))] bg-[var(--admin-secondary-soft)] p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-card)] text-[var(--admin-secondary)]">
                      <ShieldCheck size={19} />
                    </span>

                    <div>
                      <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                        Verification
                      </h2>

                      <p className="mt-2 text-sm font-medium leading-6 text-[var(--admin-muted)]">
                        Verification means limited platform checks only. It does
                        not guarantee ownership, legal title, property
                        condition, availability, or transaction safety.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {trustSignals.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[color:color-mix(in_srgb,var(--admin-secondary)_28%,var(--admin-border))] bg-[var(--admin-card)] px-3 py-1.5 text-xs font-black text-[var(--admin-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>

          {relatedProperties.length > 0 && (
            <section className="mt-16 border-t border-[var(--admin-border)] pt-10">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-primary)]">
                    You may also like
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--admin-text)]">
                    Similar listings nearby
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--admin-muted)]">
                    Compare more {categoryPlural.toLowerCase()}
                    {city ? ` in ${city}` : ""}.
                  </p>
                </div>

                <Link
                  href={categoryHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_34px_-24px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95"
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
    </ReportedPropertyGate>
  );
}
