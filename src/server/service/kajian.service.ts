import { z } from "zod";
import type { Kajian } from "@prisma/client";
import { KajianRepo } from "@/server/repo/kajian.repo";
import { ForbiddenError, NotFoundError } from "@/server/helpers/errors";
import type { AuthContext } from "@/server/middlewares/auth.middleware";
import { KAJIAN_CATEGORY_OPTIONS } from "@/types";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const phoneRegex = /^[0-9+\-\s]*$/;

/**
 * Field rules mirror `kajianFormSchema` in the frontend
 * (`src/lib/validations/kajian.ts`) exactly — same min/max lengths, same
 * category list (imported straight from `@/types` so the two can never
 * drift apart), and the same conditional rutin/insidental requirement.
 *
 * Kept as a plain object schema (no `.superRefine` yet) so `update` can
 * safely call `.partial()` on it — refinements don't survive `.partial()`,
 * so the cross-field checks are layered on separately for each variant.
 */
const kajianFields = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(120, "Judul maksimal 120 karakter"),
  ustadz: z.string().min(3, "Nama ustadz minimal 3 karakter").max(80, "Nama ustadz maksimal 80 karakter"),
  category: z.enum(KAJIAN_CATEGORY_OPTIONS as [string, ...string[]], {
    errorMap: () => ({ message: "Pilih kategori kajian" }),
  }),
  frequency: z.enum(["rutin", "insidental"], {
    errorMap: () => ({ message: "Pilih jenis jadwal" }),
  }),
  dayOfWeek: z
    .enum(["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"])
    .optional(),
  date: z.coerce.date({ invalid_type_error: "Tanggal tidak valid" }).optional(),
  startTime: z.string().regex(timeRegex, "Format waktu mulai tidak valid (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Format waktu selesai tidak valid (HH:mm)"),
  description: z
    .string()
    .min(20, "Deskripsi minimal 20 karakter agar jamaah paham konteksnya")
    .max(1000, "Deskripsi maksimal 1000 karakter"),
  contactPerson: z.string().min(3, "Nama kontak person wajib diisi"),
  contactPhone: z.string().regex(phoneRegex, "Nomor telepon hanya boleh angka, +, dan -").optional(),
  posterUrl: z.string().url("URL poster tidak valid").optional(),
  isActive: z.boolean(),
  locationId: z.string().min(1, "locationId wajib diisi"),
});

/** Same rutin/insidental + time-order rules as the frontend form's
 *  `superRefine`, so a payload that's valid client-side is guaranteed
 *  valid server-side too (and vice versa). */
function refineKajianRules(
  data: {
    frequency?: "rutin" | "insidental";
    dayOfWeek?: string;
    date?: Date;
    startTime?: string;
    endTime?: string;
  },
  ctx: z.RefinementCtx
) {
  if (data.frequency === "rutin" && !data.dayOfWeek) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dayOfWeek"],
      message: "Pilih hari untuk kajian rutin",
    });
  }
  if (data.frequency === "insidental" && !data.date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["date"],
      message: "Pilih tanggal untuk kajian insidental",
    });
  }
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "Waktu selesai harus setelah waktu mulai",
    });
  }
}

export const createKajianSchema = kajianFields.superRefine(refineKajianRules);
export const updateKajianSchema = kajianFields.partial().superRefine(refineKajianRules);

export type CreateKajianInput = z.infer<typeof createKajianSchema>;
export type UpdateKajianInput = z.infer<typeof updateKajianSchema>;

export interface ListKajianQuery {
  locationId?: string;
  category?: string;
  frequency?: "rutin" | "insidental";
  isActive?: string;
}

/** Central RBAC rule for this module: a super_admin may touch any masjid's
 *  schedule; an admin_masjid may only touch masjid they're assigned to —
 *  mirrors `assignedLocationIds` on the frontend `User` type, which is why
 *  this checks membership in an array rather than equality against a
 *  single id. */
function assertCanManageLocation(auth: AuthContext, locationId: string): void {
  if (auth.role === "admin_masjid" && !auth.locationIds.includes(locationId)) {
    throw new ForbiddenError(
      "Anda hanya dapat mengelola jadwal kajian pada masjid yang ditugaskan kepada Anda."
    );
  }
}

export const KajianService = {
  /** Public read — powers the map/list views, no auth required. */
  async list(query: ListKajianQuery): Promise<Kajian[]> {
    return KajianRepo.findMany({
      locationId: query.locationId || undefined,
      category: query.category || undefined,
      frequency: query.frequency || undefined,
      isActive: query.isActive === undefined ? undefined : query.isActive === "true",
    });
  },

  /** Public read — kajian detail / share page. */
  async getById(id: string): Promise<Kajian> {
    const kajian = await KajianRepo.findById(id);
    if (!kajian) throw new NotFoundError("Jadwal kajian tidak ditemukan.");
    return kajian;
  },

  /** Protected — admin_masjid can only create within masjid they're
   *  assigned to; super_admin can target any location. */
  async create(rawInput: unknown, auth: AuthContext): Promise<Kajian> {
    const input = createKajianSchema.parse(rawInput);
    assertCanManageLocation(auth, input.locationId);

    return KajianRepo.create({
      ...input,
      createdById: auth.userId,
    });
  },

  /** Protected — must own the *existing* location, and if the update also
   *  tries to move the kajian, must own the *destination* location too. */
  async update(id: string, rawInput: unknown, auth: AuthContext): Promise<Kajian> {
    const existing = await KajianRepo.findById(id);
    if (!existing) throw new NotFoundError("Jadwal kajian tidak ditemukan.");
    assertCanManageLocation(auth, existing.locationId);

    const input = updateKajianSchema.parse(rawInput);
    if (input.locationId) {
      assertCanManageLocation(auth, input.locationId);
    }

    return KajianRepo.update(id, input);
  },

  /** Protected — same ownership rule as update. */
  async remove(id: string, auth: AuthContext): Promise<Kajian> {
    const existing = await KajianRepo.findById(id);
    if (!existing) throw new NotFoundError("Jadwal kajian tidak ditemukan.");
    assertCanManageLocation(auth, existing.locationId);

    return KajianRepo.delete(id);
  },
};
