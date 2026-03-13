import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import TrafficDashboard from "./traffic_dashboard";
import { ConfigContext } from "../../CONTAINERs/config/context";
import { useIndexedStorage } from "../../BUILTIN_COMPONENTs/mini_react/mini_storage";
import { fetchAllTraffic, fetchUser } from "./services/github_api";
import { useGithubTokenStorage } from "./services/github_token_storage";

jest.mock("../../BUILTIN_COMPONENTs/mini_react/mini_storage", () => ({
  useIndexedStorage: jest.fn(),
}));

jest.mock("./services/github_api", () => ({
  fetchUser: jest.fn(),
  fetchAllTraffic: jest.fn(),
}));

jest.mock("./services/github_token_storage", () => ({
  useGithubTokenStorage: jest.fn(),
}));

jest.mock("./components/repo_selector", () => ({
  __esModule: true,
  default: () => <div data-testid="repo-selector" />,
}));

jest.mock("./components/traffic_chart", () => ({
  __esModule: true,
  default: ({ title, data = [], range, isLoading }) => (
    <div data-testid={`traffic-chart-${title}`}>
      {title}|points:{data.length}|range:{range}|loading:{String(isLoading)}
    </div>
  ),
}));

jest.mock("./components/stat_card", () => ({
  __esModule: true,
  default: ({ label, value, delta, deltaLabel }) => (
    <div data-testid={`stat-card-${label.replace(/\s+/g, "-")}`}>
      {label}:{value}:{delta ?? "null"}:{deltaLabel ?? "null"}
    </div>
  ),
}));

jest.mock("./components/referrers_table", () => ({
  __esModule: true,
  default: ({ data = [] }) => <div data-testid="referrers-table">{data.length}</div>,
}));

jest.mock("./components/popular_paths_table", () => ({
  __esModule: true,
  default: ({ data = [] }) => <div data-testid="paths-table">{data.length}</div>,
}));

jest.mock("../../BUILTIN_COMPONENTs/input/segmented_button", () => ({
  __esModule: true,
  default: ({ value }) => <div data-testid="range-control">{value}</div>,
}));

jest.mock("../../BUILTIN_COMPONENTs/input/button", () => ({
  __esModule: true,
  default: ({ label, prefix_icon, onClick, disabled }) => (
    <button disabled={disabled} onClick={disabled ? undefined : onClick}>
      {label || prefix_icon || "button"}
    </button>
  ),
}));

