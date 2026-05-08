"use client";

import mapboxgl from "mapbox-gl";
import {
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PropertyAddress } from "@/app/lib/property-types";

type MapboxFeatureSource = "mapbox" | "local-sector" | "local-area";

type MapboxFeature = {
  id: string;
  place_name?: string;
  place_type?: string[];
  text?: string;
  source?: MapboxFeatureSource;
  center?: [number, number];
  geometry?: {
    coordinates?: [number, number];
  };
  context?: Array<{
    id?: string;
    text?: string;
    short_code?: string;
  }>;
  properties?: {
    address?: string;
  };
  address?: string;
};

type ResolvedLocation = {
  location: string;
  area: string;
  lat: string;
  lng: string;
  address: Pick<
    PropertyAddress,
    "street" | "city" | "stateTerritory" | "country" | "zipCode"
  >;
};

type PublicLocationPickerProps = {
  mapboxToken?: string;
  locationValue: string;
  latValue: string;
  lngValue: string;
  error?: string;
  onResolvedLocation: (value: ResolvedLocation) => void;
  onCoordinateSelection: (value: { lat: string; lng: string }) => void;
};

type PickerState =
  | { kind: "idle" }
  | { kind: "typing" }
  | { kind: "selected" }
  | {
      kind: "pin-unresolved";
      lat: number;
      lng: number;
      message: string;
    }
  | {
      kind: "error";
      message: string;
    };

type CityContext = {
  key: string;
  city: string;
  stateTerritory: string;
  country: string;
  center: {
    lng: number;
    lat: number;
  };
  bbox?: string;
  aliases: string[];
};

type LocalAreaHint = {
  id: string;
  label: string;
  cityKey: string;
  center: [number, number];
  aliases: string[];
  placeType?: string[];
};

const DEFAULT_CENTER: [number, number] = [73.0479, 33.6844];
const DEFAULT_ZOOM = 12;
const SELECTED_ZOOM = 15;
const ZERO_COORDINATE_TOLERANCE = 0.000001;

const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";
const MAPBOX_CSS_URL =
  "https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css";

const CITY_CONTEXTS: CityContext[] = [
  {
    key: "islamabad",
    city: "Islamabad",
    stateTerritory: "Islamabad Capital Territory",
    country: "Pakistan",
    center: { lng: 73.0479, lat: 33.6844 },
    bbox: "72.84,33.49,73.35,33.86",
    aliases: ["islamabad", "isb", "ict", "capital"],
  },
  {
    key: "rawalpindi",
    city: "Rawalpindi",
    stateTerritory: "Punjab",
    country: "Pakistan",
    center: { lng: 73.0479, lat: 33.5651 },
    bbox: "72.91,33.46,73.20,33.72",
    aliases: ["rawalpindi", "pindi", "rwp"],
  },
  {
    key: "lahore",
    city: "Lahore",
    stateTerritory: "Punjab",
    country: "Pakistan",
    center: { lng: 74.3587, lat: 31.5204 },
    bbox: "74.12,31.35,74.56,31.72",
    aliases: ["lahore", "lhr"],
  },
  {
    key: "karachi",
    city: "Karachi",
    stateTerritory: "Sindh",
    country: "Pakistan",
    center: { lng: 67.0011, lat: 24.8607 },
    bbox: "66.75,24.75,67.35,25.10",
    aliases: ["karachi", "khi"],
  },
  {
    key: "peshawar",
    city: "Peshawar",
    stateTerritory: "Khyber Pakhtunkhwa",
    country: "Pakistan",
    center: { lng: 71.5249, lat: 34.0151 },
    bbox: "71.38,33.92,71.68,34.12",
    aliases: ["peshawar", "pew"],
  },
  {
    key: "faisalabad",
    city: "Faisalabad",
    stateTerritory: "Punjab",
    country: "Pakistan",
    center: { lng: 73.135, lat: 31.4504 },
    bbox: "72.95,31.32,73.28,31.58",
    aliases: ["faisalabad", "fsd"],
  },
  {
    key: "multan",
    city: "Multan",
    stateTerritory: "Punjab",
    country: "Pakistan",
    center: { lng: 71.5249, lat: 30.1575 },
    bbox: "71.34,30.05,71.64,30.30",
    aliases: ["multan", "mux"],
  },
  {
    key: "quetta",
    city: "Quetta",
    stateTerritory: "Balochistan",
    country: "Pakistan",
    center: { lng: 66.975, lat: 30.1798 },
    bbox: "66.82,30.08,67.10,30.30",
    aliases: ["quetta"],
  },
];

