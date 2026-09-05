/**
 * Small external store (not Context) so the token is readable from
 * TanStack Query mutation hooks without every one of them needing to sit
 * under a specific provider tree position. Persisted to localStorage so a
 * page refresh doesn't silently log the admin out.
 *
 * NOTE: localStorage is convenient for this MVP but is readable by any
 * script on the page (XSS risk) and isn't sent automatically like a
 * cookie. Before production, prefer an httpOnly cookie set by
 * `/api/auth/login` and drop this client-side token entirely.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin_masjid";
  assignedLocations: { id: string; name: string }[];
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading?: boolean;
}

const STORAGE_KEY = "kajianmap.auth";
const EMPTY_STATE: AuthState = { token: null, user: null };

let state: AuthState = { token: null, user: null, isLoading: true }; // Start with loading

function readInitialState(): AuthState {
  if (typeof window === "undefined") {
    return { ...EMPTY_STATE, isLoading: true };
  }
  
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...EMPTY_STATE, isLoading: false };
    }
    const parsed = JSON.parse(raw) as AuthState;
    return { ...parsed, isLoading: false };
  } catch {
    return { ...EMPTY_STATE, isLoading: false };
  }
}

// Initialize only on client
if (typeof window !== "undefined") {
  state = readInitialState();
}
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  getState(): AuthState {
    return state;
  },
  /** Stable empty-state reference for `useSyncExternalStore`'s server
   *  snapshot — must return the same object every call or React warns. */
  getServerState(): AuthState {
    return EMPTY_STATE;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setSession(token: string, user: AuthUser) {
    state = { token, user };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    emit();
  },
  clear() {
    state = EMPTY_STATE;
    window.localStorage.removeItem(STORAGE_KEY);
    emit();
  },
};