jest.mock("../../BUILTIN_COMPONENTs/modal/modal", () => ({
  __esModule: true,
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

jest.mock("../../BUILTIN_COMPONENTs/icon/icon", () => ({
  __esModule: true,
  default: () => <span data-testid="icon" />,
}));

jest.mock("../../BUILTIN_COMPONENTs/spinner/arc_spinner", () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />,
}));

jest.mock("./settings/settings_modal", () => ({
  __esModule: true,
  SettingsModal: ({ open }) => (open ? <div data-testid="settings-modal" /> : null),
}));

const mockStorageState = {};

const clone = (value) => JSON.parse(JSON.stringify(value));

const seedStorageState = (seed = {}) => {
  Object.keys(mockStorageState).forEach((key) => delete mockStorageState[key]);
  Object.assign(mockStorageState, clone(seed));
};

const renderDashboard = () =>
  render(
    <ConfigContext.Provider
      value={{
        theme: { font: { fontFamily: "Jost, sans-serif" }, color: "#222" },
        onThemeMode: "light_mode",
        setOnThemeMode: jest.fn(),
        syncWithSystemTheme: false,
        setSyncWithSystemTheme: jest.fn(),
      }}
    >
      <TrafficDashboard />
    </ConfigContext.Provider>,
  );

const createSeriesEntry = (timestamp, count, uniques = count) => ({
  timestamp,
  count,
  uniques,
});

const createRepoData = (lastFetched, suffix = "10") => ({
  views: [createSeriesEntry(`2026-03-${suffix}T00:00:00.000Z`, 3, 2)],
  clones: [createSeriesEntry(`2026-03-${suffix}T00:00:00.000Z`, 2, 1)],
  referrers: [{ referrer: "google.com", count: 5, uniques: 3 }],
  paths: [{ path: "/docs", title: "Docs", count: 4, uniques: 2 }],
  lastFetched,
});

describe("TrafficDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGithubTokenStorage.mockReturnValue([
      "token",
      jest.fn(),
      { clearPat: jest.fn(), isLoading: false, error: null },
    ]);

    useIndexedStorage.mockImplementation((key, initialValue) => {
      const React = require("react");
      const hasSeed = Object.prototype.hasOwnProperty.call(mockStorageState, key);
      const [value, setValue] = React.useState(
        hasSeed ? clone(mockStorageState[key]) : initialValue,
      );

      React.useEffect(() => {
        mockStorageState[key] = clone(value);
      }, [key, value]);

      const setPersistedValue = (updater) => {
        setValue((currentValue) => {
          const nextValue =
            typeof updater === "function" ? updater(currentValue) : updater;
          mockStorageState[key] = clone(nextValue);
          return nextValue;
        });
      };

      return [value, setPersistedValue, { isLoading: false }];
    });
  });

  test("uses fresh cached data without auto-refreshing the active repo", async () => {
    seedStorageState({
      github_selected_repos: ["owner/repo-one"],
      github_traffic_data: {
        "owner/repo-one": createRepoData(new Date().toISOString(), "11"),
      },
    });

    fetchUser.mockResolvedValue({ login: "red" });

    renderDashboard();

    await waitFor(() => expect(fetchUser).toHaveBeenCalledWith("token"));
    await waitFor(() =>
      expect(screen.getByTestId("traffic-chart-Page Views")).toHaveTextContent(
        "loading:false",
      ),
    );

    expect(fetchAllTraffic).not.toHaveBeenCalled();
    expect(screen.getByTestId("stat-card-Views")).toHaveTextContent(
      "Views:3:null:null",
    );
  });

  test("silently refreshes stale cached data for the active repo", async () => {
    seedStorageState({
      github_selected_repos: ["owner/repo-one"],
      github_traffic_data: {
        "owner/repo-one": createRepoData(
          new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          "10",
        ),
      },
    });

    fetchUser.mockResolvedValue({ login: "red" });
    fetchAllTraffic.mockResolvedValue({
      views: { views: [createSeriesEntry("2026-03-11T00:00:00.000Z", 8, 5)] },
      clones: { clones: [createSeriesEntry("2026-03-11T00:00:00.000Z", 4, 2)] },
      referrers: [{ referrer: "github.com", count: 7, uniques: 5 }],
      paths: [{ path: "/new", title: "New", count: 6, uniques: 4 }],
    });

    renderDashboard();

    await waitFor(() => expect(fetchUser).toHaveBeenCalledWith("token"));
    await waitFor(() =>
      expect(fetchAllTraffic).toHaveBeenCalledWith("token", "owner", "repo-one"),
    );
  });

  test("shows chart loading state while fetching an uncached active repo", async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    seedStorageState({
      github_selected_repos: ["owner/repo-one"],
      github_traffic_data: {},
    });

    fetchUser.mockResolvedValue({ login: "red" });
    fetchAllTraffic.mockReturnValue(fetchPromise);

    renderDashboard();

    await waitFor(() => expect(fetchUser).toHaveBeenCalledWith("token"));
    await waitFor(() =>
      expect(fetchAllTraffic).toHaveBeenCalledWith("token", "owner", "repo-one"),
    );
    await waitFor(() =>
      expect(screen.getByTestId("traffic-chart-Page Views")).toHaveTextContent(
        "points:0|range:all|loading:true",
      ),
    );

    await act(async () => {
      resolveFetch({
        views: { views: [createSeriesEntry("2026-03-11T00:00:00.000Z", 8, 5)] },
        clones: {
          clones: [createSeriesEntry("2026-03-11T00:00:00.000Z", 4, 2)],
        },
        referrers: [],
        paths: [],
      });
      await fetchPromise;
    });
  });

  test("manual refresh still fetches all selected repos and merges stored history", async () => {
    seedStorageState({
      github_selected_repos: ["owner/repo-one", "owner/repo-two"],
      github_traffic_data: {
        "owner/repo-one": createRepoData(new Date().toISOString(), "09"),
        "owner/repo-two": createRepoData(new Date().toISOString(), "10"),
      },
    });

    fetchUser.mockResolvedValue({ login: "red" });
    fetchAllTraffic
      .mockResolvedValueOnce({
        views: { views: [createSeriesEntry("2026-03-11T00:00:00.000Z", 9, 6)] },
        clones: { clones: [createSeriesEntry("2026-03-11T00:00:00.000Z", 5, 3)] },
        referrers: [{ referrer: "github.com", count: 9, uniques: 6 }],
        paths: [{ path: "/repo-one", title: "Repo One", count: 8, uniques: 5 }],
      })
      .mockResolvedValueOnce({
        views: {
          views: [
            createSeriesEntry("2026-03-10T00:00:00.000Z", 11, 7),
            createSeriesEntry("2026-03-12T00:00:00.000Z", 4, 2),
          ],
        },
        clones: {
          clones: [
            createSeriesEntry("2026-03-10T00:00:00.000Z", 7, 3),
            createSeriesEntry("2026-03-12T00:00:00.000Z", 2, 1),
          ],
        },
        referrers: [{ referrer: "google.com", count: 6, uniques: 4 }],
        paths: [{ path: "/repo-two", title: "Repo Two", count: 5, uniques: 3 }],
      });

    renderDashboard();

    await waitFor(() => expect(fetchUser).toHaveBeenCalledWith("token"));
    expect(fetchAllTraffic).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText("Fetch Traffic"));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(fetchAllTraffic).toHaveBeenCalledTimes(2));
    await waitFor(() => {
      expect(mockStorageState.github_traffic_data["owner/repo-one"].views).toHaveLength(2);
      expect(mockStorageState.github_traffic_data["owner/repo-two"].views).toHaveLength(2);
      expect(mockStorageState.github_traffic_data["owner/repo-two"].views[0].count).toBe(11);
      expect(mockStorageState.github_traffic_data["owner/repo-two"].views[1].count).toBe(4);
    });
  });
});
