import { useState, useEffect } from "react";

/* { ENVIRONMENT LISTENERs } ------------------------------------------------------------------------------------ */
const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark_mode"
      : "light_mode"
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark_mode" : "light_mode");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  return systemTheme;
};
const useWindowSize = () => {
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
  return windowSize;
};
/* { ENVIRONMENT LISTENERs } ------------------------------------------------------------------------------------ */

export { useSystemTheme, useWindowSize };