const LOCAL_AREA_HINTS: LocalAreaHint[] = [
  {
    id: "rawalpindi-dhok-kala-khan",
    label: "Dhok Kala Khan",
    cityKey: "rawalpindi",
    center: [73.0856, 33.6204],
    aliases: ["dhok kala khan", "dhok kala", "kala khan", "dhoke kala khan"],
    placeType: ["neighborhood"],
  },
  {
    id: "rawalpindi-saddar",
    label: "Saddar",
    cityKey: "rawalpindi",
    center: [73.0551, 33.5952],
    aliases: ["saddar", "saddar rawalpindi", "sadar rawalpindi"],
    placeType: ["neighborhood"],
  },
  {
    id: "rawalpindi-satellite-town",
    label: "Satellite Town",
    cityKey: "rawalpindi",
    center: [73.0776, 33.6358],
    aliases: ["satellite town", "satellite town rawalpindi"],
    placeType: ["neighborhood"],
  },
  {
    id: "rawalpindi-commercial-market",
    label: "Commercial Market",
    cityKey: "rawalpindi",
    center: [73.0756, 33.6383],
    aliases: [
      "commercial market",
      "commercial market rawalpindi",
      "commercial mkt",
    ],
    placeType: ["poi"],
  },
  {
    id: "rawalpindi-bahria-town",
    label: "Bahria Town",
    cityKey: "rawalpindi",
    center: [73.1115, 33.5489],
    aliases: ["bahria town rawalpindi", "bahria rawalpindi", "bahria town rwp"],
    placeType: ["neighborhood"],
  },
  {
    id: "rawalpindi-chandni-chowk",
    label: "Chandni Chowk",
    cityKey: "rawalpindi",
    center: [73.0756, 33.6262],
    aliases: ["chandni chowk", "chandni chowk rawalpindi"],
    placeType: ["poi"],
  },
  {
    id: "rawalpindi-committee-chowk",
    label: "Committee Chowk",
    cityKey: "rawalpindi",
    center: [73.0619, 33.6096],
    aliases: ["committee chowk", "committee chowk rawalpindi"],
    placeType: ["poi"],
  },
  {
    id: "rawalpindi-faizabad",
    label: "Faizabad",
    cityKey: "rawalpindi",
    center: [73.0865, 33.6606],
    aliases: ["faizabad", "faizabad rawalpindi", "faizabad islamabad"],
    placeType: ["poi"],
  },
  {
    id: "rawalpindi-murree-road",
    label: "Murree Road",
    cityKey: "rawalpindi",
    center: [73.0689, 33.6155],
    aliases: ["murree road", "murree road rawalpindi"],
    placeType: ["address"],
  },
  {
    id: "rawalpindi-chaklala",
    label: "Chaklala",
    cityKey: "rawalpindi",
    center: [73.0926, 33.5878],
    aliases: ["chaklala", "chaklala rawalpindi", "chaklala scheme"],
    placeType: ["neighborhood"],
  },
  {
    id: "rawalpindi-westridge",
    label: "Westridge",
    cityKey: "rawalpindi",
    center: [73.0366, 33.6136],
    aliases: ["westridge", "westridge rawalpindi"],
    placeType: ["neighborhood"],
  },
  {
    id: "rawalpindi-adiala-road",
    label: "Adiala Road",
    cityKey: "rawalpindi",
    center: [73.0027, 33.5571],
    aliases: ["adiala road", "adiala road rawalpindi"],
    placeType: ["address"],
  },
  {
    id: "rawalpindi-gulraiz",
    label: "Gulraiz",
    cityKey: "rawalpindi",
    center: [73.1057, 33.5687],
    aliases: ["gulraiz", "gulraiz rawalpindi", "gulraiz housing"],
    placeType: ["neighborhood"],
  },
  {
    id: "islamabad-blue-area",
    label: "Blue Area",
    cityKey: "islamabad",
    center: [73.054, 33.7136],
    aliases: ["blue area", "blue area islamabad"],
    placeType: ["neighborhood"],
  },
  {
    id: "islamabad-f-10-markaz",
    label: "F-10 Markaz",
    cityKey: "islamabad",
    center: [73.0135, 33.6959],
    aliases: ["f10 markaz", "f-10 markaz", "f 10 markaz"],
    placeType: ["poi"],
  },
  {
    id: "islamabad-f-11-markaz",
    label: "F-11 Markaz",
    cityKey: "islamabad",
    center: [72.9885, 33.6844],
    aliases: ["f11 markaz", "f-11 markaz", "f 11 markaz"],
    placeType: ["poi"],
  },
  {
    id: "islamabad-g-11-markaz",
    label: "G-11 Markaz",
    cityKey: "islamabad",
    center: [72.9997, 33.6668],
    aliases: ["g11 markaz", "g-11 markaz", "g 11 markaz"],
    placeType: ["poi"],
  },
  {
    id: "islamabad-i-8-markaz",
    label: "I-8 Markaz",
    cityKey: "islamabad",
    center: [73.0747, 33.6672],
    aliases: ["i8 markaz", "i-8 markaz", "i 8 markaz"],
    placeType: ["poi"],
  },
  {
    id: "lahore-gulberg",
    label: "Gulberg",
    cityKey: "lahore",
    center: [74.3506, 31.5206],
    aliases: ["gulberg", "gulberg lahore"],
    placeType: ["neighborhood"],
  },
  {
    id: "lahore-dha",
    label: "DHA",
    cityKey: "lahore",
    center: [74.4152, 31.4626],
    aliases: ["dha lahore", "defence lahore", "defense lahore"],
    placeType: ["neighborhood"],
  },
  {
    id: "lahore-johar-town",
    label: "Johar Town",
    cityKey: "lahore",
    center: [74.2808, 31.4697],
    aliases: ["johar town", "johar town lahore"],
    placeType: ["neighborhood"],
  },
  {
    id: "lahore-model-town",
    label: "Model Town",
    cityKey: "lahore",
    center: [74.3244, 31.4832],
    aliases: ["model town", "model town lahore"],
    placeType: ["neighborhood"],
  },
  {
    id: "karachi-gulshan",
    label: "Gulshan-e-Iqbal",
    cityKey: "karachi",
    center: [67.0971, 24.9246],
    aliases: ["gulshan", "gulshan e iqbal", "gulshan-e-iqbal karachi"],
    placeType: ["neighborhood"],
  },
  {
    id: "karachi-dha",
    label: "DHA",
    cityKey: "karachi",
    center: [67.0638, 24.7993],
    aliases: ["dha karachi", "defence karachi", "defense karachi"],
    placeType: ["neighborhood"],
  },
];

const SECTOR_BASE_LAT: Record<string, number> = {
  D: 33.748,
  E: 33.728,
  F: 33.704,
  G: 33.676,
  H: 33.648,
  I: 33.62,
};

