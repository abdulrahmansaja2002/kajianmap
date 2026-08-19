"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { LocationWithKajian } from "@/types";
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
  zoomInSignal?: number;
  zoomOutSignal?: number;
  compassSignal?: number;
  onOpenDetail?: () => void;
  isDrawingMode?: boolean;
  polygonFilter?: [number, number][] | null;
  onPolygonCreated?: (coords: [number, number][]) => void;
  mapStyle?: "default" | "satellite" | "dark";
  isRouteMode?: boolean;
  
  //  1. TAMBAHKAN DUA BARIS INI DI INTERFACE MAPVIEWPROPS 
  onRouteCalculated?: (data: { distanceKm: string; timeMins: number }) => void;
  onRouteCleared?: () => void;
}

export default function MapView({
  locations,
  selectedLocationId,
  onMarkerClick,
  userPosition,
  flyToSignal,
  zoomInSignal,
  zoomOutSignal,
  compassSignal,
  onOpenDetail,
  isDrawingMode,
  polygonFilter,
  onPolygonCreated,
  mapStyle,
  isRouteMode,
  
  //  2. TANGKAP PROPS-NYA DI PARAMETER MAPVIEW 
  onRouteCalculated,
  onRouteCleared
}: MapViewProps) {
  return (
    <div className="h-full w-full">
      <LeafletMap 
        locations={locations}
        selectedLocationId={selectedLocationId}
        onMarkerClick={onMarkerClick}
        userPosition={userPosition}
        flyToSignal={flyToSignal}
        zoomInSignal={zoomInSignal}
        zoomOutSignal={zoomOutSignal}
        compassSignal={compassSignal}
        onOpenDetail={onOpenDetail}
        isDrawingMode={isDrawingMode}
        polygonFilter={polygonFilter}
        onPolygonCreated={onPolygonCreated}
        mapStyle={mapStyle}
        isRouteMode={isRouteMode}
        
        //  3. TERUSKAN/OPER PROPS-NYA KE LEAFLETMAP 
        onRouteCalculated={onRouteCalculated}
        onRouteCleared={onRouteCleared}
      />
    </div>
  );
}