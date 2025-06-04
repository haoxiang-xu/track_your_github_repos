import { useState, useEffect, useContext, useCallback } from "react";

/* { Constants } ------------------------------------------------------------------------------------------------------------- */
import { fileTypeSVGs, UISVGs } from "./icon_manifest";
/* { Constants } ------------------------------------------------------------------------------------------------------------- */

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const Icon = ({ src, color, ...props }) => {
  const { theme } = useContext(ConfigContext);
  const [component, setComponent] = useState(null);
  const [isIconLoaded, setIsIconLoaded] = useState(false);

  const fetch_SVG_file = useCallback(async () => {
    try {
      let svg = null;
      if (src in fileTypeSVGs) {
        svg = await fileTypeSVGs[src]();
        setComponent(
          <img
            className="mini-ui-img-icon"
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
            className="mini-ui-svg-icon"
            fill={color || theme?.icon?.color || "currentColor"}
            {...props}
          ></SVG>
        );
      } else {
        svg = await import(`./SVGs/${src}.svg`);
        setComponent(
          <img
            className="mini-ui-img-icon"
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
  }, [src, theme, color]);
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
            className="mini-ui-img-icon"
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
  }, [src, theme, fetch_SVG_file]);

  if (!isIconLoaded) return null;
  return component ? component : null;
};

export default Icon;
