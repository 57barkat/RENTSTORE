export const normalizeText = (value?: string): string | undefined => {
  if (!value || typeof value !== "string") return undefined;

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\-\/]/g, "")
    .toLowerCase();
};
