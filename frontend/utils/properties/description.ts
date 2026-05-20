import type { PropertyDetailData } from "@/types/PropertyDetailScreen.types";

const toText = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const toReadableLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getTitle = (property: PropertyDetailData) => {
  const title = toText(property.title);

  if (title) {
    return title;
  }

  const type = toText(property.hostOption || property.category) || "Property";
  const area = toText(property.area);

  return area ? `${toReadableLabel(type)} in ${area}` : toReadableLabel(type);
};

const getLocation = (property: PropertyDetailData) =>
  [
    property.addressQuery,
    property.area,
    property.location,
    property.address?.[0]?.city,
  ]
    .map(toText)
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");

const getDirectDescription = (property: PropertyDetailData) => {
  if (typeof property.description === "string") {
    return toText(property.description);
  }

  return (
    toText(property.description?.value) ||
    toText(property.description?.text) ||
    toText(property.description?.body) ||
    toText(property.description?.summary)
  );
};

export const getPropertyHighlights = (property: PropertyDetailData) => {
  if (typeof property.description === "string") {
    return [];
  }

  return (property.description?.highlighted || [])
    .map(toText)
    .filter(Boolean);
};

export const buildPropertyDescriptionFallback = (
  property: PropertyDetailData,
) => {
  const title = getTitle(property);
  const type = toReadableLabel(
    toText(property.hostOption || property.category) || "property",
  ).toLowerCase();
  const location = getLocation(property);
  const capacity = property.capacityState || {};
  const roomText =
    capacity.bedrooms && capacity.bathrooms
      ? `${capacity.bedrooms} room${capacity.bedrooms === 1 ? "" : "s"} and ${capacity.bathrooms} bath${capacity.bathrooms === 1 ? "" : "s"}`
      : capacity.bedrooms
        ? `${capacity.bedrooms} room${capacity.bedrooms === 1 ? "" : "s"}`
        : capacity.Persons
          ? `space for ${capacity.Persons} guest${capacity.Persons === 1 ? "" : "s"}`
          : "";
  const features = [
    ...(property.amenities || []).slice(0, 3),
    ...getPropertyHighlights(property).slice(0, 2),
  ].map((item) => toReadableLabel(item).toLowerCase());
  const lead = location
    ? `${title} is a verified ${type} available in ${location}.`
    : `${title} is a verified ${type} available on AnganStay.`;
  const detailParts = [
    roomText ? `It includes ${roomText}` : "",
    features.length
      ? `with ${features.join(", ")} among its key features`
      : "",
  ].filter(Boolean);

  return detailParts.length
    ? `${lead} ${detailParts.join(" ")}. Contact the host to confirm availability, visit timing, and rental terms.`
    : `${lead} Contact the host to confirm availability, visit timing, and rental terms.`;
};

export const getPropertyDescriptionText = (property: PropertyDetailData) =>
  getDirectDescription(property) || buildPropertyDescriptionFallback(property);
