import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

/* { Demos ( remove during production ) } -------------------------------------------------------------------------------------- */
import DemoPage from "./PAGEs/demo";
import IconDemo from "./DEMOs/icon_demo/icon_demo";
/* { Demos ( remove during production ) } -------------------------------------------------------------------------------------- */

const App = () => {
  return (
    <ConfigContainer>
      <Router>
        <Routes>
          {/* { Demos ( remove during production ) } --------------------------------------------------------------------------- */}
          <Route path="/mini" element={<DemoPage />} />q
          <Route path="/mini/icon" element={<IconDemo />} />
          {/* { Demos ( remove during production ) } --------------------------------------------------------------------------- */}
        </Routes>
      </Router>
    </ConfigContainer>
  );
};

export default App;
