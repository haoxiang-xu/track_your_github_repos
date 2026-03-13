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

import RepoSelector from "./components/repo_selector";
import TrafficChart from "./components/traffic_chart";
import StatCard from "./components/stat_card";
import ReferrersTable from "./components/referrers_table";
import PopularPathsTable from "./components/popular_paths_table";
import SegmentedButton from "../../BUILTIN_COMPONENTs/input/segmented_button";
import Button from "../../BUILTIN_COMPONENTs/input/button";
import { Input } from "../../BUILTIN_COMPONENTs/input/input";
import Select from "../../BUILTIN_COMPONENTs/select/select";
import { SemiSwitch } from "../../BUILTIN_COMPONENTs/input/switch";
import Modal from "../../BUILTIN_COMPONENTs/modal/modal";
import Icon from "../../BUILTIN_COMPONENTs/icon/icon";
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SettingsRow — a single label + control row (PuPu pattern)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SettingsRow = ({ label, description, children }) => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        gap: 24,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontFamily: theme?.font?.fontFamily || "inherit",
            color: theme?.color || "#222",
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: 12,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: theme?.color || "#222",
              opacity: 0.45,
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SettingsSection — group of rows with a title
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SettingsSection = ({ title, children }) => {
  const { onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
          padding: "12px 0 4px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AppearancePage
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const AppearancePage = () => {
  const {
    onThemeMode,
    setOnThemeMode,
    syncWithSystemTheme,
    setSyncWithSystemTheme,
  } = useContext(ConfigContext);

  const themeValue = syncWithSystemTheme ? "sync_with_browser" : onThemeMode;

  return (
    <div style={{ padding: "8px 0" }}>
      <SettingsSection title="Theme">
        <SettingsRow
          label="Color mode"
          description="Choose between light and dark mode"
        >
          <Select
            options={[
              { value: "light_mode", label: "Light" },
              { value: "dark_mode", label: "Dark" },
              { value: "sync_with_browser", label: "System" },
            ]}
            value={themeValue}
            set_value={(val) => {
              if (val === "sync_with_browser") {
                setSyncWithSystemTheme(true);
              } else {
                setSyncWithSystemTheme(false);
                setOnThemeMode(val);
              }
            }}
            filterable={false}
            style={{
              minWidth: 140,
              fontSize: 13,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}
            option_style={{ height: 28, padding: "4px 8px", fontSize: 13 }}
            dropdown_style={{ padding: 4 }}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GitHubAuthPage
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GitHubAuthPage = ({ pat, setPat, user, setUser }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToken, setShowToken] = useState(false);

  const connected = !!user;
  const maskedPat = pat ? pat.slice(0, 6) + "••••••" + pat.slice(-4) : "";

  const successGreen = isDark ? "#86efac" : "#22c55e";
  const errorRed = "#f87171";

  const handleConnect = useCallback(async () => {
    const token = inputValue.trim();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const u = await fetchUser(token);
      setPat(token);
      setUser(u);
      setInputValue("");
    } catch (e) {
      setError(e.status === 401 ? "Invalid token" : e.message);
    } finally {
      setLoading(false);
    }
  }, [inputValue, setPat, setUser]);

  const handleDisconnect = useCallback(() => {
    setPat("");
    setUser(null);
    setError(null);
    setShowToken(false);
  }, [setPat, setUser]);

  return (
    <div style={{ padding: "8px 0" }}>
      {connected ? (
        <>
          {/* connected profile card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 0 24px",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Icon
                  src="user"
                  color={theme?.color || "#222"}
                  style={{ width: 22, height: 22, opacity: 0.5 }}
                />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontFamily: theme?.font?.fontFamily || "inherit",
                  color: theme?.color || "#222",
                }}
              >
                {user.login || user.name || "Connected"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontFamily: theme?.font?.fontFamily || "inherit",
                  color: successGreen,
                  marginTop: 2,
                }}
              >
                Connected
              </div>
            </div>
          </div>

          <SettingsSection title="Token">
            <SettingsRow
              label="Personal Access Token"
              description={showToken ? pat : maskedPat}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <Button
                  prefix_icon={showToken ? "eye_closed" : "eye_open"}
                  onClick={() => setShowToken((v) => !v)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 6,
                    borderRadius: 6,
                    opacity: 0.65,
                    content: {
                      icon: { width: 16, height: 16 },
                    },
                  }}
                />
              </div>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Account">
            <SettingsRow
              label="Disconnect"
              description="Remove saved token and disconnect from GitHub"
            >
              <Button
                prefix_icon="logout"
                label="Disconnect"
                onClick={handleDisconnect}
                style={{ fontSize: 13 }}
              />
            </SettingsRow>
          </SettingsSection>
        </>
      ) : (
        <>
          <SettingsSection title="Connect">
            <div style={{ padding: "14px 0" }}>
              <div
                style={{
                  fontSize: 13,
                  color: theme?.color || "#222",
                  opacity: 0.6,
                  marginBottom: 12,
                }}
              >
                Enter a GitHub Personal Access Token with{" "}
                <code style={{ fontSize: 12 }}>repo</code> scope to fetch
                traffic data.
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Input
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={inputValue}
                  set_value={setInputValue}
                  on_key_down={(e) => {
                    if (e.key === "Enter") handleConnect();
                  }}
                  style={{
                    fontSize: 13,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    width: 260,
                  }}
                />
                <Button
                  label={loading ? undefined : "Connect"}
                  prefix_icon={loading ? undefined : "link"}
                  onClick={handleConnect}
                  disabled={loading || !inputValue.trim()}
                  style={{ fontSize: 13 }}
                />
                {loading && <ArcSpinner style={{ width: 16, height: 16 }} />}
              </div>
              {error && (
                <div
                  style={{
                    fontSize: 12,
                    color: errorRed,
                    marginTop: 8,
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </SettingsSection>
        </>
      )}
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SettingsModal — PuPu two-pane settings
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SETTINGS_PAGES = [
  {
    key: "appearance",
    icon: "sun",
    label: "Appearance",
    component: AppearancePage,
  },
  {
    key: "github",
    icon: "key",
    label: "GitHub Auth",
    component: null, // rendered inline with props
  },
];

const SettingsModal = ({ open, onClose, pat, setPat, user, setUser }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [selectedKey, setSelectedKey] = useState("appearance");

  const ActivePage = useMemo(() => {
    const page = SETTINGS_PAGES.find((p) => p.key === selectedKey);
    return page?.component || null;
  }, [selectedKey]);

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
          height: 480,
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.06)",
          boxShadow: isDark
            ? "0 16px 48px rgba(0,0,0,0.4)"
            : "0 16px 48px rgba(0,0,0,0.08)",
          fontFamily: theme?.font?.fontFamily || "inherit",
        }}
      >
        {/* ── side menu ── */}
        <div
          style={{
            width: 180,
            flexShrink: 0,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.025)",
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderRight: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: theme?.color || "#222",
              opacity: 0.3,
              padding: "8px 12px 12px",
            }}
          >
            Settings
          </div>

          {SETTINGS_PAGES.map((page) => (
            <Button
              key={page.key}
              prefix_icon={page.icon}
              label={page.label}
              onClick={() => setSelectedKey(page.key)}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                fontSize: 13,
                opacity: selectedKey === page.key ? 1 : 0.65,
                padding: "8px 12px",
                borderRadius: 7,
                iconSize: 16,
              }}
            />
          ))}
        </div>

        {/* ── content area ── */}
        <div
          className="scrollable"
          style={{
            position: "relative",
            flex: 1,
            overflowY: "auto",
            padding: "16px 32px",
          }}
        >
          {/* close button */}
          <Button
            prefix_icon="close"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              paddingVertical: 6,
              paddingHorizontal: 6,
              borderRadius: 6,
              opacity: 0.45,
              zIndex: 2,
              content: {
                prefixIconWrap: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 0,
                },
                icon: { width: 14, height: 14 },
              },
            }}
          />

          {/* page title */}
          <div
            style={{
              fontSize: 22,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: theme?.color || "#222",
              padding: "8px 0 4px",
            }}
          >
            {SETTINGS_PAGES.find((p) => p.key === selectedKey)?.label ||
              "Settings"}
          </div>

          {selectedKey === "github" ? (
            <GitHubAuthPage
              pat={pat}
              setPat={setPat}
              user={user}
              setUser={setUser}
            />
          ) : (
            ActivePage && <ActivePage />
          )}
        </div>
      </div>
    </Modal>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TrafficDashboard
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        {/* ── sidebar top content ── */}
        <div
          style={{
            padding: "24px 20px 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            overflow: "hidden",
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

          {/* repos — takes most of sidebar height */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <RepoSelector
              pat={pat}
              user={user}
              selectedRepos={selectedRepos || []}
              setSelectedRepos={setSelectedRepos}
            />
          </div>

          {/* refresh */}
          {user && selectedRepos?.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingBottom: 12,
              }}
            >
              <Button
                label={loading ? undefined : "Fetch Traffic"}
                prefix_icon={loading ? undefined : "arrow_down"}
                onClick={handleRefresh}
                disabled={loading}
                style={{ fontSize: 13 }}
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

        {/* ── sidebar bottom — settings button ── */}
        <div
          style={{
            padding: "8px 10px",
            borderTop: `1px solid ${sidebarBorder}`,
          }}
        >
          <Button
            prefix_icon="settings"
            label="Settings"
            onClick={() => setSettingsOpen(true)}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 13,
              padding: "8px 12px",
              borderRadius: 7,
              opacity: 0.65,
              iconSize: 16,
            }}
          />
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
          {/* sidebar toggle — Mini UI icon button */}
          <Button
            prefix_icon={sidebarOpen ? "side_menu_close" : "side_menu_left"}
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 6,
              borderRadius: 6,
              opacity: 0.55,
              content: {
                icon: { width: 18, height: 18 },
              },
            }}
          />

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
                Open Settings to connect your GitHub Personal Access Token and
                start tracking traffic data. Data accumulates over time, going
                beyond the 14-day limit.
              </div>
              <Button
                prefix_icon="settings"
                label="Open Settings"
                onClick={() => setSettingsOpen(true)}
                style={{ fontSize: 13, marginTop: 8 }}
              />
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

      {/* ═══════════════════════════════════════════════════
          SETTINGS MODAL
         ═══════════════════════════════════════════════════ */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        pat={pat}
        setPat={setPat}
        user={user}
        setUser={setUser}
      />
    </div>
  );
};

export default TrafficDashboard;
