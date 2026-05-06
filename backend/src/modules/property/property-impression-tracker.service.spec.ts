import { Logger } from "@nestjs/common";
import { PropertyImpressionTrackerService } from "./property-impression-tracker.service";

describe("PropertyImpressionTrackerService", () => {
  const bulkWrite = jest.fn();
  const service = new PropertyImpressionTrackerService({
    bulkWrite,
  } as never);

  beforeEach(() => {
    bulkWrite.mockReset();
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("counts duplicate ids correctly and ignores invalid ids", async () => {
    bulkWrite.mockResolvedValue(undefined);

    await service.queueImpressions([
      {
        _id: "6818e9d6abf15f6e843bf111",
        sortWeight: 3,
        featured: true,
      },
      {
        _id: "6818e9d6abf15f6e843bf111",
        sortWeight: 3,
        featured: true,
      },
      {
        _id: "invalid-id",
        sortWeight: 1,
      },
    ]);

    expect(bulkWrite).toHaveBeenCalledTimes(1);
    const operations = bulkWrite.mock.calls[0][0];
    expect(operations).toHaveLength(1);
    expect(operations[0].updateOne.update.$inc).toMatchObject({
      impressions: 2,
      featuredImpressions: 2,
      promotedImpressions: 2,
    });
  });

  it("increments featured, boosted, and normal counters separately", async () => {
    bulkWrite.mockResolvedValue(undefined);

    await service.queueImpressions([
      {
        _id: "6818e9d6abf15f6e843bf112",
        sortWeight: 3,
        featured: true,
      },
      {
        _id: "6818e9d6abf15f6e843bf113",
        sortWeight: 2,
        isBoosted: true,
      },
      {
        _id: "6818e9d6abf15f6e843bf114",
        sortWeight: 1,
      },
    ]);

    const increments = bulkWrite.mock.calls[0][0].map(
      (operation: { updateOne: { update: { $inc: Record<string, number> } } }) =>
        operation.updateOne.update.$inc,
    );

    expect(increments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          impressions: 1,
          featuredImpressions: 1,
          promotedImpressions: 1,
        }),
        expect.objectContaining({
          impressions: 1,
          boostedImpressions: 1,
          promotedImpressions: 1,
        }),
        expect.objectContaining({
          impressions: 1,
          normalImpressions: 1,
        }),
      ]),
    );
  });

  it("uses active promotion dates instead of stale sort weights", async () => {
    bulkWrite.mockResolvedValue(undefined);

    await service.queueImpressions([
      {
        _id: "6818e9d6abf15f6e843bf115",
        sortWeight: 3,
        featured: true,
        featuredUntil: "2026-05-01T00:00:00.000Z",
        isBoosted: true,
        boostedUntil: "2026-05-10T00:00:00.000Z",
      },
    ]);

    expect(bulkWrite.mock.calls[0][0][0].updateOne.update.$inc).toMatchObject({
      impressions: 1,
      boostedImpressions: 1,
      promotedImpressions: 1,
      featuredImpressions: 0,
    });
  });
});
