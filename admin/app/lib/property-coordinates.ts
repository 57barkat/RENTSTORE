import { PublicProperty } from "./property-types";
import { getPropertyAddresses } from "./property-utils";

type LocationLike = {
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  coordinates?: number[] | null;
};

type PublicPropertyWithLocation = PublicProperty & {
  latitude?: number | null;
  longitude?: number | null;
  location?: LocationLike | null;
  coordinates?: number[] | null;
};

const toNumberOrNull = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export const getPropertyCoordinates = (
  property: PublicProperty,
): {
  latitude: number | null;
  longitude: number | null;
} => {
  const propertyWithLocation = property as PublicPropertyWithLocation;

  const address = getPropertyAddresses(property)[0] as LocationLike | undefined;

  const latitude = toNumberOrNull(
    propertyWithLocation.latitude ??
      propertyWithLocation.location?.latitude ??
      propertyWithLocation.location?.lat ??
      address?.latitude ??
      address?.lat ??
      propertyWithLocation.coordinates?.[1] ??
      propertyWithLocation.location?.coordinates?.[1] ??
      address?.coordinates?.[1],
  );

  const longitude = toNumberOrNull(
    propertyWithLocation.longitude ??
      propertyWithLocation.location?.longitude ??
      propertyWithLocation.location?.lng ??
      address?.longitude ??
      address?.lng ??
      propertyWithLocation.coordinates?.[0] ??
      propertyWithLocation.location?.coordinates?.[0] ??
      address?.coordinates?.[0],
  );

  return { latitude, longitude };
};
