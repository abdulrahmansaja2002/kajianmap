"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  Polygon,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import { Clock, MapPin } from "lucide-react";
import type { LocationWithKajian } from "@/types";
import { createKajianIcon, createUserLocationIcon, patchLeafletDefaultIcon } from "@/lib/leaflet";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

patchLeafletDefaultIcon();

// --- DATA SUMBER URL PETA ---
const MAP_TILES = {
  default: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

function AutoMosqueImage({ mosqueName }: { mosqueName: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fallbackImage = "https://images.unsplash.com/photo-1590076175571-4b5459efb08c?w=500&auto=format&fit=crop";

  useEffect(() => {
    async function fetchImage() {
      setLoading(true);
      try {
        const response = await fetch(
          `https://id.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
            mosqueName
          )}&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json&origin=*`
        );
        const data = await response.json();
        const pages = data.query?.pages;
        const page = pages ? (Object.values(pages)[0] as any) : null;

        if (page?.thumbnail?.source) {
          setImageUrl(page.thumbnail.source);
        } else {
          setImageUrl(fallbackImage);
        }
      } catch (error) {
        setImageUrl(fallbackImage);
      } finally {
        setLoading(false);
      }
    }

    if (mosqueName) fetchImage();
  }, [mosqueName]);

  if (loading) {
    return <div className="my-2 flex h-28 w-full animate-pulse items-center justify-center rounded-lg bg-slate-200 text-[11px] text-slate-400">Mencari gambar...</div>;
  }

  return <img src={imageUrl || fallbackImage} alt={mosqueName} className="my-2 h-28 w-full rounded-lg object-cover shadow-sm" onError={(e) => { e.currentTarget.src = fallbackImage; }} />;
}

function PolygonDrawHandler({ isDrawingMode, onPolygonCreated }: { isDrawingMode?: boolean; onPolygonCreated?: (coords: [number, number][]) => void }) {
  const [points, setPoints] = useState<[number, number][]>([]);

  const map = useMapEvents({
    click(e) {
      if (!isDrawingMode) return;
      setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
    dblclick(e) {
      if (!isDrawingMode || !onPolygonCreated) return;
      if (points.length >= 2) {
        const finalPoints: [number, number][] = [...points, [e.latlng.lat, e.latlng.lng]];
        onPolygonCreated(finalPoints);
        setPoints([]); 
      }
    }
  });

  useEffect(() => {
    if (isDrawingMode) {
      map.doubleClickZoom.disable();
      map.getContainer().style.cursor = "crosshair";
      map.dragging.disable();
    } else {
      map.doubleClickZoom.enable();
      map.getContainer().style.cursor = ""; 
      map.dragging.enable();
      setPoints([]); 
    }
  }, [isDrawingMode, map]);

  if (!isDrawingMode || points.length === 0) return null;

  return (
    <>
      {points.length < 3 ? (
        <Polyline positions={points} color="#3b82f6" dashArray="5, 10" />
      ) : (
        <Polygon positions={points} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.2} interactive={false} />
      )}
    </>
  );
}

//  KOMPONEN PENGGAMBAR RUTE  
function RoutingHandler({ 
  isRouteMode, 
  userPosition, 
  targetLocation,
  onRouteCalculated,
  onRouteCleared
}: { 
  isRouteMode?: boolean; 
  userPosition?: { lat: number, lng: number } | null; 
  targetLocation?: LocationWithKajian | null; 
  onRouteCalculated?: (data: { distanceKm: string; timeMins: number }) => void;
  onRouteCleared?: () => void;
}) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    // 1. Bersihkan rute jika mode dimatikan atau data posisi/tujuan tidak lengkap
    if (!isRouteMode || !userPosition || !targetLocation) {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          // Abaikan error saat penghapusan
        }
        routingControlRef.current = null;
      }
      if (onRouteCleared) onRouteCleared();
      return;
    }

    if (typeof window === "undefined") return; 

    const L = require("leaflet");
    require("leaflet-routing-machine");

    if (!L.Routing) return;

    // 2. Hapus kontrol lama jika ada sebelum membuat kontrol baru
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (e) {}
      routingControlRef.current = null;
    }

    // 3. Buat kontrol rute baru
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(targetLocation.lat, targetLocation.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true, 
      show: false, // Sembunyikan UI tabel bawaan OSRM
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 6, opacity: 0.85 }], 
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null 
    }).addTo(map);

    routingControlRef.current = routingControl;

    // 4. Tangkap event ketika rute berhasil ditemukan
    routingControl.on("routesfound", (e: any) => {
      const routes = e.routes;
      if (routes && routes[0]) {
        const summary = routes[0].summary;
        const distanceKm = (summary.totalDistance / 1000).toFixed(1); 
        const timeMins = Math.round(summary.totalTime / 60); 
        
        if (onRouteCalculated) {
          onRouteCalculated({ distanceKm, timeMins });
        }
      }
    });

    //  5. TANGKAP ERROR NETWORK / OSRM AGAR TIDAK CRASH DI NEXT.JS 
    routingControl.on("routingerror", (e: any) => {
      console.warn("OSRM Server warning / Rate limit:", e);
    });

    // 6. Cleanup saat unmount atau re-render
    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          // Abaikan error cleanup saat map unmounting
        }
        routingControlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isRouteMode, userPosition, targetLocation]);

  return null;
}

