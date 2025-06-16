import { useCallback, useEffect, useState } from "react";
import { useSystemTheme } from "../../BUILTIN_COMPONENTs/mini_react/mini_react";

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
    system_theme === "dark_mode" ? "dark_mode" : "light_mode"
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
  /* { window size } ----------------------------------------------------------------------------------------------------- */
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /* { window size } ----------------------------------------------------------------------------------------------------- */
  /* { web broswer } ----------------------------------------------------------------------------------------------------- */
  const [envBrowser, setEnvBrowser] = useState(null);
  useEffect(() => {
    const getBrowserName = () => {
      const userAgent = navigator.userAgent;

      if (
        /chrome|crios|crmo/i.test(userAgent) &&
        !/edge|edg/i.test(userAgent)
      ) {
        return "Chrome";
      } else if (
        /safari/i.test(userAgent) &&
        !/chrome|crios|crmo/i.test(userAgent)
      ) {
        return "Safari";
      } else if (/firefox|fxios/i.test(userAgent)) {
        return "Firefox";
      } else if (/edg/i.test(userAgent)) {
        return "Edge";
      } else {
        return "Other";
      }
    };
    const browserName = getBrowserName();
    setEnvBrowser(browserName);
  }, []);
  /* { web broswer } ----------------------------------------------------------------------------------------------------- */
  /* { device type } ----------------------------------------------------------------------------------------------------- */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|iphone|ipad|ipod|windows phone/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);
  /* { device type } ----------------------------------------------------------------------------------------------------- */
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
        windowSize,
        envBrowser,
        isMobile,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContainer;
