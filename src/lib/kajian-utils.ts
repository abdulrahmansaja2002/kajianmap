import type {
  Kajian,
  KajianFilters,
  Location,
  LocationWithKajian,
} from "@/types";
import {
  daysUntilNextOccurrence,
  occursOnDate,
  occursToday,
  scheduleWithTimeLabel,
  toISODate,
} from "@/lib/date-helpers";

/** Does a single kajian satisfy the filter set (date/ustadz/category)?
 *  Location-name / free-text query is resolved one level up, since that
 *  needs the parent location in scope. */
export function matchesKajianFilters(
  kajian: Kajian,
  filters: KajianFilters,
  today: Date = new Date()
): boolean {
  if (!kajian.isActive) return false;

  if (filters.dateMode === "hari_ini" && !occursToday(kajian, today)) {
    return false;
  }
  if (filters.dateMode === "tanggal" && filters.selectedDate) {
    if (!occursOnDate(kajian, filters.selectedDate)) return false;
  }
  if (filters.dateMode === "semua") {
    // Hide one-off sessions that have already passed; recurring ones are
    // always "upcoming" by definition.
    if (kajian.frequency === "insidental" && kajian.date) {
      if (kajian.date < toISODate(today)) return false;
    }
  }

  if (filters.ustadz && filters.ustadz.trim().length > 0) {
    const needle = filters.ustadz.trim().toLowerCase();
    if (!kajian.ustadz.toLowerCase().includes(needle)) return false;
  }

  if (filters.category && filters.category !== "semua") {
    if (kajian.category !== filters.category) return false;
  }

  return true;
}

/** Joins locations with their kajian, applies filters, and drops any
 *  location left with zero matching kajian. Free-text `query` matches
 *  either the kajian title or the location/masjid name. */
export function getFilteredLocationsWithKajian(
  locations: Location[],
  kajianList: Kajian[],
  filters: KajianFilters,
  today: Date = new Date()
): LocationWithKajian[] {
  const query = filters.query?.trim().toLowerCase();

  return locations
    .map((location) => {
      const locationNameMatches = query
        ? location.name.toLowerCase().includes(query)
        : true;

      const matchingKajian = kajianList
        .filter((k) => k.locationId === location.id)
        .filter((k) => matchesKajianFilters(k, filters, today))
        .filter((k) => {
          if (!query) return true;
          if (locationNameMatches) return true;
          return k.title.toLowerCase().includes(query);
        })
        .sort(
          (a, b) =>
            daysUntilNextOccurrence(a, today) - daysUntilNextOccurrence(b, today)
        );

      const hasToday = matchingKajian.some((k) => occursToday(k, today));
      const next = matchingKajian[0];

      const result: LocationWithKajian = {
        ...location,
        kajianList: matchingKajian,
        hasToday,
        nextOccurrenceLabel: next ? scheduleWithTimeLabel(next) : null,
      };
      return result;
    })
    .filter((loc) => loc.kajianList.length > 0);
}

/** Straight distance in kilometers between two lat/lng points (haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Same job as `getFilteredLocationsWithKajian`, but for data that arrived
 * from the API rather than the mock arrays — `GET /api/kajian` returns a
 * flat list of kajian each with their own `location` embedded (see
 * `lib/api-mappers.ts`), not a separate `Location[]` to join against. This
 * groups that flat list back into the same `LocationWithKajian[]` shape
 * every list/map component already expects, applying the identical filter
 * and sort rules.
 */
export function groupKajianRecordsByLocation(
  records: { kajian: Kajian; location: Location }[],
  filters: KajianFilters,
  today: Date = new Date()
): LocationWithKajian[] {
  const query = filters.query?.trim().toLowerCase();
  const byLocation = new Map<string, { location: Location; kajianList: Kajian[] }>();

  for (const { kajian, location } of records) {
    if (!matchesKajianFilters(kajian, filters, today)) continue;

    if (query) {
      const locationMatches = location.name.toLowerCase().includes(query);
      const titleMatches = kajian.title.toLowerCase().includes(query);
      if (!locationMatches && !titleMatches) continue;
    }

    const entry = byLocation.get(location.id) ?? { location, kajianList: [] };
    entry.kajianList.push(kajian);
    byLocation.set(location.id, entry);
  }

  return Array.from(byLocation.values()).map(({ location, kajianList }) => {
    const sorted = [...kajianList].sort(
      (a, b) => daysUntilNextOccurrence(a, today) - daysUntilNextOccurrence(b, today)
    );
    const hasToday = sorted.some((k) => occursToday(k, today));
    const next = sorted[0];

    const result: LocationWithKajian = {
      ...location,
      kajianList: sorted,
      hasToday,
      nextOccurrenceLabel: next ? scheduleWithTimeLabel(next) : null,
    };
    return result;
  });
}

