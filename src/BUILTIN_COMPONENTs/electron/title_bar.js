import { useContext, useEffect, useState } from "react";

import { ConfigContext } from "../../CONTAINERs/config/context";

const TOP_BAR_HEIGHT = 50;

const getRuntimePlatform = () => {
  if (typeof window === "undefined") {
    return "web";
  }
  if (window.osInfo && typeof window.osInfo.platform === "string") {
    return window.osInfo.platform;
  }
  if (window.runtime && typeof window.runtime.platform === "string") {
    return window.runtime.platform;
  }
  return "web";
};
const hasElectronWindowControls = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(
    window.runtime?.isElectron === true &&
      window.windowStateAPI &&
      typeof window.windowStateAPI.windowStateEventHandler === "function",
  );
};
const WindowControlIcon = ({ type }) => {
  if (type === "minimize") {
    return (
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none">
        <path
          d="M5 12.5H19"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "maximize") {
    return (
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none">
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (type === "restore") {
    return (
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none">
        <path
          d="M8 8H16V16H8V8Z"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M11 5H19V13"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
};
const TitleBar = () => {
  const { theme } = useContext(ConfigContext);
  const [windowIsMaximized, setWindowIsMaximized] = useState(false);
  const [hoveredAction, setHoveredAction] = useState("");

  const isElectron = hasElectronWindowControls();
  const platform = getRuntimePlatform();
  const isDarwin = platform === "darwin";

  useEffect(() => {
    if (!isElectron || !window.windowStateAPI) {
      return undefined;
    }

    const cleanup = window.windowStateAPI.windowStateEventListener(
      ({ isMaximized }) => {
        setWindowIsMaximized(Boolean(isMaximized));
      },
    );

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [isElectron]);

  if (!isElectron) {
    return null;
  }

  const runWindowAction = (action) => {
    if (
      !window.windowStateAPI ||
      typeof window.windowStateAPI.windowStateEventHandler !== "function"
    ) {
      return;
    }
    window.windowStateAPI.windowStateEventHandler(action);
  };

  const topBarBackground = theme?.backgroundColor || "rgba(22, 22, 24, 0.86)";
  const topBarForeground = theme?.color || "rgba(255, 255, 255, 0.92)";

  const controlButtonStyle = (action) => {
    const onHover = hoveredAction === action;
    const onCloseButton = action === "close";

    return {
      transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
      width: 24,
      height: 24,
      borderRadius: 6,
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      color:
        onHover && onCloseButton
          ? "rgba(255,255,255,0.98)"
          : theme?.icon?.color || topBarForeground,
      backgroundColor:
        onHover && onCloseButton
          ? "rgba(229, 57, 53, 0.92)"
          : onHover
            ? "rgba(255, 255, 255, 0.18)"
            : "rgba(255, 255, 255, 0.06)",
      WebkitAppRegion: "no-drag",
    };
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: TOP_BAR_HEIGHT,
        zIndex: 2048,
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: topBarBackground,
        color: topBarForeground,
        WebkitAppRegion: "drag",
        userSelect: "none",
        WebkitUserSelect: "none",
        border: "1px solid rgb(0, 0, 0)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: isDarwin ? 80 : 14,
          transform: "translateY(-50%)",
          opacity: 0.84,
          fontFamily: "Jost, sans-serif",
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        mini ui
      </div>

      {!isDarwin ? (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            display: "flex",
            gap: 6,
            WebkitAppRegion: "no-drag",
          }}
        >
          <button
            type="button"
            aria-label="Minimize"
            style={controlButtonStyle("minimize")}
            onMouseEnter={() => setHoveredAction("minimize")}
            onMouseLeave={() => setHoveredAction("")}
            onClick={() => runWindowAction("minimize")}
          >
            <WindowControlIcon type="minimize" />
          </button>
          <button
            type="button"
            aria-label="Maximize"
            style={controlButtonStyle("maximize")}
            onMouseEnter={() => setHoveredAction("maximize")}
            onMouseLeave={() => setHoveredAction("")}
            onClick={() => runWindowAction("maximize")}
          >
            <WindowControlIcon type={windowIsMaximized ? "restore" : "maximize"} />
          </button>
          <button
            type="button"
            aria-label="Close"
            style={controlButtonStyle("close")}
            onMouseEnter={() => setHoveredAction("close")}
            onMouseLeave={() => setHoveredAction("")}
            onClick={() => runWindowAction("close")}
          >
            <WindowControlIcon type="close" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export { TOP_BAR_HEIGHT };
export default TitleBar;
