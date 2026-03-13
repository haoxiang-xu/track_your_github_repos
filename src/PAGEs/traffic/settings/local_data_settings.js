import { useContext, useMemo } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import { SettingsRow, SettingsSection } from "./shared";

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

export const LocalDataSettings = ({
  selectedRepos,
  allTrafficData,
  onClearLocalData,
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  const stats = useMemo(() => {
    const entries = Object.values(allTrafficData || {});
    const trackedRepoCount = entries.length;
    const savedSeriesPoints = entries.reduce((sum, repoData) => {
      return (
        sum +
        (repoData?.views?.length || 0) +
        (repoData?.clones?.length || 0) +
        (repoData?.referrers?.length || 0) +
        (repoData?.paths?.length || 0)
      );
    }, 0);

    const lastFetched = entries.reduce((latest, repoData) => {
      if (!repoData?.lastFetched) {
        return latest;
      }

      if (!latest) {
        return repoData.lastFetched;
      }

      return new Date(repoData.lastFetched).getTime() >
        new Date(latest).getTime()
        ? repoData.lastFetched
        : latest;
    }, null);

    return {
      trackedRepoCount,
      selectedRepoCount: Array.isArray(selectedRepos) ? selectedRepos.length : 0,
      savedSeriesPoints,
      lastFetched,
    };
  }, [allTrafficData, selectedRepos]);

  const panelBackground = isDark
    ? "rgba(255,255,255,0.04)"
    : "rgba(0,0,0,0.03)";
  const panelBorder = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";
  const metricColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";

  return (
    <div>
      <SettingsSection title="Cache Summary" icon="data">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            padding: "14px 0 18px",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              backgroundColor: panelBackground,
              border: `1px solid ${panelBorder}`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {stats.trackedRepoCount}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: metricColor,
                fontFamily: theme?.font?.fontFamily || "inherit",
              }}
            >
              cached repos
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              backgroundColor: panelBackground,
              border: `1px solid ${panelBorder}`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {stats.selectedRepoCount}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: metricColor,
                fontFamily: theme?.font?.fontFamily || "inherit",
              }}
            >
              selected repos
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              backgroundColor: panelBackground,
              border: `1px solid ${panelBorder}`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {stats.savedSeriesPoints}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: metricColor,
                fontFamily: theme?.font?.fontFamily || "inherit",
              }}
            >
              saved entries
            </div>
          </div>
        </div>

        <SettingsRow
          label="Last fetched"
          description={formatTimestamp(stats.lastFetched)}
        />
      </SettingsSection>

      <SettingsSection title="Maintenance" icon="tool">
        <SettingsRow
          label="Clear local cache"
          description="Removes selected repos and cached traffic history from this device. Your GitHub token remains saved."
        >
          <Button
            label="Clear Cache"
            onClick={onClearLocalData}
            style={{ fontSize: 13 }}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
};

