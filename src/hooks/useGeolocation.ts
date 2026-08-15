"use client";

import { useCallback, useState } from "react";

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "error";

interface GeolocationState {
  status: GeolocationStatus;
  position: { lat: number; lng: number } | null;
  errorMessage: string | null;
}

/**
 * Wraps the browser Geolocation API so components can request the user's
 * position on demand (e.g. "auto-center peta ke lokasi user") without
 * blocking initial render — the map should always show something useful
 * even if permission is denied or the API is unavailable (SSR, older
 * browsers, etc).
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    position: null,
    errorMessage: null,
  });

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "error",
        position: null,
        errorMessage: "Geolocation tidak didukung di perangkat ini.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "loading" }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          setState({ status: "error", position: null, errorMessage: "Koordinat lokasi tidak valid." });
          return;
        }
        setState({ status: "granted", position: { lat, lng }, errorMessage: null });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          position: null,
          errorMessage:
            err.code === err.PERMISSION_DENIED
              ? "Izin lokasi ditolak. Aktifkan izin lokasi untuk melihat kajian terdekat."
              : "Tidak dapat mengambil lokasi saat ini.",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  return { ...state, requestLocation };
}
