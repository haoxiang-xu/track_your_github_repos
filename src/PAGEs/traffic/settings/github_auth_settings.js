import { useCallback, useContext, useMemo, useState } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import { Input } from "../../../BUILTIN_COMPONENTs/input/input";
import Icon from "../../../BUILTIN_COMPONENTs/icon/icon";
import ArcSpinner from "../../../BUILTIN_COMPONENTs/spinner/arc_spinner";
import { fetchUser } from "../services/github_api";
import { SettingsRow, SettingsSection } from "./shared";

const maskToken = (token) => {
  if (!token || token.length < 12) {
    return token || "Not saved";
  }
  return `${token.slice(0, 6)}••••••${token.slice(-4)}`;
};

export const GithubAuthSettings = ({
  pat,
  setPat,
  clearPat,
  user,
  setUser,
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [inputValue, setInputValue] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const connected = Boolean(user);
  const successGreen = isDark ? "#86efac" : "#15803d";
  const errorRed = "#f87171";
  const tokenDescription = useMemo(
    () => (showToken ? pat || "Not saved" : maskToken(pat)),
    [pat, showToken],
  );

  const handleConnect = useCallback(async () => {
    const token = inputValue.trim();
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const account = await fetchUser(token);
      await setPat(token);
      setUser(account);
      setInputValue("");
    } catch (connectError) {
      setError(
        connectError?.status === 401
          ? "Invalid token"
          : connectError?.message || "Unable to connect to GitHub.",
      );
    } finally {
      setLoading(false);
    }
  }, [inputValue, setPat, setUser]);

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await clearPat();
      setUser(null);
      setShowToken(false);
    } catch (disconnectError) {
      setError(disconnectError?.message || "Unable to clear the saved token.");
    } finally {
      setLoading(false);
    }
  }, [clearPat, setUser]);

  return (
    <div>
      {connected ? (
        <>
          <SettingsSection title="Account" icon="user">
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
                {user?.avatar_url ? (
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
                  {user?.login || user?.name || "Connected"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: theme?.font?.fontFamily || "inherit",
                    color: successGreen,
                    marginTop: 2,
                  }}
                >
                  GitHub connected
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Saved Token" icon="key">
            <SettingsRow
              label="Personal Access Token"
              description={tokenDescription}
            >
              <Button
                prefix_icon={showToken ? "eye_closed" : "eye_open"}
                onClick={() => setShowToken((value) => !value)}
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
            </SettingsRow>

            <SettingsRow
              label="Disconnect"
              description="Remove the locally saved token. Cached traffic data stays on this device."
            >
              <Button
                label={loading ? "Disconnecting..." : "Disconnect"}
                onClick={handleDisconnect}
                disabled={loading}
                style={{ fontSize: 13 }}
              />
            </SettingsRow>
          </SettingsSection>
        </>
      ) : (
        <SettingsSection title="Connect" icon="link">
          <div style={{ padding: "14px 0" }}>
            <div
              style={{
                fontSize: 13,
                color: theme?.color || "#222",
                opacity: 0.6,
                marginBottom: 12,
              }}
            >
              Enter a GitHub Personal Access Token with <code>repo</code> scope
              to fetch repository traffic data directly from GitHub.
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Input
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={inputValue}
                set_value={setInputValue}
                on_key_down={(event) => {
                  if (event.key === "Enter") {
                    handleConnect();
                  }
                }}
                style={{
                  fontSize: 13,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  width: 280,
                }}
              />

              <Button
                label={loading ? undefined : "Connect"}
                prefix_icon={loading ? undefined : "link"}
                onClick={handleConnect}
                disabled={loading || !inputValue.trim()}
                style={{ fontSize: 13 }}
              />

              {loading ? <ArcSpinner style={{ width: 16, height: 16 }} /> : null}
            </div>

            {error ? (
              <div style={{ fontSize: 12, color: errorRed, marginTop: 8 }}>
                {error}
              </div>
            ) : null}
          </div>
        </SettingsSection>
      )}
    </div>
  );
};

