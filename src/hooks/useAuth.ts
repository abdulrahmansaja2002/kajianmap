"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { authStore, type AuthUser } from "@/lib/auth-store";

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getServerState
  );

  return {
    token: state.token,
    user: state.user,
    isAuthenticated: !!state.token,
    isLoading: !isHydrated || state.isLoading,
    login: (token: string, user: AuthUser) => authStore.setSession(token, user),
    logout: () => authStore.clear(),
  };
}