const devWarn = (label: string, detail?: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[PublicLocationPicker] ${label}`, detail);
  }
};

const devLog = (label: string, detail?: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[PublicLocationPicker] ${label}`, detail);
  }
};

const ensureMapboxCss = () => {
  if (typeof document === "undefined") {
    return;
  }

  const existing = document.querySelector<HTMLLinkElement>(
    'link[data-public-location-picker-mapbox-css="true"]',
  );

  if (existing) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = MAPBOX_CSS_URL;
  link.dataset.publicLocationPickerMapboxCss = "true";
  document.head.appendChild(link);
};

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasMeaningfulCoordinates = (lat: number | null, lng: number | null) =>
  lat !== null &&
  lng !== null &&
  !(
    Math.abs(lat) < ZERO_COORDINATE_TOLERANCE &&
    Math.abs(lng) < ZERO_COORDINATE_TOLERANCE
  );

const normalizeComparable = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getCityContextByKey = (key: string) =>
  CITY_CONTEXTS.find((context) => context.key === key);

const getContextItems = (cityContext: CityContext) => [
  {
    id: `place.${cityContext.key}`,
    text: cityContext.city,
  },
  {
    id: `region.${normalizeComparable(cityContext.stateTerritory)}`,
    text: cityContext.stateTerritory,
  },
  {
    id: "country.pk",
    text: cityContext.country,
    short_code: "pk",
  },
];

const findContextText = (feature: MapboxFeature, prefix: string) =>
  feature.context?.find((entry) => entry.id?.startsWith(prefix))?.text || "";

const getOwnFeatureText = (feature: MapboxFeature, type: string) =>
  feature.place_type?.includes(type) ? feature.text || "" : "";

const detectCityContextFromQuery = (query: string) => {
  const normalizedQuery = normalizeComparable(query);

  return CITY_CONTEXTS.find((context) =>
    context.aliases.some((alias) =>
      normalizedQuery.includes(normalizeComparable(alias)),
    ),
  );
};

const detectCityContextFromCoordinates = (
  lng: number | null,
  lat: number | null,
) => {
  if (!hasMeaningfulCoordinates(lat, lng)) {
    return undefined;
  }

  return CITY_CONTEXTS.find((context) => {
    if (!context.bbox) {
      return false;
    }

    const [minLng, minLat, maxLng, maxLat] = context.bbox
      .split(",")
      .map(Number);

    return (
      lng !== null &&
      lat !== null &&
      lng >= minLng &&
      lng <= maxLng &&
      lat >= minLat &&
      lat <= maxLat
    );
  });
};

const extractSectorParts = (value: string) => {
  const match = value
    .trim()
    .match(/\b([a-z])\s*-?\s*(\d{1,2})(?:\s*\/\s*([1-4]))?\b/i);

  if (!match) {
    return null;
  }

  return {
    letter: match[1].toUpperCase(),
    number: Number(match[2]),
    subSector: match[3] ? Number(match[3]) : null,
  };
};

const normalizeSectorLabel = (value: string) => {
  const sector = extractSectorParts(value);

  if (!sector) {
    return value.trim();
  }

  return `${sector.letter}-${sector.number}${
    sector.subSector ? `/${sector.subSector}` : ""
  }`;
};

const isSectorStyleQuery = (value: string) =>
  Boolean(extractSectorParts(value));

const getSectorCenter = (sectorLabel: string): [number, number] | null => {
  const sector = extractSectorParts(sectorLabel);

  if (!sector) {
    return null;
  }

  const baseLat = SECTOR_BASE_LAT[sector.letter];

  if (!baseLat) {
    return null;
  }

  const baseLng = 73.105 - (sector.number - 5) * 0.0175;

  const subSectorOffsets: Record<number, { lng: number; lat: number }> = {
    1: { lng: -0.0045, lat: 0.004 },
    2: { lng: 0.0045, lat: 0.004 },
    3: { lng: -0.0045, lat: -0.004 },
    4: { lng: 0.0045, lat: -0.004 },
  };

  const offset = sector.subSector
    ? subSectorOffsets[sector.subSector] || { lng: 0, lat: 0 }
    : { lng: 0, lat: 0 };

  return [baseLng + offset.lng, baseLat + offset.lat];
};

const makeLocalFeature = ({
  id,
  text,
  cityContext,
  center,
  placeType,
  source,
}: {
  id: string;
  text: string;
  cityContext: CityContext;
  center: [number, number];
  placeType: string[];
  source: MapboxFeatureSource;
}): MapboxFeature => ({
  id,
  text,
  place_name: `${text}, ${cityContext.city}, ${cityContext.country}`,
  place_type: placeType,
  source,
  center,
  context: getContextItems(cityContext),
});

const buildLocalSectorSuggestions = (query: string): MapboxFeature[] => {
  const sector = extractSectorParts(query);
  const islamabadContext = getCityContextByKey("islamabad");

  if (!sector || !islamabadContext) {
    return [];
  }

  const baseLabel = `${sector.letter}-${sector.number}`;
  const requestedLabel = normalizeSectorLabel(query);
  const requestedCenter = getSectorCenter(requestedLabel);
  const baseCenter = getSectorCenter(baseLabel);

  if (!baseCenter) {
    return [];
  }

  if (sector.subSector && requestedCenter) {
    return [
      makeLocalFeature({
        id: `local-sector:${requestedLabel}`,
        text: requestedLabel,
        cityContext: islamabadContext,
        center: requestedCenter,
        placeType: ["locality"],
        source: "local-sector",
      }),
      makeLocalFeature({
        id: `local-sector:${requestedLabel}:area`,
        text: `${requestedLabel} Area`,
        cityContext: islamabadContext,
        center: requestedCenter,
        placeType: ["neighborhood"],
        source: "local-sector",
      }),
    ];
  }

  const suggestions: MapboxFeature[] = [
    makeLocalFeature({
      id: `local-sector:${baseLabel}`,
      text: baseLabel,
      cityContext: islamabadContext,
      center: baseCenter,
      placeType: ["locality"],
      source: "local-sector",
    }),
    makeLocalFeature({
      id: `local-sector:${baseLabel}:markaz`,
      text: `${baseLabel} Markaz`,
      cityContext: islamabadContext,
      center: baseCenter,
      placeType: ["poi"],
      source: "local-sector",
    }),
  ];

  for (const subSector of [1, 2, 3, 4]) {
    const label = `${baseLabel}/${subSector}`;
    const center = getSectorCenter(label);

    if (center) {
      suggestions.push(
        makeLocalFeature({
          id: `local-sector:${label}`,
          text: label,
          cityContext: islamabadContext,
          center,
          placeType: ["locality"],
          source: "local-sector",
        }),
      );
    }
  }

  return suggestions;
};

