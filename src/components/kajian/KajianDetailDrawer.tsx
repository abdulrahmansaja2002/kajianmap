"use client";

import { Clock, ExternalLink, MapPin, Phone, User } from "lucide-react";
import type { LocationWithKajian } from "@/types";
import { occursToday, scheduleWithTimeLabel } from "@/lib/date-helpers";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface KajianDetailDrawerProps {
  location: LocationWithKajian | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KajianDetailDrawer({
  location,
  open,
  onOpenChange,
}: KajianDetailDrawerProps) {
  if (!location) return null;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="scroll-slim mx-auto w-full max-w-2xl overflow-y-auto">
        <DrawerHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>{location.name}</DrawerTitle>
              <DrawerDescription className="mt-1 flex items-start gap-1">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {location.address}, {location.city}
              </DrawerDescription>
            </div>
            {location.hasToday && (
              <Badge variant="today" className="shrink-0">
                Ada kajian hari ini
              </Badge>
            )}
          </div>
          <Button asChild size="sm" variant="outline" className="mt-3 w-fit">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Navigasi Google Maps
            </a>
          </Button>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-4 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {location.kajianList.length} jadwal kajian
          </p>

          {location.kajianList.map((kajian) => {
            const isToday = occursToday(kajian);
            return (
              <div
                key={kajian.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                {kajian.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={kajian.posterUrl}
                    alt={`Poster ${kajian.title}`}
                    className="h-36 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-display text-base font-semibold leading-snug">
                      {kajian.title}
                    </h4>
                    {isToday && <Badge variant="today">Hari ini</Badge>}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {kajian.ustadz}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-primary-700">
                      <Clock className="h-3.5 w-3.5" />
                      {scheduleWithTimeLabel(kajian)}
                    </span>
                  </div>

                  <Badge variant="sage" className="mt-2">
                    {kajian.category}
                  </Badge>

                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {kajian.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Kontak: {kajian.contactPerson}</span>
                    {kajian.contactPhone && (
                      <a
                        href={`tel:${kajian.contactPhone}`}
                        className="flex items-center gap-1 font-medium text-primary-700 hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {kajian.contactPhone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