interface LeafletMapProps {
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
  

  onRouteCalculated?: (data: { distanceKm: string; timeMins: number }) => void;
  onRouteCleared?: () => void;
}

function MapController({ userPosition, flyToSignal, zoomInSignal, zoomOutSignal, compassSignal }: any) {
  const map = useMap();
  const lastSignal = useRef(0);
  const lastZoomIn = useRef(0);
  const lastZoomOut = useRef(0);
  const lastCompass = useRef(0);

  useEffect(() => {
    if (!!userPosition && flyToSignal !== lastSignal.current) {
      lastSignal.current = flyToSignal;
      const latlng = L.latLng(userPosition.lat, userPosition.lng);
      map.flyTo(latlng, 15, { duration: 1.1 });
    }
  }, [userPosition, flyToSignal, map]);

  useEffect(() => {
    if (zoomInSignal && zoomInSignal !== lastZoomIn.current) {
      lastZoomIn.current = zoomInSignal;
      map.zoomIn();
    }
  }, [zoomInSignal, map]);

  useEffect(() => {
    if (zoomOutSignal && zoomOutSignal !== lastZoomOut.current) {
      lastZoomOut.current = zoomOutSignal;
      map.zoomOut();
    }
  }, [zoomOutSignal, map]);

  useEffect(() => {
    if (compassSignal && compassSignal !== lastCompass.current) {
      lastCompass.current = compassSignal;
      map.flyTo(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, { duration: 1 });
    }
  }, [compassSignal, map]);

  return null;
}

export default function LeafletMap({
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
  mapStyle = "default",
  isRouteMode,
  

  onRouteCalculated,
  onRouteCleared
}: LeafletMapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    if (selectedLocationId && markerRefs.current[selectedLocationId]) {
      markerRefs.current[selectedLocationId]?.openPopup();
    }
  }, [selectedLocationId]);

  const currentTile = MAP_TILES[mapStyle] || MAP_TILES.default;
  const targetLocation = locations.find(loc => loc.id === selectedLocationId) || null;
  
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      scrollWheelZoom
      zoomControl={false} 
      className="h-full w-full"
    >
      <TileLayer
        key={mapStyle} 
        attribution={currentTile.attribution}
        url={currentTile.url}
      />

      <MapController 
        userPosition={userPosition} 
        flyToSignal={flyToSignal} 
        zoomInSignal={zoomInSignal}
        zoomOutSignal={zoomOutSignal}
        compassSignal={compassSignal}
      />

      <PolygonDrawHandler 
        isDrawingMode={isDrawingMode} 
        onPolygonCreated={onPolygonCreated} 
      />

      <RoutingHandler 
        isRouteMode={isRouteMode}
        userPosition={userPosition}
        targetLocation={targetLocation}
        onRouteCalculated={onRouteCalculated}
        onRouteCleared={onRouteCleared}
      />

      {polygonFilter && polygonFilter.length > 2 && (
        <Polygon 
          positions={polygonFilter} 
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
          interactive={false} 
        />
      )}

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
          <Popup className="kajianmap-popup " closeButton={true} offset={[0, -4]}>
            <div className="w-56 p-3.5 ">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold leading-snug text-slate-900">{location.name}</p>
                {location.hasToday && <Badge variant="today" className="shrink-0">Hari ini</Badge>}
              </div>
              <AutoMosqueImage mosqueName={location.name} />
              <p className="mb-2 flex items-start gap-1 text-xs text-slate-500">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {location.address}
              </p>
              {location.nextOccurrenceLabel && (
                <p className="flex items-center gap-1 text-xs font-medium text-primary-700">
                  <Clock className="h-3 w-3 shrink-0" /> {location.nextOccurrenceLabel}
                </p>
              )}
              <div className="mt-3">
                <Button size="sm" className="w-full text-xs" onClick={(e) => { e.stopPropagation(); if (onOpenDetail) onOpenDetail(); }}>
                  Lihat {location.kajianList.length} Jadwal Kajian
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}