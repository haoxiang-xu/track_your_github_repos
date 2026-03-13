import { useCallback, useEffect, useState } from "react";
import { useIndexedStorage } from "../../BUILTIN_COMPONENTs/mini_react/mini_storage";
import {
  useSystemTheme,
  useWindowSize,
  useWebBrowser,
  useDeviceType,
  useRuntimePlatform,
} from "../../BUILTIN_COMPONENTs/mini_react/mini_use";

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Scrollable from "../../BUILTIN_COMPONENTs/class/scrollable";
import TitleBar, {
  TOP_BAR_HEIGHT,
} from "../../BUILTIN_COMPONENTs/electron/title_bar";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "./context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Data } ------------------------------------------------------------------------------------------------------------------ */
import available_themes from "../../BUILTIN_COMPONENTs/theme/theme_manifest";
/* { Data } ------------------------------------------------------------------------------------------------------------------ */

const ConfigContainer = ({ children }) => {
  /* { STYLE } =========================================================================================================== */
  /* { global theme } ---------------------------------------------------------------------------------------------------- */
  const system_theme = useSystemTheme();
  const [theme, setTheme] = useState(null);
  const [syncWithSystemThemeState, setSyncWithSystemThemeState] = useState(true);
  const [onThemeModeState, setOnThemeModeState] = useState(
    system_theme === "dark_mode" ? "dark_mode" : "light_mode",
  );
  const [availableThemes, setAvailableThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [storedThemeMode, setStoredThemeMode, { isLoading: themeModeLoading }] =
    useIndexedStorage("ui_theme_mode_preference", "sync_with_system");
  const initialize_theme = useCallback(() => {
    setAvailableThemes(Object.keys(available_themes));
    setSelectedTheme(Object.keys(available_themes)[0]);
  }, []);
  useEffect(() => {
    initialize_theme();
  }, [initialize_theme]);

  const setOnThemeMode = useCallback(
    (nextMode) => {
      setSyncWithSystemThemeState(false);
      setOnThemeModeState(nextMode);
      setStoredThemeMode(nextMode);
    },
    [setStoredThemeMode],
  );

  const setSyncWithSystemTheme = useCallback(
    (nextValue) => {
      const shouldSync = Boolean(nextValue);
      setSyncWithSystemThemeState(shouldSync);
      if (shouldSync) {
        setStoredThemeMode("sync_with_system");
        setOnThemeModeState(
          system_theme === "dark_mode" ? "dark_mode" : "light_mode",
        );
        return;
      }

      setStoredThemeMode(onThemeModeState);
    },
    [onThemeModeState, setStoredThemeMode, system_theme],
  );

  useEffect(() => {
    if (themeModeLoading) {
      return;
    }

    if (storedThemeMode === "light_mode" || storedThemeMode === "dark_mode") {
      setSyncWithSystemThemeState(false);
      setOnThemeModeState(storedThemeMode);
      return;
    }

    setSyncWithSystemThemeState(true);
    setOnThemeModeState(
      system_theme === "dark_mode" ? "dark_mode" : "light_mode",
    );
  }, [storedThemeMode, system_theme, themeModeLoading]);

  useEffect(() => {
    if (
      available_themes &&
      available_themes[selectedTheme] &&
      available_themes[selectedTheme][onThemeModeState]
    ) {
      setTheme(available_themes[selectedTheme][onThemeModeState]);
    }
  }, [onThemeModeState, selectedTheme]);
  useEffect(() => {
    if (theme?.backgroundColor && window.themeAPI?.setBackgroundColor) {
      window.themeAPI.setBackgroundColor(theme.backgroundColor);
    }
  }, [theme]);
  useEffect(() => {
    if (syncWithSystemThemeState && system_theme) {
      setOnThemeModeState(
        system_theme === "dark_mode" ? "dark_mode" : "light_mode",
      );
    }
  }, [syncWithSystemThemeState, system_theme]);
  /* { global theme } ---------------------------------------------------------------------------------------------------- */
  /* { STYLE } =========================================================================================================== */

  /* { ENVIRONMENT } ===================================================================================================== */
  const window_size = useWindowSize();
  const env_browser = useWebBrowser();
  const device_type = useDeviceType();
  const runtime_platform = useRuntimePlatform();
  /* { ENVIRONMENT } ===================================================================================================== */

  return (
    <ConfigContext.Provider
      value={{
        /* { STYLE } ========================================== */
        syncWithSystemTheme: syncWithSystemThemeState,
        setSyncWithSystemTheme,
        availableThemes,
        theme,
        setTheme,
        onThemeMode: onThemeModeState,
        setOnThemeMode,
        /* { ENVIRONMENT } ==================================== */
        window_size,
        env_browser,
        device_type,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme?.backgroundColor || "#00000000",
        }}
      >
        <TitleBar />
        <div
          style={{
            position: "absolute",
            top: runtime_platform === "electron" ? TOP_BAR_HEIGHT : 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {children}
        </div>
      </div>
      <Scrollable />
    </ConfigContext.Provider>
  );
};

export default ConfigContainer;
