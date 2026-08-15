"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { useKajianFilter } from "@/hooks/useKajianFilter";
import { KAJIAN_CATEGORY_OPTIONS, type KajianCategory } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KajianFilterBarProps {
  filterState: ReturnType<typeof useKajianFilter>;
}

const DATE_MODE_OPTIONS: { value: "semua" | "hari_ini" | "tanggal"; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "hari_ini", label: "Hari ini" },
  { value: "tanggal", label: "Tanggal tertentu" },
];

export function KajianFilterBar({ filterState }: KajianFilterBarProps) {
  const {
    filters,
    setDateMode,
    setSelectedDate,
    setUstadz,
    setCategory,
    setQuery,
    reset,
    activeFilterCount,
  } = filterState;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kajian atau nama masjid…"
          className="pl-9"
        />
      </div>

      <Button
        variant={activeFilterCount > 0 ? "default" : "outline"}
        size="icon"
        className="relative shrink-0"
        onClick={() => setSheetOpen(true)}
        aria-label="Buka filter"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <Badge
            variant="today"
            className="absolute -right-1.5 -top-1.5 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>Filter Kajian</DrawerTitle>
              {activeFilterCount > 0 && (
                <button
                  onClick={reset}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" /> Reset
                </button>
              )}
            </div>
          </DrawerHeader>

          <div className="flex flex-col gap-5 px-5 pb-2">
            <div className="space-y-2">
              <Label>Waktu</Label>
              <div className="grid grid-cols-3 gap-2">
                {DATE_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDateMode(opt.value)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      filters.dateMode === opt.value
                        ? "border-primary bg-primary-50 text-primary-800"
                        : "border-input text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {filters.dateMode === "tanggal" && (
                <Input
                  type="date"
                  value={filters.selectedDate ?? ""}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-ustadz">Pemateri / Ustadz</Label>
              <Input
                id="filter-ustadz"
                placeholder="cth. Ustadz Fauzan"
                value={filters.ustadz ?? ""}
                onChange={(e) => setUstadz(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori / Topik</Label>
              <Select
                value={filters.category ?? "semua"}
                onValueChange={(v) => setCategory(v as KajianCategory | "semua")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua kategori</SelectItem>
                  {KAJIAN_CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={() => setSheetOpen(false)}>Terapkan Filter</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
