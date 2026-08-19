import L from "leaflet";

/**
 * Leaflet's default marker assets resolve to broken paths once bundled by
 * Next.js/webpack. Since KajianMap only ever uses the custom divIcon below,
 * this is a defensive fallback in case any third-party code reaches for
 * L.Icon.Default directly.
 */
export function patchLeafletDefaultIcon() {
  // @ts-expect-error — _getIconUrl is a private Leaflet internal
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

/** Small mosque-dome + crescent glyph, drawn once and reused inline in
 * every marker so the app doesn't depend on an external icon sprite. */
const DOME_GLYPH = `
  <path d="M6 15.5c0-3.6 2.7-6.3 6-6.3s6 2.7 6 6.3" fill="currentColor" opacity="0.95"/>
  <rect x="4.5" y="15.3" width="15" height="2.1" rx="1.05" fill="currentColor"/>
  <path d="M12 5.6v2.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="12" cy="4.6" r="1" fill="currentColor"/>
`;

interface MarkerOptions {
  hasToday: boolean;
  isSelected?: boolean;
}

/** Builds the custom KajianMap pin: a rounded badge with a mosque-dome
 * glyph. "Today" locations glow with a pulsing emerald ring; everything
 * else sits in a quieter sage/slate tone so today's kajian visually pop
 * out of the map first. */
export function createKajianIcon({ hasToday, isSelected }: MarkerOptions): L.DivIcon {
  const size = isSelected ? 46 : 38;
  const badgeColor = hasToday ? "#0D6350" : "#71827A";
  const ring = hasToday
    ? `<span class="absolute inset-0 rounded-full" style="background:#15A57D;animation:marker-pulse 2.2s ease-in-out infinite;"></span>`
    : "";

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 12}px;display:flex;align-items:flex-start;justify-content:center;">
      <div class="kajianmap-pin" style="position:relative;width:${size}px;height:${size}px;">
        ${ring}
        <div style="
          position:relative;
          width:${size}px;height:${size}px;
          border-radius:9999px;
          background:${badgeColor};
          border:2.5px solid #ffffff;
          box-shadow:0 6px 14px -4px rgba(10,20,15,0.45);
          display:flex;align-items:center;justify-content:center;
          color:#ffffff;
        ">
          <svg width="${size * 0.56}" height="${size * 0.56}" viewBox="0 0 24 24" fill="none">${DOME_GLYPH}</svg>
        </div>
      </div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${badgeColor};
        margin-top:-3px;
        filter:drop-shadow(0 2px 2px rgba(10,20,15,0.25));
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "kajianmap-marker",
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 4)],
  });
}

/** Pulsing blue dot for "you are here", distinct from the emerald kajian
 * markers so it never gets confused with an actual masjid pin. */
export function createUserLocationIcon(): L.DivIcon {
  // 👇 PERBAIKAN: Memperbesar ikon posisi pengguna dan efek radar di sekelilingnya
  const html = `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;width:48px;height:48px;border-radius:9999px;background:#2563EB;opacity:0.3;animation:user-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
      
      <span style="position:relative;width:22px;height:22px;border-radius:9999px;background:#2563EB;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(37,99,235,0.6);"></span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "kajianmap-user-dot",
    iconSize: [24, 24],
    iconAnchor: [12, 12], // Titik tengah harus presisi di [12, 12] karena ukuran w/h adalah 24px
  });
}