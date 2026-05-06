export interface PromotionStateLike {
  featured?: boolean;
  featuredUntil?: string | Date | null;
  isBoosted?: boolean;
  boosted?: boolean;
  boostedUntil?: string | Date | null;
  sortWeight?: number | null;
  views?: number | null;
  impressions?: number | null;
  promotionStatusLabel?: string | null;
}

const toDate = (value?: string | Date | null) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const isActiveFeaturedPromotion = (
  property: PromotionStateLike,
  now: Date = new Date(),
) => {
  if (!property.featured) {
    return false;
  }

  const featuredUntil = toDate(property.featuredUntil);
  return !featuredUntil || featuredUntil.getTime() >= now.getTime();
};

export const isActiveBoostedPromotion = (
  property: PromotionStateLike,
  now: Date = new Date(),
) => {
  if (!(property.isBoosted || property.boosted)) {
    return false;
  }

  const boostedUntil = toDate(property.boostedUntil);
  return !boostedUntil || boostedUntil.getTime() >= now.getTime();
};

export const getPromotionStatusLabel = (
  property: PromotionStateLike,
  now: Date = new Date(),
) => {
  if (isActiveFeaturedPromotion(property, now)) {
    return "Featured Active";
  }

  if (isActiveBoostedPromotion(property, now)) {
    return "Boosted Active";
  }

  if (property.featured || property.isBoosted || property.boosted) {
    return "Expired";
  }

  return "Normal";
};

export const formatPromotionDate = (value?: string | Date | null) => {
  const parsed = toDate(value);
  return parsed ? parsed.toLocaleDateString() : "Not set";
};

export const getCtr = (property: PromotionStateLike) => {
  const impressions = property.impressions ?? 0;
  const views = property.views ?? 0;

  if (impressions <= 0) {
    return 0;
  }

  return (views / impressions) * 100;
};
