"use client";

import { useEffect, useMemo, useState } from "react";
import { LocateFixed, Loader2, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileViewToggle } from "@/components/layout/MobileViewToggle";
import MapView from "@/components/map/MapView";
import { KajianFilterBar } from "@/components/kajian/KajianFilterBar";
import { KajianList } from "@/components/kajian/KajianList";
import { KajianDetailDrawer } from "@/components/kajian/KajianDetailDrawer";
import { useKajianFilter } from "@/hooks/useKajianFilter";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getFilteredLocationsWithKajian } from "@/lib/kajian-utils";
import { mockKajian, mockLocations } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useMediaDevice from "@/hooks/useMediaDevice";

function LocateMeButton({
  onClick,
  loading,
  className,
}: {
  onClick: () => void;
  loading: boolean;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="secondary"
      className={cn(
        "absolute z-400 h-11 w-11 rounded-full border border-border bg-card shadow-raised hover:bg-secondary",
        className
      )}
      aria-label="Temukan lokasi saya"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary-700" />
      ) : (
        <LocateFixed className="h-4 w-4 text-primary-700" />
      )}
    </Button>
  );
}

export default function PublicMapPage() {
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyToSignal, setFlyToSignal] = useState(0);
  const [locateErrorDismissed, setLocateErrorDismissed] = useState(false);

  const filterState = useKajianFilter();
  const geo = useGeolocation();

  const filteredLocations = useMemo(
    () => getFilteredLocationsWithKajian(mockLocations, mockKajian, filterState.filters),
    [filterState.filters]
  );

  const totalKajian = filteredLocations.reduce((sum, l) => sum + l.kajianList.length, 0);

  const selectedLocation =
    filteredLocations.find((l) => l.id === selectedLocationId) ?? null;

  // Try to auto-center on the user's location as soon as the map loads —
  // if permission hasn't been granted yet, the browser will simply prompt.
  useEffect(() => {
    geo.requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geo.status === "granted" && geo.position) {
      setFlyToSignal((s) => s + 1);
    }
  }, [geo.status, geo.position]);

  function handleLocateMe() {
    setLocateErrorDismissed(false);
    geo.requestLocation();
  }

  function handleMarkerClick(locationId: string) {
    setSelectedLocationId(locationId);
    setDrawerOpen(true);
  }

  const resultsSummary =
    filteredLocations.length > 0
      ? `${totalKajian} kajian ditemukan di ${filteredLocations.length} lokasi`
      : null;

  const { isMobile } = useMediaDevice();

  const DesktopView = () => (
    /* ---------- Mobile: single column, map/list toggle ---------- */
    <div className="h-full flex">
      <aside className="flex w-[400px] shrink-0 flex-col border-r border-border bg-background">
        <div className="space-y-2 border-b border-border p-4">
          <KajianFilterBar filterState={filterState} />
          {resultsSummary && (
            <p className="text-xs text-muted-foreground">{resultsSummary}</p>
          )}
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto p-4">
          <KajianList
            locations={filteredLocations}
            onSelectLocation={handleMarkerClick}
          />
        </div>
      </aside>

      <div className="relative flex-1">
        <MapView
          locations={filteredLocations}
          selectedLocationId={selectedLocationId}
          onMarkerClick={handleMarkerClick}
          userPosition={geo.position}
          flyToSignal={flyToSignal}
        />
        <LocateMeButton
          onClick={handleLocateMe}
          loading={geo.status === "loading"}
          className="bottom-6 right-6"
        />
        {(geo.status === "denied" || geo.status === "error") &&
          !locateErrorDismissed && (
            <div className="absolute bottom-20 right-6 z-400 flex max-w-[220px] items-start gap-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground shadow-raised">
              <p className="flex-1">{geo.errorMessage}</p>
              <button onClick={() => setLocateErrorDismissed(true)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
      </div>
    </div>
  )

  const MobileView = () => (
    /* ---------- Desktop: split sidebar + map ---------- */
    <div className="flex h-full flex-col md:hidden">
      <div className="space-y-2 border-b border-border bg-card p-3">
        <KajianFilterBar filterState={filterState} />
        {resultsSummary && (
          <p className="px-0.5 text-xs text-muted-foreground">{resultsSummary}</p>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        {view === "map" ? (
          <>
            <MapView
              locations={filteredLocations}
              selectedLocationId={selectedLocationId}
              onMarkerClick={handleMarkerClick}
              userPosition={geo.position}
              flyToSignal={flyToSignal}
            />
            <LocateMeButton
              onClick={handleLocateMe}
              loading={geo.status === "loading"}
              className="bottom-24 right-4"
            />
            {(geo.status === "denied" || geo.status === "error") &&
              !locateErrorDismissed && (
                <div className="absolute bottom-40 right-4 z-400 flex max-w-[200px] items-start gap-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground shadow-raised">
                  <p className="flex-1">{geo.errorMessage}</p>
                  <button onClick={() => setLocateErrorDismissed(true)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
          </>
        ) : (
          <div className="scroll-slim h-full overflow-y-auto p-3 pb-24">
            <KajianList
              locations={filteredLocations}
              onSelectLocation={handleMarkerClick}
            />
          </div>
        )}
      </div>

      <MobileViewToggle view={view} onChange={setView} />
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <Navbar />

      <div className="relative min-h-0 flex-1">
        {isMobile ? (
          <MobileView />
        ) : (
          <DesktopView />
        )}
      </div>

      <KajianDetailDrawer
        location={selectedLocation}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
