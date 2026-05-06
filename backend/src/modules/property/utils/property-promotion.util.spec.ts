import {
  getPromotionStatusLabel,
  isBoostedPromotionActive,
  isFeaturedPromotionActive,
  resolvePromotionWeight,
} from "./property-promotion.util";

describe("property promotion state helpers", () => {
  const now = new Date("2026-05-05T00:00:00.000Z");

  it("expired featured resets to normal state", () => {
    const property = {
      featured: true,
      featuredUntil: "2026-05-01T00:00:00.000Z",
      sortWeight: 1,
    };

    expect(isFeaturedPromotionActive(property, now)).toBe(false);
    expect(resolvePromotionWeight(property, now)).toBe(1);
    expect(getPromotionStatusLabel(property, now)).toBe("Expired");
  });

  it("expired boosted resets to normal state", () => {
    const property = {
      isBoosted: true,
      boostedUntil: "2026-05-01T00:00:00.000Z",
      sortWeight: 1,
    };

    expect(isBoostedPromotionActive(property, now)).toBe(false);
    expect(resolvePromotionWeight(property, now)).toBe(1);
    expect(getPromotionStatusLabel(property, now)).toBe("Expired");
  });

  it("preserves active featured listings", () => {
    const property = {
      featured: true,
      featuredUntil: "2026-05-10T00:00:00.000Z",
      sortWeight: 3,
    };

    expect(isFeaturedPromotionActive(property, now)).toBe(true);
    expect(resolvePromotionWeight(property, now)).toBe(3);
    expect(getPromotionStatusLabel(property, now)).toBe("Featured Active");
  });

  it("preserves active boosted listings", () => {
    const property = {
      isBoosted: true,
      boostedUntil: "2026-05-10T00:00:00.000Z",
      sortWeight: 2,
    };

    expect(isBoostedPromotionActive(property, now)).toBe(true);
    expect(resolvePromotionWeight(property, now)).toBe(2);
    expect(getPromotionStatusLabel(property, now)).toBe("Boosted Active");
  });

  it("prefers featured priority when both featured and boosted are active", () => {
    const property = {
      featured: true,
      featuredUntil: "2026-05-10T00:00:00.000Z",
      isBoosted: true,
      boostedUntil: "2026-05-10T00:00:00.000Z",
      sortWeight: 3,
    };

    expect(resolvePromotionWeight(property, now)).toBe(3);
    expect(getPromotionStatusLabel(property, now)).toBe("Featured Active");
  });

  it("falls back to active boosted priority when featured is expired but boosted is still active", () => {
    const property = {
      featured: true,
      featuredUntil: "2026-05-01T00:00:00.000Z",
      isBoosted: true,
      boostedUntil: "2026-05-10T00:00:00.000Z",
      sortWeight: 3,
    };

    expect(isFeaturedPromotionActive(property, now)).toBe(false);
    expect(isBoostedPromotionActive(property, now)).toBe(true);
    expect(resolvePromotionWeight(property, now)).toBe(2);
    expect(getPromotionStatusLabel(property, now)).toBe("Boosted Active");
  });
});
