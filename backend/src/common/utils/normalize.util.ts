export const normalizeText = (value?: string): string => {
  if (!value || typeof value !== "string") return "";

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\-\/]/g, "")
    .toLowerCase();
};
