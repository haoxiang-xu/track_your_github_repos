import { useState, useEffect, useRef } from "react";

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
    width: window.innerWidth || 0,
    height: window.innerHeight || 0,
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
const useMouse = () => {
  const [mouse, setMouse] = useState({ x: -999, y: -999, vx: 0, vy: 0 });

  const lastRef = useRef({
    x: 0,
    y: 0,
    t: performance.now(),
  });
  const idleTimerRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const now = performance.now();
      const dt = now - lastRef.current.t;

      const dx = e.clientX - lastRef.current.x;
      const dy = e.clientY - lastRef.current.y;

      const vx = dt > 0 ? (dx / dt) * 1000 : 0;
      const vy = dt > 0 ? (dy / dt) * 1000 : 0;

      lastRef.current = { x: e.clientX, y: e.clientY, t: now };

      setMouse({ x: e.clientX, y: e.clientY, vx, vy });

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setMouse((m) => ({ ...m, vx: 0, vy: 0 }));
      }, 60);
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return mouse;
};
const useWebBrowser = () => {
  const [envBrowser, setEnvBrowser] = useState(null);
  useEffect(() => {
    const getBrowserName = () => {
      const userAgent = navigator.userAgent;

      if (userAgent.indexOf("Firefox") > -1) {
        return "Firefox";
      } else if (
        userAgent.indexOf("Opera") > -1 ||
        userAgent.indexOf("OPR") > -1
      ) {
        return "Opera";
      } else if (userAgent.indexOf("Trident") > -1) {
        return "Internet Explorer";
      } else if (userAgent.indexOf("Edge") > -1) {
        return "Edge";
      } else if (userAgent.indexOf("Chrome") > -1) {
        return "Chrome";
      } else if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
      } else {
        return "Unknown";
      }
    };
    setEnvBrowser(getBrowserName());
  }, []);
  return envBrowser;
};
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState("desktop");
  useEffect(() => {
    const checkDeviceType = () => {
      const userAgent = navigator.userAgent;
      if (
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        )
      ) {
        setDeviceType("mobile");
      } else {
        setDeviceType("desktop");
      }
    };
    checkDeviceType();
  }, []);
  return deviceType;
};
/* { ENVIRONMENT LISTENERs } ------------------------------------------------------------------------------------ */

export {
  useSystemTheme,
  useWindowSize,
  useMouse,
  useWebBrowser,
  useDeviceType,
};
