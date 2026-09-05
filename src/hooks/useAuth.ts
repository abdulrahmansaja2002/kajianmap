"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin_masjid";
  assignedLocations: { id: string; name: string }[];
}

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

async function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60_000,
  });

  function setUser(nextUser: AuthUser) {
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, nextUser);
  }

  function logout() {
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
    queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
    void apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }

  return { user: user ?? null, isAuthenticated: !!user, isLoading, isError, setUser, logout };
}