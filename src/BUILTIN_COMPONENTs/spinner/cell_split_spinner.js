import { useContext, useEffect, useMemo, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const STYLE_ID = "mini-ui-cell-split-spinner-style";
const GOO_SVG_ID = "mini-ui-cell-goo-svg";
let styleInstanceCount = 0;

const ensureStyle = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const styleElement = document.createElement("style");
  styleElement.id = STYLE_ID;
  styleElement.innerHTML = `
    .mini-ui-cell-split {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--cell-size);
      height: var(--cell-size);
      filter: url(#mini-ui-cell-goo);
    }

    .mini-ui-cell-split__dot {
      position: absolute;
      width: var(--cell-dot);
      height: var(--cell-dot);
      border-radius: 50%;
      background: var(--cell-color);
      top: 50%;
      left: 50%;
      will-change: transform;
    }

    .mini-ui-cell-split__dot--a {
      animation: mini-ui-cell-a var(--cell-duration) ease-in-out infinite;
    }

    .mini-ui-cell-split__dot--b {
      animation: mini-ui-cell-b var(--cell-duration) ease-in-out infinite;
    }

    @keyframes mini-ui-cell-a {
      0%, 100% {
        transform: translate(-50%, -50%) translateX(0) scale(1);
      }
      10% {
        transform: translate(-50%, -50%) translateX(0) scaleX(1.12) scaleY(0.9);
      }
      30% {
        transform: translate(-50%, -50%) translateX(calc(var(--cell-travel) * -0.85)) scaleX(0.95) scaleY(1.03);
      }
      45% {
        transform: translate(-50%, -50%) translateX(calc(var(--cell-travel) * -1)) scale(1);
      }
      55% {
        transform: translate(-50%, -50%) translateX(calc(var(--cell-travel) * -1)) scale(1);
      }
      70% {
        transform: translate(-50%, -50%) translateX(calc(var(--cell-travel) * -0.85)) scaleX(0.95) scaleY(1.03);
      }
      90% {
        transform: translate(-50%, -50%) translateX(0) scaleX(1.12) scaleY(0.9);
      }
    }

    @keyframes mini-ui-cell-b {
      0%, 100% {
        transform: translate(-50%, -50%) translateX(0) scale(1);
      }
      10% {
        transform: translate(-50%, -50%) translateX(0) scaleX(1.12) scaleY(0.9);
      }
      30% {
        transform: translate(-50%, -50%) translateX(calc(var(--cell-travel) * 0.85)) scaleX(0.95) scaleY(1.03);
      }
      45% {
        transform: translate(-50%, -50%) translateX(var(--cell-travel)) scale(1);
      }
      55% {
        transform: translate(-50%, -50%) translateX(var(--cell-travel)) scale(1);
      }
      70% {
        transform: translate(-50%, -50%) translateX(calc(var(--cell-travel) * 0.85)) scaleX(0.95) scaleY(1.03);
      }
      90% {
        transform: translate(-50%, -50%) translateX(0) scaleX(1.12) scaleY(0.9);
      }
    }
  `;

  document.head.appendChild(styleElement);
};

const ensureGooFilter = (blur) => {
  if (typeof document === "undefined") return;

  /* remove previous if blur changed */
  const prev = document.getElementById(GOO_SVG_ID);
  if (prev) prev.remove();

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("id", GOO_SVG_ID);
  svg.setAttribute(
    "style",
    "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none",
  );
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <defs>
      <filter id="mini-ui-cell-goo" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 22 -7"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);
};

const CellSplitSpinner = ({
  size = 56,
  color = "default",
  speed = 1,
  style,
  className = "",
  ariaLabel = "Loading",
}) => {
  const { theme } = useContext(ConfigContext);
  const [fillColor, setFillColor] = useState(color);

  useEffect(() => {
    if (theme && color === "default") {
      setFillColor(theme.spinner?.color || "#F4B6A6");
    } else {
      setFillColor(color);
    }
  }, [theme, color]);

  const safeSpeed = useMemo(() => {
    const next = Number(speed);
    if (!Number.isFinite(next) || next <= 0) return 1;
    return Math.min(Math.max(next, 0.2), 5);
  }, [speed]);

  const dotSize = Math.max(10, Math.round(size * 0.42));
  const travel = Math.max(8, Math.round(size * 0.34));
  const blur = Math.max(3, Math.round(dotSize * 0.25));
  const duration = Math.round(1800 / safeSpeed);

  useEffect(() => {
    ensureStyle();
    ensureGooFilter(blur);
    styleInstanceCount += 1;
    return () => {
      styleInstanceCount -= 1;
      if (styleInstanceCount <= 0) {
        const s = document.getElementById(STYLE_ID);
        if (s) s.remove();
        const g = document.getElementById(GOO_SVG_ID);
        if (g) g.remove();
        styleInstanceCount = 0;
      }
    };
  }, [blur]);

  return (
    <div
      className={`mini-ui-cell-split ${className}`.trim()}
      style={{
        "--cell-size": `${size}px`,
        "--cell-dot": `${dotSize}px`,
        "--cell-travel": `${travel}px`,
        "--cell-duration": `${duration}ms`,
        "--cell-color": fillColor,
        ...style,
      }}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="mini-ui-cell-split__dot mini-ui-cell-split__dot--a" />
      <div className="mini-ui-cell-split__dot mini-ui-cell-split__dot--b" />
    </div>
  );
};

export default CellSplitSpinner;
