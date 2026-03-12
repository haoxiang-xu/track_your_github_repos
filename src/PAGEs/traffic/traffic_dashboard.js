import {
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ConfigContext } from "../../CONTAINERs/config/context";
import { useIndexedStorage } from "../../BUILTIN_COMPONENTs/mini_react/mini_storage";
import { fetchUser, fetchAllTraffic } from "./services/github_api";

import TokenInput from "./components/token_input";
import RepoSelector from "./components/repo_selector";
import TrafficChart from "./components/traffic_chart";
import StatCard from "./components/stat_card";
import ReferrersTable from "./components/referrers_table";
import PopularPathsTable from "./components/popular_paths_table";
import SegmentedButton from "../../BUILTIN_COMPONENTs/input/segmented_button";
import Button from "../../BUILTIN_COMPONENTs/input/button";
import ArcSpinner from "../../BUILTIN_COMPONENTs/spinner/arc_spinner";

/* ─────────────────────────────────────────────────────────
   Traffic Dashboard — main page
   ──────────────────────────────────────────────────────── */

const RANGE_OPTIONS = ["7d", "14d", "30d", "90d", "All"];

/* helper: merge incoming traffic into stored data */
function mergeTimeSeries(stored = [], incoming = []) {
  const map = new Map();
  for (const entry of stored) map.set(entry.timestamp, entry);
  for (const entry of incoming) map.set(entry.timestamp, entry);
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
}

