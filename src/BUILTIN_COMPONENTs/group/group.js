import {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Children,
  isValidElement,
} from "react";
import { useSpring, animated } from "react-spring";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* ============================================================================================================================ */
/*  GOOEY SVG FILTER                                                                                                           */
/* ============================================================================================================================ */
const GOO_SVG_ID = "mini-ui-group-goo-svg";
let gooRefCount = 0;

const ensureGooFilter = (blur) => {
  if (typeof document === "undefined") return;
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
      <filter id="mini-ui-group-goo" color-interpolation-filters="sRGB">
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

/* ============================================================================================================================ */
/*  Animated background shape                                                                                                   */
/* ============================================================================================================================ */
const BgShape = ({ x, y, w, h, borderRadius, bgColor }) => {
  const spring = useSpring({
    x,
    y,
    w,
    h,
    config: { tension: 170, friction: 22 },
  });

  return (
    <animated.div
      style={{
        position: "absolute",
        left: spring.x,
        top: spring.y,
        width: spring.w,
        height: spring.h,
        borderRadius,
        backgroundColor: bgColor,
      }}
    />
  );
};

/* ============================================================================================================================ */
/*  Group                                                                                                                       */
/* ============================================================================================================================ */
const Group = ({
  children,
  merged = true,
  direction = "horizontal",
  gap = 8,
  borderRadius = 10,
  backgroundColor,
  style,
  className = "",
}) => {
  const { theme } = useContext(ConfigContext);
  const isHorizontal = direction === "horizontal";

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [rects, setRects] = useState([]);

  const bgColor = backgroundColor || theme?.input?.backgroundColor || "#E8E8E8";
  const blurAmount = Math.max(3, Math.round(borderRadius * 0.5));

  /* ---- measure children ---- */
  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const next = itemRefs.current.filter(Boolean).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - cr.left,
        y: r.top - cr.top,
        w: r.width,
        h: r.height,
      };
    });
    setRects(next);
  }, []);

  useEffect(() => {
    /* initial + re-measure on layout change */
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [measure, merged, children]);

  useEffect(() => {
    const observer = new ResizeObserver(() => measure());
    if (containerRef.current) observer.observe(containerRef.current);
    itemRefs.current.filter(Boolean).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [measure, children]);

  useEffect(() => {
    ensureGooFilter(blurAmount);
    gooRefCount += 1;
    return () => {
      gooRefCount -= 1;
      if (gooRefCount <= 0) {
        const el = document.getElementById(GOO_SVG_ID);
        if (el) el.remove();
        gooRefCount = 0;
      }
    };
  }, [blurAmount]);

  /* ---- merged bounding rect ---- */
  const mergedRect = useMemo(() => {
    if (rects.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
    const x1 = Math.min(...rects.map((r) => r.x));
    const y1 = Math.min(...rects.map((r) => r.y));
    const x2 = Math.max(...rects.map((r) => r.x + r.w));
    const y2 = Math.max(...rects.map((r) => r.y + r.h));
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }, [rects]);

  /* ---- gap spring ---- */
  const containerSpring = useSpring({
    gap: merged ? 0 : gap,
    config: { tension: 170, friction: 22 },
  });

  const validChildren = Children.toArray(children).filter(isValidElement);

  return (
    <animated.div
      ref={containerRef}
      className={`mini-ui-group ${className}`.trim()}
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: "stretch",
        gap: containerSpring.gap,
        ...style,
      }}
    >
      {/* ---- Gooey background layer ---- */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          filter: "url(#mini-ui-group-goo)",
          overflow: "visible",
        }}
      >
        {merged ? (
          <BgShape
            x={mergedRect.x}
            y={mergedRect.y}
            w={mergedRect.w}
            h={mergedRect.h}
            borderRadius={borderRadius}
            bgColor={bgColor}
          />
        ) : (
          rects.map((rect, i) => (
            <BgShape
              key={i}
              x={rect.x}
              y={rect.y}
              w={rect.w}
              h={rect.h}
              borderRadius={borderRadius}
              bgColor={bgColor}
            />
          ))
        )}
      </div>

      {/* ---- Foreground (real elements) ---- */}
      {validChildren.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          style={{
            position: "relative",
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          {child}
        </div>
      ))}
    </animated.div>
  );
};

export default Group;
