export type RankedBuckets<T> = {
  featured: T[];
  boosted: T[];
  normal: T[];
};

type BucketName = keyof RankedBuckets<unknown>;

const PRIORITY_ORDER: BucketName[] = ["featured", "boosted", "normal"];
const SLOT_PATTERN: BucketName[] = [
  "featured",
  "featured",
  "featured",
  "featured",
  "boosted",
  "boosted",
  "boosted",
  "normal",
  "normal",
  "normal",
];

export const interleavePromotedBuckets = <T>(
  buckets: RankedBuckets<T>,
  targetCount: number,
) => {
  if (targetCount <= 0) {
    return [];
  }

  const indexes: Record<BucketName, number> = {
    featured: 0,
    boosted: 0,
    normal: 0,
  };

  const result: T[] = [];

  const takeNext = (preferred: BucketName) => {
    const order = [preferred, ...PRIORITY_ORDER.filter((name) => name !== preferred)];

    for (const bucketName of order) {
      const index = indexes[bucketName];
      if (index >= buckets[bucketName].length) {
        continue;
      }

      indexes[bucketName] += 1;
      return buckets[bucketName][index];
    }

    return undefined;
  };

  while (result.length < targetCount) {
    let addedThisCycle = false;

    for (const slot of SLOT_PATTERN) {
      if (result.length >= targetCount) {
        break;
      }

      const nextItem = takeNext(slot);
      if (!nextItem) {
        continue;
      }

      addedThisCycle = true;
      result.push(nextItem);
    }

    if (!addedThisCycle) {
      break;
    }
  }

  return result;
};
