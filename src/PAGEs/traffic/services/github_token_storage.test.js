import { act, renderHook, waitFor } from "@testing-library/react";
import {
  LEGACY_GITHUB_PAT_STORAGE_KEY,
  clearStoredGithubToken,
  githubTokenBridge,
  persistGithubToken,
  resolveStoredGithubToken,
  useGithubTokenStorage,
} from "./github_token_storage";
import { createIndexedDBStorageAdapter } from "../../../BUILTIN_COMPONENTs/mini_react/mini_storage";

jest.mock("../../../BUILTIN_COMPONENTs/mini_react/mini_storage", () => ({
  createIndexedDBStorageAdapter: jest.fn(),
}));

describe("github token storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete window.githubTokenAPI;
  });

  test("githubTokenBridge proxies get/set/clear to the Electron bridge", async () => {
    const targetWindow = {
      githubTokenAPI: {
        get: jest.fn().mockResolvedValue("secure-token"),
        set: jest.fn().mockResolvedValue("stored-token"),
        clear: jest.fn().mockResolvedValue(undefined),
      },
    };

    expect(githubTokenBridge.isAvailable(targetWindow)).toBe(true);
    await expect(githubTokenBridge.get(targetWindow)).resolves.toBe(
      "secure-token",
    );
    await expect(githubTokenBridge.set("next-token", targetWindow)).resolves.toBe(
      "stored-token",
    );
    await githubTokenBridge.clear(targetWindow);

    expect(targetWindow.githubTokenAPI.get).toHaveBeenCalledTimes(1);
    expect(targetWindow.githubTokenAPI.set).toHaveBeenCalledWith("next-token");
    expect(targetWindow.githubTokenAPI.clear).toHaveBeenCalledTimes(1);
  });

  test("migrates a legacy IndexedDB PAT into the Electron bridge on load", async () => {
    const legacyAdapter = {
      getItem: jest.fn().mockResolvedValue(JSON.stringify("legacy-token")),
      setItem: jest.fn(),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };
    const bridge = {
      isAvailable: jest.fn().mockReturnValue(true),
      get: jest.fn().mockResolvedValue(""),
      set: jest.fn().mockResolvedValue("legacy-token"),
      clear: jest.fn(),
    };

    const token = await resolveStoredGithubToken({
      bridge,
      legacyAdapter,
      targetWindow: {},
    });

    expect(token).toBe("legacy-token");
    expect(bridge.set).toHaveBeenCalledWith("legacy-token", {});
    expect(legacyAdapter.removeItem).toHaveBeenCalledWith(
      LEGACY_GITHUB_PAT_STORAGE_KEY,
    );
  });

  test("prefers the secure PAT when both secure and legacy copies exist", async () => {
    const legacyAdapter = {
      getItem: jest.fn().mockResolvedValue(JSON.stringify("legacy-token")),
      setItem: jest.fn(),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };
    const bridge = {
      isAvailable: jest.fn().mockReturnValue(true),
      get: jest.fn().mockResolvedValue("secure-token"),
      set: jest.fn(),
      clear: jest.fn(),
    };

    const token = await resolveStoredGithubToken({
      bridge,
      legacyAdapter,
      targetWindow: {},
    });

    expect(token).toBe("secure-token");
    expect(bridge.set).not.toHaveBeenCalled();
    expect(legacyAdapter.removeItem).toHaveBeenCalledWith(
      LEGACY_GITHUB_PAT_STORAGE_KEY,
    );
  });

  test("falls back to IndexedDB persistence when the Electron bridge is unavailable", async () => {
    const legacyAdapter = {
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };
    const bridge = {
      isAvailable: jest.fn().mockReturnValue(false),
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };

    await persistGithubToken("fallback-token", {
      bridge,
      legacyAdapter,
      targetWindow: {},
    });
    await clearStoredGithubToken({
      bridge,
      legacyAdapter,
      targetWindow: {},
    });

    expect(legacyAdapter.setItem).toHaveBeenCalledWith(
      LEGACY_GITHUB_PAT_STORAGE_KEY,
      JSON.stringify("fallback-token"),
    );
    expect(legacyAdapter.removeItem).toHaveBeenCalledWith(
      LEGACY_GITHUB_PAT_STORAGE_KEY,
    );
  });

  test("useGithubTokenStorage loads from the bridge and persists updates", async () => {
    createIndexedDBStorageAdapter.mockReturnValue({
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    });

    window.githubTokenAPI = {
      get: jest.fn().mockResolvedValue("desktop-token"),
      set: jest.fn().mockResolvedValue("desktop-token-updated"),
      clear: jest.fn().mockResolvedValue(true),
    };

    const { result } = renderHook(() => useGithubTokenStorage());

    await waitFor(() => expect(result.current[2].isLoading).toBe(false));
    expect(result.current[0]).toBe("desktop-token");

    await act(async () => {
      await result.current[1]("desktop-token-updated");
    });
    expect(window.githubTokenAPI.set).toHaveBeenCalledWith(
      "desktop-token-updated",
    );

    await act(async () => {
      await result.current[2].clearPat();
    });
    expect(window.githubTokenAPI.clear).toHaveBeenCalledTimes(1);
  });
});
