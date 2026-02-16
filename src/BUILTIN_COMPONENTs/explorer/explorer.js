import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import {
  DndContext as DndKitContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Helpers                                                                                                                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Normalise a node so every node has an `id`. */
let _autoId = 0;
const normalise = (node) => {
  if (!node.id) node.id = `__explorer_${++_autoId}`;
  if (node.children) node.children = node.children.map(normalise);
  return node;
};

/** Collect all visible ids (for SortableContext). */
const collectIds = (nodes, expanded) => {
  const ids = [];
  for (const n of nodes) {
    ids.push(n.id);
    if (n.children && expanded[n.id]) {
      ids.push(...collectIds(n.children, expanded));
    }
  }
  return ids;
};

/** Find a node by id (deep). */
const findNode = (nodes, id) => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
};

/** Find depth of a node by id. */
const findDepth = (nodes, id, depth = 0) => {
  for (const n of nodes) {
    if (n.id === id) return depth;
    if (n.children) {
      const found = findDepth(n.children, id, depth + 1);
      if (found !== -1) return found;
    }
  }
  return -1;
};

/** Deep-clone tree (needed for immutable DnD updates). */
const cloneTree = (nodes) =>
  nodes.map((n) => ({
    ...n,
    children: n.children ? cloneTree(n.children) : undefined,
  }));

/** Remove a node by id from tree, returns [newTree, removedNode]. */
const removeNode = (nodes, id) => {
  const next = [];
  let removed = null;
  for (const n of nodes) {
    if (n.id === id) {
      removed = n;
      continue;
    }
    if (n.children) {
      const [childNext, childRemoved] = removeNode(n.children, id);
      if (childRemoved) removed = childRemoved;
      next.push({ ...n, children: childNext });
    } else {
      next.push(n);
    }
  }
  return [next, removed];
};

/** Find the parent array and index for a given node id. */
const findParentArray = (nodes, id, parent = null) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { array: nodes, index: i, parent };
    if (nodes[i].children) {
      const found = findParentArray(nodes[i].children, id, nodes[i]);
      if (found) return found;
    }
  }
  return null;
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  ExplorerRow — one row in the tree                                                                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ROW_HEIGHT = 30;
const INDENT = 16;
const LINE_LEFT = 11;

