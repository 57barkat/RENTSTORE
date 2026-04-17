"use client";

/* eslint-disable @next/next/no-img-element */
import { memo, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { PublicProperty } from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyHref,
  getPropertyDescriptionText,
  getPropertyLocation,
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

  useEffect(() => {
    if (!selectedProperty) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete("preview");
        router.push(
          nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname,
          { scroll: false },
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname, router, searchParams, selectedProperty]);

  if (!selectedProperty) {
    return null;
  }

  const priceInfo = getPropertyPriceInfo(selectedProperty);

  const closeModal = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("preview");
    router.push(
      nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname,
      { scroll: false },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close property preview"
        onClick={closeModal}
        className="absolute inset-0 bg-[rgba(15,23,42,0.64)] backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-preview-title"
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-background)] shadow-2xl"
      >
        <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="aspect-[4/3] bg-[var(--admin-card)] md:aspect-auto">
            <img
              src={selectedProperty.photos?.[0] || DEFAULT_PROPERTY_IMAGE}
              alt={getPropertyTitle(selectedProperty)}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="admin-button-secondary rounded-full px-4 py-2 text-sm font-medium"
              >
                Close
              </button>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
              {getPropertyLocation(selectedProperty)}
            </p>
            <h2
              id="property-preview-title"
              className="mt-3 text-3xl font-semibold tracking-tight text-[var(--admin-text)]"
            >
              {getPropertyTitle(selectedProperty)}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--admin-muted)]">
              {getPropertyDescriptionText(selectedProperty, 220)}
            </p>

            <div className="mt-6 rounded-[1.5rem] bg-[var(--admin-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                {priceInfo.label}
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--admin-text)]">
                {getPropertyPriceDisplay(selectedProperty)}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(selectedProperty.amenities || []).slice(0, 6).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-[var(--admin-surface)] px-3 py-1 text-sm font-medium text-[var(--admin-muted)]"
                >
                  {amenity}
                </span>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                href={buildPropertyHref(selectedProperty)}
                className="admin-button-primary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-medium"
              >
                Open property page
              </Link>
              <button
                type="button"
                onClick={closeModal}
                className="admin-button-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium"
              >
                Dismiss
              </button>
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
