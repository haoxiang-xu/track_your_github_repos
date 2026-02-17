import { useState, useContext, useMemo } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../../../BUILTIN_COMPONENTs/icon/icon";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import { GhostSelect } from "../../../BUILTIN_COMPONENTs/select/select";
import { SemiSwitch } from "../../../BUILTIN_COMPONENTs/input/switch";
import { ConfirmModal } from "../../../BUILTIN_COMPONENTs/modal/modal";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  SettingsRow — a single label + control row                                                                                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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
            fontWeight: 500,
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  SettingsSection — group of rows with a title                                                                               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SettingsSection = ({ title, children }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          fontFamily: theme?.font?.fontFamily || "inherit",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: theme?.color || "#222",
          opacity: 0.35,
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  GeneralPage                                                                                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GeneralPage = () => {
  const {
    onThemeMode,
    setOnThemeMode,
    syncWithSystemTheme,
    setSyncWithSystemTheme,
    availableThemes,
  } = useContext(ConfigContext);

  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("english");

  const themeValue = syncWithSystemTheme ? "sync_with_browser" : onThemeMode;

  return (
    <div style={{ padding: "8px 0" }}>
      <SettingsSection title="Appearance">
        <SettingsRow
          label="Theme"
          description="Choose between light and dark mode"
        >
          <GhostSelect
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
            style={{ minWidth: 140 }}
          />
        </SettingsRow>
        <SettingsRow
          label="Language"
          description="Display language for the interface"
        >
          <GhostSelect
            options={[
              { value: "english", label: "English" },
              { value: "chinese", label: "中文" },
              { value: "japanese", label: "日本語" },
              { value: "korean", label: "한국어" },
            ]}
            value={language}
            set_value={setLanguage}
            filterable={false}
            style={{ minWidth: 140 }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow
          label="Notifications"
          description="Receive in-app notifications"
        >
          <SemiSwitch on={notifications} set_on={setNotifications} />
        </SettingsRow>
        <SettingsRow label="Auto-save" description="Automatically save changes">
          <SemiSwitch on={autoSave} set_on={setAutoSave} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  ProfilePage                                                                                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ProfilePage = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  return (
    <div style={{ padding: "8px 0" }}>
      {/* avatar + name card */}
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
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            src="user"
            color={theme?.color || "#222"}
            style={{ width: 24, height: 24, opacity: 0.5 }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: theme?.color || "#222",
            }}
          >
            Jane Doe
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: theme?.color || "#222",
              opacity: 0.4,
            }}
          >
            jane.doe@example.com
          </div>
        </div>
      </div>

      <SettingsSection title="Account">
        <SettingsRow label="Email" description="jane.doe@example.com">
          <Button label="Change" onClick={() => {}} />
        </SettingsRow>
        <SettingsRow label="Password" description="Last changed 30 days ago">
          <Button label="Update" onClick={() => {}} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingsRow
          label="Profile visibility"
          description="Control who can see your profile"
        >
          <GhostSelect
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
              { value: "friends", label: "Friends only" },
            ]}
            value="private"
            set_value={() => {}}
            filterable={false}
            style={{ minWidth: 140 }}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  AccountPage                                                                                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const AccountPage = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div style={{ padding: "8px 0" }}>
      <SettingsSection title="Sessions">
        <SettingsRow
          label="Active sessions"
          description="You are logged in on 2 devices"
        >
          <Button label="Manage" onClick={() => {}} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Danger zone">
        <SettingsRow
          label="Delete account"
          description="Permanently remove your account and all data"
        >
          <Button
            label="Delete"
            style={{ color: "#E5484D" }}
            onClick={() => {}}
          />
        </SettingsRow>
        <SettingsRow label="Log out" description="Sign out of this device">
          <Button
            prefix_icon="logout"
            label="Log out"
            onClick={() => setLogoutOpen(true)}
          />
        </SettingsRow>
      </SettingsSection>

      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => setLogoutOpen(false)}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
      />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  SideMenuItem                                                                                                               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SideMenuItem = ({ icon, label, selected, onClick }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [hovered, setHovered] = useState(false);

  const bg = selected
    ? isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.07)"
    : hovered
      ? isDark
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.04)"
      : "transparent";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 7,
        cursor: "pointer",
        backgroundColor: bg,
        transition: "background-color 0.15s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <Icon
        src={icon}
        color={theme?.color || "#222"}
        style={{ width: 16, height: 16, opacity: selected ? 0.8 : 0.45 }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: selected ? 600 : 400,
          fontFamily: theme?.font?.fontFamily || "inherit",
          color: theme?.color || "#222",
          opacity: selected ? 1 : 0.65,
          transition: "opacity 0.15s ease",
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  SettingsShowroom — the full settings panel                                                                                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const PAGES = [
  {
    key: "general",
    icon: "settings",
    label: "General",
    component: GeneralPage,
  },
  { key: "profile", icon: "user", label: "Profile", component: ProfilePage },
  { key: "account", icon: "lock", label: "Account", component: AccountPage },
];

const SettingsShowroom = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [selectedKey, setSelectedKey] = useState("general");

  const ActivePage = useMemo(
    () => PAGES.find((p) => p.key === selectedKey)?.component || GeneralPage,
    [selectedKey],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        height: 520,
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
      {/* ── side menu ───────────────────────────────────── */}
      <div
        style={{
            position: "relative",
          width: 200,
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
        {/* settings title */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: theme?.color || "#222",
            opacity: 0.3,
            padding: "8px 12px 12px",
          }}
        >
          Settings
        </div>

        {PAGES.map((page) => (
          <Button
            key={page.key}
            prefix_icon={page.icon}
            label={page.label}
            onClick={() => setSelectedKey(page.key)}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 13,
              fontWeight: 400,
              opacity: selectedKey === page.key ? 1 : 0.65,
              padding: "8px 12px",
              borderRadius: 7,
              iconSize: 16,
            }}
          />
        ))}

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* logout at bottom */}
        <div style={{ padding: "0px" }}>
          <Button
            prefix_icon="logout"
            label="Log out"
            onClick={() => {}}
            style={{
             position: "absolute",
              bottom: 8,
              left: 8,
              width: "calc(100% - 16px)",
              justifyContent: "flex-start",
              fontSize: 13,
              fontWeight: 400,
              padding: "8px 12px",
              borderRadius: 7,
              opacity: 0.65,
              iconSize: 16,
            }}
          />
        </div>
      </div>

      {/* ── content area ────────────────────────────────── */}
      <div
        className="scrollable"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 32px",
        }}
      >
        {/* page title */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            fontFamily: theme?.font?.fontFamily || "inherit",
            color: theme?.color || "#222",
            padding: "8px 0 4px",
          }}
        >
          {PAGES.find((p) => p.key === selectedKey)?.label || "Settings"}
        </div>

        <ActivePage />
      </div>
    </div>
  );
};

export default SettingsShowroom;
