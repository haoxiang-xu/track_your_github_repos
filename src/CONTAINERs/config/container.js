import { useCallback, useEffect, useState } from "react";
import {
  useSystemTheme,
  useWindowSize,
  useWebBrowser,
  useDeviceType,
} from "../../BUILTIN_COMPONENTs/mini_react/mini_use";
import Scrollable from "../../BUILTIN_COMPONENTs/class/scrollable";

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
  const [syncWithSystemTheme, setSyncWithSystemTheme] = useState(true);
  const [theme, setTheme] = useState(null);
  const [onThemeMode, setOnThemeMode] = useState(
    system_theme === "dark_mode" ? "dark_mode" : "light_mode",
  );
  const [availableThemes, setAvailableThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const initialize_theme = useCallback(() => {
    setOnThemeMode(system_theme);
    setAvailableThemes(Object.keys(available_themes));
    setSelectedTheme(Object.keys(available_themes)[0]);
  }, [system_theme]);
  useEffect(() => {
    initialize_theme();
  }, [initialize_theme]);
  useEffect(() => {
    if (
      available_themes &&
      available_themes[selectedTheme] &&
      available_themes[selectedTheme][onThemeMode]
    ) {
      setTheme(available_themes[selectedTheme][onThemeMode]);
    }
  }, [onThemeMode, selectedTheme]);
  /* { global theme } ---------------------------------------------------------------------------------------------------- */
  /* { STYLE } =========================================================================================================== */

  /* { ENVIRONMENT } ===================================================================================================== */
  const window_size = useWindowSize();
  const env_browser = useWebBrowser();
  const device_type = useDeviceType();
  /* { ENVIRONMENT } ===================================================================================================== */

  return (
    <ConfigContext.Provider
      value={{
        /* { STYLE } ========================================== */
        syncWithSystemTheme,
        setSyncWithSystemTheme,
        availableThemes,
        theme,
        setTheme,
        onThemeMode,
        setOnThemeMode,
        /* { ENVIRONMENT } ==================================== */
        window_size,
        env_browser,
        device_type,
      }}
    >
      {children}
      <Scrollable />
    </ConfigContext.Provider>
  );
};

export default ConfigContainer;
