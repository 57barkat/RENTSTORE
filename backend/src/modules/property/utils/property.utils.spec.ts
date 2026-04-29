import { PropertyService } from "../property.service";
import {
  buildCanonicalListingBaseFilter,
  buildMongoFilter,
} from "./property.utils";

describe("property search canonical filters", () => {
  it("builds the listing filter with canonical city, area, host option, and rent purpose rules", () => {
    const filter = buildMongoFilter({
      city: "ISLAMABAD",
      area: "g 11",
      hostOption: "home",
      purpose: "rent",
    });

    expect(filter).toMatchObject({
      status: true,
      isApproved: true,
      moderationStatus: "ACTIVE",
      hostOption: "home",
    });

    expect(Array.isArray(filter.$and)).toBe(true);

    const cityCondition = filter.$and.find(
      (condition: Record<string, any>) => condition["address.city"],
    );
    expect(cityCondition).toEqual({
      "address.city": {
        $regex: "^ISLAMABAD$",
        $options: "i",
      },
    });

    const rentCondition = filter.$and.find(
      (condition: Record<string, any>) =>
        Array.isArray(condition.$or) &&
        condition.$or.some((entry: Record<string, any>) => entry.monthlyRent),
    );
    expect(rentCondition).toEqual({
      $or: [
        { monthlyRent: { $gt: 0 } },
        { dailyRent: { $gt: 0 } },
        { weeklyRent: { $gt: 0 } },
      ],
    });

    const areaSearchCondition = filter.$and.find(
      (condition: Record<string, any>) =>
        Array.isArray(condition.$or) &&
        condition.$or.some((entry: Record<string, any>) => entry.area instanceof RegExp),
    );
    expect(areaSearchCondition).toBeDefined();
  });

  it("uses the same canonical base filter for popular locations and canonicalizes sector slugs", async () => {
    const aggregate = jest.fn().mockResolvedValue([
      { _id: { city: "Islamabad", area: "G-11" }, listingCount: 4 },
      { _id: { city: "islamabad", area: "g 11" }, listingCount: 3 },
      { _id: { city: "ISLAMABAD", area: "G13-1" }, listingCount: 2 },
      { _id: { city: "Islamabad", area: "F 10 4" }, listingCount: 1 },
    ]);

    const service = {
      propertyModel: { aggregate },
    } as unknown as PropertyService;

    const result = await PropertyService.prototype.getPopularLocations.call(
      service,
      {
        city: "Islamabad",
        propertyType: "home",
        purpose: "rent",
        limit: 8,
      },
    );

    expect(aggregate).toHaveBeenCalledTimes(1);
    const pipeline = aggregate.mock.calls[0][0];
    expect(pipeline[0].$match).toEqual(
      buildCanonicalListingBaseFilter({
        city: "Islamabad",
        hostOption: "home",
        purpose: "rent",
      }),
    );

    expect(result).toEqual([
      {
        area: "G-11",
        city: "Islamabad",
        propertyType: "home",
        count: 7,
        listingCount: 7,
        slug: "houses-for-rent-in-g-11-islamabad",
      },
      {
        area: "G-13-1",
        city: "Islamabad",
        propertyType: "home",
        count: 2,
        listingCount: 2,
        slug: "houses-for-rent-in-g-13-1-islamabad",
      },
      {
        area: "F-10-4",
        city: "Islamabad",
        propertyType: "home",
        count: 1,
        listingCount: 1,
        slug: "houses-for-rent-in-f-10-4-islamabad",
      },
    ]);
  });
});
