/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../../BUILTIN_COMPONENTs/icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const IconDemo = () => {
  return (
    <div className="icon-demo">
      <h2>Icon Demo</h2>
      <div className="icon-list">
        <Icon
          src="settings"
          color="rgb(90, 86, 145)"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
          }}
        />
        <Icon
          src="user"
          color="#75ff33"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
          }}
        />
        <Icon
          src="search"
          color="#ff33a1"
          style={{
            width: "50px",
            height: "50px",
            margin: "10px",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
};

export default IconDemo;
