"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { mapApiUser, type ApiUserRecord } from "@/lib/api-mappers";
import { useAuth } from "@/hooks/useAuth";
import type { User, UserRole } from "@/types";
import type { UserFormValues } from "@/lib/validations/user";
import { locationKeys } from "@/hooks/queries/useLocation";

/**
 * Centralized query key factory — every hook below builds its key through
 * this so `queryClient.invalidateQueries` calls stay in sync with what
 * `useQuery` actually registered.
 */
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export interface UserListParams {
  role?: UserRole;
  isActive?: boolean;
}

function toQueryString(params: UserListParams): string {
  const sp = new URLSearchParams();
  if (params.role) sp.set("role", params.role);
  if (params.isActive !== undefined) sp.set("isActive", String(params.isActive));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function fetchUserList(params: UserListParams, token: string | null): Promise<User[]> {
  const records = await apiFetch<ApiUserRecord[]>(`/api/user${toQueryString(params)}`, { token });
  return records.map(mapApiUser);
}

/** Protected — super_admin only. Powers the manajemen admin table. */
export function useUserListQuery(params: UserListParams = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUserList(params, token),
    enabled: !!token,
  });
}

/** Protected — super_admin only. */
export function useUserDetailQuery(id: string | undefined) {
  const { token } = useAuth();

  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: async (): Promise<User> => {
      const record = await apiFetch<ApiUserRecord>(`/api/user/${id}`, { token });
      return mapApiUser(record);
    },
    enabled: !!id && !!token,
  });
}

/** Protected — requires `useAuth().token`; super_admin only. */
export function useCreateUserMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UserFormValues) =>
      apiFetch<ApiUserRecord>("/api/user", { method: "POST", body: values, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}

export function useUpdateUserMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<UserFormValues> }) =>
      apiFetch<ApiUserRecord>(`/api/user/${id}`, { method: "PUT", body: values, token }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

export function useDeleteUserMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/user/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
