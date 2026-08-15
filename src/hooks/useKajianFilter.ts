"use client";

import { useCallback, useMemo, useState } from "react";
import type { KajianCategory, KajianFilters } from "@/types";
import { toISODate } from "@/lib/date-helpers";

const DEFAULT_FILTERS: KajianFilters = {
  dateMode: "semua",
  ustadz: "",
  category: "semua",
  query: "",
};

/**
 * Owns the filter-bar state (Hari ini / Tanggal tertentu / Pemateri /
 * Kategori / pencarian bebas) so both the desktop filter bar and the
 * mobile drawer version can share one source of truth.
 */
export function useKajianFilter(initial?: Partial<KajianFilters>) {
  const [filters, setFilters] = useState<KajianFilters>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const setDateMode = useCallback((mode: KajianFilters["dateMode"]) => {
    setFilters((f) => ({
      ...f,
      dateMode: mode,
      selectedDate: mode === "tanggal" ? f.selectedDate ?? toISODate(new Date()) : f.selectedDate,
    }));
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    setFilters((f) => ({ ...f, dateMode: "tanggal", selectedDate: date }));
  }, []);

  const setUstadz = useCallback((ustadz: string) => {
    setFilters((f) => ({ ...f, ustadz }));
  }, []);

  const setCategory = useCallback((category: KajianCategory | "semua") => {
    setFilters((f) => ({ ...f, category }));
  }, []);

  const setQuery = useCallback((query: string) => {
    setFilters((f) => ({ ...f, query }));
  }, []);

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.dateMode !== "semua") n++;
    if (filters.ustadz && filters.ustadz.trim()) n++;
    if (filters.category && filters.category !== "semua") n++;
    return n;
  }, [filters]);

  return {
    filters,
    setDateMode,
    setSelectedDate,
    setUstadz,
    setCategory,
    setQuery,
    reset,
    activeFilterCount,
  };
}
