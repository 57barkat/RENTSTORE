"use client";

import { memo, useCallback, useEffect, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import type { PublicProperty } from "@/app/lib/property-types";

import PropertyImagePlaceholder from "@/app/components/properties/PropertyImagePlaceholder";
import {
  buildPropertyImageAlt,
  buildPropertyHref,
  formatReadableLabel,
  getPropertyDescriptionText,
  getPropertyLocation,
  getPropertyPhotoUrls,
  getPropertyPriceDisplay,
  getPropertyPriceInfo,
  getPropertyTitle,
} from "@/app/lib/property-utils";

interface PropertyModalProps {
  properties: PublicProperty[];
  pathname: string;
}

const PropertyModalComponent = ({
  properties,
  pathname,
}: PropertyModalProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get("preview");

  const selectedProperty = useMemo(
    () => properties.find((property) => property._id === selectedId),
    [properties, selectedId],
  );

  const closeModal = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.delete("preview");

    router.push(
      nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname,
      { scroll: false },
    );
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!selectedProperty) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProperty, closeModal]);

  if (!selectedProperty) {
    return null;
  }

  const priceInfo = getPropertyPriceInfo(selectedProperty);
  const modalImage = getPropertyPhotoUrls(selectedProperty)[0] || "";
  const displayAmenities = (selectedProperty.amenities || [])
    .map(formatReadableLabel)
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,23,42,0.72)] p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close property preview"
        onClick={closeModal}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-preview-title"
        className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-background)] shadow-[0_40px_120px_-24px_rgba(15,23,42,0.45)] sm:max-w-2xl sm:rounded-[2rem] lg:max-w-5xl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close preview"
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--admin-text)] shadow-sm backdrop-blur transition hover:bg-white hover:text-[var(--admin-primary)]"
        >
          <X size={18} />
        </button>

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.12fr_0.88fr]">
          {/* Image Section */}
          <div className="flex min-h-[260px] items-center justify-center bg-[#f3f4f6] sm:min-h-[340px] lg:min-h-[580px]">
            <div className="relative h-[260px] w-full sm:h-[340px] lg:h-full">
              {modalImage ? (
                <Image
                  src={modalImage}
                  alt={buildPropertyImageAlt(selectedProperty)}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 672px, 55vw"
                  className="object-contain p-3 sm:p-4"
                />
              ) : (
                <PropertyImagePlaceholder />
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col p-5 sm:p-6 lg:p-8">
            {/* Location */}
            <p className="pr-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--admin-primary)]">
              {getPropertyLocation(selectedProperty)}
            </p>

            {/* Title */}
            <h2
              id="property-preview-title"
              className="mt-3 text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl"
            >
              {getPropertyTitle(selectedProperty)}
            </h2>

            {/* Description */}
            <p className="mt-4 text-sm leading-7 text-[var(--admin-muted)]">
              {getPropertyDescriptionText(selectedProperty, 220)}
            </p>

            {/* Price Card */}
            <div className="mt-5 rounded-[1.25rem] bg-[var(--admin-card)] p-4 sm:rounded-[1.5rem] sm:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                {priceInfo.label}
              </p>

              <p className="mt-2 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-4xl">
                {getPropertyPriceDisplay(selectedProperty)}
              </p>
            </div>

            {/* Amenities */}
            {displayAmenities.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {displayAmenities.map((amenity, index) => (
                  <span
                    key={`${amenity}-${index}`}
                    className="rounded-full bg-[var(--admin-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-muted)] sm:text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-auto lg:pt-8">
              <Link
                href={buildPropertyHref(selectedProperty)}
                className="admin-button-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Open property page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyModal = memo(PropertyModalComponent);

PropertyModal.displayName = "PropertyModal";

export default PropertyModal;
