import type { LocationWithKajian } from "@/types";

// Fungsi pembantu untuk mengubah derajat menjadi radian
function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Menghitung jarak garis lurus (dalam Kilometer) antara dua titik koordinat
 */
export function calculateDistanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371; 
  
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

/**
 * Memfilter lokasi yang berada dalam radius tertentu (default 10 km) 
 * dan mengurutkannya dari yang paling dekat.
 */
export function getNearbyLocations(
  userLat: number, 
  userLng: number, 
  locations: LocationWithKajian[],
  maxRadiusKm: number = 10 // <-- Radius 10 km diterapkan secara otomatis di sini
) {
  return locations
    .map((loc) => ({
      ...loc,
      // Menambahkan properti 'distance' ke setiap lokasi
      distance: calculateDistanceInKm(userLat, userLng, loc.lat, loc.lng)
    }))
    // Memilah yang hanya berjarak 10 km atau kurang
    .filter((loc) => loc.distance <= maxRadiusKm)
    // Mengurutkan dari yang paling dekat ke yang paling jauh
    .sort((a, b) => a.distance - b.distance); 
}