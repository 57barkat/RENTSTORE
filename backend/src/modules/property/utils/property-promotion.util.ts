export type PromotionWeight = 1 | 2 | 3;

type PromotionLike = {
  featured?: boolean | null;
  featuredUntil?: Date | string | null;
  isBoosted?: boolean | null;
  boostedUntil?: Date | string | null;
  sortWeight?: number | null;
};

const toDate = (value?: Date | string | null) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const hasFutureExpiry = (
  value?: Date | string | null,
  now: Date = new Date(),
) => {
  const date = toDate(value);
  return date ? date.getTime() >= now.getTime() : true;
};

export const isFeaturedPromotionActive = (
  property: PromotionLike,
  now: Date = new Date(),
) => Boolean(property.featured) && hasFutureExpiry(property.featuredUntil, now);

export const isBoostedPromotionActive = (
  property: PromotionLike,
  now: Date = new Date(),
) => Boolean(property.isBoosted) && hasFutureExpiry(property.boostedUntil, now);

export const resolvePromotionWeight = (
  property: PromotionLike,
  now: Date = new Date(),
): PromotionWeight => {
  if (isFeaturedPromotionActive(property, now)) {
    return 3;
  }

  if (isBoostedPromotionActive(property, now)) {
    return 2;
  }

  return 1;
};

export const getPromotionStatusLabel = (
  property: PromotionLike,
  now: Date = new Date(),
) => {
  const featuredActive = isFeaturedPromotionActive(property, now);
  const boostedActive = isBoostedPromotionActive(property, now);

  if (featuredActive) {
    return "Featured Active";
  }

  if (boostedActive) {
    return "Boosted Active";
  }

  if (property.featured || property.isBoosted) {
    return "Expired";
  }

  return "Normal";
};
