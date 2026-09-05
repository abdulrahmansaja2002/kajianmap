"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, KeyRound, Loader2, X } from "lucide-react";
import {
  createUserFormSchema,
  updateUserFormSchema,
  type UserFormValues,
} from "@/lib/validations/user";
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
import { useState } from "react";

interface UserFormProps {
  locations: Location[];
  defaultValues?: Partial<UserFormValues>;
  /** When true, password is optional (leave blank to keep the current hash). */
  isEdit?: boolean;
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
  isEdit = false,
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateUserFormSchema : createUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      assignedLocationIds: [],
      isActive: true,
      ...defaultValues,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const generatePassword = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  const handleGeneratePassword = () => {
    const password = generatePassword();
    form.setValue("password", password);
  };


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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>            
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input type={showPassword ? "text" : "password"} placeholder={isEdit ? "********" : "Password Baru"} {...field} />
                    <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => field.onChange("")} disabled={isEdit}>
                      <X className="h-4 w-4" /> Hapus Password
                    </Button>
                    <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                      <KeyRound className="h-4 w-4" /> Generate Password
                    </Button>
                  </div>
                </div>
              </FormControl>
              {isEdit && (
                <FormDescription>
                  Jika tidak ingin mengubah password, biarkan kosong.
                </FormDescription>
              )}
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
