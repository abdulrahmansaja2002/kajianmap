import { useState, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getNearbyLocations } from "@/lib/distance-point";

export type ScannerStatus = "idle" | "scanning" | "found" | "empty" | "error";

export function useNearbyKajian(locations: any[]) { 
  const geo = useGeolocation();
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);

  // Fungsi untuk memicu pencarian secara manual
  const startScan = () => {
    setStatus("scanning");
    geo.requestLocation();
  };

  // Fungsi untuk mereset scanner (misal saat ditutup)
  const resetScanner = () => {
    setStatus("idle");
    setNearbyLocations([]);
  };

  useEffect(() => {
    // Hanya kalkulasi jika statusnya sedang 'scanning'
    if (status !== "scanning") return;

    if (geo.status === "error" || geo.status === "denied") {
      setStatus("error");
      return;
    }

    if (geo.status === "granted" && geo.position) {
      // Jeda 1.5 detik untuk animasi UI
      const scanTimer = setTimeout(() => {
        const results = getNearbyLocations(geo.position!.lat, geo.position!.lng, locations, 10);
        setNearbyLocations(results);
        setStatus(results.length > 0 ? "found" : "empty");
      }, 1500);

      return () => clearTimeout(scanTimer);
    }
  }, [geo.status, geo.position, locations, status]);

  return { status, nearbyLocations, geoError: geo.errorMessage, startScan, resetScanner };
}