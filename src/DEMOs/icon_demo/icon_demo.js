/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../../BUILTIN_COMPONENTs/icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

import { fileTypeSVGs } from "../../BUILTIN_COMPONENTs/icon/icon_manifest";

const IconDemo = () => {
  return (
    <div
      className="icon-demo"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <span
        style={{
          fontSize: "36px",
          marginBottom: "20px",
          color: "rgb(0, 0, 0)",
        }}
      >
        Icon Demo
      </span>
      <div
        className="icon-list"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          maxWidth: "800px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <span
          style={{
            width: "100%",
            fontSize: "24px",
            marginLeft: "10px",
            marginBottom: "10px",
            color: "rgb(0, 0, 0)",
          }}
        >
          file type SVGs
        </span>
        {fileTypeSVGs
          ? Object.entries(fileTypeSVGs).map(([key]) => {
              return (
                <div key={key} style={{}}>
                  <Icon
                    src={key}
                    style={{
                      width: "28px",
                      height: "28px",
                    }}
                  />
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

export default IconDemo;
