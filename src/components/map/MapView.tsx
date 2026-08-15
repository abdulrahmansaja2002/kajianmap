"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { LocationWithKajian } from "@/types";

/**
 * Leaflet reaches for `window` at import time, which breaks Next.js's
 * server render. Loading the real map component with `ssr: false` keeps
 * it strictly client-side while this wrapper renders a stable placeholder
 * during the very first paint.
 */
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-xs font-medium">Memuat peta…</p>
      </div>
    </div>
  ),
});

interface MapViewProps {
  locations: LocationWithKajian[];
  selectedLocationId: string | null;
  onMarkerClick: (locationId: string) => void;
  userPosition: { lat: number; lng: number } | null;
  flyToSignal: number;
}

export default function MapView(props: MapViewProps) {
  return <LeafletMap {...props} />;
}
