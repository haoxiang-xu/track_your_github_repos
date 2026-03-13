import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConfigContext } from "../../CONTAINERs/config/context";
import { useIndexedStorage } from "../../BUILTIN_COMPONENTs/mini_react/mini_storage";
import { fetchAllTraffic, fetchUser } from "./services/github_api";
import {
  getRangeDelta,
  getRangeDeltaLabel,
  hasRepoTrafficData,
  isRepoTrafficStale,
  mergeTimeSeries,
  normalizeRange,
  sumSeriesField,
} from "./services/traffic_data";
import { useGithubTokenStorage } from "./services/github_token_storage";
import RepoSelector from "./components/repo_selector";
import TrafficChart from "./components/traffic_chart";
import StatCard from "./components/stat_card";
import ReferrersTable from "./components/referrers_table";
import PopularPathsTable from "./components/popular_paths_table";
import SegmentedButton from "../../BUILTIN_COMPONENTs/input/segmented_button";
import Button from "../../BUILTIN_COMPONENTs/input/button";
import ArcSpinner from "../../BUILTIN_COMPONENTs/spinner/arc_spinner";
import { SettingsModal } from "./settings/settings_modal";

const RANGE_OPTIONS = ["7d", "14d", "30d", "90d", "All"];
const CACHE_TTL_MS = 60 * 60 * 1000;

const formatTimestamp = (value) => {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
};

