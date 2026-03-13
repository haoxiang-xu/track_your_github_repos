import { render, screen } from "@testing-library/react";
import TrafficChart from "./traffic_chart";
import { ConfigContext } from "../../../CONTAINERs/config/context";

jest.mock("recharts", () => {
  const React = require("react");

  return {
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ children }) => <svg data-testid="area-chart">{children}</svg>,
    Area: () => <g data-testid="area-series" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  };
});

const renderChart = (props) =>
  render(
    <ConfigContext.Provider
      value={{
        theme: { font: { fontFamily: "Jost, sans-serif" } },
        onThemeMode: "light_mode",
      }}
    >
      <TrafficChart {...props} />
    </ConfigContext.Provider>,
  );

describe("TrafficChart", () => {
  test("keeps the existing chart visible while showing a loading overlay", () => {
    renderChart({
      title: "Page Views",
      range: "14d",
      isLoading: true,
      data: [
        {
          timestamp: "2026-03-11T00:00:00.000Z",
          count: 8,
          uniques: 5,
        },
      ],
    });

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(
      screen.getByTestId("traffic-chart-loading-overlay"),
    ).toBeInTheDocument();
    expect(screen.queryByText("No data yet")).not.toBeInTheDocument();
  });

  test("shows a fixed loading placeholder when there is no data yet", () => {
    renderChart({
      title: "Page Views",
      range: "14d",
      isLoading: true,
      data: [],
    });

    expect(
      screen.getByTestId("traffic-chart-loading-placeholder"),
    ).toBeInTheDocument();
    expect(screen.queryByText("No data yet")).not.toBeInTheDocument();
  });

  test("shows the empty state only when not loading", () => {
    renderChart({
      title: "Page Views",
      range: "14d",
      isLoading: false,
      data: [],
    });

    expect(screen.getByText("No data yet")).toBeInTheDocument();
    expect(
      screen.queryByTestId("traffic-chart-loading-placeholder"),
    ).not.toBeInTheDocument();
  });
});
