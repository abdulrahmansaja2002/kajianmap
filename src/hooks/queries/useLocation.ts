"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { mapApiLocation, type ApiLocationRecord } from "@/lib/api-mappers";
import { useAuth } from "@/hooks/useAuth";
import type { Location } from "@/types";
import type { LocationFormValues } from "@/lib/validations/location";

/**
 * Centralized query key factory — every hook below builds its key through
 * this so `queryClient.invalidateQueries` calls stay in sync with what
 * `useQuery` actually registered.
 */
export const locationKeys = {
  all: ["location"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (params: LocationListParams) => [...locationKeys.lists(), params] as const,
  details: () => [...locationKeys.all, "detail"] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

export interface LocationListParams {
  city?: string;
  province?: string;
}

function toQueryString(params: LocationListParams): string {
  const sp = new URLSearchParams();
  if (params.city) sp.set("city", params.city);
  if (params.province) sp.set("province", params.province);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function fetchLocationList(params: LocationListParams): Promise<Location[]> {
  const records = await apiFetch<ApiLocationRecord[]>(`/api/location${toQueryString(params)}`);
  return records.map(mapApiLocation);
}

/** Public list — powers the map pickers and super-admin location table. */
export function useLocationListQuery(params: LocationListParams = {}) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => fetchLocationList(params),
  });
}

/** Public detail. */
export function useLocationDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: locationKeys.detail(id ?? ""),
    queryFn: async (): Promise<Location> => {
      const record = await apiFetch<ApiLocationRecord>(`/api/location/${id}`);
      return mapApiLocation(record);
    },
    enabled: !!id,
  });
}

/** Protected — requires `useAuth().token`; super_admin only. */
export function useCreateLocationMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LocationFormValues) =>
      apiFetch<ApiLocationRecord>("/api/location", { method: "POST", body: values, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}

export function useUpdateLocationMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LocationFormValues> }) =>
      apiFetch<ApiLocationRecord>(`/api/location/${id}`, { method: "PUT", body: values, token }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.id) });
    },
  });
}

export function useDeleteLocationMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/location/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}
