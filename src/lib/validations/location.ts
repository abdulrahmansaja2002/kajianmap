import { z } from "zod";

export const locationFormSchema = z.object({
  name: z.string().min(3, "Nama tempat minimal 3 karakter").max(100),
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
  contactPhone: z.string().optional().or(z.literal("")),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;
