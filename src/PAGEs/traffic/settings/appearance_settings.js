import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import Select from "../../../BUILTIN_COMPONENTs/select/select";
import { SettingsRow, SettingsSection } from "./shared";

export const AppearanceSettings = () => {
  const {
    onThemeMode,
    setOnThemeMode,
    syncWithSystemTheme,
    setSyncWithSystemTheme,
  } = useContext(ConfigContext);

  const themeValue = syncWithSystemTheme ? "sync_with_browser" : onThemeMode;

  return (
    <div>
      <SettingsSection title="Appearance" icon="color">
        <SettingsRow
          label="Theme Mode"
          description="Choose between light, dark, or the system appearance."
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

