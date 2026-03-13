import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import Icon from "../../../BUILTIN_COMPONENTs/icon/icon";

export const SettingsRow = ({ label, description, children }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

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
            color: isDark ? "#fff" : "#222",
            marginBottom: description ? 2 : 0,
          }}
        >
          {label}
        </div>
        {description ? (
          <div
            style={{
              fontSize: 12,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: isDark ? "#fff" : "#222",
              opacity: 0.45,
              marginTop: 2,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
};

export const SettingsSection = ({ title, icon, children }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  return (
    <div style={{ marginBottom: 8 }}>
      {title ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 0 4px",
          }}
        >
          {icon ? (
            <Icon
              src={icon}
              style={{
                width: 20,
                height: 20,
                opacity: 0.75,
              }}
            />
          ) : null}
          <span
            style={{
              fontSize: 11,
              fontFamily: theme?.font?.fontFamily || "inherit",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: isDark ? "#fff" : "#222",
              opacity: 0.35,
            }}
          >
            {title}
          </span>
        </div>
      ) : null}

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

