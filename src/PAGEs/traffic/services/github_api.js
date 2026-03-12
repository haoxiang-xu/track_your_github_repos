/* ─────────────────────────────────────────────────────────
   GitHub REST API v3 – Traffic helper layer
   All calls require a PAT with `repo` scope.
   ──────────────────────────────────────────────────────── */

const API = "https://api.github.com";

const headers = (token) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

/* ── helpers ────────────────────────────────────────────── */

const json = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `GitHub API ${res.status}`);
    err.status = res.status;
    err.rateRemaining = res.headers.get("x-ratelimit-remaining");
    throw err;
  }
  return res.json();
};

/* ── public API ─────────────────────────────────────────── */

/** Validate token & return the authenticated user */
export async function fetchUser(token) {
  const res = await fetch(`${API}/user`, { headers: headers(token) });
  return json(res);
}

/** List repos the authenticated user can push to (needed for traffic) */
export async function fetchRepos(
  token,
  { perPage = 100, sort = "pushed" } = {},
) {
  let page = 1;
  let all = [];
  while (true) {
    const res = await fetch(
      `${API}/user/repos?per_page=${perPage}&sort=${sort}&page=${page}&affiliation=owner`,
      { headers: headers(token) },
    );
    const batch = await json(res);
    all = all.concat(batch);
    if (batch.length < perPage) break;
    page++;
  }
  return all;
}

/** 14-day traffic views  →  { count, uniques, views: [{ timestamp, count, uniques }] } */
export async function fetchTrafficViews(token, owner, repo) {
  const res = await fetch(`${API}/repos/${owner}/${repo}/traffic/views`, {
    headers: headers(token),
  });
  return json(res);
}

/** 14-day traffic clones →  { count, uniques, clones: [{ timestamp, count, uniques }] } */
export async function fetchTrafficClones(token, owner, repo) {
  const res = await fetch(`${API}/repos/${owner}/${repo}/traffic/clones`, {
    headers: headers(token),
  });
  return json(res);
}

/** Top 10 referrers →  [{ referrer, count, uniques }] */
export async function fetchReferrers(token, owner, repo) {
  const res = await fetch(
    `${API}/repos/${owner}/${repo}/traffic/popular/referrers`,
    { headers: headers(token) },
  );
  return json(res);
}

/** Top 10 popular content paths →  [{ path, title, count, uniques }] */
export async function fetchPopularPaths(token, owner, repo) {
  const res = await fetch(
    `${API}/repos/${owner}/${repo}/traffic/popular/paths`,
    { headers: headers(token) },
  );
  return json(res);
}

/** Convenience – pull all traffic data for one repo in parallel */
export async function fetchAllTraffic(token, owner, repo) {
  const [views, clones, referrers, paths] = await Promise.all([
    fetchTrafficViews(token, owner, repo),
    fetchTrafficClones(token, owner, repo),
    fetchReferrers(token, owner, repo),
    fetchPopularPaths(token, owner, repo),
  ]);
  return { views, clones, referrers, paths };
}
