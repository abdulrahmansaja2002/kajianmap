"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { userFormSchema, type UserFormValues } from "@/lib/validations/user";
import type { Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface UserFormProps {
  locations: Location[];
  defaultValues?: Partial<UserFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

export function UserForm({
  locations,
  defaultValues,
  submitLabel = "Simpan Admin",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      assignedLocationIds: [],
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Admin</FormLabel>
              <FormControl>
                <Input placeholder="cth. Ridho Prasetya" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin.masjid@kajianmap.id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedLocationIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Masjid yang Ditugaskan</FormLabel>
              <FormDescription>
                Admin ini hanya dapat mengelola jadwal kajian pada masjid yang dicentang.
              </FormDescription>
              <div className="scroll-slim flex max-h-44 flex-col gap-1 overflow-y-auto rounded-lg border border-input p-2">
                {locations.map((loc) => {
                  const checked = field.value?.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const current = field.value ?? [];
                          field.onChange(
                            v
                              ? [...current, loc.id]
                              : current.filter((id) => id !== loc.id)
                          );
                        }}
                      />
                      {loc.name}
                    </label>
                  );
                })}
              </div>
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
                <FormLabel>Akun Aktif</FormLabel>
                <FormDescription>
                  Nonaktifkan untuk mencabut akses admin tanpa menghapus akunnya.
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
