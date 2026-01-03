import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

/* { Demos ( remove during production ) } -------------------------------------------------------------------------------------- */
import DemoPage from "./PAGEs/demo";
import IconDemo from "./DEMOs/icon_demo/icon_demo";
import SwitchDemo from "./DEMOs/switch_demo/switch_demo";
import DndDemo from "./DEMOs/dnd_demo/dnd_demo";
/* { Demos ( remove during production ) } -------------------------------------------------------------------------------------- */

const App = () => {
  return (
    <ConfigContainer>
      <Router>
        <Routes>
          {/* { Demos ( remove during production ) } --------------------------------------------------------------------------- */}
          <Route path="/mini" element={<DemoPage />} />
          <Route path="/mini/icon" element={<IconDemo />} />
          <Route path="/mini/switch" element={<SwitchDemo />} />
          <Route path="/mini/dnd" element={<DndDemo />} />
          {/* { Demos ( remove during production ) } --------------------------------------------------------------------------- */}
        </Routes>
      </Router>
    </ConfigContainer>
  );
};

export default App;
