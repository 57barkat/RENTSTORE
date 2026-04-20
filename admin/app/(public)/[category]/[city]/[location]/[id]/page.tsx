import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import PropertyCard from "@/app/components/properties/PropertyCard";
import { PropertyService } from "@/app/lib/PropertyService";
import type { PublicProperty } from "@/app/lib/property-types";
import {
  BRAND_NAME,
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyHref,
  buildPropertyMetadataDescription,
  buildPropertyMetadataTitle,
  extractPropertyId,
  formatPriceAmount,
  formatCurrency,
  getCanonicalCategorySegment,
  getCategoryLabel,
  getPropertyAddresses,
  getPropertyCategory,
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
  normalizeCategorySegment,
} from "@/app/lib/property-utils";
import PropertyGallery from "@/app/components/properties/PropertyGallery";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface DetailPageProps {
  params: Promise<{
    category: string;
    city: string;
    location: string;
    id: string;
  }>;
}

const resolveProperty = async (
  paramsPromise: Promise<{
    category: string;
    city: string;
    location: string;
    id: string;
  }>,
) => {
  const params = await paramsPromise;
  const category = normalizeCategorySegment(params.category);

  if (!category) {
    notFound();
  }

  const propertyId = extractPropertyId(params.id);

  if (!propertyId) {
    notFound();
  }

  const property = await PropertyService.getPropertyByRouteId(propertyId);

  if (!property) {
    notFound();
  }

  return {
    params,
    category,
    property,
    canonicalHref: buildPropertyHref(property),
  };
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

const getFactRows = (property: PublicProperty) => {
  return [
    {
      label: "Category",
      value: getCategoryLabel(getPropertyCategory(property)),
    },
    { label: "City", value: getPropertyCity(property) },
    { label: "Location", value: getPropertyLocation(property) },
    {
      label: "Security deposit",
      value: formatCurrency(property.SecuritybasePrice || 0),
    },
    {
      label: "Apartment type",
      value: property.apartmentType || "Standard",
    },
    {
      label: "Furnishing",
      value: property.furnishing || "Ask for details",
    },
    {
      label: "Parking",
      value: property.parking ? "Available" : "Not specified",
    },
    {
      label: "Bills",
      value: hasAllBillsIncluded(property)
        ? property.ALL_BILLS?.join(", ")
        : "On request",
    },
  ];
};

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { category, property, canonicalHref } = await resolveProperty(params);
  const title = buildPropertyMetadataTitle(category, property);
  const description = buildPropertyMetadataDescription(category, property);
  const image = property.photos?.[0] || DEFAULT_PROPERTY_IMAGE;
  const canonicalUrl = toAbsoluteUrl(canonicalHref);
  const imageUrl = toAbsoluteUrl(image);

  return {
    title: `${title} | ${BRAND_NAME}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${BRAND_NAME}`,
      description,
      type: "article",
      url: canonicalUrl,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PropertyDetailPage({ params }: DetailPageProps) {
  const {
    params: resolvedParams,
    category,
    property,
    canonicalHref,
  } = await resolveProperty(params);

  const currentPath = `/${resolvedParams.category}/${resolvedParams.city}/${resolvedParams.location}/${resolvedParams.id}`;

  if (canonicalHref !== currentPath) {
    redirect(canonicalHref);
  }

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
  const summary = getPropertyDescriptionText(property, 220);
  const addressLine = renderAddress(property);
  const highlights = getPropertyHighlights(property);
  const contactPhone = getPropertyContactPhone(property);
  const priceInfo = getPropertyPriceInfo(property);
  const pricingOptions = getPropertyPricingOptions(property);
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
        addressLocality: getPropertyCity(property),
        streetAddress: getPropertyAddresses(property)[0]?.street,
        addressRegion: getPropertyAddresses(property)[0]?.stateTerritory,
        postalCode: getPropertyAddresses(property)[0]?.zipCode,
        addressCountry: getPropertyAddresses(property)[0]?.country,
      },
      numberOfRooms:
        property.capacityState?.bedrooms || property.capacityState?.beds,
    },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_28%,_#ffffff_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link
            href={`/${getCanonicalCategorySegment(category)}`}
            className="font-medium text-sky-700 hover:text-sky-900"
          >
            Back to listings
          </Link>
          <span>/</span>
          <span>{title}</span>
        </div>

        <div className="mb-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-sky-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              {getCategoryLabel(category)} in {getPropertyCity(property)} •{" "}
              {getPropertyLocation(property)}
            </span>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                {summary}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              {priceInfo.label}
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              {getPropertyPriceDisplay(property)}
            </p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-900">Area:</span>{" "}
                {getPropertyLocation(property)}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-900">Address:</span>{" "}
                {addressLine ||
                  `${getPropertyLocation(property)}, ${getPropertyCity(property)}`}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-900">
                  Security deposit:
                </span>{" "}
                {formatCurrency(property.SecuritybasePrice || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-8">
            <PropertyGallery galleryImages={galleryImages} title={title} />

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Listing overview
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Bedrooms
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {property.capacityState?.bedrooms ||
                      property.capacityState?.beds ||
                      0}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Bathrooms
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {property.capacityState?.bathrooms || 0}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Floor level
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {property.capacityState?.floorLevel || 0}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {property.size?.unit || "Size"}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {property.size?.value || "Ask for details"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Pricing options
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Compare every available rate for this property before you
                    book or contact the host.
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Primary price: {getPropertyPriceDisplay(property)}
                </p>
              </div>

              {pricingOptions.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pricingOptions.map((option) => (
                    <div
                      key={option.frequency}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {option.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                        {option.amount
                          ? formatPriceAmount(option.amount)
                          : "Contact"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-sky-700">
                        {option.suffix}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  Pricing is available on request for this property.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                What this property offers
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {(property.amenities || []).length > 0 ? (
                  property.amenities?.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                    >
                      {amenity}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500">
                    Amenity information will appear here once it is available
                    from the backend listing.
                  </p>
                )}
              </div>
            </section>

            {(highlights.length > 0 ||
              (property.mealPlan || []).length > 0 ||
              (property.rules || []).length > 0) && (
              <section className="grid gap-6 xl:grid-cols-3">
                {highlights.length > 0 && (
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                      Highlights
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(property.mealPlan || []).length > 0 && (
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                      Meal plan
                    </h2>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {property.mealPlan?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(property.rules || []).length > 0 && (
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                      Rules
                    </h2>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {property.rules?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Safety and verification
              </h2>
              <p className="mt-4 text-slate-600">
                {property.safetyDetailsData?.cameraDescription ||
                  "This listing includes backend-provided verification and safety information."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {(
                  property.safetyDetailsData?.safetyDetails || [
                    "Verified listing",
                  ]
                ).map((detail) => (
                  <span
                    key={detail}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/30">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
                Ready to enquire?
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Contact the listing host
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This property page is server-rendered for search engines and
                maps the existing backend schema into a public, responsive
                detail view.
              </p>
              {contactPhone ? (
                <a
                  href={`tel:${contactPhone}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-100"
                >
                  Contact host
                </a>
              ) : (
                <div className="mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-slate-300">
                  Contact details available on request
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Listing facts
              </h2>
              <dl className="mt-4 space-y-4 text-sm">
                {getFactRows(property).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-slate-500">{item.label}</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {item.value}
                    </dd>
                  </div>
                ))}
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Views</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {property.views || 0}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {relatedProperties.length > 0 && (
          <section className="mt-16 space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
                Related listings
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                More places in {getPropertyCity(property)}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {relatedProperties.map((listing) => (
                <PropertyCard key={listing._id} property={listing} />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
