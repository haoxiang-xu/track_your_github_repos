import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/* { Containers } -------------------------------------------------------------------------------------------------------------- */
import ConfigContainer from "./CONTAINERs/config/container";
/* { Containers } -------------------------------------------------------------------------------------------------------------- */

const App = () => {
  return (
    <ConfigContainer>
      <Router>
        <Routes></Routes>
      </Router>
    </ConfigContainer>
  );
};

export default App;
