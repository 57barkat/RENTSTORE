import { interleavePromotedBuckets } from "./property-ranking.util";

const makeItems = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);

describe("property ranking interleaving", () => {
  it("follows the 4/3/3 pattern when all buckets are available", () => {
    const result = interleavePromotedBuckets(
      {
        featured: makeItems("F", 8),
        boosted: makeItems("B", 6),
        normal: makeItems("N", 6),
      },
      10,
    );

    expect(result).toEqual([
      "F-1",
      "F-2",
      "F-3",
      "F-4",
      "B-1",
      "B-2",
      "B-3",
      "N-1",
      "N-2",
      "N-3",
    ]);
  });

  it("fills missing featured slots from boosted and normal listings", () => {
    const result = interleavePromotedBuckets(
      {
        featured: [],
        boosted: makeItems("B", 5),
        normal: makeItems("N", 5),
      },
      10,
    );

    expect(result).toEqual([
      "B-1",
      "B-2",
      "B-3",
      "B-4",
      "B-5",
      "N-1",
      "N-2",
      "N-3",
      "N-4",
      "N-5",
    ]);
  });

  it("fills missing boosted slots from featured and normal listings", () => {
    const result = interleavePromotedBuckets(
      {
        featured: makeItems("F", 4),
        boosted: [],
        normal: makeItems("N", 6),
      },
      10,
    );

    expect(result).toEqual([
      "F-1",
      "F-2",
      "F-3",
      "F-4",
      "N-1",
      "N-2",
      "N-3",
      "N-4",
      "N-5",
      "N-6",
    ]);
  });

  it("returns only normal listings when promoted buckets are empty", () => {
    const result = interleavePromotedBuckets(
      {
        featured: [],
        boosted: [],
        normal: makeItems("N", 4),
      },
      10,
    );

    expect(result).toEqual(["N-1", "N-2", "N-3", "N-4"]);
  });

  it("keeps page 1 and page 2 stable from the same interleaved order", () => {
    const interleaved = interleavePromotedBuckets(
      {
        featured: makeItems("F", 8),
        boosted: makeItems("B", 8),
        normal: makeItems("N", 8),
      },
      20,
    );

    expect(interleaved.slice(0, 10)).toEqual([
      "F-1",
      "F-2",
      "F-3",
      "F-4",
      "B-1",
      "B-2",
      "B-3",
      "N-1",
      "N-2",
      "N-3",
    ]);
    expect(interleaved.slice(10, 20)).toEqual([
      "F-5",
      "F-6",
      "F-7",
      "F-8",
      "B-4",
      "B-5",
      "B-6",
      "N-4",
      "N-5",
      "N-6",
    ]);
  });

  it("preserves price ascending order inside each bucket", () => {
    const result = interleavePromotedBuckets(
      {
        featured: ["F-100", "F-200"],
        boosted: ["B-300", "B-400"],
        normal: ["N-500", "N-600"],
      },
      6,
    );

    expect(result).toEqual(["F-100", "F-200", "B-300", "B-400", "N-500", "N-600"]);
  });

  it("preserves newest order inside each bucket", () => {
    const result = interleavePromotedBuckets(
      {
        featured: ["F-new", "F-old"],
        boosted: ["B-new", "B-old"],
        normal: ["N-new", "N-old"],
      },
      6,
    );

    expect(result).toEqual(["F-new", "F-old", "B-new", "B-old", "N-new", "N-old"]);
  });
});
