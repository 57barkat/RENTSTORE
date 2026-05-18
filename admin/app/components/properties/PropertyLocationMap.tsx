"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import {
  Building2,
  GraduationCap,
  Landmark,
  MapPin,
  Store,
} from "lucide-react";

import type { NearbyPlace } from "@/app/lib/property-types";

import "mapbox-gl/dist/mapbox-gl.css";

interface PropertyLocationMapProps {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  nearbyPlaces?: NearbyPlace[];
}

const categoryLabels: Record<NearbyPlace["category"], string> = {
  mosque: "Masjid / mosque",
  school: "School",
  hospital: "Hospital / clinic",
  market: "Market",
  useful: "Useful place",
};

const categoryInitials: Record<NearbyPlace["category"], string> = {
  mosque: "M",
  school: "S",
  hospital: "H",
  market: "B",
  useful: "P",
};

const formatDistance = (distanceMeters: number) => {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.max(1, Math.round(distanceMeters))} m`;
};

const getPlaceIcon = (category: NearbyPlace["category"]) => {
  if (category === "mosque") return Landmark;
  if (category === "school") return GraduationCap;
  if (category === "hospital") return Building2;
  if (category === "market") return Store;
  return MapPin;
};

const nearbySearches: Array<{
  label: string;
  category: NearbyPlace["category"];
  query: string;
}> = [
  { label: "Masjid / Mosque", category: "mosque", query: "masjid mosque" },
  { label: "Hospitals", category: "hospital", query: "hospital clinic" },
  { label: "Schools", category: "school", query: "school" },
  { label: "Markets", category: "market", query: "market grocery store" },
];

export default function PropertyLocationMap({
  address,
  latitude,
  longitude,
  nearbyPlaces = [],
}: PropertyLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const hasCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const mapPlaces = useMemo(
    () =>
      nearbyPlaces.filter(
        (place) =>
          Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
      ),
    [nearbyPlaces],
  );
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const googleMapsHref = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : encodeURIComponent(address);
  const googleEmbedSrc = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const nearbySearchBase = hasCoordinates
    ? `${latitude},${longitude}`
    : address;

  useEffect(() => {
    if (!hasCoordinates || !mapContainerRef.current) return;

    const token = mapboxToken;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 14,
    });

    mapRef.current = map;

    const propertyMarker = document.createElement("div");
    propertyMarker.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:48px;height:48px;border-radius:9999px;background:var(--admin-primary);color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px rgba(0,0,0,.18);border:4px solid white;font-size:13px;font-weight:900;">HERE</div>
        <span style="margin-top:4px;border-radius:9999px;background:white;padding:4px 12px;font-size:12px;font-weight:700;color:var(--admin-primary);box-shadow:0 4px 10px rgba(0,0,0,.12);">Property</span>
      </div>
    `;

    new mapboxgl.Marker(propertyMarker, { anchor: "bottom" })
      .setLngLat([longitude, latitude])
      .addTo(map);

    mapPlaces.forEach((place) => {
      const markerEl = document.createElement("div");
      markerEl.innerHTML = `
        <div title="${place.name}" style="width:36px;height:36px;border-radius:9999px;background:white;color:var(--admin-primary);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,.14);border:2px solid var(--admin-primary-soft);font-size:12px;font-weight:900;">
          ${categoryInitials[place.category]}
        </div>
      `;

      new mapboxgl.Marker(markerEl, { anchor: "bottom" })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasCoordinates, latitude, longitude, mapPlaces, mapboxToken]);

  if (!hasCoordinates) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white">
        <iframe
          title="Property address map"
          src={googleEmbedSrc}
          className="block h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="border-t border-[var(--admin-border)] bg-[#F8FAFC] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--admin-text)]">
                Nearby essentials
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                Exact saved coordinates are not available, so this map uses the
                listed address. Open nearby searches to verify masjid,
                hospitals, schools, and markets around this area.
              </p>
            </div>

            <a
              href={googleMapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-fit shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {nearbySearches.map((item) => {
              const Icon = getPlaceIcon(item.category);
              const href = `https://www.google.com/maps/search/${encodeURIComponent(`${item.query} near ${nearbySearchBase}`)}`;

              return (
                <a
                  key={item.label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition hover:shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                    <Icon size={17} />
                  </span>
                  <span className="text-sm font-bold text-[var(--admin-text)]">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {address && (
          <p className="border-t border-[var(--admin-border)] bg-white px-5 py-4 text-sm font-medium text-[var(--admin-muted)]">
            {address}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white">
      {mapboxToken && (
        <div ref={mapContainerRef} className="h-[420px] overflow-hidden" />
      )}

      {!mapboxToken && (
        <iframe
          title="Property location map"
          src={googleEmbedSrc}
          className="block h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      <div className="grid gap-4 border-t border-[var(--admin-border)] bg-[#F8FAFC] p-5 md:grid-cols-[1fr_auto]">
        <div>
          <h3 className="text-lg font-bold text-[var(--admin-text)]">
            Nearby essentials
          </h3>

          {nearbyPlaces.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {nearbyPlaces.map((place) => {
                const Icon = getPlaceIcon(place.category);
                return (
                  <a
                    key={place.id}
                    href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 transition hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--admin-text)]">
                          {place.name}
                        </p>
                        <p className="text-xs text-[var(--admin-muted)]">
                          {categoryLabels[place.category]}
                          {place.address ? `, ${place.address}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-[var(--admin-primary)]">
                      {formatDistance(place.distanceMeters)}
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[var(--admin-muted)]">
              Nearby places are not available for this location yet. Use the map
              to check the surrounding area before visiting.
            </p>
          )}
        </div>

        <a
          href={googleMapsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-fit items-center justify-center rounded-xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
