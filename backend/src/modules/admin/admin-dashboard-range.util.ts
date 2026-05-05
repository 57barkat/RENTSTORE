export const DASHBOARD_ACTIVITY_RANGES = [7, 30] as const;

export type DashboardActivityRange =
  (typeof DASHBOARD_ACTIVITY_RANGES)[number];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const normalizeDashboardActivityRange = (
  value?: string | number,
): DashboardActivityRange => {
  if (value === 30 || value === "30") {
    return 30;
  }

  return 7;
};

export const getDashboardActivityWindow = (
  range: DashboardActivityRange,
  now: Date = new Date(),
) => {
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (range - 1));

  return { start, end };
};

export const buildDashboardActivityBuckets = (
  range: DashboardActivityRange,
  now: Date = new Date(),
) => {
  const { start } = getDashboardActivityWindow(range, now);

  return Array.from({ length: range }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_IN_MS);
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      name:
        range === 30
          ? date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })
          : date.toLocaleDateString("en-US", {
              weekday: "short",
              timeZone: "UTC",
            }),
      fullLabel: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    };
  });
};
