"use client";

import { useSyncExternalStore } from "react";
import { authStore, type AuthUser } from "@/lib/auth-store";

export function useAuth() {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getServerState
  );

  return {
    token: state.token,
    user: state.user,
    isAuthenticated: !!state.token,
    login: (token: string, user: AuthUser) => authStore.setSession(token, user),
    logout: () => authStore.clear(),
  };
}