const localHintMatchesQuery = (hint: LocalAreaHint, query: string) => {
  const normalizedQuery = normalizeComparable(query);

  if (normalizedQuery.length < 2) {
    return false;
  }

  const values = [hint.label, ...hint.aliases].map(normalizeComparable);

  return values.some(
    (value) =>
      value.includes(normalizedQuery) || normalizedQuery.includes(value),
  );
};

const buildLocalAreaSuggestions = (query: string) =>
  LOCAL_AREA_HINTS.filter((hint) => localHintMatchesQuery(hint, query))
    .map((hint) => {
      const cityContext = getCityContextByKey(hint.cityKey);

      if (!cityContext) {
        return null;
      }

      return makeLocalFeature({
        id: `local-area:${hint.id}`,
        text: hint.label,
        cityContext,
        center: hint.center,
        placeType: hint.placeType || ["neighborhood"],
        source: "local-area",
      });
    })
    .filter((feature): feature is MapboxFeature => Boolean(feature));

const getFeatureType = (feature: MapboxFeature) =>
  feature.place_type?.[0] || "";

const isGenericCityLevelFeature = (feature: MapboxFeature) =>
  ["region", "country"].includes(getFeatureType(feature));

const featureHaystack = (feature: MapboxFeature) =>
  normalizeComparable(`${feature.text || ""} ${feature.place_name || ""}`);

const hasSectorMatch = (feature: MapboxFeature, normalizedSector: string) =>
  featureHaystack(feature).includes(normalizeComparable(normalizedSector));

const scoreFeature = (
  feature: MapboxFeature,
  query: string,
  preferredContext?: CityContext,
) => {
  const normalizedQuery = normalizeComparable(query);
  const haystack = featureHaystack(feature);
  const type = getFeatureType(feature);

  let score = 0;

  if (feature.source === "local-area") score += 1000;
  if (feature.source === "local-sector") score += 950;
  if (haystack.includes(normalizedQuery)) score += 180;
  if (feature.text && normalizeComparable(feature.text) === normalizedQuery) {
    score += 120;
  }

  if (["address", "poi", "neighborhood", "locality"].includes(type)) {
    score += 80;
  }

  if (type === "district" || type === "place") {
    score += 20;
  }

  if (preferredContext) {
    const contextHaystack = normalizeComparable(
      `${feature.place_name || ""} ${feature.context
        ?.map((entry) => entry.text)
        .join(" ")}`,
    );

    if (contextHaystack.includes(normalizeComparable(preferredContext.city))) {
      score += 80;
    }
  }

  if (isGenericCityLevelFeature(feature)) {
    score -= 150;
  }

  return score;
};

const scoreSectorFeature = (
  feature: MapboxFeature,
  normalizedSector: string,
) => {
  const haystack = featureHaystack(feature);
  const normalized = normalizeComparable(normalizedSector);

  let score = 0;

  if (feature.source === "local-sector") score += 1000;
  if (haystack.includes(`${normalized}markaz`)) score += 180;
  if (haystack.includes(normalized)) score += 140;
  if (haystack.includes("islamabad")) score += 50;

  if (
    ["address", "poi", "neighborhood", "locality"].includes(
      getFeatureType(feature),
    )
  ) {
    score += 70;
  }

  if (isGenericCityLevelFeature(feature)) {
    score -= 150;
  }

  return score;
};

const getCoordinatesFromFeature = (feature: MapboxFeature) => {
  const coordinates = feature.center || feature.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const [lng, lat] = coordinates;

  if (!hasMeaningfulCoordinates(lat, lng)) {
    return null;
  }

  return {
    lng,
    lat,
  };
};

const resolveFeature = (feature: MapboxFeature): ResolvedLocation | null => {
  const coordinates = getCoordinatesFromFeature(feature);

  if (!coordinates) {
    return null;
  }

  const city =
    getOwnFeatureText(feature, "place") ||
    findContextText(feature, "place") ||
    findContextText(feature, "locality") ||
    findContextText(feature, "district") ||
    "";

  const stateTerritory =
    getOwnFeatureText(feature, "region") ||
    findContextText(feature, "region") ||
    "";

  const countryCode =
    feature.context
      ?.find((entry) => entry.id?.startsWith("country"))
      ?.short_code?.split("-")[1] || "";

  const country =
    getOwnFeatureText(feature, "country") ||
    findContextText(feature, "country") ||
    (countryCode ? countryCode.toUpperCase() : "Pakistan");

  const zipCode =
    getOwnFeatureText(feature, "postcode") ||
    findContextText(feature, "postcode");

  const area =
    getOwnFeatureText(feature, "neighborhood") ||
    getOwnFeatureText(feature, "locality") ||
    getOwnFeatureText(feature, "poi") ||
    getOwnFeatureText(feature, "address") ||
    findContextText(feature, "neighborhood") ||
    findContextText(feature, "locality") ||
    feature.text ||
    "";

  const streetName = feature.text || "";
  const streetNumber = feature.address || feature.properties?.address || "";
  const street = [streetNumber, streetName].filter(Boolean).join(" ").trim();

  return {
    location:
      feature.place_name ||
      [area, city, stateTerritory, country].filter(Boolean).join(", "),
    area,
    lat: String(coordinates.lat),
    lng: String(coordinates.lng),
    address: {
      street: street || area || city || "",
      city,
      stateTerritory,
      country: country ? toTitleCase(country) : "Pakistan",
      zipCode: zipCode || "",
    },
  };
};

