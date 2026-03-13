import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./CONTAINERs/config/container", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock("./BUILTIN_COMPONENTs/mini_react/mini_router", () => ({
  Router: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
}));

jest.mock("./PAGEs/traffic/traffic_dashboard", () => ({
  __esModule: true,
  default: () => <div>Traffic Dashboard</div>,
}));

jest.mock("./PAGEs/demo/demo", () => ({
  __esModule: true,
  default: () => <div>Demo Page</div>,
}));

test("renders the traffic dashboard route by default", () => {
  render(<App />);

  expect(screen.getByText("Traffic Dashboard")).toBeInTheDocument();
});
