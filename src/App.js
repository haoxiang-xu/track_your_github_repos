import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

/* { Demos } ------------------------------------------------------------------------------------------------------------------- */
import Icon from "./DEMOs/icon/icon";
/* { Demos } ------------------------------------------------------------------------------------------------------------------- */

const App = () => {
  return (
    <ConfigContainer>
        <Router>
          <Routes>
            <Route path="/mini/icon" element={<Icon />} />
          </Routes>
        </Router>
    </ConfigContainer>
  );
};

export default App;
