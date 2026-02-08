import { useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import Select from "../../BUILTIN_COMPONENTs/select/select";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SelectDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [house, setHouse] = useState("club");
  const [city, setCity] = useState(null);

  const houseOptions = [
    { label: "Heart", value: "heart", icon: "poker_hearts" },
    { label: "Diamond", value: "diamond", icon: "poker_diamonds" },
    { label: "Spade", value: "spade", icon: "poker_spades", disabled: true },
    { label: "Club", value: "club", icon: "poker_clubs" },
  ];

  const cityOptions = [
    { label: "New York", value: "nyc", icon: "map" },
    { label: "San Francisco", value: "sf", icon: "map" },
    { label: "Tokyo", value: "tokyo", icon: "map" },
    { label: "Sydney", value: "sydney", icon: "map" },
    { label: "Berlin", value: "berlin", icon: "map", disabled: true },
    { label: "Singapore", value: "singapore", icon: "map" },
    { label: "London", value: "london", icon: "map" },
    { label: "Paris", value: "paris", icon: "map" },
    { label: "Toronto", value: "toronto", icon: "map" },
    { label: "Seoul", value: "seoul", icon: "map" },
    { label: "Bangkok", value: "bangkok", icon: "map" },
    { label: "Rome", value: "rome", icon: "map" },
    { label: "Barcelona", value: "barcelona", icon: "map" },
    { label: "Dubai", value: "dubai", icon: "map" },
    { label: "Delhi", value: "delhi", icon: "map" },
    { label: "Mexico City", value: "mexico_city", icon: "map" },
    { label: "Sao Paulo", value: "sao_paulo", icon: "map" },
    { label: "Cape Town", value: "cape_town", icon: "map" },
  ];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        padding: "10px",
      }}
    >
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily: "Jost",
          color: theme?.color || "black",

          userSelect: "none",
          webkitUserSelect: "none",
          mozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Selects
      </span>
      <Select
        options={houseOptions}
        value={house}
        set_value={setHouse}
        filter_mode="trigger"
        placeholder="Select club"
        style={{ width: 240 }}
      />
      <Select
        options={cityOptions}
        value={city}
        set_value={setCity}
        filter_mode="panel"
        placeholder="Select city"
        search_placeholder="Filter cities..."
        style={{ width: 280 }}
        dropdown_style={{ maxWidth: 320, maxHeight: 240 }}
      />
      <Select
        options={cityOptions}
        filter_mode="trigger"
        placeholder="Disabled select"
        style={{ width: 240 }}
        disabled
      />
    </div>
  );
};

export default SelectDemo;
