/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
import { Router, Routes, Route } from "./BUILTIN_COMPONENTs/mini_react/mini_router";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import TitleBar, { TOP_BAR_HEIGHT } from "./BUILTIN_COMPONENTs/electron/title_bar";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

/* { Demos ( remove during production ) } -------------------------------------------------------------------------------------- */
import DemoPage from "./PAGEs/demo/demo";
/* { Demos ( remove during production ) } -------------------------------------------------------------------------------------- */

const isElectronRuntime = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(window.miniUIRuntime && window.miniUIRuntime.isElectron === true);
};

const App = () => {
  const onElectronRuntime = isElectronRuntime();

  return (
    <ConfigContainer>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TitleBar />
        <div
          style={{
            position: "absolute",
            top: onElectronRuntime ? TOP_BAR_HEIGHT : 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Router>
            <Routes>
              {/* { Demos ( remove during production ) } --------------------------------------------------------------------- */}
              <Route path="/mini" element={<DemoPage />} />
              {/* { Demos ( remove during production ) } --------------------------------------------------------------------- */}
            </Routes>
          </Router>
        </div>
      </div>
    </ConfigContainer>
  );
};

export default App;
