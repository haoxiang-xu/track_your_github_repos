const RANGE_DAY_MAP = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

const toDate = (value) => {
  if (value instanceof Date) return new Date(value);
  return new Date(value || Date.now());
};

const startOfUtcDay = (value) => {
  const date = toDate(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const endOfUtcDay = (value) => {
  const date = toDate(value);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
};

const shiftUtcDays = (value, offset) => {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
};

const sortTimeSeries = (series = []) =>
  [...series].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

const sumEntries = (entries = [], key) =>
  entries.reduce((sum, entry) => sum + (Number(entry?.[key]) || 0), 0);

const filterSeriesBetween = (
  series = [],
  { from = null, to = null, includeStart = true, includeEnd = true } = {},
) =>
  sortTimeSeries(series).filter((entry) => {
    const timestamp = new Date(entry.timestamp);
    if (Number.isNaN(timestamp.getTime())) return false;

    if (from) {
      const startsBefore = includeStart ? timestamp < from : timestamp <= from;
      if (startsBefore) return false;
    }

    if (to) {
      const endsAfter = includeEnd ? timestamp > to : timestamp >= to;
      if (endsAfter) return false;
    }

    return true;
  });

export function normalizeRange(range) {
  if (!range) return "all";
  const normalized = String(range).toLowerCase();
  if (normalized === "all") return "all";
  return RANGE_DAY_MAP[normalized] ? normalized : "all";
}

export function getRangeDays(range) {
  const normalized = normalizeRange(range);
  return RANGE_DAY_MAP[normalized] || null;
}

export function getRangeWindow(range, now = new Date()) {
  const normalized = normalizeRange(range);
  const days = getRangeDays(normalized);
  if (!days) return null;

  const windowEnd = endOfUtcDay(now);
  const windowStart = shiftUtcDays(startOfUtcDay(now), -(days - 1));

  return {
    start: windowStart,
    end: windowEnd,
    days,
    range: normalized,
  };
}

export function filterSeriesByRange(series = [], range, now = new Date()) {
  const normalized = normalizeRange(range);
  if (normalized === "all") return sortTimeSeries(series);

  const window = getRangeWindow(normalized, now);
  return filterSeriesBetween(series, {
    from: window?.start,
    to: window?.end,
  });
}

export function sumSeriesField(series = [], key, range, now = new Date()) {
  return sumEntries(filterSeriesByRange(series, range, now), key);
}

export function getRangeDelta(series = [], key, range, now = new Date()) {
  const window = getRangeWindow(range, now);
  if (!window) return null;

  const previousStart = shiftUtcDays(window.start, -window.days);
  const previousEnd = new Date(window.start.getTime() - 1);
  const previousEntries = filterSeriesBetween(series, {
    from: previousStart,
    to: previousEnd,
  });

  if (!previousEntries.length) return null;

  const currentEntries = filterSeriesBetween(series, {
    from: window.start,
    to: window.end,
  });

  return sumEntries(currentEntries, key) - sumEntries(previousEntries, key);
}

export function getRangeDeltaLabel(range) {
  const normalized = normalizeRange(range);
  return normalized === "all" ? null : `vs prev ${normalized}`;
}

export function mergeTimeSeries(stored = [], incoming = []) {
  const byTimestamp = new Map();

  for (const entry of stored) {
    byTimestamp.set(entry.timestamp, entry);
  }

  for (const entry of incoming) {
    byTimestamp.set(entry.timestamp, entry);
  }

  return sortTimeSeries(Array.from(byTimestamp.values()));
}

export function hasRepoTrafficData(repoData) {
  return Boolean(
    repoData &&
      (repoData.lastFetched ||
        repoData.views?.length ||
        repoData.clones?.length ||
        repoData.referrers?.length ||
        repoData.paths?.length),
  );
}

export function isRepoTrafficStale(
  repoData,
  ttlMs,
  now = Date.now(),
) {
  if (!repoData?.lastFetched) return true;

  const lastFetchedAt = new Date(repoData.lastFetched).getTime();
  if (Number.isNaN(lastFetchedAt)) return true;

  const currentTime = now instanceof Date ? now.getTime() : Number(now);
  return currentTime - lastFetchedAt >= ttlMs;
}
