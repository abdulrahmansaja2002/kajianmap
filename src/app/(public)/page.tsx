"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Icon
import { 
  List, Loader2, X, Home, Zap, BoxSelect, 
  Eraser, RefreshCw, Layers, BookOpen, 
  Crosshair, Plus, Minus, PersonStanding, LogIn,
  Map, Globe, Moon 
} from "lucide-react"; 

import MapView from "@/components/map/MapView";
import { KajianFilterBar } from "@/components/kajian/KajianFilterBar";
import { KajianList } from "@/components/kajian/KajianList";
import { KajianDetailDrawer } from "@/components/kajian/KajianDetailDrawer";
import { useKajianFilter } from "@/hooks/useKajianFilter";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getFilteredLocationsWithKajian, groupKajianRecordsByLocation } from "@/lib/kajian-utils";
import { mockKajian, mockLocations } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NearbyScannerAlert } from "@/components/kajian/NearbyScannerAlert";
import { useNearbyKajian } from "@/hooks/useNearbyKajian";
import { useKajianListQuery } from "@/hooks/queries/useKajian";


// Algoritma menarik sebuah garis lurus imajiner dari titik tersebut ke satu arah tak terhingga, lalu menghitung berapa kali garis itu memotong garis batas area.
function isPointInPolygon(point: [number, number], polygon: [number, number][]) {
  const x = point[0], y = point[1];
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

// 1. MapToolbar
function MapToolbar({
  onToggleList,
  onResetView,
  onSearch,
  isDrawingMode,
  hasPolygon,
  onToggleDraw,
  onClearDraw,
  onToggleLayerMenu,
  isListOpen,
  isLayerMenuOpen,
  isRouteMode
}: {
  onToggleList: () => void;
  onResetView: () => void;
  onSearch: () => void;
  isDrawingMode: boolean;
  hasPolygon: boolean;
  onToggleDraw: () => void;
  onClearDraw: () => void;
  onToggleLayerMenu: () => void;
  isListOpen: boolean;
  isLayerMenuOpen: boolean;
  isRouteMode?: boolean;
}) {
  return (
   <div className={cn(
      "absolute bottom-6 md:bottom-10 z-50 flex w-[95%] max-w-[420px] -translate-x-1/2 items-center justify-between md:justify-center md:gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 shadow-lg backdrop-blur-md transition-all duration-300",
      isListOpen 
        ? "left-1/2 md:left-[calc(50%+160px)] lg:left-[calc(50%+180px)] xl:left-1/2" 
        : "left-1/2"
    )}>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-9 w-9 md:h-10 md:w-10 rounded-full text-white hover:bg-white/20 transition-colors" 
        onClick={onSearch}
        title="KajianPintar">
        <Zap className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {/* Tombol List */}
      <Button 
        size="icon" 
        variant="ghost"
        disabled={isRouteMode} 
        className={cn(
          "h-9 w-9 md:h-10 md:w-10 rounded-full transition-colors",
          isListOpen ? "bg-white/20 text-yellow-400" : "text-white hover:bg-white/20"
        )} 
        onClick={onToggleList}
        title="Daftar Kajian"
      >
        <List className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      
      {/* Tombol BoxSelect (Mode Poligon) */}
      <Button 
        size="icon" 
        variant="ghost"
        disabled={isRouteMode} 
        className={cn(
          "h-9 w-9 md:h-10 md:w-10 rounded-full transition-colors",
          isDrawingMode ? "bg-white/20 text-yellow-400" : "text-white hover:bg-white/20"
        )}
        onClick={onToggleDraw}
        title={isDrawingMode ? "Batal Mode Poligon" : "Mode Poligon"}
      >
        <BoxSelect className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <Button 
        size="icon" 
        variant="ghost"
        disabled={!hasPolygon || isRouteMode}
        className={cn(
          "h-9 w-9 md:h-10 md:w-10 rounded-full transition-colors",
          hasPolygon ? "text-red-400 hover:bg-red-400/20" : "text-white/50 opacity-50 cursor-not-allowed"
        )}
        onClick={onClearDraw}
        title="Hapus Area Poligon"
      >
        <Eraser className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <Button 
        size="icon" 
        variant="ghost" 
        className="h-9 w-9 md:h-10 md:w-10 rounded-full text-white hover:bg-white/20 transition-colors" 
        onClick={onResetView}
        title="Reset Tampilan">
        <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      
      {/* Tombol Layers (Mode Peta) */}
      <Button 
        size="icon" 
        variant="ghost"
        disabled={isRouteMode} 
        className={cn(
          "h-9 w-9 md:h-10 md:w-10 rounded-full transition-colors",
          isLayerMenuOpen ? "bg-white/20 text-yellow-400" : "text-white hover:bg-white/20"
        )} 
        onClick={onToggleLayerMenu}
        title="Mode Peta"
      >
        <Layers className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      
      <Button 
        size="icon" 
        variant="ghost" 
        disabled={isRouteMode} 
        className="h-9 w-9 md:h-10 md:w-10 rounded-full text-white hover:bg-white/20 transition-colors"
        title="Bantuan & Panduan"
      >
        <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </div>
  );
}

// 2. RightSideControls
function RightSideControls({ onZoomIn, onZoomOut, onLocate, locateLoading, isListOpen,isRouteMode,onToggleRoute, isDisabled }: any) {
  return (
    <div className={cn(
      "absolute bottom-24 md:bottom-10 right-3 md:right-4 z-50 flex-col gap-2 md:gap-3",
      isListOpen ? "hidden lg:flex" : "flex"
    )}>
      
      {/* 1. Tombol Titik Saat Ini (Lokasi Saya) */}
      <button 
        onClick={onLocate} 
        className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
        aria-label="Lokasi Saya"
        title="Lokasi Saya"
      >
        {locateLoading ? (
          <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
        ) : (
          <Crosshair className="h-5 w-5 md:h-6 md:w-6" />
        )}
      </button>

      {/* 2. Container Tombol Zoom (Volume) */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-lg backdrop-blur-md">
        <button 
          onClick={onZoomIn} 
          className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center border-b border-white/20 text-white transition hover:bg-white/20 active:bg-white/30"
          aria-label="Perbesar"
          title="Perbesar"
        >
          <Plus className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button 
          onClick={onZoomOut} 
          className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center text-white transition hover:bg-white/20 active:bg-white/30"
          aria-label="Perkecil"
          title="Perkecil"
        >
          <Minus className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>

      {/* 3. Tombol Mode Orang */}
      <button 
        onClick={onToggleRoute}
        disabled={isDisabled}
        className={cn(
          "flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-2xl border border-white/20 shadow-lg backdrop-blur-md transition active:scale-95",
          isRouteMode 
            ? "bg-white/20 text-yellow-500" 
            : "bg-black/40 text-white hover:bg-white/20"
        )}
        aria-label="Mode Rute"
        title="Jarak & Rute"
      >
        <PersonStanding className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      
    </div>
  );
}

export default function PublicMapPage() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyToSignal, setFlyToSignal] = useState(0);
  const [locateErrorDismissed, setLocateErrorDismissed] = useState(false);
  const [zoomInSignal, setZoomInSignal] = useState(0);
  const [zoomOutSignal, setZoomOutSignal] = useState(0);
  const [compassSignal, setCompassSignal] = useState(0); 
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [polygonFilter, setPolygonFilter] = useState<[number, number][] | null>(null);
  const [routeSummary, setRouteSummary] = useState<{ distanceKm: string; timeMins: number } | null>(null);
  const [mapStyle, setMapStyle] = useState<"default" | "satellite" | "dark">("default");
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const filterState = useKajianFilter();
  const geo = useGeolocation();
  const [showScanner, setShowScanner] = useState(false);
  const isAnyOtherFeatureActive = isListOpen || isDrawingMode || isLayerMenuOpen || showScanner || isRouteMode;
  
  // Only `isActive` is filtered server-side here — date mode, ustadz,
  // category, and free-text search stay client-side in
  // `groupKajianRecordsByLocation` so typing in the search box doesn't
  // trigger a network round trip on every keystroke.
  const kajianQuery = useKajianListQuery({ isActive: true });

  const filteredLocations = useMemo(() => {
    // let baseLocations = getFilteredLocationsWithKajian(mockLocations, mockKajian, filterState.filters);
    let baseLocations = groupKajianRecordsByLocation(kajianQuery.data ?? [], filterState.filters);
    if (polygonFilter && polygonFilter.length > 2) {
      baseLocations = baseLocations.filter(loc => 
        isPointInPolygon([loc.lat, loc.lng], polygonFilter)
      );
    }
    return baseLocations;
  }, [filterState.filters, polygonFilter]);

  const { status: scannerStatus, nearbyLocations, startScan, resetScanner } = useNearbyKajian(filteredLocations);
  const totalKajian = filteredLocations.reduce((sum, l) => sum + l.kajianList.length, 0);
  const selectedLocation = filteredLocations.find((l) => l.id === selectedLocationId) ?? null;
  const resultsSummary = kajianQuery.isLoading
    ? "Memuat jadwal kajian…"
    : kajianQuery.isError
    ? "Gagal memuat data. Periksa koneksi lalu coba lagi."
    : filteredLocations.length > 0
    ? `${totalKajian} kajian ditemukan di ${filteredLocations.length} lokasi`
    : "Tidak ada kajian yang cocok dengan filter.";
  useEffect(() => { geo.requestLocation(); }, []);
  useEffect(() => { if (geo.status === "granted" && geo.position) setFlyToSignal((s) => s + 1); }, [geo.status, geo.position]);

  function handleLocateMe() {
    setLocateErrorDismissed(false);
    geo.requestLocation();
  }

  function handleMarkerClick(locationId: string) {
    setSelectedLocationId(locationId);
  }

  function handleTriggerSearch() {
    setShowScanner(true);
    startScan();
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <style>{`
        .leaflet-control-zoom { display: none !important; }
        .leaflet-routing-container { display: none !important; }
      `}</style>

      {/* Header Judul */}
      <div className="pointer-events-none absolute left-4 top-4 md:left-6 md:top-6 z-50">
        <h1 className={cn(
          "text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md transition-colors duration-300",
          mapStyle === "default" ? "text-blue-900" : "text-yellow-400"
        )}>
          KajianMap
        </h1>
      </div>

      {/* Pojok Kanan Atas */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6 z-50 flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" className="h-10 md:h-12 px-4 rounded-full bg-white/40 text-blue-900 shadow-sm backdrop-blur-md hover:bg-white transition-colors font-medium text-xs md:text-sm flex items-center gap-1.5">
            <LogIn className="h-4 w-4 md:h-4 md:w-4" />
            <span className="hidden md:inline">Masuk Admin</span>
          </Button>
        </Link>
        <Button size="icon" variant="ghost" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/40 text-blue-900 shadow-sm backdrop-blur-md hover:bg-white transition-colors">
          <Home className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
      </div>

      {/* Peta Utama */}
      <div className="absolute inset-0 z-0">
        <MapView
          locations={filteredLocations}
          selectedLocationId={selectedLocationId}
          onMarkerClick={handleMarkerClick}
          onOpenDetail={() => setDrawerOpen(true)}
          userPosition={geo.position}
          flyToSignal={flyToSignal}
          zoomInSignal={zoomInSignal}
          zoomOutSignal={zoomOutSignal}
          compassSignal={compassSignal} 
          isDrawingMode={isDrawingMode}
          polygonFilter={polygonFilter}
          onPolygonCreated={(coords: [number, number][]) => {
            setPolygonFilter(coords);
            setIsDrawingMode(false);
          }}
          mapStyle={mapStyle}
          isRouteMode={isRouteMode}
          onRouteCalculated={(data) => setRouteSummary(data)}
          onRouteCleared={() => setRouteSummary(null)}
        />
      </div>

      {/* PANEL DAFTAR KAJIAN */}
      <div className={cn(
        "absolute z-[40] flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white/65 backdrop-blur-md border border-border shadow-2xl", 
        isListOpen ? "opacity-100 pointer-events-auto translate-y-0 md:translate-x-0" : "opacity-0 pointer-events-none translate-y-10 md:translate-y-0 md:-translate-x-10", 
        "inset-4 top-20 bottom-24 rounded-3xl md:inset-auto md:left-6 md:top-24 md:bottom-10 md:w-[340px] lg:w-[400px] md:rounded-2xl"
      )}>
        <div className="relative z-[3] flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Daftar Kajian</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsListOpen(false)} className="rounded-full h-8 w-8 hover:bg-muted"><X className="h-4 w-4" /></Button>
        </div>
        <div className="relative z-[2] space-y-2 border-b border-border p-4 bg-transparent">
          <KajianFilterBar filterState={filterState} />
          {resultsSummary && <p className="text-xs text-slate-900">{resultsSummary}</p>}
        </div>
        <div className="relative z-[1] flex-1 overflow-y-auto p-4 scroll-slim">
          {polygonFilter && filteredLocations.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500"><X className="h-6 w-6" /></div>
              <p className="text-sm font-medium text-foreground">Maaf, tidak ada kajian di dalam area yang Anda seleksi.</p>
              <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => { setPolygonFilter(null); setIsDrawingMode(false); }}>
                <Eraser className="mr-2 h-4 w-4" /> Hapus Area
              </Button>
            </div>
          ) : (
            <KajianList locations={filteredLocations} onSelectLocation={(id) => { handleMarkerClick(id); setDrawerOpen(true); if (window.innerWidth < 768) setIsListOpen(false); }} />
          )}
        </div>
      </div>

      {/* 6. UI BOX PILIHAN MODE PETA YANG RESPONSIF  */}
      {isLayerMenuOpen && (
        <div className={cn(
          "absolute bottom-20 md:bottom-24 z-50 flex w-max -translate-x-1/2 items-center justify-center gap-1 md:gap-2 rounded-2xl border border-white/20 bg-black/65 p-1.5 md:p-2.5 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200",
          isListOpen 
            ? "left-1/2 md:left-[calc(50%+160px)] lg:left-[calc(50%+180px)] xl:left-1/2" 
            : "left-1/2"
        )}>
          
          <button 
            onClick={() => { setMapStyle("default"); setIsLayerMenuOpen(false); }} 
            className={cn("flex w-16 md:w-20 flex-col items-center justify-center gap-1 md:gap-1.5 rounded-xl py-2 md:py-2.5 transition-colors", mapStyle === "default" ? "bg-blue-600" : "hover:bg-white/20")}
          >
            <Map className="h-4 w-4 md:h-6 md:w-6" />
            <span className="text-[10px] md:text-xs font-medium">Default</span>
          </button>
          
          <button 
            onClick={() => { setMapStyle("satellite"); setIsLayerMenuOpen(false); }} 
            className={cn("flex w-16 md:w-20 flex-col items-center justify-center gap-1 md:gap-1.5 rounded-xl py-2 md:py-2.5 transition-colors", mapStyle === "satellite" ? "bg-blue-600" : "hover:bg-white/20")}
          >
            <Globe className="h-4 w-4 md:h-6 md:w-6" />
            <span className="text-[10px] md:text-xs font-medium">Satelit</span>
          </button>
          
          <button 
            onClick={() => { setMapStyle("dark"); setIsLayerMenuOpen(false); }} 
            className={cn("flex w-16 md:w-20 flex-col items-center justify-center gap-1 md:gap-1.5 rounded-xl py-2 md:py-2.5 transition-colors", mapStyle === "dark" ? "bg-blue-600" : "hover:bg-white/20")}
          >
            <Moon className="h-4 w-4 md:h-6 md:w-6" />
            <span className="text-[10px] md:text-xs font-medium">Gelap</span>
          </button>

        </div>
      )}

      {/* Rute 1 Titik Kajian */}
      {isRouteMode && selectedLocation && routeSummary && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex w-[92%] max-w-[400px] items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/65 px-4 py-3 text-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          
          {/* Info Jarak & Waktu */}
          <div className="flex-1 overflow-hidden">
            <p className="text-[11px] font-semibold tracking-wide text-yellow-400 uppercase truncate">
              📍 Rute ke {selectedLocation.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2.5">
              <span className="text-lg font-extrabold text-white">
                {routeSummary.distanceKm} <span className="text-xs font-normal text-slate-300">km</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-sm font-semibold text-emerald-400">
                ~{routeSummary.timeMins} <span className="text-xs font-normal text-emerald-200">menit</span>
              </span>
            </div>
          </div>

          {/* Akses Cepat Navigasi & Tutup */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
            >
              <span>Navigasi</span>
            </a>

            <button 
              onClick={() => {
                setIsRouteMode(false);
                setRouteSummary(null);
              }}
              className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white transition active:scale-95"
              title="Tutup Rute"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      <MapToolbar
        onSearch={() => {
          handleTriggerSearch();
          // Tutup menu lain saat mencari
          setIsListOpen(false);
          setIsLayerMenuOpen(false);
        }} 
        onToggleList={() => {
          setIsListOpen(!isListOpen);
          setIsLayerMenuOpen(false); 
          setIsDrawingMode(false);
        }} 
        onResetView={() => setCompassSignal((s) => s + 1)}
        isDrawingMode={isDrawingMode}
        hasPolygon={polygonFilter !== null}
        onToggleDraw={() => {
          setIsDrawingMode(!isDrawingMode);
          setIsListOpen(false);       
          setIsLayerMenuOpen(false);  
        }}
        onClearDraw={() => {
          setPolygonFilter(null);
          setIsDrawingMode(false);
        }}
        onToggleLayerMenu={() => {
          setIsLayerMenuOpen(!isLayerMenuOpen);
          setIsListOpen(false);       
          setIsDrawingMode(false);    
        }}
        isListOpen={isListOpen}
        isLayerMenuOpen={isLayerMenuOpen}
        isRouteMode={isRouteMode}
      />

      {/* Sisa UI Kontrol Kanan & Scanner ... */}
      <RightSideControls 
        onLocate={handleLocateMe} 
        locateLoading={geo.status === "loading"} 
        onZoomIn={() => setZoomInSignal((s) => s + 1)} 
        onZoomOut={() => setZoomOutSignal((s) => s + 1)} 
        isListOpen={isListOpen}
        isRouteMode={isRouteMode}
        onToggleRoute={() => {
          setIsRouteMode(!isRouteMode);
          setIsListOpen(false);      
          setIsLayerMenuOpen(false);  
        }} 
        isDisabled={isAnyOtherFeatureActive}
      />

      {(geo.status === "denied" || geo.status === "error") && !locateErrorDismissed && (
        <div className="absolute bottom-36 md:bottom-28 left-1/2 z-50 flex -translate-x-1/2 w-[90%] max-w-[300px] items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground shadow-raised">
          <p className="flex-1">{geo.errorMessage}</p>
          <button onClick={() => setLocateErrorDismissed(true)} className="mt-0.5 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      )}
      
      <KajianDetailDrawer location={selectedLocation} open={drawerOpen} onOpenChange={setDrawerOpen} />
      
      {showScanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
          <NearbyScannerAlert 
            status={scannerStatus} 
            nearbyLocations={nearbyLocations} 
            onShowDetail={(id: string) => { 
              handleMarkerClick(id); 
              setDrawerOpen(true); 
              setShowScanner(false); 
              resetScanner(); 
              }}
              onClose={() => { 
                setShowScanner(false); 
                resetScanner(); 
              }}
              />
        </div>
      )}

      {polygonFilter && filteredLocations.length === 0 && !isListOpen && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex w-[85vw] max-w-[320px] flex-col items-center justify-center gap-1 rounded-2xl border border-white/20 bg-black/75 p-5 text-center text-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <X className="mb-1 h-8 w-8 text-red-400" />
          <p className="text-[15px] font-bold">Area Kosong</p>
          <p className="text-xs text-slate-300">Maaf, tidak ada titik kajian di dalam area yang Anda gambar.</p>
          <Button variant="outline" size="sm" className="mt-3 w-full rounded-full border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/30 hover:text-white" onClick={() => setPolygonFilter(null)}>
            <Eraser className="mr-2 h-4 w-4" /> Hapus Area
          </Button>
        </div>
      )}
    </div>
  );
}