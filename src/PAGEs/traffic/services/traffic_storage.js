/* ─────────────────────────────────────────────────────────
   Traffic data accumulation & persistence layer.
   
   Uses useIndexedStorage to keep historical traffic data
   in IndexedDB so it survives past the 14-day GitHub window.
   ──────────────────────────────────────────────────────── */

import { useCallback, useRef } from "react";
import { useIndexedStorage } from "../../BUILTIN_COMPONENTs/mini_react/mini_storage";

/* ── merge helper ───────────────────────────────────────── */

/**
 * Merge a fresh 14-day array from GitHub into an existing historical array.
 * Each entry has { timestamp (ISO string), count, uniques }.
 * We de-duplicate by timestamp and keep the newest value for each date.
 */
function mergeTimeSeries(stored = [], incoming = []) {
  const map = new Map();
  for (const entry of stored) {
    map.set(entry.timestamp, entry);
  }
  for (const entry of incoming) {
    // GitHub always gives the latest value for each day — overwrite
    map.set(entry.timestamp, entry);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
}

/* ── hook ────────────────────────────────────────────────── */

/**
 * useTrafficStorage(repoFullName)
 *
 * Returns helpers to persist and retrieve traffic history for a single repo.
 *
 * Storage keys:
 *   traffic:views:{owner/repo}
 *   traffic:clones:{owner/repo}
 *   traffic:referrers:{owner/repo}
 *   traffic:paths:{owner/repo}
 *   traffic:meta:{owner/repo}       – { lastFetched }
 */
export function useTrafficStorage(repoFullName) {
  const viewsKey = `traffic:views:${repoFullName}`;
  const clonesKey = `traffic:clones:${repoFullName}`;
  const referrersKey = `traffic:referrers:${repoFullName}`;
  const pathsKey = `traffic:paths:${repoFullName}`;
  const metaKey = `traffic:meta:${repoFullName}`;

  const [storedViews, setStoredViews] = useIndexedStorage(viewsKey, []);
  const [storedClones, setStoredClones] = useIndexedStorage(clonesKey, []);
  const [storedReferrers, setStoredReferrers] = useIndexedStorage(
    referrersKey,
    [],
  );
  const [storedPaths, setStoredPaths] = useIndexedStorage(pathsKey, []);
  const [meta, setMeta] = useIndexedStorage(metaKey, { lastFetched: null });

  /* We keep a ref to the latest stored series so the merge callback
     always reads the freshest state even if the hook hasn't re-rendered. */
  const viewsRef = useRef(storedViews);
  viewsRef.current = storedViews;
  const clonesRef = useRef(storedClones);
  clonesRef.current = storedClones;

  /**
   * Merge a freshly-fetched traffic payload into persistent storage.
   * @param {{ views, clones, referrers, paths }} data  – from fetchAllTraffic
   */
  const mergeTraffic = useCallback(
    (data) => {
      if (data.views?.views) {
        setStoredViews(mergeTimeSeries(viewsRef.current, data.views.views));
      }
      if (data.clones?.clones) {
        setStoredClones(mergeTimeSeries(clonesRef.current, data.clones.clones));
      }
      // Referrers & paths are snapshots — just replace
      if (data.referrers) setStoredReferrers(data.referrers);
      if (data.paths) setStoredPaths(data.paths);
      setMeta({ lastFetched: new Date().toISOString() });
    },
    [
      setStoredViews,
      setStoredClones,
      setStoredReferrers,
      setStoredPaths,
      setMeta,
    ],
  );

  return {
    views: storedViews,
    clones: storedClones,
    referrers: storedReferrers,
    paths: storedPaths,
    meta,
    mergeTraffic,
  };
}

/* ── PAT storage helper ─────────────────────────────────── */

export function usePatStorage() {
  const [pat, setPat, { removeValue }] = useIndexedStorage("github_pat", "");
  return { pat, setPat, clearPat: removeValue };
}

/* ── Selected repos storage ──────────────────────────────── */

export function useSelectedReposStorage() {
  const [repos, setRepos] = useIndexedStorage("github_selected_repos", []);
  return { repos, setRepos };
}
