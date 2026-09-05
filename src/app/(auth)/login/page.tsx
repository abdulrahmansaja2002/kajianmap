"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LandPlot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Masukkan email yang valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

/**
 * MVP mock authentication: routes by email pattern instead of a real
 * session lookup. Swap for a real auth provider before launch.
 */
export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    if (values.email.includes("superadmin")) {
      router.push("/super-admin/locations");
    } else if (values.email.includes("admin")) {
      router.push("/admin/jadwal");
    } else {
      setFormError("Akun tidak ditemukan. Gunakan salah satu akun contoh di bawah.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LandPlot className="h-5 w-5" />
          </span>
          <CardTitle className="font-display text-xl">Masuk ke KajianMap</CardTitle>
          <CardDescription>Khusus Admin Masjid & Super Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin.masjidraya@kajianmap.id" {...field} />
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
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError && (
                <p className="text-xs font-medium text-destructive">{formError}</p>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-1">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Masuk
              </Button>
            </form>
          </Form>

          <div className="mt-5 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Akun contoh (mock):</p>
            <p>admin.masjidraya@kajianmap.id — Admin Masjid</p>
            <p>superadmin@kajianmap.id — Super Admin</p>
            <p className="mt-1">Kata sandi bebas, min. 6 karakter.</p>
          </div>

          <Link
            href="/"
            className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            ← Kembali ke peta publik
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
