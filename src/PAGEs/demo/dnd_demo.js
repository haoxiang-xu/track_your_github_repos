import { useContext, useState, useCallback, useMemo } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import {
  DndContext,
  Draggable,
  Droppable,
  arrayMove,
  findContainer,
  moveBetweenContainers,
} from "../../BUILTIN_COMPONENTs/dnd";
import { CustomizedTooltip } from "./demo";
import { restrictToParentElement } from "@dnd-kit/modifiers";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ── card used as a draggable item ────────────────────── */
const DemoCard = ({ label, isDark, isDragOverlay }) => {
  return (
    <div
      style={{
        padding: "10px 18px",
        borderRadius: 7,
        backgroundColor: isDark
          ? "rgba(38, 38, 38, 1)"
          : "rgba(255, 255, 255, 1)",
        color: isDark ? "#ddd" : "#222",
        fontFamily: "Jost, sans-serif",
        fontSize: 14,
        fontWeight: 500,
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isDragOverlay
          ? isDark
            ? "0 12px 32px rgba(0,0,0,0.45)"
            : "0 12px 32px rgba(0,0,0,0.14)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.35)"
            : "0 2px 8px rgba(0,0,0,0.06)",
        whiteSpace: "nowrap",
        userSelect: "none",
        WebkitUserSelect: "none",
        transform: isDragOverlay ? "scale(1.02)" : undefined,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      {label}
    </div>
  );
};

/* ── item data (keyed by id for quick lookup) ────────── */
const ITEM_DATA = {
  1: { label: "Item 1" },
  2: { label: "Item 2" },
  3: { label: "Item 3" },
  4: { label: "Item 4" },
  5: { label: "Item 5" },
  6: { label: "Item 6" },
  7: { label: "Item 7" },
  8: { label: "Item 8" },
  9: { label: "Item 9" },
  10: { label: "Item 10" },
};

/* ── initial container → ids mapping ─────────────────── */
const INITIAL_CONTAINERS = {
  A: ["1", "2", "3", "4"],
  B: ["5", "6"],
};

const DndDemo = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [containers, setContainers] = useState(INITIAL_CONTAINERS);

  /* ── drag events ────────────────────────────────────── */
  const onDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;

      const activeContainer = findContainer(active.id, containers);
      const overContainer = findContainer(over.id, containers);

      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      )
        return;

      setContainers((prev) =>
        moveBetweenContainers(
          prev,
          activeContainer,
          overContainer,
          active.id,
          over.id,
        ),
      );
    },
    [containers],
  );

  const onDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;

      const activeContainer = findContainer(active.id, containers);
      const overContainer = findContainer(over.id, containers);

      if (!activeContainer || !overContainer) return;

      if (activeContainer === overContainer) {
        const items = containers[activeContainer];
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        if (oldIndex !== newIndex) {
          setContainers((prev) => ({
            ...prev,
            [activeContainer]: arrayMove(
              prev[activeContainer],
              oldIndex,
              newIndex,
            ),
          }));
        }
      } else {
        // Already handled in onDragOver — finalize position
        setContainers((prev) =>
          moveBetweenContainers(
            prev,
            activeContainer,
            overContainer,
            active.id,
            over.id,
          ),
        );
      }
    },
    [containers],
  );

  /* ── overlay renderer ──────────────────────────────── */
  const renderOverlay = useCallback(
    (activeId) => {
      const data = ITEM_DATA[activeId];
      if (!data) return null;
      return <DemoCard label={data.label} isDark={isDark} isDragOverlay />;
    },
    [isDark],
  );

  /* ── flat items list for each container ────────────── */
  const containerStyle = useMemo(
    () => ({
      flex: 1,
      minWidth: 180,
      minHeight: 80,
      padding: 12,
      borderRadius: 10,
      border: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(0,0,0,0.08)",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    }),
    [isDark],
  );

  const labelStyle = useMemo(
    () => ({
      fontSize: 12,
      fontFamily: "Jost, sans-serif",
      fontWeight: 500,
      color: theme?.color || "#222",
      opacity: 0.45,
      marginBottom: 8,
      userSelect: "none",
    }),
    [theme?.color],
  );

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        padding: "10px",
      }}
    >
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily: "Jost",
          color: theme?.color || "black",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        Drag & Drop
      </span>

      {/* ── Vertical → Vertical ──────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<DndContext on_drag_over={handleDragOver}
            on_drag_end={handleDragEnd}
            overlay={(id) => <Card>{items[id]}</Card>}>
  <Droppable id="A" items={listA} direction="vertical">
    {listA.map((id) => (
      <Draggable key={id} id={id}>
        <Card>{items[id].label}</Card>
      </Draggable>
    ))}
  </Droppable>
</DndContext>
\`\`\`
        `}
      >
        <DndContext
          on_drag_over={onDragOver}
          on_drag_end={onDragEnd}
          overlay={renderOverlay}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <div style={containerStyle}>
              <div style={labelStyle}>List A (vertical)</div>
              <Droppable
                id="A"
                items={containers.A}
                direction="vertical"
                gap={8}
              >
                {containers.A.map((id) => (
                  <Draggable key={id} id={id}>
                    <DemoCard label={ITEM_DATA[id].label} isDark={isDark} />
                  </Draggable>
                ))}
              </Droppable>
            </div>

            <div style={containerStyle}>
              <div style={labelStyle}>List B (vertical)</div>
              <Droppable
                id="B"
                items={containers.B}
                direction="vertical"
                gap={8}
              >
                {containers.B.map((id) => (
                  <Draggable key={id} id={id}>
                    <DemoCard label={ITEM_DATA[id].label} isDark={isDark} />
                  </Draggable>
                ))}
              </Droppable>
            </div>
          </div>
        </DndContext>
      </CustomizedTooltip>

      {/* ── Sort Only (no cross-container) ────────────── */}
      <SortOnlyDemo
        isDark={isDark}
        theme={theme}
        containerStyle={containerStyle}
        labelStyle={labelStyle}
      />
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Sort-only demo — items stay in their own droppable                                                                          */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SORT_ONLY_INITIAL = {
  C: ["7", "8", "9", "10"],
};

