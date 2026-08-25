"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateKajianMutation,
  useDeleteKajianMutation,
  useMyKajianListQuery,
  useUpdateKajianMutation,
} from "@/hooks/queries/useKajian";
import { KajianForm } from "@/components/admin/KajianForm";
import type { Kajian } from "@/types";
import type { KajianFormValues } from "@/lib/validations/kajian";
import { ApiError } from "@/lib/api-client";
import { scheduleWithTimeLabel } from "@/lib/date-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminJadwalPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Route guard: TanStack Query has no opinion on auth, so this is plain
  // client-side redirect logic sitting next to it, same as any other app.
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.role === "super_admin") {
      router.replace("/super-admin");
    }
  }, [isAuthenticated, user, router]);

  const assignedLocations = useMemo(() => user?.assignedLocations ?? [], [user]);
  const locationIds = useMemo(() => assignedLocations.map((l) => l.id), [assignedLocations]);

  const { data: myKajian, isLoading, isError } = useMyKajianListQuery(locationIds);

  const createMutation = useCreateKajianMutation();
  const updateMutation = useUpdateKajianMutation();
  const deleteMutation = useDeleteKajianMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKajian, setEditingKajian] = useState<Kajian | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreateDialog() {
    setEditingKajian(null);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEditDialog(kajian: Kajian) {
    setEditingKajian(kajian);
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal kajian ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal menghapus jadwal.");
    }
  }

  async function toggleActive(kajian: Kajian) {
    try {
      await updateMutation.mutateAsync({
        id: kajian.id,
        values: { isActive: !kajian.isActive },
      });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal memperbarui status.");
    }
  }

  async function handleSubmit(values: KajianFormValues) {
    setFormError(null);
    try {
      if (editingKajian) {
        await updateMutation.mutateAsync({ id: editingKajian.id, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal menyimpan jadwal.");
    }
  }

  if (!isAuthenticated || user?.role === "super_admin") {
    return null; // redirect effect above handles navigation
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Jadwal Kajian Saya</h1>
          <p className="text-sm text-muted-foreground">
            Kelola jadwal kajian untuk{" "}
            {assignedLocations.map((l) => l.name).join(", ") || "masjid Anda"}.
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={assignedLocations.length === 0}>
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadwal</CardTitle>
          <CardDescription>
            {isLoading
              ? "Memuat…"
              : `${myKajian.length} jadwal terdaftar di lokasi yang Anda kelola.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Memuat jadwal…</span>
            </div>
          )}

          {isError && !isLoading && (
            <p className="py-8 text-center text-sm text-destructive">
              Gagal memuat jadwal. Periksa koneksi lalu muat ulang halaman.
            </p>
          )}

          {!isLoading && !isError && myKajian.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada jadwal kajian. Klik &ldquo;Tambah Jadwal&rdquo; untuk membuat yang pertama.
            </p>
          )}

          {!isLoading && myKajian.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Ustadz</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myKajian.map(({ kajian }) => (
                  <TableRow key={kajian.id}>
                    <TableCell className="max-w-[220px]">
                      <p className="truncate font-medium">{kajian.title}</p>
                      <Badge variant="sage" className="mt-1">
                        {kajian.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {kajian.ustadz}
                    </TableCell>
                    <TableCell className="text-sm">{scheduleWithTimeLabel(kajian)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={kajian.isActive}
                          onCheckedChange={() => toggleActive(kajian)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {kajian.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(kajian)}
                          aria-label="Edit jadwal"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(kajian.id)}
                          aria-label="Hapus jadwal"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto scroll-slim sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingKajian ? "Edit Jadwal Kajian" : "Tambah Jadwal Kajian"}
            </DialogTitle>
            <DialogDescription>
              Jadwal akan langsung tampil di peta publik setelah disimpan.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <p className="text-sm font-medium text-destructive">{formError}</p>
          )}
          <KajianForm
            locations={assignedLocations}
            lockedLocationId={
              assignedLocations.length === 1 ? assignedLocations[0].id : undefined
            }
            defaultValues={
              editingKajian
                ? {
                    ...editingKajian,
                    contactPhone: editingKajian.contactPhone ?? "",
                    posterUrl: editingKajian.posterUrl ?? "",
                  }
                : undefined
            }
            submitLabel={editingKajian ? "Simpan Perubahan" : "Tambah Jadwal"}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
