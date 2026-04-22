export const normalizeText = (value?: string | null): string => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const normalizeAddressSearch = normalizeText;
export const normalizeAreaSearch = normalizeText;

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const cleanDisplayValue = (value?: string | null): string => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
};

export const buildFlexibleAreaRegex = (
  value?: string | null,
): RegExp | null => {
  const normalized = normalizeAreaSearch(value);
  if (!normalized) {
    return null;
  }

  return new RegExp(
    `^${normalized.split("").map(escapeRegex).join("[\\\\s\\\\-\\\\/]*")}`,
    "i",
  );
};

export const formatCanonicalArea = (value?: string | null): string => {
  const cleaned = cleanDisplayValue(value);
  if (!cleaned) {
    return "";
  }

  const sectorLikeMatch = cleaned.match(
    /^([a-z]+)\s*[-/ ]?\s*(\d+)(?:\s*[-/ ]?\s*([a-z0-9]+))?$/i,
  );

  if (sectorLikeMatch) {
    const [, prefix, number, suffix] = sectorLikeMatch;
    return [prefix.toUpperCase(), number, suffix?.toUpperCase()]
      .filter(Boolean)
      .join("-");
  }

  return cleaned;
};

export const buildPrefixRegex = (
  normalizedValue?: string | null,
): RegExp | null => {
  const normalized = normalizeAddressSearch(normalizedValue);
  if (!normalized) {
    return null;
  }

  return new RegExp(`^${escapeRegex(normalized)}`, "i");
};

export const buildContainsRegex = (
  normalizedValue?: string | null,
): RegExp | null => {
  const normalized = normalizeAddressSearch(normalizedValue);
  if (!normalized) {
    return null;
  }

  return new RegExp(escapeRegex(normalized), "i");
};
