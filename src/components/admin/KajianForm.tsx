"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  kajianFormDefaults,
  kajianFormSchema,
  type KajianFormValues,
} from "@/lib/validations/kajian";
import { DAY_OF_WEEK_OPTIONS, KAJIAN_CATEGORY_OPTIONS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface KajianFormProps {
  /** Locations the current admin is allowed to assign this kajian to. A
   *  super_admin sees every masjid; an admin_masjid only sees theirs. Only
   *  `id`/`name` are needed to render the select, so this stays decoupled
   *  from the full `Location` type. */
  locations: { id: string; name: string }[];
  /** Pre-fills the form for editing; omit for "tambah baru". */
  defaultValues?: Partial<KajianFormValues>;
  /** Locks the location select to a single masjid — used when an
   *  admin_masjid is only assigned to one location. */
  lockedLocationId?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: KajianFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

export function KajianForm({
  locations,
  defaultValues,
  lockedLocationId,
  submitLabel = "Simpan Jadwal",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: KajianFormProps) {
  const form = useForm<KajianFormValues>({
    resolver: zodResolver(kajianFormSchema),
    defaultValues: {
      ...kajianFormDefaults,
      locationId: lockedLocationId ?? "",
      title: "",
      ustadz: "",
      description: "",
      contactPerson: "",
      contactPhone: "",
      posterUrl: "",
      ...defaultValues,
    },
  });

  // Keep the locked location in sync if the prop changes (e.g. after the
  // admin's assignment loads asynchronously).
  useEffect(() => {
    if (lockedLocationId) {
      form.setValue("locationId", lockedLocationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedLocationId]);

  const frequency = form.watch("frequency");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi / Masjid</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!lockedLocationId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih masjid yang ditugaskan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lockedLocationId && (
                <FormDescription>
                  Anda hanya dapat menambahkan jadwal untuk masjid yang ditugaskan.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Kajian</FormLabel>
              <FormControl>
                <Input placeholder="cth. Kajian Tafsir Al-Qur'an Ba'da Subuh" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ustadz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Ustadz / Pemateri</FormLabel>
                <FormControl>
                  <Input placeholder="cth. Ustadz Fauzan Ridwan, Lc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori / Topik</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {KAJIAN_CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Jadwal</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      field.value === "rutin"
                        ? "border-primary bg-primary-50"
                        : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="rutin" />
                    Rutin (mingguan)
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      field.value === "insidental"
                        ? "border-primary bg-primary-50"
                        : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="insidental" />
                    Insidental (sekali)
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {frequency === "rutin" ? (
          <FormField
            control={form.control}
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hari</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hari" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DAY_OF_WEEK_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Mulai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Selesai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Jelaskan singkat isi kajian, siapa yang boleh hadir, dan hal penting lainnya."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length ?? 0}/1000 karakter
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kontak Person</FormLabel>
                <FormControl>
                  <Input placeholder="cth. Sekretariat Masjid" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon (opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="022-xxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="posterUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Poster / Gambar (opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormDescription>
                Tempel tautan gambar poster kajian jika tersedia.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-3.5">
              <div className="space-y-0.5">
                <FormLabel>Jadwal Aktif</FormLabel>
                <FormDescription>
                  Nonaktifkan untuk menyembunyikan jadwal dari peta tanpa menghapusnya.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
