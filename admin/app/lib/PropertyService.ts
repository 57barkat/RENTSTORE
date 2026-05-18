import "server-only";

import { cache } from "react";

import type {
  PopularLocationCityGroup,
  PopularLocationSummary,
  NearbyPlace,
  PublicPropertyFilterOptions,
  PropertySearchFilters,
  PropertySearchResponse,
  PublicProperty,
  UploaderProfileResponse,
} from "@/app/lib/property-types";
import {
  buildPropertySearchQuery,
  extractPropertyId,
  getPropertyCategory,
  getPropertyCity,
} from "@/app/lib/property-utils";

const API_BASE_URL = (process.env.API_URL || "").replace(/\/$/, "");
const NEXT_PUBLIC_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";
const PUBLIC_LISTING_REVALIDATE_SECONDS = 300;
const PUBLIC_DETAIL_REVALIDATE_SECONDS = 600;
const PUBLIC_DISCOVERY_REVALIDATE_SECONDS = 1800;

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:3000/api/v1";
const DEFAULT_LOCALHOST_ALIAS_API_BASE_URL = "http://127.0.0.1:3000/api/v1";
const LEGACY_TUNNEL_API_BASE_URL =
  "https://banefully-jointed-freya.ngrok-free.dev/api/v1";

const getCandidateBaseUrls = (): string[] => {
  const candidates =
    process.env.NODE_ENV === "production"
      ? [API_BASE_URL, NEXT_PUBLIC_API_URL]
      : [
          DEFAULT_LOCAL_API_BASE_URL,
          DEFAULT_LOCALHOST_ALIAS_API_BASE_URL,
          API_BASE_URL,
          NEXT_PUBLIC_API_URL,
          LEGACY_TUNNEL_API_BASE_URL,
        ];

  return Array.from(
    new Set(candidates.map((value) => value.replace(/\/$/, "")).filter(Boolean)),
  );
};

const requestJson = async <T>(
  path: string,
  options?: {
    revalidate?: number;
    tags?: string[];
  },
): Promise<T> => {
  const candidateBaseUrls = getCandidateBaseUrls();

  if (candidateBaseUrls.length === 0) {
    throw new Error(
      "Missing API_URL or NEXT_PUBLIC_API_URL for public property requests.",
    );
  }

  let lastError: Error | null = null;
  const failedAttempts: Array<{
    baseUrl: string;
    reason: string;
  }> = [];

  for (const baseUrl of candidateBaseUrls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(FRONTEND_SECRET
            ? { "x-frontend-secret": FRONTEND_SECRET }
            : {}),
        },
        next:
          options?.revalidate || options?.tags?.length
            ? {
                ...(options?.revalidate
                  ? { revalidate: options.revalidate }
                  : {}),
                ...(options?.tags?.length ? { tags: options.tags } : {}),
              }
            : undefined,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        lastError = new Error(
          `Property request failed with status ${response.status} from ${baseUrl}${body ? `: ${body.slice(0, 160)}` : ""}`,
        );
        failedAttempts.push({
          baseUrl,
          reason: `status ${response.status}`,
        });

        if (![502, 503, 504].includes(response.status)) {
          continue;
        }

        continue;
      }

      const json = (await response.json()) as T;
      return json;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Property request failed unexpectedly.");
      failedAttempts.push({
        baseUrl,
        reason: lastError.message,
      });
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
  return requestJson<PropertySearchResponse>(`/properties/search?${query}`, {
    revalidate: PUBLIC_LISTING_REVALIDATE_SECONDS,
    tags: [
      "public-properties",
      `public-search:${filters.category}`,
      ...(filters.city ? [`public-city:${filters.city.toLowerCase()}`] : []),
      ...(filters.location
        ? [`public-area:${filters.location.toLowerCase()}`]
        : []),
    ],
  });
};

const getPropertyByIdInternal = async (
  propertyId: string,
): Promise<PublicProperty> => {
  const payload = await requestJson<PublicProperty | { data?: PublicProperty }>(
    `/properties/${propertyId}`,
    {
      revalidate: PUBLIC_DETAIL_REVALIDATE_SECONDS,
      tags: ["public-properties", `public-property:${propertyId}`],
    },
  );

  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload as PublicProperty;
};

const getPropertyUploaderProfileInternal = async (
  propertyId: string,
): Promise<UploaderProfileResponse> => {
  return requestJson<UploaderProfileResponse>(
    `/properties/${propertyId}/uploader-profile`,
    {
      revalidate: PUBLIC_DETAIL_REVALIDATE_SECONDS,
      tags: ["public-properties", `public-property:${propertyId}`],
    },
  );
};

const getNearbyPlacesInternal = async (
  propertyId: string,
): Promise<NearbyPlace[]> => {
  return requestJson<NearbyPlace[]>(`/properties/${propertyId}/nearby-places`, {
    revalidate: PUBLIC_DETAIL_REVALIDATE_SECONDS,
    tags: ["public-properties", `public-property:${propertyId}`],
  });
};

