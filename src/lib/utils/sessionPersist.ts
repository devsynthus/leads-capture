const STORAGE_KEY = "expo-lead-form:v1";

/** Read/write helpers for sessionStorage — tab-scoped, so a refresh survives but a fresh kiosk tab starts clean. */
export function readPersistedState<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writePersistedState<T>(value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private browsing, quota) — persistence is a convenience, not required.
  }
}

export function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