const SortOnlyList = ({ listId, isDark, containerStyle, labelStyle }) => {
  const [items, setItems] = useState(SORT_ONLY_INITIAL[listId]);

  const onDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const renderOverlay = useCallback(
    (activeId) => {
      const data = ITEM_DATA[activeId];
      if (!data) return null;
      return <DemoCard label={data.label} isDark={isDark} isDragOverlay />;
    },
    [isDark],
  );

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>List {listId} (sort only)</div>
      <DndContext
        on_drag_end={onDragEnd}
        overlay={renderOverlay}
        modifiers={[restrictToParentElement]}
      >
        <Droppable id={listId} items={items} direction="vertical" gap={8}>
          {items.map((id) => (
            <Draggable key={id} id={id}>
              <DemoCard label={ITEM_DATA[id].label} isDark={isDark} />
            </Draggable>
          ))}
        </Droppable>
      </DndContext>
    </div>
  );
};

const SortOnlyDemo = ({ isDark, theme, containerStyle, labelStyle }) => {
  return (
    <CustomizedTooltip
      code={`
\`\`\`js
// Each list has its own DndContext
// → items can never leave their container
<DndContext on_drag_end={handleSort}
            overlay={(id) => <Card />}>
  <Droppable id="C" items={items}>
    {items.map((id) => (
      <Draggable key={id} id={id}>
        <Card>{id}</Card>
      </Draggable>
    ))}
  </Droppable>
</DndContext>
\`\`\`
      `}
    >
      <div style={{ display: "flex", gap: 24 }}>
        <SortOnlyList
          listId="C"
          isDark={isDark}
          containerStyle={containerStyle}
          labelStyle={labelStyle}
        />
      </div>
    </CustomizedTooltip>
  );
};

export default DndDemo;
