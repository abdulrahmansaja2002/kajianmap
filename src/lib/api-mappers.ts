import type {
  Kajian,
  KajianCategory,
  KajianDayOfWeek,
  KajianFrequency,
  Location,
  User,
  UserRole,
} from "@/types";

/**
 * Shape actually returned by GET /api/kajian and /api/kajian/:id — a
 * Prisma `Kajian` row with its parent `location` and `createdBy` embedded
 * (see the `include` in `server/repo/kajian.repo.ts`). Nullable Prisma
 * fields serialize as `null` over JSON, not `undefined`, which is why this
 * type — and the mappers below — exist separately from `@/types`' `Kajian`/
 * `Location`, which use `?` (`undefined`) for optional fields everywhere
 * else in the app.
 */
export interface ApiLocationRecord {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKajianRecord {
  id: string;
  title: string;
  ustadz: string;
  category: string;
  frequency: KajianFrequency;
  dayOfWeek: KajianDayOfWeek | null;
  date: string | null;
  startTime: string;
  endTime: string;
  description: string;
  posterUrl: string | null;
  contactPerson: string;
  contactPhone: string | null;
  isActive: boolean;
  locationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  location: ApiLocationRecord;
  createdBy: { id: string; name: string; email: string };
}

export function mapApiLocation(raw: ApiLocationRecord): Location {
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    city: raw.city,
    province: raw.province,
    lat: raw.lat,
    lng: raw.lng,
    imageUrl: raw.imageUrl ?? undefined,
    contactPhone: raw.contactPhone ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export interface ApiUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedLocations: { id: string; name: string }[];
}

export function mapApiUser(raw: ApiUserRecord): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    assignedLocationIds: raw.assignedLocations.map((l) => l.id),
    avatarUrl: raw.avatarUrl ?? undefined,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function mapApiKajian(raw: ApiKajianRecord): Kajian {
  return {
    id: raw.id,
    locationId: raw.locationId,
    title: raw.title,
    ustadz: raw.ustadz,
    // The API validates `category` against the same `KAJIAN_CATEGORY_OPTIONS`
    // this cast assumes — see kajian.service.ts's `createKajianSchema`.
    category: raw.category as KajianCategory,
    frequency: raw.frequency,
    dayOfWeek: raw.dayOfWeek ?? undefined,
    date: raw.date ?? undefined,
    startTime: raw.startTime,
    endTime: raw.endTime,
    description: raw.description,
    contactPerson: raw.contactPerson,
    contactPhone: raw.contactPhone ?? undefined,
    posterUrl: raw.posterUrl ?? undefined,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    createdBy: raw.createdById,
  };
}