const TrafficDashboard = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  /* ── persistent state ── */
  const [pat, setPat] = useIndexedStorage("github_pat", "");
  const [selectedRepos, setSelectedRepos] = useIndexedStorage(
    "github_selected_repos",
    [],
  );
  const [allTrafficData, setAllTrafficData] = useIndexedStorage(
    "github_traffic_data",
    {},
  );

  /* ── ephemeral state ── */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchProgress, setFetchProgress] = useState("");
  const [range, setRange] = useState("All");
  const [activeRepo, setActiveRepo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── auto-reconnect on load if PAT exists ── */
  const reconnected = useRef(false);
  useEffect(() => {
    if (pat && !user && !reconnected.current) {
      reconnected.current = true;
      fetchUser(pat)
        .then((u) => setUser(u))
        .catch(() => {
          /* stale token – do nothing */
        });
    }
  }, [pat, user]);

  /* Auto-select first repo if none active */
  useEffect(() => {
    if (!activeRepo && selectedRepos?.length > 0) {
      setActiveRepo(selectedRepos[0]);
    }
  }, [selectedRepos, activeRepo]);

  /* ── fetch all traffic data ── */
  const handleRefresh = useCallback(async () => {
    if (!pat || !selectedRepos?.length) return;
    setLoading(true);
    const newData = { ...allTrafficData };
    for (let i = 0; i < selectedRepos.length; i++) {
      const fullName = selectedRepos[i];
      const [owner, repo] = fullName.split("/");
      setFetchProgress(`${i + 1}/${selectedRepos.length}  ${repo}`);
      try {
        const traffic = await fetchAllTraffic(pat, owner, repo);
        const prev = newData[fullName] || {};
        newData[fullName] = {
          views: mergeTimeSeries(prev.views || [], traffic.views?.views || []),
          clones: mergeTimeSeries(
            prev.clones || [],
            traffic.clones?.clones || [],
          ),
          referrers: traffic.referrers || [],
          paths: traffic.paths || [],
          lastFetched: new Date().toISOString(),
        };
      } catch (e) {
        console.warn(`Failed to fetch traffic for ${fullName}:`, e);
      }
    }
    setAllTrafficData(newData);
    setLoading(false);
    setFetchProgress("");
  }, [pat, selectedRepos, allTrafficData, setAllTrafficData]);

  /* ── active repo data ── */
  const repoData = useMemo(() => {
    if (!activeRepo || !allTrafficData) return null;
    return allTrafficData[activeRepo] || null;
  }, [activeRepo, allTrafficData]);

  /* ── compute stats ── */
  const stats = useMemo(() => {
    if (!repoData)
      return { totalViews: 0, uniqueViews: 0, totalClones: 0, uniqueClones: 0 };
    const sumField = (arr, key) =>
      (arr || []).reduce((s, d) => s + (d[key] || 0), 0);
    return {
      totalViews: sumField(repoData.views, "count"),
      uniqueViews: sumField(repoData.views, "uniques"),
      totalClones: sumField(repoData.clones, "count"),
      uniqueClones: sumField(repoData.clones, "uniques"),
    };
  }, [repoData]);

  /* ── delta (last 14d vs prev 14d) ── */
  const deltas = useMemo(() => {
    if (!repoData?.views?.length) return {};
    const now = new Date();
    const d14 = new Date(now);
    d14.setDate(d14.getDate() - 14);
    const d28 = new Date(now);
    d28.setDate(d28.getDate() - 28);

    const sumRange = (arr, key, from, to) =>
      (arr || [])
        .filter((d) => {
          const t = new Date(d.timestamp);
          return t >= from && t < to;
        })
        .reduce((s, d) => s + (d[key] || 0), 0);

    const viewsRecent = sumRange(repoData.views, "count", d14, now);
    const viewsPrev = sumRange(repoData.views, "count", d28, d14);
    const clonesRecent = sumRange(repoData.clones, "count", d14, now);
    const clonesPrev = sumRange(repoData.clones, "count", d28, d14);

    return {
      viewsDelta: viewsPrev ? viewsRecent - viewsPrev : null,
      clonesDelta: clonesPrev ? clonesRecent - clonesPrev : null,
    };
  }, [repoData]);

  /* ── colors ── */
  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)";
  const pageBg = isDark ? "#0f0f0f" : "#fafafa";
  const sidebarBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)";
  const sidebarBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        fontFamily,
        color: baseColor,
        backgroundColor: pageBg,
        overflow: "hidden",
      }}
    >
      {/* ═══════════════════════════════════════════════════
          SIDEBAR
         ═══════════════════════════════════════════════════ */}
      <div
        style={{
          width: sidebarOpen ? 300 : 0,
          minWidth: sidebarOpen ? 300 : 0,
          borderRight: sidebarOpen ? `1px solid ${sidebarBorder}` : "none",
          background: sidebarBg,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.25s, min-width 0.25s",
        }}
      >
        <div
          style={{
            padding: "24px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* branding */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: baseColor,
            }}
          >
            GitHub Traffic
          </div>

          {/* token */}
          <TokenInput pat={pat} setPat={setPat} user={user} setUser={setUser} />

          {/* repos */}
          <RepoSelector
            pat={pat}
            user={user}
            selectedRepos={selectedRepos || []}
            setSelectedRepos={setSelectedRepos}
          />

          {/* refresh */}
          {user && selectedRepos?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button
                label={loading ? undefined : "Fetch Traffic"}
                prefix_icon={loading ? undefined : "arrow_down"}
                onClick={handleRefresh}
                disabled={loading}
                style={{ root: { fontSize: 13 } }}
              />
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ArcSpinner style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 11, color: mutedColor }}>
                    {fetchProgress}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT
         ═══════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── top bar ── */}
        <div
          style={{
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${sidebarBorder}`,
            flexWrap: "wrap",
          }}
        >
          {/* sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: mutedColor,
              fontSize: 18,
              padding: "2px 4px",
              borderRadius: 4,
              lineHeight: 1,
            }}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          {/* repo tabs */}
          {selectedRepos?.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
              {selectedRepos.map((r) => {
                const name = r.split("/")[1];
                const isActive = r === activeRepo;
                return (
                  <button
                    key={r}
                    onClick={() => setActiveRepo(r)}
                    style={{
                      background: isActive
                        ? isDark
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(0,0,0,0.07)"
                        : "transparent",
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontFamily,
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? baseColor : mutedColor,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* range selector */}
          <SegmentedButton
            options={RANGE_OPTIONS}
            value={range}
            on_change={setRange}
            style={{ fontSize: 12 }}
          />
        </div>

        {/* ── scrollable content area ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
          }}
        >
          {!user ? (
            /* ── empty state ── */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 16,
                opacity: 0.5,
              }}
            >
              <div style={{ fontSize: 48 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>
                GitHub Traffic Tracker
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: mutedColor,
                  textAlign: "center",
                  maxWidth: 340,
                }}
              >
                Connect your GitHub Personal Access Token to start tracking
                traffic data. Data accumulates over time, going beyond the
                14-day limit.
              </div>
            </div>
          ) : !repoData ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 12,
                opacity: 0.5,
              }}
            >
              <div style={{ fontSize: 14, color: mutedColor }}>
                Select repos and click "Fetch Traffic" to start
              </div>
            </div>
          ) : (
            /* ── dashboard content ── */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 28,
                maxWidth: 960,
              }}
            >
              {/* stat cards */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <StatCard
                  label="Views"
                  value={stats.totalViews}
                  delta={deltas.viewsDelta}
                  deltaLabel="vs prev 14d"
                  icon="👁"
                />
                <StatCard
                  label="Unique Visitors"
                  value={stats.uniqueViews}
                  icon="🧑"
                />
                <StatCard
                  label="Clones"
                  value={stats.totalClones}
                  delta={deltas.clonesDelta}
                  deltaLabel="vs prev 14d"
                  icon="📦"
                />
                <StatCard
                  label="Unique Cloners"
                  value={stats.uniqueClones}
                  icon="🔧"
                />
              </div>

              {/* charts */}
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 16,
                  padding: "24px 24px 16px",
                }}
              >
                <TrafficChart
                  data={repoData.views}
                  title="Page Views"
                  range={range === "All" ? "all" : range.toLowerCase()}
                  height={240}
                />
              </div>

              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 16,
                  padding: "24px 24px 16px",
                }}
              >
                <TrafficChart
                  data={repoData.clones}
                  title="Git Clones"
                  range={range === "All" ? "all" : range.toLowerCase()}
                  height={240}
                  color1={isDark ? "#86efac" : "#22c55e"}
                  color2={isDark ? "#fbbf24" : "#d97706"}
                />
              </div>

              {/* tables side by side */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 16,
                    padding: 22,
                  }}
                >
                  <ReferrersTable data={repoData.referrers} />
                </div>
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 16,
                    padding: 22,
                  }}
                >
                  <PopularPathsTable data={repoData.paths} />
                </div>
              </div>

              {/* last fetched note */}
              {repoData.lastFetched && (
                <div
                  style={{
                    fontSize: 11,
                    color: mutedColor,
                    textAlign: "right",
                  }}
                >
                  Last fetched:{" "}
                  {new Date(repoData.lastFetched).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficDashboard;