const dedupeFeatures = (features: MapboxFeature[]) => {
  const seen = new Set<string>();
  const result: MapboxFeature[] = [];

  for (const feature of features) {
    const coords = feature.center || feature.geometry?.coordinates || [];
    const key = normalizeComparable(
      `${feature.text || ""}-${feature.place_name || ""}-${coords.join(",")}`,
    );

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(feature);
  }

  return result;
};

const buildSearchQueries = (query: string, preferredContext?: CityContext) => {
  const trimmed = query.trim();
  const queries: string[] = [];

  const addQuery = (value: string) => {
    const cleaned = value.trim();

    if (!cleaned) {
      return;
    }

    if (
      !queries.some(
        (queryValue) => queryValue.toLowerCase() === cleaned.toLowerCase(),
      )
    ) {
      queries.push(cleaned);
    }
  };

  if (preferredContext) {
    addQuery(`${trimmed}, ${preferredContext.city}, Pakistan`);
    addQuery(trimmed);
    addQuery(`${trimmed}, Pakistan`);
  } else {
    addQuery(trimmed);
    addQuery(`${trimmed}, Pakistan`);
    addQuery(`${trimmed}, Rawalpindi, Pakistan`);
    addQuery(`${trimmed}, Islamabad, Pakistan`);
    addQuery(`${trimmed}, Lahore, Pakistan`);
  }

  return queries.slice(0, 5);
};

async function fetchMapboxForwardResults(
  token: string,
  query: string,
  options?: {
    proximity?: { lng: number; lat: number };
    signal?: AbortSignal;
  },
) {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const sectorQuery = isSectorStyleQuery(trimmed);
  const normalizedSector = sectorQuery
    ? normalizeSectorLabel(trimmed)
    : trimmed;

  const localSectorSuggestions = sectorQuery
    ? buildLocalSectorSuggestions(trimmed)
    : [];

  const localAreaSuggestions = !sectorQuery
    ? buildLocalAreaSuggestions(trimmed)
    : [];

  const contextFromQuery = detectCityContextFromQuery(trimmed);
  const contextFromLocalArea = localAreaSuggestions
    .map((feature) => {
      const cityName = findContextText(feature, "place");

      return CITY_CONTEXTS.find((context) => context.city === cityName);
    })
    .find(Boolean);

  const contextFromCoordinates = detectCityContextFromCoordinates(
    options?.proximity?.lng ?? null,
    options?.proximity?.lat ?? null,
  );

  const preferredContext =
    contextFromQuery || contextFromLocalArea || contextFromCoordinates;

  const buildRequest = async (
    searchQuery: string,
    requestOptions?: {
      autocomplete?: boolean;
      limit?: number;
      cityContext?: CityContext;
      forceIslamabadSectorContext?: boolean;
    },
  ) => {
    const cityContext = requestOptions?.cityContext;
    const params = new URLSearchParams({
      access_token: token,
      country: "pk",
      language: "en",
      limit: String(requestOptions?.limit || 6),
      autocomplete: requestOptions?.autocomplete === false ? "false" : "true",
      types: "address,poi,locality,neighborhood,district,place,postcode",
    });

    if (requestOptions?.forceIslamabadSectorContext) {
      const islamabadContext = getCityContextByKey("islamabad");

      if (islamabadContext?.bbox) {
        params.set("bbox", islamabadContext.bbox);
        params.set(
          "proximity",
          `${islamabadContext.center.lng},${islamabadContext.center.lat}`,
        );
      }
    } else {
      if (cityContext?.bbox) {
        params.set("bbox", cityContext.bbox);
      }

      const proximity = options?.proximity || cityContext?.center;

      if (proximity) {
        params.set("proximity", `${proximity.lng},${proximity.lat}`);
      }
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery,
      )}.json?${params.toString()}`,
      { signal: options?.signal },
    );

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        `Search request failed (${response.status}): ${
          text || "No response body"
        }`,
      );
    }

    const json = (await response.json()) as { features?: MapboxFeature[] };

    return (Array.isArray(json.features) ? json.features : []).map(
      (feature) => ({
        ...feature,
        source: "mapbox" as const,
      }),
    );
  };

  devLog("forward-search:start", {
    query: trimmed,
    sectorQuery,
    normalizedSector,
    preferredContext: preferredContext?.city,
  });

  if (sectorQuery) {
    const queryVariants = [
      `${normalizedSector}, Islamabad, Pakistan`,
      `${normalizedSector} Markaz, Islamabad, Pakistan`,
      `${normalizedSector}/1, Islamabad, Pakistan`,
      `${normalizedSector}/2, Islamabad, Pakistan`,
      `${normalizedSector}/3, Islamabad, Pakistan`,
      `${normalizedSector}/4, Islamabad, Pakistan`,
      `${normalizedSector} Islamabad Pakistan`,
    ];

    const merged = new Map<string, MapboxFeature>();

    for (const searchQuery of queryVariants) {
      const features = await buildRequest(searchQuery, {
        autocomplete: false,
        limit: 8,
        forceIslamabadSectorContext: true,
      });

      for (const feature of features) {
        if (!merged.has(feature.id)) {
          merged.set(feature.id, feature);
        }
      }
    }

    const mapboxSectorResults = Array.from(merged.values())
      .filter((feature) => hasSectorMatch(feature, normalizedSector))
      .sort(
        (left, right) =>
          scoreSectorFeature(right, normalizedSector) -
          scoreSectorFeature(left, normalizedSector),
      )
      .filter((feature) => !isGenericCityLevelFeature(feature));

    const finalResults = dedupeFeatures([
      ...localSectorSuggestions,
      ...mapboxSectorResults,
    ])
      .sort(
        (left, right) =>
          scoreSectorFeature(right, normalizedSector) -
          scoreSectorFeature(left, normalizedSector),
      )
      .slice(0, 6);

    devLog("forward-search:sector-results", {
      normalizedSector,
      finalResults,
    });

    return finalResults;
  }

  const merged = new Map<string, MapboxFeature>();

  for (const feature of localAreaSuggestions) {
    merged.set(feature.id, feature);
  }

  const queryVariants = buildSearchQueries(trimmed, preferredContext);

  for (const searchQuery of queryVariants) {
    const features = await buildRequest(searchQuery, {
      autocomplete: true,
      limit: 8,
      cityContext: preferredContext,
    });

    for (const feature of features) {
      if (!merged.has(feature.id)) {
        merged.set(feature.id, feature);
      }
    }

    const specificFeatureCount = features.filter(
      (feature) => !isGenericCityLevelFeature(feature),
    ).length;

    if (specificFeatureCount >= 4 && localAreaSuggestions.length > 0) {
      break;
    }
  }

  const finalResults = dedupeFeatures(Array.from(merged.values()))
    .sort(
      (left, right) =>
        scoreFeature(right, trimmed, preferredContext) -
        scoreFeature(left, trimmed, preferredContext),
    )
    .slice(0, 6);

  devLog("forward-search:final-results", {
    query: trimmed,
    preferredContext: preferredContext?.city,
    finalResults,
  });

  return finalResults;
}

async function fetchMapboxReverseResult(
  token: string,
  lng: number,
  lat: number,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    access_token: token,
    language: "en",
    limit: "1",
    types: "address,poi,place,locality,neighborhood,district,postcode",
  });

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Reverse geocode failed (${response.status}): ${
        text || "No response body"
      }`,
    );
  }

  const json = (await response.json()) as { features?: MapboxFeature[] };

  return Array.isArray(json.features) && json.features[0]
    ? json.features[0]
    : null;
}

