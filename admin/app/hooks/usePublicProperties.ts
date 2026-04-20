"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  PropertyCategory,
  PropertySearchFilters,
} from "@/app/lib/property-types";
import {
  buildPropertyBrowserQuery,
  parsePropertySearchParams,
} from "@/app/lib/property-utils";

export const useProperties = (category: PropertyCategory) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () =>
      parsePropertySearchParams(
        category,
        Object.fromEntries(searchParams.entries()),
      ),
    [category, searchParams],
  );

  const pushFilters = useCallback(
    (nextFilters: PropertySearchFilters) => {
      const query = buildPropertyBrowserQuery(nextFilters);
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
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
