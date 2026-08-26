import { z } from "zod";
import type { Location } from "../../../generated/prisma/client";
import { LocationRepo } from "@/server/repo/location.repo";
import { NotFoundError } from "@/server/helpers/errors";
import { requireRole, type AuthContext } from "@/server/middlewares/auth.middleware";

const phoneRegex = /^[0-9+\-\s]*$/;

/**
 * Field rules mirror `locationFormSchema` in the frontend
 * (`src/lib/validations/location.ts`) — same min/max lengths and the same
 * lat/lng bounds as `Location` in `@/types`.
 *
 * Kept as a plain object schema so `update` can safely call `.partial()`.
 */
const locationFields = z.object({
  name: z.string().min(3, "Nama tempat minimal 3 karakter").max(100, "Nama tempat maksimal 100 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota wajib diisi"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  lat: z.coerce
    .number({ invalid_type_error: "Latitude harus berupa angka" })
    .min(-90)
    .max(90),
  lng: z.coerce
    .number({ invalid_type_error: "Longitude harus berupa angka" })
    .min(-180)
    .max(180),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  contactPhone: z
    .string()
    .regex(phoneRegex, "Nomor telepon hanya boleh angka, +, dan -")
    .optional()
    .or(z.literal("")),
});

export const createLocationSchema = locationFields;
export const updateLocationSchema = locationFields.partial();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export interface ListLocationQuery {
  city?: string;
  province?: string;
}

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const LocationService = {
  /** Public read — powers the map, location pickers, and admin tables. */
  async list(query: ListLocationQuery = {}): Promise<Location[]> {
    return LocationRepo.findMany({
      city: query.city || undefined,
      province: query.province || undefined,
    });
  },

  /** Public read — location detail. */
  async getById(id: string): Promise<Location> {
    const location = await LocationRepo.findById(id);
    if (!location) throw new NotFoundError("Lokasi tidak ditemukan.");
    return location;
  },

  /** Protected — only super_admin may register a new masjid. */
  async create(rawInput: unknown, auth: AuthContext): Promise<Location> {
    requireRole(auth, ["super_admin"]);
    const input = createLocationSchema.parse(rawInput);

    return LocationRepo.create({
      name: input.name,
      address: input.address,
      city: input.city,
      province: input.province,
      lat: input.lat,
      lng: input.lng,
      imageUrl: emptyToNull(input.imageUrl),
      contactPhone: emptyToNull(input.contactPhone),
    });
  },

  /** Protected — only super_admin may edit a masjid. */
  async update(id: string, rawInput: unknown, auth: AuthContext): Promise<Location> {
    requireRole(auth, ["super_admin"]);
    const existing = await LocationRepo.findById(id);
    if (!existing) throw new NotFoundError("Lokasi tidak ditemukan.");

    const input = updateLocationSchema.parse(rawInput);

    return LocationRepo.update(id, {
      name: input.name,
      address: input.address,
      city: input.city,
      province: input.province,
      lat: input.lat,
      lng: input.lng,
      imageUrl: emptyToNull(input.imageUrl),
      contactPhone: emptyToNull(input.contactPhone),
    });
  },

  /** Protected — deleting a location cascades its kajian (Prisma schema). */
  async remove(id: string, auth: AuthContext): Promise<Location> {
    requireRole(auth, ["super_admin"]);
    const existing = await LocationRepo.findById(id);
    if (!existing) throw new NotFoundError("Lokasi tidak ditemukan.");

    return LocationRepo.delete(id);
  },
};
