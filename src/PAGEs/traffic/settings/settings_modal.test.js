import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import { SettingsModal } from "./settings_modal";

jest.mock("../../../BUILTIN_COMPONENTs/modal/modal", () => ({
  __esModule: true,
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

jest.mock("../../../BUILTIN_COMPONENTs/input/button", () => ({
  __esModule: true,
  default: ({ label, prefix_icon, onClick, disabled }) => (
    <button disabled={disabled} onClick={disabled ? undefined : onClick}>
      {label || prefix_icon || "button"}
    </button>
  ),
}));

jest.mock("../../../BUILTIN_COMPONENTs/select/select", () => ({
  __esModule: true,
  default: ({ options, value, set_value }) => (
    <select
      aria-label="theme-select"
      value={value}
      onChange={(event) => set_value(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("../../../BUILTIN_COMPONENTs/input/input", () => ({
  Input: ({ value, set_value, placeholder, on_key_down }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(event) => set_value(event.target.value)}
      onKeyDown={on_key_down}
    />
  ),
}));

jest.mock("../../../BUILTIN_COMPONENTs/icon/icon", () => ({
  __esModule: true,
  default: () => <span data-testid="icon" />,
}));

jest.mock("../../../BUILTIN_COMPONENTs/spinner/arc_spinner", () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />,
}));

const renderModal = (props = {}) =>
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
      <SettingsModal
        open
        onClose={jest.fn()}
        pat="ghp_1234567890token"
        setPat={jest.fn()}
        clearPat={jest.fn().mockResolvedValue(undefined)}
        user={{ login: "red", avatar_url: "" }}
        setUser={jest.fn()}
        selectedRepos={["owner/repo-one", "owner/repo-two"]}
        allTrafficData={{
          "owner/repo-one": {
            views: [{ timestamp: "2026-03-11T00:00:00.000Z", count: 3, uniques: 2 }],
            clones: [{ timestamp: "2026-03-11T00:00:00.000Z", count: 2, uniques: 1 }],
            referrers: [{ referrer: "google.com", count: 5, uniques: 3 }],
            paths: [{ path: "/docs", title: "Docs", count: 4, uniques: 2 }],
            lastFetched: "2026-03-11T12:00:00.000Z",
          },
        }}
        onClearLocalData={jest.fn()}
        {...props}
      />
    </ConfigContext.Provider>,
  );

describe("SettingsModal", () => {
  test("switches pages and clears local cache from the Local Data page", () => {
    const onClearLocalData = jest.fn();
    renderModal({ onClearLocalData });

    fireEvent.click(screen.getByText("Local Data"));

    expect(screen.getByText("Clear Cache")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Clear Cache"));

    expect(onClearLocalData).toHaveBeenCalledTimes(1);
  });

  test("disconnects the saved GitHub token from the GitHub Auth page", async () => {
    const clearPat = jest.fn().mockResolvedValue(undefined);
    const setUser = jest.fn();

    renderModal({ clearPat, setUser });
    fireEvent.click(screen.getByText("GitHub Auth"));
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));

    await waitFor(() => expect(clearPat).toHaveBeenCalledTimes(1));
    expect(setUser).toHaveBeenCalledWith(null);
  });
});
