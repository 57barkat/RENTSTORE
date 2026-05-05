import {
  buildDashboardActivityBuckets,
  getDashboardActivityWindow,
  normalizeDashboardActivityRange,
} from "./admin-dashboard-range.util";

describe("admin dashboard activity range utils", () => {
  it("defaults unsupported values to 7 days", () => {
    expect(normalizeDashboardActivityRange()).toBe(7);
    expect(normalizeDashboardActivityRange("7")).toBe(7);
    expect(normalizeDashboardActivityRange("999")).toBe(7);
  });

  it("accepts the 30-day range explicitly", () => {
    expect(normalizeDashboardActivityRange("30")).toBe(30);
    expect(normalizeDashboardActivityRange(30)).toBe(30);
  });

  it("builds a full 7-day window including today", () => {
    const now = new Date("2026-05-04T10:15:00.000Z");
    const { start, end } = getDashboardActivityWindow(7, now);

    expect(start.toISOString()).toBe("2026-04-28T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-05-04T23:59:59.999Z");
  });

  it("builds calendar-day buckets for 30 days", () => {
    const now = new Date("2026-05-04T10:15:00.000Z");
    const buckets = buildDashboardActivityBuckets(30, now);

    expect(buckets).toHaveLength(30);
    expect(buckets[0]).toMatchObject({
      key: "2026-04-05",
      name: "Apr 5",
      fullLabel: "Apr 5, 2026",
    });
    expect(buckets[29]).toMatchObject({
      key: "2026-05-04",
      name: "May 4",
      fullLabel: "May 4, 2026",
    });
  });
});
