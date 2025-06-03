import { useState, useEffect, useContext } from "react";

/* { Constants } ------------------------------------------------------------------------------------------------------------- */
import { fileTypeSVGs, UISVGs } from "./icon_manifest";
/* { Constants } ------------------------------------------------------------------------------------------------------------- */

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
import { StyleContext } from "../../CONTAINERs/style/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const Icon = ({ src, color, ...props }) => {
  const { theme } = useContext(ConfigContext);
  const { defaultIconRGB } = useContext(StyleContext);
  const [component, setComponent] = useState(null);
  const [isIconLoaded, setIsIconLoaded] = useState(false);

  const fetch_SVG_file = async () => {
    try {
      let svg = null;
      if (src in fileTypeSVGs) {
        svg = await fileTypeSVGs[src]();
        setComponent(
          <img
            src={svg.default}
            alt={src.replace(/_/g, " ")}
            draggable={false}
            {...props}
          />
        );
      } else if (src in UISVGs) {
        const SVG = UISVGs[src];
        setComponent(
          <SVG
            fill={color || defaultIconRGB}
            {...props}
          >
          </SVG>
        );
      } else {
        svg = await import(`./SVGs/${src}.svg`);
        setComponent(
          <img
            src={svg.default}
            alt={src.replace(/_/g, " ")}
            draggable={false}
            {...props}
          />
        );
      }
      setIsIconLoaded(true);
    } catch (error) {
      console.error(
        "[Error occurred while fetching SVG file BUILTIN_COMPONENTs/icon/icon.js]:",
        error
      );
    }
  };
  useEffect(() => {
    if (!src) return;
    try {
      if (
        src.indexOf("png") === -1 &&
        src.indexOf("jpg") === -1 &&
        src.indexOf("jpeg") === -1
      ) {
        fetch_SVG_file();
      } else {
        setComponent(
          <img
            src={src}
            alt={src.replace(/_/g, " ")}
            draggable={false}
            {...props}
          />
        );
        setIsIconLoaded(true);
      }
    } catch (error) {
      console.error(
        "[Error occurred while setting icon source BUILTIN_COMPONENTs/icon/icon.js]:",
        error
      );
      setIsIconLoaded(false);
    }
  }, [src, theme]);

  if (!isIconLoaded) return null;
  return component ? component : null;
};

export default Icon;
