import { useContext, useEffect, useRef, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const Separator = ({ style }) => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      style={{
        width: 1,
        backgroundColor: style?.color || theme?.color || "rgba(0, 0, 0, 0.12)",
        ...style,
      }}
    ></div>
  );
};

const ValidationCodeInput = ({ style }) => {
  const { theme } = useContext(ConfigContext);
  const inputRefs = useRef([]);
  const [values, setValues] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    for (let i = 0; i < values.length; i++) {
      if (values[i] === "") {
        if (inputRefs.current[i]) {
          inputRefs.current[i].focus();
        }
        return;
      }
    }
    if (inputRefs.current[values.length - 1]) {
      inputRefs.current[values.length - 1].focus();
    }
  }, [values]);

  const handle_key_down = (e, idx) => {
    const target = e.target;
    const selectionStart = target?.selectionStart ?? 0;
    const selectionEnd = target?.selectionEnd ?? 0;
    const currentValue = target?.value ?? "";
    const isCaretAtStart = selectionStart === 0 && selectionEnd === 0;
    const isCaretAtEnd =
      selectionStart === currentValue.length &&
      selectionEnd === currentValue.length;

    if (e.key === "Backspace" && values[idx] === "") {
      if (idx > 0) {
        const newValues = [...values];
        newValues[idx - 1] = "";
        setValues(newValues);
        if (inputRefs.current[idx - 1]) {
          inputRefs.current[idx - 1].focus();
        }
      }
    }
    if (e.key === "ArrowLeft") {
      if (idx > 0 && isCaretAtStart) {
        e.preventDefault();
        if (inputRefs.current[idx - 1]) {
          inputRefs.current[idx - 1].focus();
        }
      }
    }
    if (e.key === "ArrowRight") {
      if (idx < values.length - 1 && isCaretAtEnd) {
        e.preventDefault();
        if (inputRefs.current[idx + 1]) {
          inputRefs.current[idx + 1].focus();
        }
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
      }}
    >
      {values.map((val, idx) => (
        <Input
          input_ref={(el) => (inputRefs.current[idx] = el)}
          key={idx}
          style={{
            width: style?.fontSize || theme?.input.fontSize || 16,
            textAlign: "center",
            fontSize: style?.fontSize || theme?.input.fontSize || 16,
          }}
          value={val}
          set_value={(next) => {
            if (next.length > 1) next = next.slice(-1);
            const newValues = [...values];
            newValues[idx] = next;
            setValues(newValues);
          }}
          on_key_down={(e) => handle_key_down(e, idx)}
          placeholder=""
          maxLength={1}
        />
      ))}
    </div>
  );
};
const Password = ({
  style,
  value,
  set_value = () => {},
  mask_char = "\u25CF",
  ...props
}) => {
  const { theme } = useContext(ConfigContext);
  const [visible, setVisible] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef(null);
  const pendingCaretRef = useRef(null);
  const valueRef = useRef("");

  const isControlled = value !== undefined;
  const realValue = isControlled ? String(value ?? "") : internalValue;
  const maskChar = mask_char || "\u25CF";
  const displayValue = visible ? realValue : maskChar.repeat(realValue.length);

  useEffect(() => {
    valueRef.current = realValue;
  }, [realValue]);
  useEffect(() => {
    if (visible) return;
    if (!inputRef.current) return;
    if (pendingCaretRef.current === null) return;
    const caret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    inputRef.current.setSelectionRange(caret, caret);
  }, [displayValue, visible]);

  const update_value = (next) => {
    if (!isControlled) setInternalValue(next);
    set_value(next);
  };
  const handle_set_value = (nextDisplayValue, event) => {
    const diff_masked_value = (prevLen, nextValue, maskChar) => {
      const prevValue = maskChar.repeat(prevLen);
      const nextLen = nextValue.length;
      let start = 0;
      while (
        start < prevLen &&
        start < nextLen &&
        nextValue[start] === prevValue[start]
      ) {
        start += 1;
      }
      let end = 0;
      while (
        end < prevLen - start &&
        end < nextLen - start &&
        nextValue[nextLen - 1 - end] === prevValue[prevLen - 1 - end]
      ) {
        end += 1;
      }
      const removed = prevLen - start - end;
      const inserted = nextValue.slice(start, nextLen - end);
      return { start, removed, inserted };
    };
    if (visible) {
      update_value(nextDisplayValue);
      return;
    }

    const prevValue = valueRef.current;
    const prevLen = prevValue.length;
    const nextLen = nextDisplayValue.length;
    const inputType = event?.nativeEvent?.inputType || "";
    const data = event?.nativeEvent?.data ?? "";
    const caret = event?.target?.selectionStart ?? nextLen;

    if (inputType.startsWith("insert")) {
      if (data) {
        const insertLen = data.length;
        const removed = Math.max(0, prevLen - (nextLen - insertLen));
        const start = Math.max(0, caret - insertLen);
        const nextValue =
          prevValue.slice(0, start) + data + prevValue.slice(start + removed);
        pendingCaretRef.current = start + insertLen;
        update_value(nextValue);
        return;
      }

      const diff = diff_masked_value(prevLen, nextDisplayValue, maskChar);
      const nextValue =
        prevValue.slice(0, diff.start) +
        diff.inserted +
        prevValue.slice(diff.start + diff.removed);
      pendingCaretRef.current = diff.start + diff.inserted.length;
      update_value(nextValue);
      return;
    }

    if (inputType.startsWith("delete")) {
      const removed = Math.max(1, prevLen - nextLen);
      const deleteStart = Math.max(0, caret);
      const nextValue =
        prevValue.slice(0, deleteStart) +
        prevValue.slice(deleteStart + removed);
      pendingCaretRef.current = deleteStart;
      update_value(nextValue);
      return;
    }

    if (!inputType) {
      if (nextLen < prevLen) {
        const removed = Math.max(1, prevLen - nextLen);
        const deleteStart = Math.max(0, caret);
        const nextValue =
          prevValue.slice(0, deleteStart) +
          prevValue.slice(deleteStart + removed);
        pendingCaretRef.current = deleteStart;
        update_value(nextValue);
        return;
      }
      if (nextLen > prevLen) {
        const insertLen = nextLen - prevLen;
        const start = Math.max(0, caret - insertLen);
        const inserted = nextDisplayValue.slice(start, start + insertLen);
        const nextValue =
          prevValue.slice(0, start) + inserted + prevValue.slice(start);
        pendingCaretRef.current = start + insertLen;
        update_value(nextValue);
        return;
      }
    }

    const diff = diff_masked_value(prevLen, nextDisplayValue, maskChar);
    const nextValue =
      prevValue.slice(0, diff.start) +
      diff.inserted +
      prevValue.slice(diff.start + diff.removed);
    pendingCaretRef.current = diff.start + diff.inserted.length;
    update_value(nextValue);
  };

  return (
    <Input
      type="text"
      input_ref={inputRef}
      style={{ ...style }}
      value={displayValue}
      set_value={handle_set_value}
      postfix_component={
        <div
          style={{
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setVisible(!visible);
          }}
        >
          <Icon
            src={visible ? "eye_closed" : "eye_open"}
            style={{ width: 20, height: 20 }}
            color={style?.color || theme?.color || "black"}
          />
        </div>
      }
      placeholder="Password"
      no_separator={true}
      {...props}
    />
  );
};
const Input = ({
  /* content props -------------- */
  prefix_component,
  prefix_icon,
  prefix_label,
  postfix_component,
  postfix_label,
  postfix_icon,
  placeholder,

  /* functional props ----------- */
  input_ref,
  value,
  set_value = () => {},
  on_focus = () => {},
  on_blur = () => {},
  on_key_down = () => {},

  /* styling props -------------- */
  type = "text",
  style,
  max_length,
  no_separator = false,
}) => {
  const { theme } = useContext(ConfigContext);
  const default_input_ref = useRef(null);
  const [onFocus, setOnFocus] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: `6px 8px`,
        height:
          style?.height ||
          theme?.input.height ||
          style?.fontSize + 16 ||
          theme?.input.fontSize + 16 ||
          32,

        backgroundColor: theme?.input.backgroundColor || "white",
        borderRadius: style?.borderRadius || theme?.input.borderRadius || 4,
        boxShadow: style?.boxShadow || theme?.input.boxShadow || "none",
        outline:
          style?.outline || onFocus
            ? theme?.input.outline.onFocus
            : theme?.input.outline.onBlur || "1px solid #CCCCCC",
        overflow: "hidden",
        ...style,
      }}
      onClick={() => {
        if (
          (input_ref || default_input_ref) &&
          (input_ref || default_input_ref).current
        ) {
          (input_ref || default_input_ref).current.focus();
        }
      }}
    >
      {prefix_component !== undefined ? (
        <>
          {prefix_component}
          {!no_separator && (
            <Separator
              style={{
                height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              }}
            />
          )}
        </>
      ) : null}
      {prefix_icon === undefined ? null : (
        <>
          <Icon
            src={prefix_icon}
            style={{
              width: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
            }}
            color={style?.color || theme?.color || "black"}
          />
          {!no_separator && (
            <Separator
              style={{
                height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              }}
            />
          )}
        </>
      )}
      {prefix_label === undefined ? null : (
        <>
          <span
            style={{
              fontFamily:
                style?.fontFamily ||
                theme?.font.fontFamily ||
                "Arial, sans-serif",
              fontSize: style?.fontSize || theme?.input.fontSize || 16,
              color: style?.color || theme?.color || "black",

              userSelect: "none",
              webkitUserSelect: "none",
              mozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {prefix_label}
          </span>
          {!no_separator && (
            <Separator
              style={{
                height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              }}
            />
          )}
        </>
      )}
      <input
        ref={input_ref || default_input_ref}
        type={type}
        style={{
          fontFamily: style?.fontFamily || theme?.font.fontFamily || "Jost",
          width: "100%",
          height: "90%",
          fontSize: style?.fontSize || theme?.input.fontSize || 16,
          border: "1px solid rgba(255, 255, 255, 0)",
          backgroundColor: "rgba(0,0,0,0)",
          color: style?.color || theme?.color || "black",
          caretColor: style?.color || theme?.color || "black",
          outline: "none",
        }}
        onFocus={() => {
          setOnFocus(true);
          on_focus();
        }}
        onBlur={() => {
          setOnFocus(false);
          on_blur();
        }}
        onKeyDown={(e) => {
          on_key_down(e);
        }}
        maxLength={max_length}
        value={value}
        onChange={(e) => set_value(e.target.value, e)}
        placeholder={placeholder !== undefined ? placeholder : "Placeholder"}
      />
      {postfix_label === undefined ? null : (
        <>
          {!no_separator && (
            <Separator
              style={{
                height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              }}
            />
          )}
          <span
            style={{
              fontFamily:
                style?.fontFamily ||
                theme?.font.fontFamily ||
                "Arial, sans-serif",
              fontSize: style?.fontSize || theme?.input.fontSize || 16,
              color: style?.color || theme?.color || "black",

              userSelect: "none",
              webkitUserSelect: "none",
              mozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {postfix_label}
          </span>
        </>
      )}
      {postfix_icon === undefined ? null : (
        <>
          {!no_separator && (
            <Separator
              style={{
                height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              }}
            />
          )}
          <Icon
            src={postfix_icon}
            style={{
              width: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
            }}
            color={style?.color || theme?.color || "black"}
          />
        </>
      )}
      {postfix_component !== undefined ? (
        <>
          {!no_separator && (
            <Separator
              style={{
                height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              }}
            />
          )}
          {postfix_component}
        </>
      ) : null}
    </div>
  );
};

export { Password, ValidationCodeInput };
export default Input;
