import { z } from "zod";
import { KAJIAN_CATEGORY_OPTIONS } from "@/types";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validation for the Tambah/Edit Jadwal Kajian form. `frequency` drives a
 * conditional requirement: "rutin" needs a dayOfWeek, "insidental" needs a
 * specific date — enforced with superRefine since Zod's discriminated
 * unions get awkward once react-hook-form is in the mix.
 */
export const kajianFormSchema = z
  .object({
    locationId: z.string().min(1, "Pilih lokasi/masjid terlebih dahulu"),
    title: z
      .string()
      .min(5, "Judul kajian minimal 5 karakter")
      .max(120, "Judul kajian maksimal 120 karakter"),
    ustadz: z
      .string()
      .min(3, "Nama pemateri minimal 3 karakter")
      .max(80, "Nama pemateri maksimal 80 karakter"),
    category: z.enum(
      KAJIAN_CATEGORY_OPTIONS as [string, ...string[]],
      { errorMap: () => ({ message: "Pilih kategori kajian" }) }
    ),
    frequency: z.enum(["rutin", "insidental"], {
      errorMap: () => ({ message: "Pilih jenis jadwal" }),
    }),
    dayOfWeek: z
      .enum(["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"])
      .optional(),
    date: z.string().optional(),
    startTime: z
      .string()
      .regex(timeRegex, "Format waktu tidak valid (HH:mm)"),
    endTime: z.string().regex(timeRegex, "Format waktu tidak valid (HH:mm)"),
    description: z
      .string()
      .min(20, "Deskripsi minimal 20 karakter agar jamaah paham konteksnya")
      .max(1000, "Deskripsi maksimal 1000 karakter"),
    contactPerson: z
      .string()
      .min(3, "Nama kontak person wajib diisi"),
    contactPhone: z
      .string()
      .regex(/^[0-9+\-\s]*$/, "Nomor telepon hanya boleh angka, +, dan -")
      .optional()
      .or(z.literal("")),
    posterUrl: z
      .string()
      .url("URL poster tidak valid")
      .optional()
      .or(z.literal("")),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
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
    if (
      timeRegex.test(data.startTime) &&
      timeRegex.test(data.endTime) &&
      data.endTime <= data.startTime
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Waktu selesai harus setelah waktu mulai",
      });
    }
  });

export type KajianFormValues = z.infer<typeof kajianFormSchema>;

export const kajianFormDefaults: Partial<KajianFormValues> = {
  frequency: "rutin",
  isActive: true,
  startTime: "19:30",
  endTime: "21:00",
};
