import { useEffect, useState } from "react";
import { useSystemTheme } from "../../BUILTIN_COMPONENTs/mini_react/mini_react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "./context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const ConfigContainer = ({ children }) => {
  /* { STYLE } =========================================================================================================== */
  /* { global theme } ---------------------------------------------------------------------------------------------------- */
  const system_theme = useSystemTheme();
  const [syncWithSystemTheme, setSyncWithSystemTheme] = useState(true);
  const [theme, setTheme] = useState(system_theme);
  /* { global theme } ---------------------------------------------------------------------------------------------------- */

  /* { global styling } -------------------------------------------------------------------------------------------------- */
  /* { global styling } -------------------------------------------------------------------------------------------------- */
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
        theme,
        setTheme,
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
