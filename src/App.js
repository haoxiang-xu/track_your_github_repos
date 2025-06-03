import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
import StyleContainer from "./CONTAINERs/style/container";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

/* { Demos } ------------------------------------------------------------------------------------------------------------------- */
import Icon from "./DEMOs/icon/icon";
/* { Demos } ------------------------------------------------------------------------------------------------------------------- */

const App = () => {
  return (
    <ConfigContainer>
      <StyleContainer>
        <Router>
          <Routes>
            <Route path="/mini/icon" element={<Icon />} />
          </Routes>
        </Router>
      </StyleContainer>
    </ConfigContainer>
  );
};

export default App;
