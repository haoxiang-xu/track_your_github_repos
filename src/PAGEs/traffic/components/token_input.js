import { useContext, useState, useCallback } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import { Input } from "../../../BUILTIN_COMPONENTs/input/input";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import ArcSpinner from "../../../BUILTIN_COMPONENTs/spinner/arc_spinner";
import { fetchUser } from "../services/github_api";

const TokenInput = ({ pat, setPat, user, setUser }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connected = !!user;

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
  }, [setPat, setUser]);

  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const errorColor = "#f87171";
  const successGreen = isDark ? "#86efac" : "#22c55e";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {connected ? (
        /* ── connected state ───────────────────────────── */
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={user.avatar_url}
            alt=""
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `2px solid ${successGreen}`,
            }}
          />
          <span
            style={{
              fontFamily: theme?.font?.fontFamily || "Jost, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: baseColor,
            }}
          >
            {user.login}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: successGreen,
              display: "inline-block",
            }}
          />
          <Button
            label="Disconnect"
            onClick={handleDisconnect}
            style={{
              root: { fontSize: 12, color: mutedColor },
            }}
          />
        </div>
      ) : (
        /* ── input state ───────────────────────────────── */
        <>
          <Input
            placeholder="GitHub Personal Access Token"
            type="password"
            value={inputValue}
            set_value={setInputValue}
            prefix_icon="key"
            on_key_down={(e) => {
              if (e.key === "Enter") handleConnect();
            }}
            style={{ fontSize: 13, paddingHorizontal: 10, paddingVertical: 7 }}
          />
          {loading ? (
            <ArcSpinner style={{ width: 20, height: 20 }} />
          ) : (
            <Button
              label="Connect"
              prefix_icon="link"
              onClick={handleConnect}
              disabled={!inputValue.trim()}
              style={{
                root: { fontSize: 13 },
              }}
            />
          )}
          {error && (
            <span
              style={{
                fontSize: 12,
                color: errorColor,
                fontFamily: theme?.font?.fontFamily || "Jost, sans-serif",
              }}
            >
              {error}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default TokenInput;
