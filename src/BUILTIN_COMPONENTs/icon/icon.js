import { useState, useEffect, useRef, useContext } from "react";
import { iconManifest } from "./icon_manifest";

import { ConfigContext } from "../../CONTAINERs/config/context";

const Icon = ({ src, ...props }) => {
  const { theme } = useContext(ConfigContext);
  const [iconSrc, setIconSrc] = useState(null);
  const [isIconLoaded, setIsIconLoaded] = useState(false);
  const iconRef = useRef(null);

  useEffect(() => {
    const fetch_SVG_file = async () => {
      try {
        let svg = null;
        if (theme === "dark_theme") {
          svg = await iconManifest[src]();
        } else {
          svg = await iconManifest[src + "_"]();
        }
        setIconSrc(svg.default);
        setIsIconLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };
    if (!src) return;
    try {
      if (
        src.indexOf("png") === -1 &&
        src.indexOf("jpg") === -1 &&
        src.indexOf("jpeg") === -1
      ) {
        fetch_SVG_file();
      } else {
        setIconSrc(src);
        setIsIconLoaded(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, [src, theme]);

  if (!isIconLoaded) return null;
  return (
    <img
      ref={iconRef}
      src={iconSrc}
      alt={src.replace(/_/g, " ")}
      draggable={false}
      {...props}
    />
  );
};

export default Icon;
