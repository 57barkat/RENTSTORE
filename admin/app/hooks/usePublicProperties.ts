"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  PropertyCategory,
  PropertySearchFilters,
} from "@/app/lib/property-types";
import {
  buildListingPath,
  buildPropertyBrowserQuery,
  parsePropertySearchParams,
} from "@/app/lib/property-utils";
import { parseSeoListingSlug } from "@/app/lib/property-seo";

export const useProperties = (category: PropertyCategory) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathSegment = pathname.split("/").filter(Boolean)[0] || "";
  const seoRoute = useMemo(() => parseSeoListingSlug(pathSegment), [pathSegment]);

  const filters = useMemo(
    () => {
      const nextFilters = parsePropertySearchParams(
        seoRoute?.category || category,
        Object.fromEntries(searchParams.entries()),
      );

      if (seoRoute) {
        nextFilters.city = seoRoute.city;
        nextFilters.location = seoRoute.area || "";
        nextFilters.purpose = seoRoute.purpose;
      }

      return nextFilters;
    },
    [category, searchParams, seoRoute],
  );

  const pushFilters = useCallback(
    (nextFilters: PropertySearchFilters) => {
      const shouldStayOnRoot =
        pathname === "/" && nextFilters.category === "property";
      const nextPath = buildListingPath(nextFilters, {
        preferSeo:
          !shouldStayOnRoot &&
          (Boolean(seoRoute) || Boolean(nextFilters.city)),
        rootForProperty: shouldStayOnRoot,
      });
      const nextSeoRoute = parseSeoListingSlug(nextPath.replace(/^\//, ""));
      const query = buildPropertyBrowserQuery(nextFilters, {
        omitCity: Boolean(nextSeoRoute),
        omitPurpose: Boolean(nextSeoRoute),
        omitLocation: Boolean(nextSeoRoute),
      });
      router.push(query ? `${nextPath}?${query}` : nextPath, { scroll: false });
    },
    [pathname, router, seoRoute],
  );

  const updateFilters = useCallback(
    (patch: Partial<PropertySearchFilters>) => {
      pushFilters({
        ...filters,
        ...patch,
        page: patch.page ?? 1,
      });
    },
    [filters, pushFilters],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
};
