type PromotionLike = {
  featured?: boolean | null;
  featuredUntil?: string | Date | null;
  isBoosted?: boolean | null;
  boostedUntil?: string | Date | null;
};

const toDate = (value?: string | Date | null) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const hasFutureExpiry = (value?: string | Date | null, now: Date = new Date()) => {
  const date = toDate(value);
  return date ? date.getTime() >= now.getTime() : true;
};

export const isActiveFeaturedPromotion = (
  property: PromotionLike,
  now: Date = new Date(),
) => Boolean(property.featured) && hasFutureExpiry(property.featuredUntil, now);

export const isActiveBoostedPromotion = (
  property: PromotionLike,
  now: Date = new Date(),
) => Boolean(property.isBoosted) && hasFutureExpiry(property.boostedUntil, now);

export const getPromotionLabel = (
  property: PromotionLike,
  now: Date = new Date(),
) => {
  if (isActiveFeaturedPromotion(property, now)) {
    return "Featured Active";
  }

  if (isActiveBoostedPromotion(property, now)) {
    return "Boosted Active";
  }

  if (property.featured || property.isBoosted) {
    return "Expired";
  }

  return "Normal";
};

export const getPromotionExpiryText = (value?: string | Date | null) => {
  const date = toDate(value);
  return date ? date.toLocaleDateString() : null;
};

export const getPromotionTimeLeft = (value?: string | Date | null) => {
  const date = toDate(value);
  if (!date) {
    return null;
  }

  const diff = date.getTime() - Date.now();
  if (diff <= 0) {
    return null;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
};
