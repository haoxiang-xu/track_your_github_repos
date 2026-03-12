import { useContext, useState, useEffect, useCallback } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import { fetchRepos } from "../services/github_api";
import ArcSpinner from "../../../BUILTIN_COMPONENTs/spinner/arc_spinner";
import Icon from "../../../BUILTIN_COMPONENTs/icon/icon";

const RepoSelector = ({ pat, user, selectedRepos, setSelectedRepos }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const hoverBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const selectedBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const accent = isDark ? "#93c5fd" : "#3b82f6";

  const loadRepos = useCallback(async () => {
    if (!pat || !user) return;
    setLoading(true);
    try {
      const list = await fetchRepos(pat);
      setRepos(list);
    } catch {
      /* silently fail – user can retry */
    } finally {
      setLoading(false);
    }
  }, [pat, user]);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const toggleRepo = useCallback(
    (fullName) => {
      setSelectedRepos((prev) => {
        const set = new Set(prev);
        if (set.has(fullName)) set.delete(fullName);
        else set.add(fullName);
        return Array.from(set);
      });
    },
    [setSelectedRepos],
  );

  const selectAll = useCallback(() => {
    setSelectedRepos(repos.map((r) => r.full_name));
  }, [repos, setSelectedRepos]);

  const deselectAll = useCallback(() => {
    setSelectedRepos([]);
  }, [setSelectedRepos]);

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* ── header row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 13,
            fontWeight: 500,
            color: baseColor,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Repositories
        </span>
        <span style={{ fontFamily, fontSize: 12, color: mutedColor }}>
          ({selectedRepos.length}/{repos.length} selected)
        </span>
        <button
          onClick={selectAll}
          style={{
            background: "none",
            border: "none",
            color: accent,
            fontFamily,
            fontSize: 12,
            cursor: "pointer",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          All
        </button>
        <button
          onClick={deselectAll}
          style={{
            background: "none",
            border: "none",
            color: mutedColor,
            fontFamily,
            fontSize: 12,
            cursor: "pointer",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          None
        </button>
        {loading && <ArcSpinner style={{ width: 16, height: 16 }} />}
      </div>

      {/* ── search ── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.10)",
          borderRadius: 6,
          padding: "4px 8px",
        }}
      >
        <Icon src="search" style={{ width: 14, height: 14, opacity: 0.4 }} />
        <input
          type="text"
          placeholder="Filter repos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            color: baseColor,
            fontFamily,
            fontSize: 13,
            flex: 1,
            padding: 0,
          }}
        />
      </div>

      {/* ── repo list ── */}
      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: 6,
        }}
      >
        {filtered.map((r) => {
          const isSelected = selectedRepos.includes(r.full_name);
          return (
            <RepoRow
              key={r.full_name}
              repo={r}
              isSelected={isSelected}
              onToggle={() => toggleRepo(r.full_name)}
              fontFamily={fontFamily}
              baseColor={baseColor}
              mutedColor={mutedColor}
              hoverBg={hoverBg}
              selectedBg={selectedBg}
              accent={accent}
              isDark={isDark}
            />
          );
        })}
        {!loading && filtered.length === 0 && (
          <span
            style={{ fontFamily, fontSize: 13, color: mutedColor, padding: 8 }}
          >
            {repos.length === 0 ? "No repos found." : "No matching repos."}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── individual row ── */
const RepoRow = ({
  repo,
  isSelected,
  onToggle,
  fontFamily,
  baseColor,
  mutedColor,
  hoverBg,
  selectedBg,
  accent,
  isDark,
}) => {
  const [hovered, setHovered] = useState(false);

  const bg = isSelected ? selectedBg : hovered ? hoverBg : "transparent";

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 6,
        cursor: "pointer",
        backgroundColor: bg,
        transition: "background-color 0.15s",
      }}
    >
      {/* checkbox indicator */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: isSelected
            ? `1.5px solid ${accent}`
            : isDark
              ? "1.5px solid rgba(255,255,255,0.2)"
              : "1.5px solid rgba(0,0,0,0.2)",
          backgroundColor: isSelected ? accent : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        {isSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 3.5L3.5 6L9 1"
              stroke={isDark ? "#1a1a1a" : "#fff"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* repo info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 13,
            fontWeight: 500,
            color: baseColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {repo.name}
        </span>
        {repo.description && (
          <span
            style={{
              fontFamily,
              fontSize: 11,
              color: mutedColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {repo.description}
          </span>
        )}
      </div>

      {/* stars */}
      <span
        style={{ fontFamily, fontSize: 11, color: mutedColor, flexShrink: 0 }}
      >
        ★ {repo.stargazers_count}
      </span>

      {/* visibility */}
      <span
        style={{
          fontFamily,
          fontSize: 10,
          color: mutedColor,
          border: isDark
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(0,0,0,0.12)",
          borderRadius: 4,
          padding: "1px 5px",
          flexShrink: 0,
        }}
      >
        {repo.private ? "private" : "public"}
      </span>
    </div>
  );
};

export default RepoSelector;