const ExplorerRow = ({
  node,
  depth,
  isDark,
  colors,
  fontSize,
  isExpanded,
  onToggle,
  draggable,
  activeId,
  overId,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [ghostRect, setGhostRect] = useState(null);
  const labelRef = useRef(null);
  const hoverTimer = useRef(null);
  const rowRef = useRef(null);

  const isBeingDragged = activeId === node.id;
  const isDropTarget = overId === node.id && activeId !== node.id;

  /* ── dnd-kit sortable ──────────────────────────────── */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, disabled: !draggable });

  /* combined ref for sortable + measuring */
  const combinedRef = useCallback(
    (el) => {
      rowRef.current = el;
      setNodeRef(el);
    },
    [setNodeRef],
  );

  /* Only apply transform on the dragged item (which is hidden anyway).
     Non-dragged items stay in place — no "make room" shifting. */
  const sortableStyle = isBeingDragged
    ? { transform: CSS.Transform.toString(transform), transition }
    : {};

  /* ── visual tokens ─────────────────────────────────── */
  const hoverBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const activeBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)";
  const showBg = (hovered || pressed) && !isBeingDragged;

  /* expand icon */
  const expandIcon = node.expand_icon
    ? node.expand_icon
    : isExpanded
      ? "arrow_down"
      : "arrow_right";

  /* Check if text overflows – show full on hover after delay */
  const checkOverflow = useCallback(() => {
    if (labelRef.current) {
      const el = labelRef.current;
      if (el.scrollWidth > el.clientWidth) {
        hoverTimer.current = setTimeout(() => {
          if (rowRef.current) {
            setGhostRect(rowRef.current.getBoundingClientRect());
          }
          setShowFull(true);
        }, 600);
      }
    }
  }, []);

  const clearOverflow = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowFull(false);
    setGhostRect(null);
  }, []);

  /* ── event handlers ────────────────────────────────── */
  const handleClick = useCallback(
    (e) => {
      if (hasChildren) onToggle(node.id);
      if (node.on_click) node.on_click(node, e);
    },
    [hasChildren, node, onToggle],
  );

  const handleDoubleClick = useCallback(
    (e) => {
      if (node.on_double_click) node.on_double_click(node, e);
    },
    [node],
  );

  const handleContextMenu = useCallback(
    (e) => {
      if (node.on_context_menu) node.on_context_menu(node, e);
    },
    [node],
  );

  /* ── custom component path ─────────────────────────── */
  if (node.component) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...sortableStyle,
          paddingLeft: depth * INDENT,
          opacity: isBeingDragged ? 0 : 1,
          height: isBeingDragged ? 0 : undefined,
          overflow: isBeingDragged ? "hidden" : undefined,
          transition: "opacity 0.15s ease, height 0.15s ease",
        }}
        {...attributes}
        {...(draggable ? listeners : {})}
      >
        {typeof node.component === "function"
          ? node.component({ node, depth, isExpanded })
          : node.component}
      </div>
    );
  }

  const iconSize = Math.round(fontSize * 1.15);

  return (
    <div
      ref={combinedRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => {
        setHovered(true);
        checkOverflow();
      }}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
        clearOverflow();
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        ...sortableStyle,
        position: "relative",
        display: "flex",
        alignItems: "center",
        /* hide the original row while dragging — prevents double ghost */
        height: isBeingDragged ? 0 : ROW_HEIGHT,
        opacity: isBeingDragged ? 0 : 1,
        overflow: isBeingDragged ? "hidden" : "visible",
        paddingLeft: isBeingDragged ? 0 : depth * INDENT,
        paddingRight: isBeingDragged ? 0 : 8,
        gap: 4,
        fontSize,
        fontFamily: "Jost, sans-serif",
        fontWeight: 400,
        color: colors.color,
        cursor: draggable ? (isDragging ? "grabbing" : "pointer") : "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        borderRadius: 5,
        transition: "opacity 0.15s ease, height 0.15s ease, padding 0.15s ease",
        ...node.style,
      }}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      {/* ── drop insertion line (shown below this row) ── */}
      {isDropTarget && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -1,
            left: depth * INDENT + 4,
            right: 8,
            height: 2,
            borderRadius: 1,
            backgroundColor: isDark
              ? "rgba(100, 149, 237, 0.7)"
              : "rgba(66, 133, 244, 0.6)",
            boxShadow: isDark
              ? "0 0 4px rgba(100, 149, 237, 0.5)"
              : "0 0 3px rgba(66, 133, 244, 0.3)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* ── hover / press background ─────────────────── */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: pressed ? 1 : 0,
          borderRadius: pressed ? 4 : 5,
          backgroundColor: pressed ? activeBg : hoverBg,
          transform: showBg ? "scale(1)" : "scale(0.97, 0)",
          opacity: showBg ? 1 : 0,
          transition: showBg
            ? "transform 0.2s cubic-bezier(0.2,0.9,0.3,1), opacity 0.15s ease, inset 0.1s ease, border-radius 0.1s ease"
            : "transform 0.18s cubic-bezier(0.4,0,1,1), opacity 0.12s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── expand / collapse icon ───────────────────── */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          flexShrink: 0,
          opacity: hasChildren ? 0.7 : 0,
          transition: "transform 0.2s cubic-bezier(0.32,1,0.32,1)",
        }}
      >
        <Icon src={expandIcon} style={{ width: 14, height: 14 }} />
      </span>

      {/* ── prefix icon ──────────────────────────────── */}
      {node.prefix_icon && (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            src={node.prefix_icon}
            style={{ width: iconSize, height: iconSize }}
          />
        </span>
      )}

      {/* ── prefix text ──────────────────────────────── */}
      {node.prefix && (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
            opacity: 0.5,
            fontSize: fontSize - 1,
          }}
        >
          {node.prefix}
        </span>
      )}

      {/* ── label ────────────────────────────────────── */}
      <span
        ref={labelRef}
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {node.label}
      </span>

      {/* ── postfix text ─────────────────────────────── */}
      {node.postfix && (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
            opacity: 0.4,
            fontSize: fontSize - 1,
          }}
        >
          {node.postfix}
        </span>
      )}

      {/* ── postfix icon ─────────────────────────────── */}
      {node.postfix_icon && (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            src={node.postfix_icon}
            style={{ width: iconSize, height: iconSize }}
          />
        </span>
      )}

      {/* ── ghost overlay for truncated labels ───────── */}
      {showFull &&
        ghostRect &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: ghostRect.top,
              left: ghostRect.left,
              height: ghostRect.height,
              display: "flex",
              alignItems: "center",
              paddingLeft: depth * INDENT,
              paddingRight: 12,
              gap: 4,
              fontSize,
              fontFamily: "Jost, sans-serif",
              fontWeight: 400,
              color: colors.color,
              backgroundColor: colors.bg,
              borderRadius: 5,
              boxShadow: isDark
                ? "0 2px 12px rgba(0,0,0,0.45)"
                : "0 2px 12px rgba(0,0,0,0.10)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 999999,
            }}
          >
            {/* expand icon */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                flexShrink: 0,
                opacity: hasChildren ? 0.7 : 0,
              }}
            >
              <Icon src={expandIcon} style={{ width: 14, height: 14 }} />
            </span>
            {node.prefix_icon && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  src={node.prefix_icon}
                  style={{ width: iconSize, height: iconSize }}
                />
              </span>
            )}
            {node.prefix && (
              <span
                style={{
                  flexShrink: 0,
                  opacity: 0.5,
                  fontSize: fontSize - 1,
                }}
              >
                {node.prefix}
              </span>
            )}
            <span>{node.label}</span>
            {node.postfix && (
              <span
                style={{
                  flexShrink: 0,
                  opacity: 0.4,
                  fontSize: fontSize - 1,
                }}
              >
                {node.postfix}
              </span>
            )}
            {node.postfix_icon && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  src={node.postfix_icon}
                  style={{ width: iconSize, height: iconSize }}
                />
              </span>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  AnimatedChildren — collapse / expand wrapper                                                                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const AnimatedChildren = ({ open, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(open ? "auto" : 0);
  const [overflow, setOverflow] = useState(open ? "visible" : "hidden");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const el = contentRef.current;
    if (!el) return;

    if (open) {
      const h = el.scrollHeight;
      setHeight(h);
      setOverflow("hidden");
      const timer = setTimeout(() => {
        setHeight("auto");
        setOverflow("visible");
      }, 280);
      return () => clearTimeout(timer);
    } else {
      const h = el.scrollHeight;
      setHeight(h);
      setOverflow("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(0);
        });
      });
    }
  }, [open]);

  return (
    <div
      ref={contentRef}
      style={{
        height,
        overflow,
        transition: "height 0.28s cubic-bezier(0.32, 1, 0.32, 1)",
        willChange: "height",
      }}
    >
      {children}
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  ExplorerBranch — recursively renders tree nodes with level indicator lines                                                  */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ExplorerBranch = ({
  nodes,
  depth,
  isDark,
  colors,
  fontSize,
  expanded,
  onToggle,
  draggable,
  activeId,
  overId,
}) => {
  return nodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = !!expanded[node.id];

    return (
      <React.Fragment key={node.id}>
        <ExplorerRow
          node={node}
          depth={depth}
          isDark={isDark}
          colors={colors}
          fontSize={fontSize}
          isExpanded={isOpen}
          onToggle={onToggle}
          draggable={draggable}
          activeId={activeId}
          overId={overId}
        />
        {hasChildren && (
          <AnimatedChildren open={isOpen}>
            <div style={{ position: "relative" }}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: depth * INDENT + LINE_LEFT,
                  width: 1,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(0,0,0,0.08)",
                  borderRadius: 1,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <ExplorerBranch
                nodes={node.children}
                depth={depth + 1}
                isDark={isDark}
                colors={colors}
                fontSize={fontSize}
                expanded={expanded}
                onToggle={onToggle}
                draggable={draggable}
                activeId={activeId}
                overId={overId}
              />
            </div>
          </AnimatedChildren>
        )}
      </React.Fragment>
    );
  });
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Explorer — the main container                                                                                               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const AUTO_EXPAND_DELAY = 500;