const getPopularLocationsInternal = async (input: {
  city?: string;
  propertyType?: string;
  type?: string;
  purpose?: "rent" | "sale";
  limit?: number;
}): Promise<PopularLocationSummary[]> => {
  const params = new URLSearchParams();

  if (input.city) {
    params.set("city", input.city);
  }

  if (input.propertyType) {
    params.set("propertyType", input.propertyType);
  }

  if (input.type) {
    params.set("type", input.type);
  }

  if (input.purpose) {
    params.set("purpose", input.purpose);
  }

  if (input.limit) {
    params.set("limit", String(input.limit));
  }

  return requestJson<PopularLocationSummary[]>(
    `/seo/popular-locations?${params.toString()}`,
    {
      revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS,
      tags: ["public-properties", "public-popular-locations"],
    },
  );
};

const getPopularLocationsOverviewInternal = async (input: {
  propertyType?: string;
  type?: string;
  purpose?: "rent" | "sale";
  limit?: number;
}): Promise<PopularLocationCityGroup[]> => {
  const params = new URLSearchParams();

  if (input.propertyType) {
    params.set("propertyType", input.propertyType);
  }

  if (input.type) {
    params.set("type", input.type);
  }

  if (input.purpose) {
    params.set("purpose", input.purpose);
  }

  if (input.limit) {
    params.set("limit", String(input.limit));
  }

  return requestJson<PopularLocationCityGroup[]>(
    `/seo/popular-locations?${params.toString()}`,
    {
      revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS,
      tags: ["public-properties", "public-popular-locations"],
    },
  );
};

const getFilterOptionsInternal = async (input: {
  category?: string;
  city?: string;
  purpose?: "rent" | "sale";
}): Promise<PublicPropertyFilterOptions> => {
  const params = new URLSearchParams();

  if (input.category) {
    params.set("hostOption", input.category);
  }

  if (input.city) {
    params.set("city", input.city);
  }

  if (input.purpose) {
    params.set("purpose", input.purpose);
  }

  return requestJson<PublicPropertyFilterOptions>(
    `/properties/filter-options?${params.toString()}`,
    {
      revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS,
      tags: [
        "public-properties",
        "public-filter-options",
        ...(input.category ? [`public-filters:${input.category}`] : []),
      ],
    },
  );
};

const searchPropertiesCached = cache(async (serializedFilters: string) => {
  return searchPropertiesInternal(
    JSON.parse(serializedFilters) as PropertySearchFilters,
  );
});

const getPropertyByIdCached = cache(async (propertyId: string) => {
  return getPropertyByIdInternal(propertyId);
});

const getNearbyPlacesCached = cache(async (propertyId: string) => {
  return getNearbyPlacesInternal(propertyId);
});

const getPopularLocationsCached = cache(
  async (serializedInput: string) =>
    getPopularLocationsInternal(
      JSON.parse(serializedInput) as {
        city?: string;
        propertyType?: string;
        type?: string;
        purpose?: "rent" | "sale";
        limit?: number;
      },
    ),
);

const getPopularLocationsOverviewCached = cache(
  async (serializedInput: string) =>
    getPopularLocationsOverviewInternal(
      JSON.parse(serializedInput) as {
        propertyType?: string;
        type?: string;
        purpose?: "rent" | "sale";
        limit?: number;
      },
    ),
);

const getFilterOptionsCached = cache(
  async (serializedInput: string) =>
    getFilterOptionsInternal(
      JSON.parse(serializedInput) as {
        category?: string;
        city?: string;
        purpose?: "rent" | "sale";
      },
    ),
);

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

  async getPropertyUploaderProfileByProperty(
    propertyId: string,
  ): Promise<UploaderProfileResponse | null> {
    if (!propertyId) {
      return null;
    }

    try {
      return await getPropertyUploaderProfileInternal(propertyId);
    } catch {
      return null;
    }
  },

  async getNearbyPlacesByProperty(propertyId: string): Promise<NearbyPlace[]> {
    if (!propertyId) {
      return [];
    }

    try {
      return await getNearbyPlacesCached(propertyId);
    } catch {
      return [];
    }
  },

  async getPopularLocations(input: {
    city?: string;
    propertyType?: string;
    type?: string;
    purpose?: "rent" | "sale";
    limit?: number;
  }): Promise<PopularLocationSummary[]> {
    return getPopularLocationsCached(JSON.stringify(input));
  },

  async getPopularLocationsOverview(input: {
    propertyType?: string;
    type?: string;
    purpose?: "rent" | "sale";
    limit?: number;
  }): Promise<PopularLocationCityGroup[]> {
    return getPopularLocationsOverviewCached(JSON.stringify(input));
  },

  async getFilterOptions(input: {
    category?: string;
    city?: string;
    purpose?: "rent" | "sale";
  }): Promise<PublicPropertyFilterOptions> {
    return getFilterOptionsCached(JSON.stringify(input));
  },
};
