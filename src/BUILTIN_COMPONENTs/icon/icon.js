import { useState, useEffect, useContext, useCallback } from "react";

/* { Constants } ------------------------------------------------------------------------------------------------------------- */
import { fileTypeSVGs, UISVGs } from "./icon_manifest";
/* { Constants } ------------------------------------------------------------------------------------------------------------- */

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const Icon = ({ src, color, ...props }) => {
  const { theme } = useContext(ConfigContext);

  const [component, setComponent] = useState(
    <div className="mini-ui-img-icon placeholder" {...props} />
  );

  const fetch_icon = useCallback(async () => {
    try {
      let svg = null;
      if (src in UISVGs) {
        const SVG = await UISVGs[src];
        setComponent(
          <SVG
            className="mini-ui-svg-icon"
            fill={color || theme?.icon?.color || "currentColor"}
          ></SVG>
        );
      } else if (src in fileTypeSVGs) {
        svg = await fileTypeSVGs[src]();
        setComponent(
          <img
            className="mini-ui-img-icon"
            src={svg.default}
            alt={src.replace(/_/g, " ")}
            draggable={false}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        );
      } else {
        svg = await import(`./SVGs/${src}.svg`);
        setComponent(
          <img
            className="mini-ui-img-icon"
            src={svg.default}
            alt={src.replace(/_/g, " ")}
            draggable={false}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        );
      }
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
        fetch_icon();
      } else {
        setComponent(
          <img
            className="mini-ui-img-icon"
            src={src}
            alt={src.replace(/_/g, " ")}
            draggable={false}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        );
      }
    } catch (error) {
      console.error(
        "[Error occurred while setting icon source BUILTIN_COMPONENTs/icon/icon.js]:",
        error
      );
    }
  }, [src, theme, fetch_icon]);

  return <div {...props}>{component}</div>;
};

export default Icon;
