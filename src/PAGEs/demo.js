/* { Components } -------------------------------------------------------------------------------------------------------------- */
import GrainyBackground from "../BUILTIN_COMPONENTs/background/grainy_background/grainy_background";
import logo from "../logo.svg";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const DemoPage = () => {
  return (
    <div
      id="demo-page"
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <GrainyBackground
        baseFrequency={0.5}
        numOctaves={5}
        animationDuration={40}
      />
      <div
        id="demo-page-intro-container"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <img
          id="demo-page-intro-container-logo"
          src={logo}
          alt="Mini UI Logo"
          style={{
            width: "128px",
            height: "128px",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            pointerEvents: "none",
          }}
        />
        <span
          id="demo-page-intro-container-title"
          style={{
            display: "block",
            fontSize: "48px",
            color: "#FFFFFF",
            marginTop: "16px",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          Mini UI
        </span>
        <p
          id="demo-page-intro-container-description"
          style={{
            color: "#FFFFFF",
            fontSize: "18px",
            maxWidth: "600px",
            marginTop: "16px",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          A starting point for your React Project.
        </p>
      </div>
    </div>
  );
};

export default DemoPage;
