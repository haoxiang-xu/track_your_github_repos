import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  useLayoutEffect,
  useRef,
  cloneElement,
  isValidElement,
} from "react";
import { useMouse } from "./mini_react.js";
import VanillaTilt from "vanilla-tilt";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
const DnDContext = createContext();
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const default_tilt_config = {
  vanilla_max_deg: 10,
  vanilla_scale: 1.05,
  x_max_deg: 30,
  y_max_deg: 30,
  z_max_deg: 20,
};
const default_draggable_style = {
  top: 0,
  height: 45,
  gap: 5,
};

const Draggable = ({
  render = () => {
    return <div></div>;
  },
  tilt = false,
  tilt_config = default_tilt_config,
}) => {
  const {
    draggableComponentRender,
    setDraggableSize,
    setDraggableComponentRender,
    setDraggableInnerPosition,
    setDraggableOutterPosition,
    setDraggableConfig,
  } = useContext(DnDContext);
  const tiltRef = useRef(null);
  const hasCapturedRef = useRef(false);
  const baseSizeRef = useRef({ width: 0, height: 0 });

  const initialize_draggable_component_render = useCallback(() => {
    setDraggableComponentRender(render());
  }, [render, setDraggableComponentRender]);
  useLayoutEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    const measure = () => {
      baseSizeRef.current = {
        width: el.offsetWidth || el.clientWidth || 0,
        height: el.offsetHeight || el.clientHeight || 0,
      };
    };

    measure();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    return () => {
      if (ro) {
        ro.disconnect();
      }
    };
  }, []);
  const capturePosition = (e) => {
    const target =
      tiltRef.current ||
      (e.target instanceof Element ? e.target : e.currentTarget);
    const rect = target.getBoundingClientRect();
    const baseWidth = baseSizeRef.current.width || rect.width;
    const baseHeight = baseSizeRef.current.height || rect.height;
    const ratioX = rect.width ? (e.clientX - rect.left) / rect.width : 0;
    const ratioY = rect.height ? (e.clientY - rect.top) / rect.height : 0;

    hasCapturedRef.current = true;
    setDraggableInnerPosition({
      x: ratioX * baseWidth,
      y: ratioY * baseHeight,
    });
    setDraggableOutterPosition({
      x: rect.left,
      y: rect.top,
    });
    setDraggableConfig({ tilt, tilt_config });
    setDraggableSize({ width: baseWidth, height: baseHeight });
    initialize_draggable_component_render();
  };
  const handleDragStart = (e) => {
    if (!hasCapturedRef.current) {
      capturePosition(e);
    } else {
      initialize_draggable_component_render();
    }
  };

  useEffect(() => {
    if (!tiltRef.current) return;
    if (tilt !== true) return;
    VanillaTilt.init(tiltRef.current, {
      reverse: true,
      reset: true,
      max: tilt_config.vanilla_max_deg || default_tilt_config.vanilla_max_deg,
      scale: tilt_config.vanilla_scale || default_tilt_config.vanilla_scale,
    });
  }, [tilt, tilt_config, tiltRef]);
  useEffect(() => {
    if (draggableComponentRender === null) {
      hasCapturedRef.current = false;
    }
  }, [draggableComponentRender]);

  return (
    <div
      onMouseDown={handleDragStart}
      style={{ cursor: "grab", width: "fit-content", height: "fit-content" }}
    >
      {(() => {
        const rendered_component = render();
        if (isValidElement(rendered_component)) {
          return cloneElement(rendered_component, { ref: tiltRef });
        }
        return <div ref={tiltRef}>{rendered_component}</div>;
      })()}
    </div>
  );
};
const Droppable = ({
  draggables,
  style,
  draggable_style = default_draggable_style,
}) => {
  const [draggableStyles, setDraggableStyles] = useState(null);
  const [droppableOutterPosition, setDroppableOutterPosition] = useState({
    x: 0,
    y: 0,
  });

  const capturePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDroppableOutterPosition({
      x: rect.left,
      y: rect.top,
    });
    console.log("Captured Droppable position:", rect.left, rect.top);
  };

  useEffect(() => {
    console.log("Droppable position updated:", droppableOutterPosition);
  }, [droppableOutterPosition]);
  useEffect(() => {
    let index = 0;
    for (let draggable in draggables) {
      const style = {
        ...default_draggable_style,
        ...draggable_style,
        transition: "top 300ms ease, left 300ms ease",
        position: "absolute",
        top:
          index *
            ((draggable_style.height || default_draggable_style.height) +
              (draggable_style.gap || default_draggable_style.gap || 0) +
              (draggable_style.top || default_draggable_style.top || 0)) +
          (draggable_style.gap || default_draggable_style.gap || 0),
        left: draggable_style.gap || default_draggable_style.gap || 0,
        width:
          "calc(100% - " +
          (draggable_style.gap || default_draggable_style.gap || 0) * 2 +
          "px)",
        margin: 0,
      };
      index += 1;
      setDraggableStyles((prev) => ({
        ...(prev || {}),
        [draggable]: style,
      }));
    }
  }, [draggables, draggable_style]);

  return (
    <div style={{ ...(style || {}) }} onMouseDown={capturePosition}>
      {draggables && draggables.length > 0 && draggableStyles !== null
        ? draggables.map((item, index) => {
            return (
              <Draggable
                key={index}
                render={() => {
                  const rendered_component = item.render();
                  if (isValidElement(rendered_component)) {
                    const merged_style = {
                      ...(rendered_component.props.style || {}),
                      ...(draggableStyles?.[index] || {}),
                    };
                    return cloneElement(rendered_component, {
                      style: merged_style,
                    });
                  } else {
                    return (
                      <div style={draggableStyles?.[index] || {}}>
                        {rendered_component}
                      </div>
                    );
                  }
                }}
                tilt={item.tilt}
                tilt_config={item.tilt_config}
              />
            );
          })
        : null}
    </div>
  );
};
const DnDGhost = ({ debug = false }) => {
  const mouse = useMouse();
  const {
    draggableSize,
    draggableInnerPosition,
    draggableComponentRender,
    draggableConfig,
    setDraggableComponentRender,
    setDraggableInnerPosition,
    setDraggableOutterPosition,
  } = useContext(DnDContext);

  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [ghostComponent, setGhostComponent] = useState(null);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const normTanh = (v, vAtMax = 1200) => Math.tanh(v / vAtMax);
  const velocityToDegTanh = (v, { maxDeg = 18, vAtMax = 1200 } = {}) => {
    const normalized = Math.tanh(v / vAtMax);
    return normalized * maxDeg;
  };
  const smooth = (prev, next, alpha = 0.18) => {
    return prev + (next - prev) * alpha;
  };
  const handle_drag_end = () => {
    setDraggableInnerPosition({ x: 0, y: 0 });
    setDraggableOutterPosition({ x: 0, y: 0 });
    setDraggableComponentRender(null);
  };

  useEffect(() => {
    if (draggableComponentRender) {
      setGhostComponent(() => {
        const ghost_component = draggableComponentRender;
        const mergedStyle = {
          ...(ghost_component.props.style || {}),
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          transform: `translate(0%, 0%)`,
          width: draggableSize.width,
          height: draggableSize.height,
        };
        if (isValidElement(ghost_component)) {
          return cloneElement(ghost_component, {
            style: mergedStyle,
          });
        } else {
          return <div style={mergedStyle}>{ghost_component}</div>;
        }
      });
    }
  }, [draggableComponentRender, draggableSize]);
  useEffect(() => {
    const computeRotateZ = (
      vx,
      vy,
      originPct,
      size,
      {
        maxDeg = 10, // rotateZ 最大角度一般别太大，3~12之间舒服
        vAtMax = 1400, // 速度到这附近基本饱和
        lever = 1.0, // “抓角落更容易拧”的倍率
      } = {}
    ) => {
      if (!size?.width || !size?.height) return 0;

      const ox = originPct.x / 100 - 0.5;
      const oy = originPct.y / 100 - 0.5;

      // 杠杆长度：离中心越远越大（0~0.707）
      const r = Math.sqrt(ox * ox + oy * oy);
      const leverFactor = 1 + lever * (r / 0.707); // 1..(1+lever)

      // 速度归一化
      const nx = normTanh(vx, vAtMax);
      const ny = normTanh(vy, vAtMax);

      // 扭矩方向：2D 叉积（origin 向量 × 速度向量）
      // z = ox*vy - oy*vx
      const torque = ox * ny - oy * nx;

      // 映射到角度
      const deg = clamp(torque * maxDeg * leverFactor, -maxDeg, maxDeg);
      return deg;
    };
    if (draggableConfig?.tilt === true) {
      if (mouse.vx !== undefined && mouse.vy !== undefined) {
        if (mouse.vx === 0 && mouse.vy === 0) {
          setRotate((prev) => ({
            x: 0,
            y: 0,
            z: 0,
          }));
          return;
        }
        setRotate((prev) => ({
          x: smooth(prev.x, velocityToDegTanh(mouse.vy, { maxDeg: 45 })),
          y: smooth(prev.y, -velocityToDegTanh(mouse.vx, { maxDeg: 45 })),
          z: computeRotateZ(mouse.vx, mouse.vy, origin, draggableSize, {
            maxDeg: 45,
            vAtMax: 1400,
            lever: 1.2,
          }),
        }));
      }
    }
  }, [mouse.vx, mouse.vy, origin, draggableSize, draggableConfig]);
  useEffect(() => {
    setOrigin({
      x: clamp(
        (draggableInnerPosition.x / draggableSize.width) * 100,
        0,
        100
      ).toFixed(2),
      y: clamp(
        (draggableInnerPosition.y / draggableSize.height) * 100,
        0,
        100
      ).toFixed(2),
    });
    setScale(draggableConfig.tilt_config?.vanilla_scale);
  }, [draggableSize, draggableInnerPosition, draggableConfig]);

  return (
    <div
      style={{
        display: ghostComponent ? "inline-block" : "none",
        position: "fixed",
        top: mouse.y - draggableInnerPosition.y,
        left: mouse.x - draggableInnerPosition.x,
        width: draggableSize.width,
        height: draggableSize.height,
        outline: debug ? "3px dashed rgba(255, 255, 255, 0.75)" : "none",
        zIndex: 2048,
        transformOrigin: `${origin.x}% ${origin.y}%`,
        transition: "transform 420ms cubic-bezier(0.22, 1.18, 0.36, 1)",
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) rotateZ(${rotate.z}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseUp={handle_drag_end}
    >
      {ghostComponent}
      {debug ? (
        <>
          <div
            id={"DnDGhost-debug-x-origin"}
            style={{
              position: "absolute",
              top: `${origin.y}%`,
              left: 0,
              width: "100%",
              height: "2px",
              border: "2px dashed rgba(255, 255, 255, 0.75)",
              opacity: 0.5,
            }}
          ></div>
          <div
            id={"DnDGhost-debug-y-origin"}
            style={{
              position: "absolute",
              top: 0,
              left: `${origin.x}%`,
              width: "2px",
              height: "100%",
              border: "2px dashed rgba(255, 255, 255, 0.75)",
              opacity: 0.5,
            }}
          ></div>
        </>
      ) : null}
    </div>
  );
};
const DnDWrapper = ({ children, debug = false }) => {
  const [draggableSize, setDraggableSize] = useState({ width: 0, height: 0 });
  const [draggableInnerPosition, setDraggableInnerPosition] = useState({
    x: 0,
    y: 0,
  });
  const [draggableOutterPosition, setDraggableOutterPosition] = useState({
    x: 0,
    y: 0,
  });
  const [draggableComponentRender, setDraggableComponentRender] =
    useState(null);
  const [draggableConfig, setDraggableConfig] = useState({
    tilt: false,
    tilt_config: {
      x_max_deg: 45,
      y_max_deg: 45,
      z_max_deg: 20,
    },
  });

  return (
    <DnDContext.Provider
      value={{
        draggableSize,
        setDraggableSize,
        draggableComponentRender,
        setDraggableComponentRender,
        draggableInnerPosition,
        setDraggableInnerPosition,
        draggableOutterPosition,
        setDraggableOutterPosition,
        draggableConfig,
        setDraggableConfig,
      }}
    >
      {children}
      {draggableComponentRender ? <DnDGhost debug={debug} /> : null}
    </DnDContext.Provider>
  );
};

export { Draggable, Droppable, DnDGhost, DnDWrapper };
