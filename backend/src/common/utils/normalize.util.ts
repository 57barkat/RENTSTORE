export const normalizeText = (value?: string | null): string => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const normalizeAddressSearch = normalizeText;

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
