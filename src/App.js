import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

/* { Demos } ------------------------------------------------------------------------------------------------------------------- */
import IconDemo from "./DEMOs/icon_demo/icon_demo";
/* { Demos } ------------------------------------------------------------------------------------------------------------------- */

const App = () => {
  return (
    <ConfigContainer>
        <Router>
          <Routes>
            <Route path="/mini/icon" element={<IconDemo />} />
          </Routes>
        </Router>
    </ConfigContainer>
  );
};

export default App;
