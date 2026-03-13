import {
  filterSeriesByRange,
  getRangeDelta,
  getRangeDeltaLabel,
  mergeTimeSeries,
} from "./traffic_data";

const NOW = new Date("2026-03-12T12:00:00.000Z");

const makeDailyEntry = (day, count, uniques = count, month = 3) => ({
  timestamp: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00.000Z`,
  count,
  uniques,
});

describe("traffic_data helpers", () => {
  test("mergeTimeSeries overwrites duplicate timestamps and keeps ascending order", () => {
    const merged = mergeTimeSeries(
      [makeDailyEntry(8, 3), makeDailyEntry(10, 5)],
      [makeDailyEntry(9, 4), makeDailyEntry(10, 9)],
    );

    expect(merged).toEqual([
      makeDailyEntry(8, 3),
      makeDailyEntry(9, 4),
      makeDailyEntry(10, 9),
    ]);
  });

  test("filterSeriesByRange handles 7d/14d/30d/90d/all consistently", () => {
    const series = Array.from({ length: 20 }, (_, index) => {
      const entryDate = new Date(NOW);
      entryDate.setUTCDate(entryDate.getUTCDate() - (19 - index));

      return {
        timestamp: entryDate.toISOString(),
        count: index + 1,
        uniques: index + 1,
      };
    });

    expect(filterSeriesByRange(series, "7d", NOW)).toHaveLength(7);
    expect(filterSeriesByRange(series, "14d", NOW)).toHaveLength(14);
    expect(filterSeriesByRange(series, "30d", NOW)).toHaveLength(20);
    expect(filterSeriesByRange(series, "90d", NOW)).toHaveLength(20);
    expect(filterSeriesByRange(series, "all", NOW)).toHaveLength(20);
  });

  test("getRangeDelta compares against the previous same-length window", () => {
    const series = [
      makeDailyEntry(27, 2, 2, 2),
      makeDailyEntry(28, 2, 2, 2),
      makeDailyEntry(1, 2),
      makeDailyEntry(2, 2),
      makeDailyEntry(3, 2),
      makeDailyEntry(4, 2),
      makeDailyEntry(5, 2),
      makeDailyEntry(6, 5),
      makeDailyEntry(7, 5),
      makeDailyEntry(8, 5),
      makeDailyEntry(9, 5),
      makeDailyEntry(10, 5),
      makeDailyEntry(11, 5),
      makeDailyEntry(12, 5),
    ];

    expect(getRangeDelta(series, "count", "7d", NOW)).toBe(21);
  });

  test("getRangeDelta hides delta for all-range views", () => {
    const series = [makeDailyEntry(11, 3), makeDailyEntry(12, 4)];

    expect(getRangeDelta(series, "count", "all", NOW)).toBeNull();
    expect(getRangeDeltaLabel("all")).toBeNull();
  });
});
