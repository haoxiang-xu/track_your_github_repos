/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../../BUILTIN_COMPONENTs/icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const IconDemo = () => {
  return (
    <div className="icon-demo"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <span
        style={{
          fontSize: "36px",
          marginBottom: "20px",
          color: "rgb(0, 0, 0)",
        }}
      >Icon Demo</span>
      <div className="icon-list">
        <Icon
          src="settings"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
            padding: "12px",
            boxSizing: "border-box",
            borderRadius: "16px",
          }}
        />
        <Icon
          src="CSS"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
            padding: "12px",
            borderRadius: "16px",
          }}
        />
        <Icon
          src="search"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
            padding: "12px",
            borderRadius: "16px",
          }}
        />
      </div>
    </div>
  );
};

export default IconDemo;