export default function PublicLocationPicker({
  mapboxToken,
  locationValue,
  latValue,
  lngValue,
  error,
  onResolvedLocation,
  onCoordinateSelection,
}: PublicLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markerElementRef = useRef<HTMLElement | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResolvedLocationRef = useRef(onResolvedLocation);
  const onCoordinateSelectionRef = useRef(onCoordinateSelection);
  const mapboxTokenRef = useRef(mapboxToken);
  const mapReadyRef = useRef(false);
  const currentCoordsRef = useRef<{ lat: number | null; lng: number | null }>({
    lat: toNumber(latValue),
    lng: toNumber(lngValue),
  });

  const [searchDraft, setSearchDraft] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [pickerState, setPickerState] = useState<PickerState>({ kind: "idle" });

  const searchValue = searchDraft ?? locationValue;

  const coordinates = useMemo(() => {
    const lat = toNumber(latValue);
    const lng = toNumber(lngValue);

    return lat !== null && lng !== null ? { lat, lng } : null;
  }, [latValue, lngValue]);

  const hasResolvedLocation = useMemo(
    () =>
      Boolean(locationValue.trim()) &&
      hasMeaningfulCoordinates(
        coordinates?.lat ?? null,
        coordinates?.lng ?? null,
      ),
    [coordinates?.lat, coordinates?.lng, locationValue],
  );

  const hasConfirmedSelection =
    hasResolvedLocation &&
    Boolean(locationValue.trim()) &&
    searchValue.trim() === locationValue.trim();

  const showTypingState =
    pickerState.kind === "typing" &&
    searchValue.trim().length > 0 &&
    !hasConfirmedSelection;

  useEffect(() => {
    mapboxTokenRef.current = mapboxToken;
  }, [mapboxToken]);

  useEffect(() => {
    onResolvedLocationRef.current = onResolvedLocation;
  }, [onResolvedLocation]);

  useEffect(() => {
    onCoordinateSelectionRef.current = onCoordinateSelection;
  }, [onCoordinateSelection]);

  useEffect(() => {
    currentCoordsRef.current = {
      lat: coordinates?.lat ?? null,
      lng: coordinates?.lng ?? null,
    };
  }, [coordinates?.lat, coordinates?.lng]);

  const markMapReady = () => {
    if (!mapReadyRef.current) {
      mapReadyRef.current = true;
      setMapReady(true);
    }
  };

  const showMarker = () => {
    if (markerElementRef.current) {
      markerElementRef.current.style.display = "block";
    }
  };

  const setMarkerPosition = (lng: number, lat: number) => {
    if (!markerRef.current) {
      return;
    }

    markerRef.current.setLngLat([lng, lat]);
    showMarker();
  };

  const moveMapTo = (lng: number, lat: number, zoom = SELECTED_ZOOM) => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.easeTo({
      center: [lng, lat],
      zoom,
      duration: 650,
    });
  };

  const resolvePin = async (lng: number, lat: number) => {
    const token = mapboxTokenRef.current;

    if (!token) {
      setPickerState({
        kind: "error",
        message: "Mapbox token is missing, so this pin cannot be resolved.",
      });
      return;
    }

    if (!hasMeaningfulCoordinates(lat, lng)) {
      setPickerState({
        kind: "error",
        message: "Invalid coordinates received from the map interaction.",
      });
      devWarn("Ignoring invalid coordinate selection", { lat, lng });
      return;
    }

    onCoordinateSelectionRef.current({
      lat: String(lat),
      lng: String(lng),
    });

    reverseAbortRef.current?.abort();

    const controller = new AbortController();
    reverseAbortRef.current = controller;

    try {
      const feature = await fetchMapboxReverseResult(
        token,
        lng,
        lat,
        controller.signal,
      );

      if (!feature) {
        setPickerState({
          kind: "pin-unresolved",
          lat,
          lng,
          message:
            "Pin selected, but address could not be resolved. Please choose a search suggestion or edit address details manually.",
        });
        devWarn("Reverse geocode returned no result", { lat, lng });
        return;
      }

      const resolved = resolveFeature(feature);

      if (!resolved) {
        setPickerState({
          kind: "pin-unresolved",
          lat,
          lng,
          message:
            "Pin selected, but address could not be resolved. Please choose a search suggestion or edit address details manually.",
        });
        devWarn("Reverse geocode feature could not be resolved", feature);
        return;
      }

      onResolvedLocationRef.current(resolved);
      setSearchDraft(resolved.location);
      setSearchOpen(false);
      setSuggestions([]);
      setPickerState({ kind: "selected" });
    } catch (fetchError) {
      if ((fetchError as Error).name === "AbortError") {
        return;
      }

      setPickerState({
        kind: "pin-unresolved",
        lat,
        lng,
        message:
          "Pin selected, but address could not be resolved. Please choose a search suggestion or edit address details manually.",
      });

      devWarn("Reverse geocode failed", fetchError);
    }
  };

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) {
      return;
    }

    ensureMapboxCss();

    const initialHasCoordinates = hasMeaningfulCoordinates(
      currentCoordsRef.current.lat,
      currentCoordsRef.current.lng,
    );

    const initialCenter: [number, number] = initialHasCoordinates
      ? [
          currentCoordsRef.current.lng as number,
          currentCoordsRef.current.lat as number,
        ]
      : DEFAULT_CENTER;

    const map = new mapboxgl.Map({
      accessToken: mapboxToken,
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: initialCenter,
      zoom: initialHasCoordinates ? SELECTED_ZOOM : DEFAULT_ZOOM,
      attributionControl: true,
    });

    const marker = new mapboxgl.Marker({
      color: "#000080",
      draggable: true,
    })
      .setLngLat(initialCenter)
      .addTo(map);

    markerElementRef.current = marker.getElement();
    markerElementRef.current.style.display = initialHasCoordinates
      ? "block"
      : "none";

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      }),
      "top-right",
    );

    map.on("load", () => {
      devLog("map:load", { style: MAPBOX_STYLE });
      map.resize();
      setMapLoadError(null);
      markMapReady();
    });

    map.on("idle", () => {
      map.resize();
      markMapReady();
    });

    map.on("styledata", () => {
      map.resize();
    });

    map.on("error", (event) => {
      const errorValue = (event as { error?: unknown }).error;
      const message =
        errorValue instanceof Error
          ? errorValue.message
          : typeof errorValue === "string"
            ? errorValue
            : "Map failed to load.";

      if (
        message.includes("401") ||
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("forbidden")
      ) {
        setMapLoadError(
          "The Mapbox public token cannot load map tiles for this site. Check token value, URL restrictions, scopes, and allowed domains.",
        );
      } else {
        setMapLoadError(message);
      }

      devWarn("Map load error", errorValue || message);
    });

    map.on("click", (event) => {
      const { lng, lat } = event.lngLat;

      setMarkerPosition(lng, lat);
      moveMapTo(lng, lat);
      void resolvePin(lng, lat);
    });

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();

      setMarkerPosition(lngLat.lng, lngLat.lat);
      moveMapTo(lngLat.lng, lngLat.lat);
      void resolvePin(lngLat.lng, lngLat.lat);
    });

    mapRef.current = map;
    markerRef.current = marker;

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && mapContainerRef.current
        ? new ResizeObserver(() => {
            map.resize();
          })
        : null;

    if (resizeObserver && mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const delayedResize = window.setTimeout(() => {
      map.resize();
    }, 300);

    return () => {
      searchAbortRef.current?.abort();
      reverseAbortRef.current?.abort();
      resizeObserver?.disconnect();
      window.clearTimeout(delayedResize);
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      markerElementRef.current = null;
      mapReadyRef.current = false;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (
      !mapRef.current ||
      !markerRef.current ||
      !hasResolvedLocation ||
      !coordinates
    ) {
      return;
    }

    setMarkerPosition(coordinates.lng, coordinates.lat);
    moveMapTo(coordinates.lng, coordinates.lat);
  }, [coordinates, hasResolvedLocation]);

  useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
      reverseAbortRef.current?.abort();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearchDraft(value);
    setSearchOpen(true);
    setPickerState(value.trim() ? { kind: "typing" } : { kind: "idle" });

    if (!mapboxToken) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      searchAbortRef.current?.abort();
      setSuggestions([]);
      setSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      searchAbortRef.current?.abort();

      const controller = new AbortController();
      searchAbortRef.current = controller;

      setSearching(true);

      try {
        const currentLat = currentCoordsRef.current.lat;
        const currentLng = currentCoordsRef.current.lng;
        const features = await fetchMapboxForwardResults(mapboxToken, value, {
          signal: controller.signal,
          proximity: hasMeaningfulCoordinates(currentLat, currentLng)
            ? {
                lng: currentLng as number,
                lat: currentLat as number,
              }
            : undefined,
        });

        setSuggestions(features);

        if (features.length === 0) {
          setPickerState({
            kind: "error",
            message:
              "No matching locations found. Try a fuller area, city, or address.",
          });
        }
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setSuggestions([]);
        setPickerState({
          kind: "error",
          message: "Search request failed. Please try again.",
        });
        devWarn("Forward geocode failed", fetchError);
      } finally {
        setSearching(false);
      }
    }, 250);
  };

  const handleSelectSuggestion = (feature: MapboxFeature) => {
    const resolved = resolveFeature(feature);

    if (!resolved) {
      setPickerState({
        kind: "error",
        message: "This suggestion did not include valid coordinates.",
      });
      devWarn("Suggestion could not be resolved", feature);
      return;
    }

    const lat = Number(resolved.lat);
    const lng = Number(resolved.lng);

    if (!hasMeaningfulCoordinates(lat, lng)) {
      setPickerState({
        kind: "error",
        message: "Selected place returned invalid coordinates.",
      });
      devWarn("Suggestion produced invalid coordinates", resolved);
      return;
    }

    onCoordinateSelectionRef.current({
      lat: resolved.lat,
      lng: resolved.lng,
    });
    onResolvedLocationRef.current(resolved);

    setMarkerPosition(lng, lat);
    moveMapTo(lng, lat);

    setSearchDraft(resolved.location);
    setSuggestions([]);
    setSearchOpen(false);
    setPickerState({ kind: "selected" });

    devLog("search-select:resolved", resolved);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setPickerState({
        kind: "error",
        message: "Your browser does not support current location.",
      });
      return;
    }

    if (!mapboxToken) {
      setPickerState({
        kind: "error",
        message:
          "Mapbox token is missing, so current location cannot be resolved.",
      });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocating(false);

        if (!hasMeaningfulCoordinates(lat, lng)) {
          setPickerState({
            kind: "error",
            message: "Current location returned invalid coordinates.",
          });
          return;
        }

        setMarkerPosition(lng, lat);
        moveMapTo(lng, lat);

        void resolvePin(lng, lat);
      },
      () => {
        setLocating(false);
        setPickerState({
          kind: "error",
          message:
            "Browser geolocation was denied. You can still search manually or place a pin on the map.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-background)]/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--admin-text)]">
              Search and place your listing
            </p>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Search an area or address, then drag the pin if you want to
              fine-tune the exact entrance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={!mapboxToken || locating}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4 text-[var(--admin-primary)]" />
            )}
            Use current location
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />

          <input
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="admin-input w-full rounded-2xl px-12 py-3 text-sm"
            placeholder="Search by area, sector, city, or full address"
          />

          {searching ? (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--admin-muted)]" />
          ) : null}
        </div>

        {searchOpen && suggestions.length > 0 ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_20px_45px_-35px_var(--admin-shadow)]">
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectSuggestion(feature)}
                className="flex w-full items-start gap-3 border-b border-[var(--admin-border)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--admin-background)]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-primary)]" />

                <span>
                  <span className="block text-sm font-semibold text-[var(--admin-text)]">
                    {feature.text || feature.place_name || "Selected place"}
                  </span>

                  {feature.place_name ? (
                    <span className="block text-xs text-[var(--admin-muted)]">
                      {feature.place_name}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white">
          {mapboxToken ? (
            <>
              <div ref={mapContainerRef} className="h-[320px] w-full" />

              {!mapReady && !mapLoadError ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--admin-muted)] shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading map
                  </div>
                </div>
              ) : null}

              {mapLoadError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 px-6 text-center">
                  <div className="max-w-md">
                    <TriangleAlert className="mx-auto h-8 w-8 text-[var(--admin-error)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--admin-text)]">
                      Map could not load
                    </p>
                    <p className="mt-2 text-xs text-[var(--admin-muted)]">
                      {mapLoadError}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-[var(--admin-border)] px-4 py-3 text-xs text-[var(--admin-muted)]">
                Click anywhere on the map or drag the pin to update the exact
                location and auto-fill the address fields below.
              </div>
            </>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center px-6 py-10 text-center">
              <div className="max-w-md">
                <MapPin className="mx-auto h-8 w-8 text-[var(--admin-primary)]" />

                <p className="mt-3 text-sm font-semibold text-[var(--admin-text)]">
                  Map search is unavailable
                </p>

                <p className="mt-2 text-sm text-[var(--admin-muted)]">
                  Add{" "}
                  <span className="font-bold">
                    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                  </span>{" "}
                  to enable web map selection. Manual address entry still works
                  below.
                </p>
              </div>
            </div>
          )}
        </div>

        {hasConfirmedSelection ? (
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
              Selected location
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
              {locationValue}
            </p>

            {coordinates ? (
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                Pin set at {coordinates.lat.toFixed(5)},{" "}
                {coordinates.lng.toFixed(5)}
              </p>
            ) : null}
          </div>
        ) : null}

        {showTypingState ? (
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
              Search pending
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
              Select a suggestion to confirm this location.
            </p>
          </div>
        ) : null}

        {pickerState.kind === "pin-unresolved" ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Pin selected
            </p>

            <p className="mt-1 text-sm font-semibold text-amber-900">
              {pickerState.message}
            </p>

            <p className="mt-1 text-xs text-amber-800">
              Coordinates: {pickerState.lat.toFixed(5)},{" "}
              {pickerState.lng.toFixed(5)}
            </p>
          </div>
        ) : null}

        {!searchValue.trim() && !hasResolvedLocation ? (
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
              Location required
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
              Search for a real place or drop a pin to continue.
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs font-semibold text-[var(--admin-error)]">
          {error}
        </p>
      ) : null}

      {pickerState.kind === "error" ? (
        <p className="inline-flex items-start gap-2 text-xs font-semibold text-[var(--admin-error)]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {pickerState.message}
        </p>
      ) : null}
    </div>
  );
}
