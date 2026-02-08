import { useEffect, useContext } from "react";
import { ConfigContext } from "../../CONTAINERs/config/context";

const ScrollingBar = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);

  useEffect(() => {
    const styleElement = document.createElement("style");
    const scrollingBar = theme?.scrolling_bar || {};

    styleElement.innerHTML = `
    .scrolling-bar::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }
    .scrolling-bar::-webkit-scrollbar:vertical {
      width: 7px;
    }
    .scrolling-bar::-webkit-scrollbar:horizontal {
      height: 7px;
    }
    .scrolling-bar::-webkit-scrollbar-track {
      background-color: rgba(225, 225, 225, 0);
    }
    .scrolling-bar::-webkit-scrollbar-thumb {
      transition: background-color 0.2s ease;
      background-color: ${scrollingBar.backgroundColor?.default || "#CCCCCC00"};
      border-radius: 6px;
      border: ${scrollingBar.border || "2px solid transparent"};
    }
    .scrolling-bar::-webkit-scrollbar-thumb:horizontal {
      transition: background-color 0.2s ease;
      background-color: ${scrollingBar.backgroundColor?.default || "#CCCCCC00"};
      border-radius: 6px;
      border: ${scrollingBar.border || "2px solid transparent"};
    }
    .scrolling-bar::-webkit-scrollbar-thumb:hover,
    .scrolling-bar.scrolling-active::-webkit-scrollbar-thumb {
      background-color: ${scrollingBar.backgroundColor?.active || "#CCCCCC"};
    }

    .scrolling-bar::-webkit-scrollbar-thumb:horizontal:hover,
    .scrolling-bar.scrolling-active::-webkit-scrollbar-thumb:horizontal {
      background-color: ${scrollingBar.backgroundColor?.active || "#CCCCCC"};
    }
    .scrolling-bar::-webkit-scrollbar-track:horizontal {
      background-color: rgba(225, 225, 225, 0);
    }
    .scrolling-bar::-webkit-scrollbar-corner {
      background-color: transparent;
    }
  `;
    document.head.appendChild(styleElement);
    const elList = document.querySelectorAll(".scrolling-bar");
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

export default ScrollingBar;
