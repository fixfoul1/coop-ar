import { useCallback, useState } from "react";

const STORAGE_KEY = "coop-username";

export function useUsername() {
  const [username, setUsernameState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setUsername = useCallback((name: string) => {
    const trimmed = name.trim();
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      console.warn("localStorage write failed");
    }
    setUsernameState(trimmed);
  }, []);

  const clearUsername = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.warn("localStorage remove failed");
    }
    setUsernameState(null);
  }, []);

  return { username, setUsername, clearUsername };
}
