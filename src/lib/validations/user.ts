import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Masukkan email yang valid"),
  assignedLocationIds: z
    .array(z.string())
    .min(1, "Pilih minimal satu masjid untuk ditugaskan"),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
