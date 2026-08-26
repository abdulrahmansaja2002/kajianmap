import { z } from "zod";

/** Shared fields — mirrors `User` in `@/types` minus server-generated
 *  `id` / `role` / timestamps. `password` is never stored on `User`. */
export const userFieldsSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Masukkan email yang valid"),
  assignedLocationIds: z
    .array(z.string())
    .min(1, "Pilih minimal satu masjid untuk ditugaskan"),
  isActive: z.boolean(),
  password: z.string().optional(),
});

export const createUserFormSchema = userFieldsSchema.extend({
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export const updateUserFormSchema = userFieldsSchema.extend({
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .optional()
    .or(z.literal("")),
});

/** Alias used by `UserForm` create mode and the existing import sites. */
export const userFormSchema = createUserFormSchema;

export type UserFormValues = z.infer<typeof userFieldsSchema> & {
  password?: string;
};
