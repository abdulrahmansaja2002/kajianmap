"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { mapApiKajian, mapApiLocation, type ApiKajianRecord } from "@/lib/api-mappers";
import { useAuth } from "@/hooks/useAuth";
import type { Kajian, Location } from "@/types";
import type { KajianFormValues } from "@/lib/validations/kajian";

/**
 * Centralized query key factory — every hook below builds its key through
 * this so `queryClient.invalidateQueries` calls stay in sync with what
 * `useQuery` actually registered. See the TanStack Query docs' "Query Key
 * Factory" pattern.
 */
export const kajianKeys = {
  all: ["kajian"] as const,
  lists: () => [...kajianKeys.all, "list"] as const,
  list: (params: KajianListParams) => [...kajianKeys.lists(), params] as const,
  details: () => [...kajianKeys.all, "detail"] as const,
  detail: (id: string) => [...kajianKeys.details(), id] as const,
};

export interface KajianListParams {
  locationId?: string;
  category?: string;
  frequency?: "rutin" | "insidental";
  isActive?: boolean;
}

export interface KajianWithLocation {
  kajian: Kajian;
  location: Location;
}

function toQueryString(params: KajianListParams): string {
  const sp = new URLSearchParams();
  if (params.locationId) sp.set("locationId", params.locationId);
  if (params.category) sp.set("category", params.category);
  if (params.frequency) sp.set("frequency", params.frequency);
  if (params.isActive !== undefined) sp.set("isActive", String(params.isActive));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function fetchKajianList(params: KajianListParams): Promise<KajianWithLocation[]> {
  const records = await apiFetch<ApiKajianRecord[]>(`/api/kajian${toQueryString(params)}`);
  return records.map((r) => ({ kajian: mapApiKajian(r), location: mapApiLocation(r.location) }));
}

/** Public list — powers the map/list views. No auth needed since
 *  `GET /api/kajian` is a public route. */
export function useKajianListQuery(params: KajianListParams = {}) {
  return useQuery({
    queryKey: kajianKeys.list(params),
    queryFn: () => fetchKajianList(params),
  });
}

/** Public detail — powers the shareable `/kajian/[id]` page. */
export function useKajianDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: kajianKeys.detail(id ?? ""),
    queryFn: async (): Promise<KajianWithLocation> => {
      const record = await apiFetch<ApiKajianRecord>(`/api/kajian/${id}`);
      return { kajian: mapApiKajian(record), location: mapApiLocation(record.location) };
    },
    enabled: !!id,
  });
}

/**
 * Admin dashboard helper: an admin_masjid can be assigned to more than one
 * masjid (`assignedLocations`), and the list endpoint only filters by a
 * single `locationId`. Rather than teaching the API an "IN" filter for one
 * screen, `useQueries` fires one request per assigned location in
 * parallel and this flattens the results — same end result, no backend
 * change needed.
 */
export function useMyKajianListQuery(locationIds: string[]) {
  const results = useQueries({
    queries: locationIds.map((locationId) => ({
      queryKey: kajianKeys.list({ locationId }),
      queryFn: () => fetchKajianList({ locationId }),
    })),
  });

  return {
    data: results.flatMap((r) => r.data ?? []),
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetch: () => Promise.all(results.map((r) => r.refetch())),
  };
}

/** Protected — requires `useAuth().token`; throws `ApiError` (401/403) if
 *  missing or the caller isn't allowed to manage the target location. */
export function useCreateKajianMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: KajianFormValues) =>
      apiFetch<ApiKajianRecord>("/api/kajian", { method: "POST", body: values, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kajianKeys.lists() });
    },
  });
}

export function useUpdateKajianMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<KajianFormValues> }) =>
      apiFetch<ApiKajianRecord>(`/api/kajian/${id}`, { method: "PUT", body: values, token }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: kajianKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kajianKeys.detail(variables.id) });
    },
  });
}

export function useDeleteKajianMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/kajian/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kajianKeys.lists() });
    },
  });
}
