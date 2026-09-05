/**
 * KajianMap — core domain types.
 * Kept framework-agnostic so they can be reused by API routes,
 * server components, client components, and Zod schemas alike.
 */

// ---------------------------------------------------------------------------
// Roles & Users
// ---------------------------------------------------------------------------

/** The three access tiers described in the product spec. Public users are
 *  unauthenticated and therefore not represented as a stored `User`. */
export type UserRole = "super_admin" | "admin_masjid";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Location IDs this admin is allowed to manage. Empty for super_admin,
   *  since a super_admin implicitly manages everything. */
  assignedLocationIds: string[];
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string; // ISO date string
}

/** Shape returned by the (mock) auth layer once a user is signed in. */
export interface AuthSession {
  user: User;
  token: string;
}

// ---------------------------------------------------------------------------
// Locations (Masjid / tempat kajian)
// ---------------------------------------------------------------------------

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  /** Optional cover image for the location's own profile. */
  imageUrl?: string;
  /** Denormalized for quick display; not required for CRUD. */
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Kajian (the recurring or one-off study session itself)
// ---------------------------------------------------------------------------

export type KajianFrequency = "rutin" | "insidental";

export type KajianDayOfWeek =
  | "senin"
  | "selasa"
  | "rabu"
  | "kamis"
  | "jumat"
  | "sabtu"
  | "minggu";

export const DAY_OF_WEEK_OPTIONS: { value: KajianDayOfWeek; label: string }[] = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
  { value: "minggu", label: "Minggu" },
];

export type KajianCategory =
  | "Tafsir Al-Qur'an"
  | "Hadits"
  | "Fiqih"
  | "Aqidah"
  | "Sirah Nabawiyah"
  | "Akhlak & Tazkiyah"
  | "Muamalah"
  | "Kajian Umum"
  | "Kajian Muslimah"
  | "Kajian Remaja";

export const KAJIAN_CATEGORY_OPTIONS: KajianCategory[] = [
  "Tafsir Al-Qur'an",
  "Hadits",
  "Fiqih",
  "Aqidah",
  "Sirah Nabawiyah",
  "Akhlak & Tazkiyah",
  "Muamalah",
  "Kajian Umum",
  "Kajian Muslimah",
  "Kajian Remaja",
];

export interface Kajian {
  id: string;
  locationId: string;
  title: string;
  ustadz: string;
  category: KajianCategory;
  frequency: KajianFrequency;
  /** Required when frequency === "rutin". */
  dayOfWeek?: KajianDayOfWeek;
  /** Required when frequency === "insidental". ISO date, e.g. "2026-08-21". */
  date?: string;
  /** 24h "HH:mm" */
  startTime: string;
  /** 24h "HH:mm" */
  endTime: string;
  description: string;
  contactPerson: string;
  contactPhone?: string;
  posterUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Which admin_masjid user created/owns this entry — used for RBAC checks. */
  createdBy: string;
}

/** A location bundled with its kajian list — the shape the map & list views
 *  actually consume, since a single masjid can host several kajian. */
export interface LocationWithKajian extends Location {
  kajianList: Kajian[];
  /** True if at least one active kajian at this location happens today. */
  hasToday: boolean;
  /** Earliest upcoming occurrence across this location's kajian, for sorting. */
  nextOccurrenceLabel: string | null;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export type DateFilterMode = "semua" | "hari_ini" | "tanggal";

export interface KajianFilters {
  dateMode: DateFilterMode;
  /** Only used when dateMode === "tanggal". ISO date string. */
  selectedDate?: string;
  ustadz?: string;
  category?: KajianCategory | "semua";
  /** Free-text search across title / masjid name. */
  query?: string;
}