const Explorer = ({
  data = [],
  default_expanded,
  draggable = false,
  on_reorder,
  style,
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  /* ── normalise nodes ───────────────────────────────── */
  const [tree, setTree] = useState(() => data.map(normalise));
  useEffect(() => {
    setTree(data.map(normalise));
  }, [data]);

  /* ── expanded state ────────────────────────────────── */
  const [expanded, setExpanded] = useState(() => {
    if (default_expanded === true) {
      const all = {};
      const walk = (nodes) =>
        nodes.forEach((n) => {
          if (n.children) {
            all[n.id] = true;
            walk(n.children);
          }
        });
      walk(data.map(normalise));
      return all;
    }
    if (Array.isArray(default_expanded)) {
      return Object.fromEntries(default_expanded.map((id) => [id, true]));
    }
    return {};
  });

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* ── sizing / colors ───────────────────────────────── */
  const fontSize = style?.fontSize ?? 13;
  const containerWidth = style?.width ?? 260;
  const colors = useMemo(() => {
    const bg = theme?.backgroundColor ?? (isDark ? "#1E1E1E" : "#FFFFFF");
    const color = theme?.color ?? (isDark ? "#CCC" : "#222");
    return { bg, color };
  }, [isDark, theme]);

  /* ── DnD state ─────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const autoExpandTimer = useRef(null);
  const collapsedOnDrag = useRef(null);

  const visibleIds = useMemo(
    () => collectIds(tree, expanded),
    [tree, expanded],
  );

  /* ── drag start: collapse the dragged folder ───────── */
  const handleDragStart = useCallback(
    (e) => {
      const id = e.active.id;
      setActiveId(id);
      setOverId(null);

      const node = findNode(tree, id);
      if (node?.children && expanded[id]) {
        collapsedOnDrag.current = id;
        setExpanded((prev) => ({ ...prev, [id]: false }));
      } else {
        collapsedOnDrag.current = null;
      }
    },
    [tree, expanded],
  );

  /* ── drag over: auto-expand closed folders after delay ── */
  const handleDragOver = useCallback(
    (e) => {
      const over = e.over;
      const newOverId = over?.id ?? null;
      setOverId(newOverId);

      if (autoExpandTimer.current) {
        clearTimeout(autoExpandTimer.current);
        autoExpandTimer.current = null;
      }

      if (!newOverId || newOverId === e.active.id) return;

      const overNode = findNode(tree, newOverId);
      if (overNode?.children && !expanded[newOverId]) {
        autoExpandTimer.current = setTimeout(() => {
          setExpanded((prev) => ({ ...prev, [newOverId]: true }));
        }, AUTO_EXPAND_DELAY);
      }
    },
    [tree, expanded],
  );

  /* ── drag end: reorder + restore ───────────────────── */
  const handleDragEnd = useCallback(
    (e) => {
      if (autoExpandTimer.current) {
        clearTimeout(autoExpandTimer.current);
        autoExpandTimer.current = null;
      }

      setActiveId(null);
      setOverId(null);

      const { active, over } = e;
      if (!over || active.id === over.id) {
        if (collapsedOnDrag.current) {
          setExpanded((prev) => ({
            ...prev,
            [collapsedOnDrag.current]: true,
          }));
          collapsedOnDrag.current = null;
        }
        return;
      }

      setTree((prev) => {
        const next = cloneTree(prev);
        const activeInfo = findParentArray(next, active.id);
        const overInfo = findParentArray(next, over.id);
        if (!activeInfo || !overInfo) return prev;

        if (activeInfo.array === overInfo.array) {
          const arr = activeInfo.array;
          const from = arr.findIndex((n) => n.id === active.id);
          const to = arr.findIndex((n) => n.id === over.id);
          const moved = arrayMove(arr, from, to);
          arr.length = 0;
          arr.push(...moved);
        } else {
          /* cross-parent: remove from source, then insert at target */
          const [withoutActive, removed] = removeNode(next, active.id);
          if (!removed) return prev;
          /* replace next's contents with the version that has the node removed */
          next.length = 0;
          next.push(...withoutActive);
          const overRefresh = findParentArray(next, over.id);
          if (!overRefresh) return prev;
          overRefresh.array.splice(overRefresh.index, 0, removed);
        }

        if (on_reorder) on_reorder(next);
        return next;
      });

      if (collapsedOnDrag.current) {
        setExpanded((prev) => ({
          ...prev,
          [collapsedOnDrag.current]: true,
        }));
        collapsedOnDrag.current = null;
      }
    },
    [on_reorder],
  );

  const handleDragCancel = useCallback(() => {
    if (autoExpandTimer.current) {
      clearTimeout(autoExpandTimer.current);
      autoExpandTimer.current = null;
    }
    if (collapsedOnDrag.current) {
      setExpanded((prev) => ({
        ...prev,
        [collapsedOnDrag.current]: true,
      }));
      collapsedOnDrag.current = null;
    }
    setActiveId(null);
    setOverId(null);
  }, []);

  /* ── overlay node data ────────────────────────────── */
  const activeNode = activeId ? findNode(tree, activeId) : null;
  const activeDepth = activeId ? findDepth(tree, activeId) : 0;
  const overlayIconSize = Math.round(fontSize * 1.15);

  /* ── render ────────────────────────────────────────── */
  const content = (
    <div
      style={{
        position: "relative",
        width: containerWidth,
        minHeight: 40,
        padding: "4px 0",
        fontFamily: "Jost, sans-serif",
        overflow: "hidden",
        ...style,
      }}
    >
      <ExplorerBranch
        nodes={tree}
        depth={0}
        isDark={isDark}
        colors={colors}
        fontSize={fontSize}
        expanded={expanded}
        onToggle={toggleExpand}
        draggable={draggable}
        activeId={activeId}
        overId={overId}
      />
    </div>
  );

  if (!draggable) return content;

  return (
    <DndKitContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={visibleIds}
        strategy={verticalListSortingStrategy}
      >
        {content}
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeNode ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: ROW_HEIGHT,
              paddingLeft: activeDepth * INDENT,
              paddingRight: 8,
              gap: 4,
              fontSize,
              fontFamily: "Jost, sans-serif",
              fontWeight: 400,
              color: colors.color,
              backgroundColor: colors.bg,
              borderRadius: 5,
              boxShadow: isDark
                ? "0 4px 16px rgba(0,0,0,0.5)"
                : "0 4px 16px rgba(0,0,0,0.12)",
              opacity: 0.9,
              whiteSpace: "nowrap",
              cursor: "grabbing",
              pointerEvents: "none",
            }}
          >
            {/* expand icon placeholder */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                flexShrink: 0,
                opacity: activeNode.children ? 0.7 : 0,
              }}
            >
              <Icon src="arrow_right" style={{ width: 14, height: 14 }} />
            </span>
            {activeNode.prefix_icon && (
              <span
                style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <Icon
                  src={activeNode.prefix_icon}
                  style={{ width: overlayIconSize, height: overlayIconSize }}
                />
              </span>
            )}
            {activeNode.prefix && (
              <span
                style={{ opacity: 0.5, fontSize: fontSize - 1, flexShrink: 0 }}
              >
                {activeNode.prefix}
              </span>
            )}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeNode.label}
            </span>
            {activeNode.postfix && (
              <span
                style={{ opacity: 0.4, fontSize: fontSize - 1, flexShrink: 0 }}
              >
                {activeNode.postfix}
              </span>
            )}
            {activeNode.postfix_icon && (
              <span
                style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <Icon
                  src={activeNode.postfix_icon}
                  style={{ width: overlayIconSize, height: overlayIconSize }}
                />
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndKitContext>
  );
};

export { Explorer as default, Explorer };
