import { useEffect, useState, useContext } from "react";

/* { Constants } ------------------------------------------------------------------------------------------------------------- */
import { defaultRGBA, defaultFontRGBA, defaultIconRGBA } from "./config";
/* { Constants } ------------------------------------------------------------------------------------------------------------- */

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { StyleContext } from "./context";
import { ConfigContext } from "../config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const StyleContainer = ({ children }) => {
  const { theme } = useContext(ConfigContext);

  /* { RGB } ================================================================================================================= */
  const [defaultRGB, setDefaultRGB] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });
  const [defaultFonrRGB, setDefaultFontRGB] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  const [defaultIconRGB, setDefaultIconRGB] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  useEffect(() => {
    if (theme === "light_theme") {
      setDefaultRGB(defaultRGBA.light_theme);
      setDefaultFontRGB(defaultFontRGBA.light_theme);
      setDefaultIconRGB(defaultIconRGBA.light_theme);
    }
    if (theme === "dark_theme") {
      setDefaultRGB(defaultRGBA.dark_theme);
      setDefaultFontRGB(defaultFontRGBA.dark_theme);
      setDefaultIconRGB(defaultIconRGBA.dark_theme);
    }
  }, [theme]);
  /* { RGB } ================================================================================================================= */

  return (
    <StyleContext.Provider
      value={{
        defaultRGB,
        defaultFonrRGB,
        defaultIconRGB,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export default StyleContainer;
