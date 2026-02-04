import { useEffect, useContext } from "react";
import { ConfigContext } from "../../CONTAINERs/config/context";

const ScrollingSpace = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);

  useEffect(() => {
    const styleElement = document.createElement("style");
    const scrollingSpace = theme?.scrollingSpace || {};

    styleElement.innerHTML = `
    .scrolling-space-v::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }
    .scrolling-space-v::-webkit-scrollbar:vertical {
      width: 7px;
    }
    .scrolling-space-v::-webkit-scrollbar:horizontal {
      height: 7px;
    }
    .scrolling-space-v::-webkit-scrollbar-track {
      background-color: rgba(225, 225, 225, 0);
    }
    .scrolling-space-v::-webkit-scrollbar-thumb {
      transition: background-color 0.2s ease;
      background-color: ${scrollingSpace.backgroundColor?.default || "#CCCCCC00"};
      border-radius: 6px;
      border: ${scrollingSpace.border || "2px solid transparent"};
    }
    .scrolling-space-v::-webkit-scrollbar-thumb:horizontal {
      transition: background-color 0.2s ease;
      background-color: ${scrollingSpace.backgroundColor?.default || "#CCCCCC00"};
      border-radius: 6px;
      border: ${scrollingSpace.border || "2px solid transparent"};
    }
    .scrolling-space-v::-webkit-scrollbar-thumb:hover,
    .scrolling-space-v.scrolling-active::-webkit-scrollbar-thumb {
      background-color: ${scrollingSpace.backgroundColor?.active || "#CCCCCC"};
    }

    .scrolling-space-v::-webkit-scrollbar-thumb:horizontal:hover,
    .scrolling-space-v.scrolling-active::-webkit-scrollbar-thumb:horizontal {
      background-color: ${scrollingSpace.backgroundColor?.active || "#CCCCCC"};
    }
    .scrolling-space-v::-webkit-scrollbar-track:horizontal {
      background-color: rgba(225, 225, 225, 0);
    }
  `;
    document.head.appendChild(styleElement);
    const elList = document.querySelectorAll(".scrolling-space-v");
    elList.forEach((el) => {
      let timer = null;
      el.addEventListener("scroll", () => {
        el.classList.add("scrolling-active");
        clearTimeout(timer);
        timer = setTimeout(() => {
          el.classList.remove("scrolling-active");
        }, 800);
      });
    });
    return () => {
      document.head.removeChild(styleElement);
      elList.forEach((el) => el.classList.remove("scrolling-active"));
    };
  }, [theme, onThemeMode]);
};

export default ScrollingSpace;
