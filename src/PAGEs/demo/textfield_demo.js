import { useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import TextField from "../../BUILTIN_COMPONENTs/input/textfield";
import Icon from "../../BUILTIN_COMPONENTs/icon/icon";
import { CustomizedTooltip } from "./demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ── Shared small button ── */
const IconBtn = ({ src, color, size = 28, iconSize = 16, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backgroundColor: hovered ? "rgba(128,128,128,0.12)" : "transparent",
        transition: "background-color 0.15s ease",
        color: color || "inherit",
      }}
    >
      <Icon src={src} style={{ width: iconSize, height: iconSize }} />
    </div>
  );
};

/* ── Attachment toolbar (chat input) ── */
const AttachPanel = ({ color, bg, active }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      padding: "4px",
      borderRadius: 7,
      backgroundColor: active ? bg || "rgba(128,128,128,0.08)" : "transparent",
      transition: "background-color 0.22s ease",
    }}
  >
    <IconBtn src="add" color={color} />
    <IconBtn src="link" color={color} />
    <IconBtn src="edit" color={color} />
  </div>
);

/* ── Character counter badge ── */
const CharCount = ({ count, max, color }) => {
  const over = max && count > max;
  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: "Jost, sans-serif",
        color: over ? "#e05050" : color || "rgba(128,128,128,0.5)",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "color 0.15s ease",
      }}
    >
      {count}
      {max ? ` / ${max}` : ""}
    </span>
  );
};

const TextFieldDemo = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const color = theme?.color || "black";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)";
  const panelBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  /* ---- per-demo state ---- */
  const [chatVal, setChatVal] = useState("");
  const [chatFocused, setChatFocused] = useState(false);
  const chatActive = chatVal.length > 0 || chatFocused;

  const [noteVal, setNoteVal] = useState("");
  const NOTE_MAX = 280;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
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
          color,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        Text Field
      </span>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* ── 1. Chat message input ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<TextField
  min_rows={1}
  max_display_rows={6}
  placeholder="Type a message..."
  content_section={<AttachPanel />}
  functional_section={<IconBtn src="arrow_up" />}
/>
\`\`\`
          `}
        >
          <TextField
            value={chatVal}
            set_value={setChatVal}
            min_rows={1}
            max_display_rows={6}
            placeholder="Type a message..."
            on_focus={() => setChatFocused(true)}
            on_blur={() => setChatFocused(false)}
            content_section={
              <AttachPanel color={color} bg={panelBg} active={chatActive} />
            }
            functional_section={
              <>
                {chatVal.length > 0 && (
                  <IconBtn
                    src="close"
                    color={color}
                    onClick={() => setChatVal("")}
                  />
                )}
                <IconBtn src="arrow_up" color={color} />
              </>
            }
            style={{ width: 320, marginTop: 32 }}
          />
        </CustomizedTooltip>

        {/* ── 2. Note / comment with character limit ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<TextField
  min_rows={3}
  max_display_rows={8}
  placeholder="Write a note..."
  functional_section={<CharCount max={280} />}
/>
\`\`\`
          `}
        >
          <TextField
            value={noteVal}
            set_value={setNoteVal}
            min_rows={3}
            max_display_rows={8}
            placeholder="Write a note..."
            functional_section={
              <CharCount
                count={noteVal.length}
                max={NOTE_MAX}
                color={subColor}
              />
            }
            style={{ width: 300 }}
          />
        </CustomizedTooltip>
      </div>
    </div>
  );
};

export default TextFieldDemo;
