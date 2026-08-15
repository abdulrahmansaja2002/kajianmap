"use client";

import { ExternalLink, MapPin } from "lucide-react";
import type { LocationWithKajian } from "@/types";
import { KajianCard } from "@/components/kajian/KajianCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KajianListProps {
  locations: LocationWithKajian[];
  onSelectLocation: (locationId: string) => void;
  className?: string;
}

export function KajianList({ locations, onSelectLocation, className }: KajianListProps) {
  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground/50" />
        <p className="font-display text-sm font-semibold text-foreground">
          Tidak ada kajian yang cocok
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Coba ubah filter tanggal, pemateri, atau kategori untuk melihat jadwal lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {locations.map((location) => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
        return (
          <div
            key={location.id}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <button
              onClick={() => onSelectLocation(location.id)}
              className="flex w-full items-start justify-between gap-2 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-sm font-semibold text-foreground">
                    {location.name}
                  </h3>
                  {location.hasToday && <Badge variant="today">Hari ini</Badge>}
                </div>
                <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  {location.address}
                </p>
              </div>
            </button>

            <div className="mt-3 flex flex-col gap-2">
              {location.kajianList.slice(0, 3).map((kajian) => (
                <button
                  key={kajian.id}
                  onClick={() => onSelectLocation(location.id)}
                  className="text-left"
                >
                  <KajianCard kajian={kajian} compact />
                </button>
              ))}
              {location.kajianList.length > 3 && (
                <button
                  onClick={() => onSelectLocation(location.id)}
                  className="text-left text-xs font-medium text-primary-700 hover:underline"
                >
                  +{location.kajianList.length - 3} jadwal lainnya
                </button>
              )}
            </div>

            <Button asChild size="sm" variant="ghost" className="mt-3 h-7 px-2 text-xs">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Navigasi
              </a>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