const TrafficDashboard = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  const [pat, setPat, { clearPat, isLoading: patLoading }] =
    useGithubTokenStorage();
  const [selectedRepos, setSelectedRepos, { isLoading: selectedReposLoading }] =
    useIndexedStorage("github_selected_repos", []);
  const [allTrafficData, setAllTrafficData, { isLoading: trafficDataLoading }] =
    useIndexedStorage("github_traffic_data", {});

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchProgress, setFetchProgress] = useState("");
  const [range, setRange] = useState("All");
  const [activeRepo, setActiveRepo] = useState(null);
  const { sidebarOpen, setSidebarOpen } = useContext(ConfigContext);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [repoLoadingState, setRepoLoadingState] = useState({});
  const inFlightFetchesRef = useRef(new Map());

  const storageReady =
    !patLoading && !selectedReposLoading && !trafficDataLoading;

  const reconnected = useRef(false);
  useEffect(() => {
    if (patLoading) {
      return;
    }

    if (pat && !user && !reconnected.current) {
      reconnected.current = true;
      fetchUser(pat)
        .then((account) => setUser(account))
        .catch(() => {
          reconnected.current = false;
        });
    }

    if (!pat) {
      reconnected.current = false;
      setUser(null);
    }
  }, [pat, patLoading, user]);

  useEffect(() => {
    if (!selectedRepos?.length) {
      if (activeRepo) {
        setActiveRepo(null);
      }
      return;
    }

    if (!activeRepo || !selectedRepos.includes(activeRepo)) {
      setActiveRepo(selectedRepos[0]);
    }
  }, [activeRepo, selectedRepos]);

  const fetchRepoTraffic = useCallback(
    async (fullName) => {
      if (!pat || !fullName) {
        return null;
      }

      const inFlight = inFlightFetchesRef.current.get(fullName);
      if (inFlight) {
        return inFlight;
      }

      const [owner, repo] = fullName.split("/");

      const request = (async () => {
        setRepoLoadingState((prev) => ({ ...prev, [fullName]: true }));

        try {
          const traffic = await fetchAllTraffic(pat, owner, repo);

          setAllTrafficData((prev) => {
            const next = { ...(prev || {}) };
            const previousData = next[fullName] || {};

            next[fullName] = {
              views: mergeTimeSeries(
                previousData.views || [],
                traffic.views?.views || [],
              ),
              clones: mergeTimeSeries(
                previousData.clones || [],
                traffic.clones?.clones || [],
              ),
              referrers: traffic.referrers || [],
              paths: traffic.paths || [],
              lastFetched: new Date().toISOString(),
            };

            return next;
          });

          return traffic;
        } catch (error) {
          // Keep the current cache visible if a refresh fails.
          // eslint-disable-next-line no-console
          console.warn(`Failed to fetch traffic for ${fullName}:`, error);
          throw error;
        } finally {
          inFlightFetchesRef.current.delete(fullName);
          setRepoLoadingState((prev) => {
            if (!prev[fullName]) {
              return prev;
            }

            const next = { ...prev };
            delete next[fullName];
            return next;
          });
        }
      })();

      inFlightFetchesRef.current.set(fullName, request);
      return request;
    },
    [pat, setAllTrafficData],
  );

  const handleRefresh = useCallback(async () => {
    if (!pat || !selectedRepos?.length) {
      return;
    }

    setLoading(true);
    try {
      for (let index = 0; index < selectedRepos.length; index += 1) {
        const fullName = selectedRepos[index];
        const [, repoName] = fullName.split("/");
        setFetchProgress(`${index + 1}/${selectedRepos.length}  ${repoName}`);

        try {
          await fetchRepoTraffic(fullName);
        } catch (_error) {
          // Continue refreshing the remaining repos.
        }
      }
    } finally {
      setLoading(false);
      setFetchProgress("");
    }
  }, [fetchRepoTraffic, pat, selectedRepos]);

  useEffect(() => {
    if (!storageReady || !pat || !user || !activeRepo) {
      return;
    }

    const cachedRepoData = allTrafficData?.[activeRepo];
    const needsInitialFetch = !hasRepoTrafficData(cachedRepoData);
    const needsBackgroundRefresh = isRepoTrafficStale(
      cachedRepoData,
      CACHE_TTL_MS,
    );

    if (needsInitialFetch || needsBackgroundRefresh) {
      fetchRepoTraffic(activeRepo).catch(() => {
        // Keep showing cached data or placeholders.
      });
    }
  }, [activeRepo, allTrafficData, fetchRepoTraffic, pat, storageReady, user]);

  const repoData = useMemo(() => {
    if (!activeRepo || !allTrafficData) {
      return null;
    }
    return allTrafficData[activeRepo] || null;
  }, [activeRepo, allTrafficData]);

  const normalizedRange = useMemo(() => normalizeRange(range), [range]);
  const activeRepoLoading = Boolean(activeRepo && repoLoadingState[activeRepo]);
  const hasActiveRepoData = hasRepoTrafficData(repoData);
  const deltaLabel = useMemo(
    () => getRangeDeltaLabel(normalizedRange),
    [normalizedRange],
  );

  const stats = useMemo(() => {
    if (!repoData) {
      return {
        totalViews: 0,
        uniqueViews: 0,
        totalClones: 0,
        uniqueClones: 0,
      };
    }

    return {
      totalViews: sumSeriesField(repoData.views, "count", normalizedRange),
      uniqueViews: sumSeriesField(repoData.views, "uniques", normalizedRange),
      totalClones: sumSeriesField(repoData.clones, "count", normalizedRange),
      uniqueClones: sumSeriesField(repoData.clones, "uniques", normalizedRange),
    };
  }, [normalizedRange, repoData]);

  const deltas = useMemo(() => {
    if (!repoData) {
      return {};
    }

    return {
      viewsDelta: getRangeDelta(repoData.views, "count", normalizedRange),
      clonesDelta: getRangeDelta(repoData.clones, "count", normalizedRange),
    };
  }, [normalizedRange, repoData]);

  const handleClearLocalData = useCallback(() => {
    setSelectedRepos([]);
    setAllTrafficData({});
    setActiveRepo(null);
    setRange("All");
    setFetchProgress("");
    setRepoLoadingState({});
  }, [setAllTrafficData, setSelectedRepos]);

  const baseColor = isDark ? "rgba(255,255,255,0.92)" : "#232323";
  const mutedColor = isDark ? "rgba(255,255,255,0.52)" : "rgba(29, 29, 29, 0.56)";
  const subtleColor = isDark ? "rgba(255,255,255,0.34)" : "rgba(21,24,33,0.34)";
  const sidebarBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const pageBackground = isDark ? "#181818" : "#f5f5f5";
  const sidebarBg = isDark ? "#151515" : "rgb(245, 245, 245)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        fontFamily,
        color: baseColor,
        overflow: "hidden",
        background: pageBackground,
      }}
    >
      <div
        style={{
          width: sidebarOpen ? 320 : 0,
          minWidth: sidebarOpen ? 320 : 0,
          transition: "width 0.28s ease, min-width 0.28s ease",
          overflow: "hidden",
          borderRight: sidebarOpen ? `1px solid ${sidebarBorder}` : "none",
          backgroundColor: sidebarBg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "50px 16px 0 16px",
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 4px",
            }}
          >
            <span style={{ fontSize: 13, color: mutedColor }}>
              {user ? `${selectedRepos.length} selected` : "Connect GitHub"}
            </span>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ArcSpinner style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 11, color: mutedColor }}>
                  {fetchProgress || "Updating"}
                </span>
              </div>
            ) : null}
          </div>

          <div style={{ minHeight: 0, flex: 1 }}>
            <RepoSelector
              pat={pat}
              user={user}
              selectedRepos={selectedRepos || []}
              setSelectedRepos={setSelectedRepos}
            />
          </div>
        </div>

        <div
          style={{
            padding: "0 16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {user && selectedRepos?.length > 0 ? (
            <Button
              label={loading ? "Fetching..." : "Fetch Traffic"}
              prefix_icon={loading ? undefined : "arrow_down"}
              onClick={handleRefresh}
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 9,
              }}
            />
          ) : null}

          <Button
            prefix_icon="settings"
            label="Settings"
            onClick={() => setSettingsOpen(true)}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 9,
              opacity: 0.72,
            }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="scrollable"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "50px 28px 28px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 20,
                  lineHeight: 1.2,
                  fontWeight: 500,
                }}
              >
                {activeRepo
                  ? activeRepo
                  : user
                    ? "Select a repository"
                    : "Connect GitHub to begin"}
              </div>
            </div>

            <SegmentedButton
              options={RANGE_OPTIONS}
              value={range}
              on_change={setRange}
              style={{ fontSize: 12 }}
            />
          </div>

          {selectedRepos?.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              {selectedRepos.map((repoName) => {
                const isActive = repoName === activeRepo;
                const label = repoName.split("/")[1];

                return (
                  <button
                    key={repoName}
                    onClick={() => setActiveRepo(repoName)}
                    style={{
                      border: "1px solid transparent",
                      backgroundColor: isActive
                        ? isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.08)"
                        : "transparent",
                      borderRadius: 999,
                      padding: "6px 14px",
                      color: isActive ? baseColor : mutedColor,
                      fontFamily,
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}
          {!user ? (
            <div
              style={{
                minHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "min(520px, 100%)",
                  padding: "28px 30px",
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    lineHeight: 1.15,
                    fontWeight: 500,
                  }}
                >
                  Track repository traffic locally.
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: mutedColor,
                  }}
                >
                  Connect a GitHub Personal Access Token, choose the
                  repositories you want to watch, then keep accumulating views
                  and clones on this device over time.
                </div>
                <div style={{ marginTop: 18 }}>
                  <Button
                    prefix_icon="settings"
                    label="Open Settings"
                    onClick={() => setSettingsOpen(true)}
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
          ) : !activeRepo ? (
            <div
              style={{
                minHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "min(420px, 100%)",
                  padding: "24px 26px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  Select repositories to start
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: mutedColor,
                  }}
                >
                  Your selected repositories will appear here with long-lived
                  traffic history and referrer breakdowns.
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
                maxWidth: 1080,
              }}
            >
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <StatCard
                  label="Views"
                  value={stats.totalViews}
                  delta={deltas.viewsDelta}
                  deltaLabel={deltaLabel}
                  accentColor={isDark ? "#93c5fd" : "#2563eb"}
                />
                <StatCard
                  label="Unique Visitors"
                  value={stats.uniqueViews}
                  accentColor={isDark ? "#7dd3fc" : "#0284c7"}
                />
                <StatCard
                  label="Clones"
                  value={stats.totalClones}
                  delta={deltas.clonesDelta}
                  deltaLabel={deltaLabel}
                  accentColor={isDark ? "#86efac" : "#16a34a"}
                />
                <StatCard
                  label="Unique Cloners"
                  value={stats.uniqueClones}
                  accentColor={isDark ? "#f9a8d4" : "#db2777"}
                />
              </div>

              <TrafficChart
                data={repoData?.views || []}
                title="Page Views"
                range={normalizedRange}
                height={250}
                isLoading={activeRepoLoading}
              />

              <TrafficChart
                data={repoData?.clones || []}
                title="Git Clones"
                range={normalizedRange}
                height={250}
                color1={isDark ? "#86efac" : "#16a34a"}
                color2={isDark ? "#fbbf24" : "#d97706"}
                isLoading={activeRepoLoading}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                <ReferrersTable data={repoData?.referrers || []} />
                <PopularPathsTable data={repoData?.paths || []} />
              </div>

              {repoData?.lastFetched && hasActiveRepoData ? (
                <div
                  style={{
                    fontSize: 11,
                    color: subtleColor,
                    textAlign: "right",
                    letterSpacing: "0.03em",
                  }}
                >
                  Last fetched {formatTimestamp(repoData.lastFetched)}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        pat={pat}
        setPat={setPat}
        clearPat={clearPat}
        user={user}
        setUser={setUser}
        selectedRepos={selectedRepos || []}
        allTrafficData={allTrafficData || {}}
        onClearLocalData={handleClearLocalData}
      />
    </div>
  );
};

export default TrafficDashboard;
