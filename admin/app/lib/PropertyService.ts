import "server-only";

import { cache } from "react";

import type {
  PropertySearchFilters,
  PropertySearchResponse,
  PublicProperty,
} from "@/app/lib/property-types";
import {
  buildPropertySearchQuery,
  extractPropertyId,
  getPropertyCategory,
  getPropertyCity,
} from "@/app/lib/property-utils";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

const FRONTEND_SECRET =
  process.env.MY_APP_SECRET || "aganstaysecretkey";

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:3000/api/v1";
const DEFAULT_LOCALHOST_ALIAS_API_BASE_URL = "http://127.0.0.1:3000/api/v1";
const LEGACY_TUNNEL_API_BASE_URL =
  "https://banefully-jointed-freya.ngrok-free.dev/api/v1";

const getCandidateBaseUrls = (): string[] => {
  const candidates = [
    API_BASE_URL,
    DEFAULT_LOCAL_API_BASE_URL,
    DEFAULT_LOCALHOST_ALIAS_API_BASE_URL,
  ];

  if (process.env.NODE_ENV !== "production") {
    candidates.push(LEGACY_TUNNEL_API_BASE_URL);
  }

  return Array.from(
    new Set(candidates.map((value) => value.replace(/\/$/, "")).filter(Boolean)),
  );
};

const requestJson = async <T>(path: string): Promise<T> => {
  const candidateBaseUrls = getCandidateBaseUrls();

  if (candidateBaseUrls.length === 0) {
    throw new Error(
      "Missing API_URL or NEXT_PUBLIC_API_URL for public property requests.",
    );
  }

  let lastError: Error | null = null;

  for (const baseUrl of candidateBaseUrls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          "x-frontend-secret": FRONTEND_SECRET,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        lastError = new Error(
          `Property request failed with status ${response.status} from ${baseUrl}${body ? `: ${body.slice(0, 160)}` : ""}`,
        );

        if (![502, 503, 504].includes(response.status)) {
          throw lastError;
        }

        continue;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Property request failed unexpectedly.");
    }
  }

  throw (
    lastError ||
    new Error("Property request failed because no API base URL responded.")
  );
};

const searchPropertiesInternal = async (
  filters: PropertySearchFilters,
): Promise<PropertySearchResponse> => {
  const query = buildPropertySearchQuery(filters);
  return requestJson<PropertySearchResponse>(`/properties/search?${query}`);
};

const getPropertyByIdInternal = async (
  propertyId: string,
): Promise<PublicProperty> => {
  const payload = await requestJson<PublicProperty | { data?: PublicProperty }>(
    `/properties/${propertyId}`,
  );

  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload as PublicProperty;
};

const searchPropertiesCached = cache(async (serializedFilters: string) => {
  return searchPropertiesInternal(
    JSON.parse(serializedFilters) as PropertySearchFilters,
  );
});

const getPropertyByIdCached = cache(async (propertyId: string) => {
  return getPropertyByIdInternal(propertyId);
});

export const PropertyService = {
  async searchProperties(
    filters: PropertySearchFilters,
  ): Promise<PropertySearchResponse> {
    return searchPropertiesCached(JSON.stringify(filters));
  },

  async getPropertyByRouteId(routeId: string): Promise<PublicProperty | null> {
    const propertyId = extractPropertyId(routeId) || routeId;

    if (!propertyId) {
      return null;
    }

    try {
      return await getPropertyByIdCached(propertyId);
    } catch {
      return null;
    }
  },

  async getRelatedProperties(
    property: PublicProperty,
  ): Promise<PublicProperty[]> {
    const response = await searchPropertiesInternal({
      category: getPropertyCategory(property),
      city: getPropertyCity(property),
      page: 1,
      limit: 4,
      sortBy: "popular",
    });

    return response.data
      .filter((item) => item._id !== property._id)
      .slice(0, 3);
  },
};
