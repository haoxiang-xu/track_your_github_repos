import { useCallback, useEffect, useState } from "react";
import { createIndexedDBStorageAdapter } from "../../../BUILTIN_COMPONENTs/mini_react/mini_storage";

export const LEGACY_GITHUB_PAT_STORAGE_KEY = "github_pat";

let legacyTokenAdapter = null;

const resolveWindowTarget = (targetWindow) => {
  if (targetWindow) {
    return targetWindow;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  return null;
};

const getLegacyTokenAdapter = (adapterOverride) => {
  if (adapterOverride) {
    return adapterOverride;
  }
  if (!legacyTokenAdapter) {
    legacyTokenAdapter = createIndexedDBStorageAdapter();
  }
  return legacyTokenAdapter;
};

const parseLegacyTokenPayload = (rawValue) => {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "";
  }

  if (typeof rawValue !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(rawValue);
    return typeof parsed === "string" ? parsed : "";
  } catch (_error) {
    return rawValue.trim();
  }
};

export const githubTokenBridge = {
  isAvailable(targetWindow) {
    const runtimeWindow = resolveWindowTarget(targetWindow);
    return Boolean(
      runtimeWindow?.githubTokenAPI &&
        typeof runtimeWindow.githubTokenAPI.get === "function" &&
        typeof runtimeWindow.githubTokenAPI.set === "function" &&
        typeof runtimeWindow.githubTokenAPI.clear === "function",
    );
  },

  async get(targetWindow) {
    const runtimeWindow = resolveWindowTarget(targetWindow);
    if (!githubTokenBridge.isAvailable(runtimeWindow)) {
      return "";
    }

    const token = await runtimeWindow.githubTokenAPI.get();
    return typeof token === "string" ? token : "";
  },

  async set(token, targetWindow) {
    const runtimeWindow = resolveWindowTarget(targetWindow);
    if (!githubTokenBridge.isAvailable(runtimeWindow)) {
      return "";
    }

    const nextToken = typeof token === "string" ? token : "";
    const stored = await runtimeWindow.githubTokenAPI.set(nextToken);
    return typeof stored === "string" ? stored : nextToken;
  },

  async clear(targetWindow) {
    const runtimeWindow = resolveWindowTarget(targetWindow);
    if (!githubTokenBridge.isAvailable(runtimeWindow)) {
      return;
    }

    await runtimeWindow.githubTokenAPI.clear();
  },
};

export const readLegacyGithubToken = async (adapterOverride) => {
  const adapter = getLegacyTokenAdapter(adapterOverride);
  const rawValue = await adapter.getItem(LEGACY_GITHUB_PAT_STORAGE_KEY);
  return parseLegacyTokenPayload(rawValue);
};

export const writeLegacyGithubToken = async (token, adapterOverride) => {
  const adapter = getLegacyTokenAdapter(adapterOverride);
  const nextToken = typeof token === "string" ? token.trim() : "";

  if (!nextToken) {
    await adapter.removeItem(LEGACY_GITHUB_PAT_STORAGE_KEY);
    return "";
  }

  await adapter.setItem(
    LEGACY_GITHUB_PAT_STORAGE_KEY,
    JSON.stringify(nextToken),
  );
  return nextToken;
};

export const clearLegacyGithubToken = async (adapterOverride) => {
  const adapter = getLegacyTokenAdapter(adapterOverride);
  await adapter.removeItem(LEGACY_GITHUB_PAT_STORAGE_KEY);
};

export const resolveStoredGithubToken = async ({
  bridge = githubTokenBridge,
  targetWindow,
  legacyAdapter,
} = {}) => {
  const runtimeWindow = resolveWindowTarget(targetWindow);
  const legacyToken = await readLegacyGithubToken(legacyAdapter);

  if (!bridge.isAvailable(runtimeWindow)) {
    return legacyToken;
  }

  const secureToken = await bridge.get(runtimeWindow);
  if (secureToken) {
    if (legacyToken) {
      await clearLegacyGithubToken(legacyAdapter);
    }
    return secureToken;
  }

  if (legacyToken) {
    await bridge.set(legacyToken, runtimeWindow);
    await clearLegacyGithubToken(legacyAdapter);
    return legacyToken;
  }

  return "";
};

export const persistGithubToken = async (
  token,
  {
    bridge = githubTokenBridge,
    targetWindow,
    legacyAdapter,
  } = {},
) => {
  const runtimeWindow = resolveWindowTarget(targetWindow);
  const nextToken = typeof token === "string" ? token.trim() : "";

  if (!bridge.isAvailable(runtimeWindow)) {
    return writeLegacyGithubToken(nextToken, legacyAdapter);
  }

  if (!nextToken) {
    await bridge.clear(runtimeWindow);
    await clearLegacyGithubToken(legacyAdapter);
    return "";
  }

  const storedToken = await bridge.set(nextToken, runtimeWindow);
  await clearLegacyGithubToken(legacyAdapter);
  return storedToken;
};

export const clearStoredGithubToken = async (options = {}) =>
  persistGithubToken("", options);

export const useGithubTokenStorage = () => {
  const [pat, setPatState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const token = await resolveStoredGithubToken();
        if (!canceled) {
          setPatState(token);
          setError(null);
        }
      } catch (loadError) {
        if (!canceled) {
          setError(loadError);
          setPatState("");
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      canceled = true;
    };
  }, []);

  const setPat = useCallback(async (nextToken) => {
    const resolvedToken =
      typeof nextToken === "function" ? nextToken(pat) : nextToken;
    const normalizedToken =
      typeof resolvedToken === "string" ? resolvedToken.trim() : "";
    setPatState(normalizedToken);

    try {
      await persistGithubToken(normalizedToken);
      setError(null);
      return normalizedToken;
    } catch (persistError) {
      setError(persistError);
      throw persistError;
    }
  }, [pat]);

  const clearPat = useCallback(async () => {
    setPatState("");

    try {
      await clearStoredGithubToken();
      setError(null);
    } catch (clearError) {
      setError(clearError);
      throw clearError;
    }
  }, []);

  return [pat, setPat, { clearPat, isLoading, error }];
};

