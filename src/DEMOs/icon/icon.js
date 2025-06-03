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
            border: "2px solid rgb(34, 31, 76)",
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
            backgroundColor: "rgba(150, 150, 150, 0.2)",
            borderRadius: "16px",
          }}
        />
        <Icon
          src="search"
          color="rgb(255, 255, 255)"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
            padding: "12px",
            backgroundColor: "rgba(44, 44, 44, 0.8)",
            borderRadius: "16px",
          }}
        />
      </div>
    </div>
  );
};

export default IconDemo;
