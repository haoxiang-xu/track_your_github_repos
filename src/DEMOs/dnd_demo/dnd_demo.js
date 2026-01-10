import { useState, useContext, forwardRef } from "react";
import {
  Droppable,
  Draggable,
  DnDWrapper,
} from "../../BUILTIN_COMPONENTs/mini_react/mini_dnd.js";
import { LightSwitch } from "../../BUILTIN_COMPONENTs/switch/switch.js";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const DraggableA = forwardRef(({ style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      style={{
        position: "absolute",
        display: "flex",
        color: "#ffffff",
        backgroundColor: "#ffffff28",
        backdropFilter: "blur(6px)",
        border: "3px solid #ffffff79",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        cursor: "grab",
        fontFamily: "Jost",
        fontSize: "48px",
        userSelect: "none",
        transformStyle: "preserve-3d",
        transform: "translateZ(0px) perspective(600px)",
        ...style,
      }}
    >
      A
    </div>
  );
});
const DraggableB = forwardRef(({ style, ...props }, ref) => {
  const { onThemeMode } = useContext(ConfigContext);
  return (
    <div
      ref={ref}
      {...props}
      style={{
        position: "absolute",
        display: "flex",
        color: "#ffffff",
        backgroundColor: onThemeMode === "light_mode" ? "#f3beab" : "#361952ff",
        backdropFilter: "blur(6px)",
        alignItems: "center",
        justifyContent: "center",
        border: "3px solid #ffffff79",
        borderRadius: "12px",
        cursor: "grab",
        fontFamily: "Jost",
        fontSize: "48px",
        userSelect: "none",
        transformStyle: "preserve-3d",
        transform: "translateZ(0px) perspective(600px)",
        ...style,
      }}
    >
      <LightSwitch style={{
        border: "2px solid #ffffffff",
      }}/>
    </div>
  );
});

const DndDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [draggablesA, setDraggablesA] = useState([
    {
      id: "draggable-A",
      render: () => {
        return <DraggableA />;
      },
      tilt: true,
      tilt_config: {
        vanilla_max_deg: 10,
        vanilla_scale: 1.1,
      },
    },
    {
      id: "draggable-B",
      render: () => {
        return <DraggableB />;
      },
      tilt: true,
      tilt_config: {
        vanilla_max_deg: 5,
        x_max_deg: 0,
        y_max_deg: 0,
        z_max_deg: 0,
        vanilla_scale: 1.2,
      },
    },
    {
      id: "draggable-C",
      render: () => {
        return (
          <div
            style={{
              position: "absolute",
              display: "flex",
              backgroundColor: "#ffa600ff",
              color: "#ffffff",
              border: "3px solid #ffffff79",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              fontFamily: "Jost",
              fontSize: "48px",
              cursor: "grab",
              userSelect: "none",
              transformStyle: "preserve-3d",
              transform: "translateZ(0px) perspective(600px)",
            }}
          >
            C
          </div>
        );
      },
      tilt: true,
      tilt_config: {
        vanilla_max_deg: 20,
        vanilla_scale: 1.2,
      },
    },
    {
      id: "draggable-D",
      render: () => {
        return (
          <div
            style={{
              position: "absolute",
              display: "flex",
              backgroundColor: "#ff000dff",
              color: "#ffffff",
              border: "3px solid #ffffff79",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              fontFamily: "Jost",
              fontSize: "48px",
              cursor: "grab",
              userSelect: "none",
              transformStyle: "preserve-3d",
              transform: "translateZ(0px) perspective(600px)",
            }}
          >
            D
          </div>
        );
      },
      tilt: true,
      tilt_config: {
        vanilla_max_deg: 20,
        vanilla_scale: 1.2,
      },
    },
  ]);
  const [draggablesB, setDraggablesB] = useState([]);

  return (
    <DnDWrapper>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: theme?.backgroundColor || "white",
        }}
      >
        <Droppable
          id={"droppable-0"}
          style={{
            width: "120px",
            height: "500px",
            position: "absolute",
            top: "50px",
            left: "50%",
            backgroundColor: theme?.foregroundColor || "#ffffff28",
            borderRadius: "24px",
          }}
          type="horizontal"
          draggables={draggablesA}
          setDraggables={setDraggablesA}
          draggable_style={{
            top: 0,
            height: 80,
            gap: 15,
          }}
        />
        <Droppable
          id={"droppable-1"}
          style={{
            width: "500px",
            height: "120px",
            position: "absolute",
            top: "calc(50% + 120px)",
            left: "50%",
            borderRadius: "24px",
            border: "5px dashed #8d8d8dff",
          }}
          type="vertical"
          draggables={draggablesB}
          setDraggables={setDraggablesB}
          draggable_style={{
            top: 0,
            height: 80,
            gap: 10,
          }}
        />
        <Draggable
          key={"draggable-E"}
          id="draggable-E"
          render={() => {
            return (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  backgroundColor: "#5284eeff",
                  color: "#ffffff",
                  border: "3px solid #ffffff79",
                  width: "120px",
                  height: "80px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  fontFamily: "Jost",
                  fontSize: "48px",
                  cursor: "grab",
                  userSelect: "none",
                  transformStyle: "preserve-3d",
                  transform: "translateZ(0px) perspective(600px)",
                }}
              >
                E
              </div>
            );
          }}
          tilt={true}
          tilt_config={{
            vanilla_max_deg: 15,
            vanilla_scale: 2,
          }}
        />
        <Draggable
          key={"draggable-F"}
          id="draggable-F"
          render={() => {
            return (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  backgroundColor: "#a927d1ff",
                  width: "80px",
                  height: "180px",
                  color: "#ffffff",
                  border: "3px solid #ffffff79",
                  marginTop: "20px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  fontFamily: "Jost",
                  fontSize: "48px",
                  cursor: "grab",
                  userSelect: "none",
                  transformStyle: "preserve-3d",
                  transform: "translateZ(0px) perspective(600px)",
                }}
              >
                F
              </div>
            );
          }}
          tilt={true}
          tilt_config={{
            vanilla_max_deg: 16,
            vanilla_scale: 1.3,
          }}
        />
      </div>
    </DnDWrapper>
  );
};

export default DndDemo;
