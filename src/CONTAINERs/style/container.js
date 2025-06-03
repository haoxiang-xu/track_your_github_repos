import { useEffect, useState, useContext } from "react";

/* { Constants } ------------------------------------------------------------------------------------------------------------- */
import { default_RGBA, default_font_RGBA, default_icon_RGBA } from "./config";
/* { Constants } ------------------------------------------------------------------------------------------------------------- */

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { StyleContext } from "./context";
import { ConfigContext } from "../config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const StyleContainer = ({ children }) => {
  const { theme } = useContext(ConfigContext);

  /* { RGB } ================================================================================================================= */
  const [defaultRGBA, setDefaultRGBA] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });
  const [defaultFonrRGBA, setDefaultFontRGBA] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  const [defaultIconRGBA, setDefaultIconRGBA] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  useEffect(() => {
    if (theme === "light_theme") {
      setDefaultRGBA(default_RGBA.light_theme);
      setDefaultFontRGBA(default_font_RGBA.light_theme);
      setDefaultIconRGBA(default_icon_RGBA.light_theme);
    }
    if (theme === "dark_theme") {
      setDefaultRGBA(default_RGBA.dark_theme);
      setDefaultFontRGBA(default_font_RGBA.dark_theme);
      setDefaultIconRGBA(default_icon_RGBA.dark_theme);
    }
  }, [theme]);
  /* { RGB } ================================================================================================================= */

  return (
    <StyleContext.Provider
      value={{
        defaultRGBA,
        defaultFonrRGBA,
        defaultIconRGBA,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export default StyleContainer;
