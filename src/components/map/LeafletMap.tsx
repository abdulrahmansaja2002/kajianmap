"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Clock, MapPin } from "lucide-react";
import type { LocationWithKajian } from "@/types";
import { createKajianIcon, createUserLocationIcon, patchLeafletDefaultIcon } from "@/lib/leaflet";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

patchLeafletDefaultIcon();

interface LeafletMapProps {
  locations: LocationWithKajian[];
  selectedLocationId: string | null;
  onMarkerClick: (locationId: string) => void;
  userPosition: { lat: number; lng: number } | null;
  /** Bump this number to re-trigger a flyTo (e.g. after "locate me"). */
  flyToSignal: number;
}

/** Handles imperative map movements (flyTo user's location) that don't map
 *  cleanly onto React-Leaflet's declarative props. */
function MapController({
  userPosition,
  flyToSignal,
}: {
  userPosition: { lat: number; lng: number } | null;
  flyToSignal: number;
}) {
  const map = useMap();
  const lastSignal = useRef(0);

  useEffect(() => {
    if (userPosition && flyToSignal !== lastSignal.current) {
      lastSignal.current = flyToSignal;
      const latlng = L.latLng(userPosition.lat, userPosition.lng);
      console.log("flyTo", latlng);
      // TODO: Fix the flyTo issue
      // map.flyTo(latlng, 15, { duration: 1.1 });
    }
  }, [userPosition, flyToSignal, map]);

  return null;
}

export default function LeafletMap({
  locations,
  selectedLocationId,
  onMarkerClick,
  userPosition,
  flyToSignal,
}: LeafletMapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    if (selectedLocationId && markerRefs.current[selectedLocationId]) {
      markerRefs.current[selectedLocationId]?.openPopup();
    }
  }, [selectedLocationId]);

  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      scrollWheelZoom
      zoomControl
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController userPosition={userPosition} flyToSignal={flyToSignal} />

      {userPosition && (
        <Marker
          position={[userPosition.lat, userPosition.lng]}
          icon={createUserLocationIcon()}
          zIndexOffset={-100}
        />
      )}

      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={createKajianIcon({
            hasToday: location.hasToday,
            isSelected: location.id === selectedLocationId,
          })}
          eventHandlers={{ click: () => onMarkerClick(location.id) }}
          ref={(ref) => {
            markerRefs.current[location.id] = ref;
          }}
        >
          <Popup className="kajianmap-popup" closeButton={false} offset={[0, -4]}>
            <div className="w-56 p-3.5">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold leading-snug text-slate-900">
                  {location.name}
                </p>
                {location.hasToday && (
                  <Badge variant="today" className="shrink-0">
                    Hari ini
                  </Badge>
                )}
              </div>
              <p className="mb-2 flex items-start gap-1 text-xs text-slate-500">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                {location.address}
              </p>
              {location.nextOccurrenceLabel && (
                <p className="flex items-center gap-1 text-xs font-medium text-primary-700">
                  <Clock className="h-3 w-3 shrink-0" />
                  {location.nextOccurrenceLabel}
                </p>
              )}
              <p className="mt-2 text-[11px] text-slate-400">
                {location.kajianList.length} jadwal ditemukan · klik untuk detail
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
