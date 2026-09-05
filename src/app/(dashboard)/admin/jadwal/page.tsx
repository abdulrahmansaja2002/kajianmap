"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { KajianForm } from "@/components/admin/KajianForm";
import { mockKajian, mockLocations, mockUsers } from "@/lib/mock-data";
import type { Kajian } from "@/types";
import type { KajianFormValues } from "@/lib/validations/kajian";
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

/** MVP stand-in for a real auth session. In production this comes from
 *  the logged-in user's JWT/session, scoped server-side. */
const CURRENT_ADMIN = mockUsers.find((u) => u.id === "admin-1")!;

export default function AdminJadwalPage() {
  const assignedLocations = useMemo(
    () =>
      mockLocations.filter((loc) =>
        CURRENT_ADMIN.assignedLocationIds.includes(loc.id)
      ),
    []
  );

  const [kajianList, setKajianList] = useState<Kajian[]>(() =>
    mockKajian.filter((k) => CURRENT_ADMIN.assignedLocationIds.includes(k.locationId))
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKajian, setEditingKajian] = useState<Kajian | null>(null);

  function openCreateDialog() {
    setEditingKajian(null);
    setDialogOpen(true);
  }

  function openEditDialog(kajian: Kajian) {
    setEditingKajian(kajian);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus jadwal kajian ini? Tindakan tidak dapat dibatalkan.")) return;
    setKajianList((list) => list.filter((k) => k.id !== id));
  }

  function toggleActive(id: string) {
    setKajianList((list) =>
      list.map((k) => (k.id === id ? { ...k, isActive: !k.isActive } : k))
    );
  }

  function handleSubmit(values: KajianFormValues) {
    const now = new Date().toISOString();

    if (editingKajian) {
      setKajianList((list) =>
        list.map((k) =>
          k.id === editingKajian.id
            ? {
                ...k,
                ...values,
                category: values.category as Kajian["category"],
                contactPhone: values.contactPhone || undefined,
                posterUrl: values.posterUrl || undefined,
                updatedAt: now,
              }
            : k
        )
      );
    } else {
      const newKajian: Kajian = {
        id: `kj-${Date.now()}`,
        ...values,
        category: values.category as Kajian["category"],
        contactPhone: values.contactPhone || undefined,
        posterUrl: values.posterUrl || undefined,
        createdAt: now,
        updatedAt: now,
        createdBy: CURRENT_ADMIN.id,
      };
      setKajianList((list) => [newKajian, ...list]);
    }
    setDialogOpen(false);
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
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadwal</CardTitle>
          <CardDescription>
            {kajianList.length} jadwal terdaftar di lokasi yang Anda kelola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kajianList.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada jadwal kajian. Klik &ldquo;Tambah Jadwal&rdquo; untuk membuat yang pertama.
            </p>
          ) : (
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
                {kajianList.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="max-w-[220px]">
                      <p className="truncate font-medium">{k.title}</p>
                      <Badge variant="sage" className="mt-1">
                        {k.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {k.ustadz}
                    </TableCell>
                    <TableCell className="text-sm">{scheduleWithTimeLabel(k)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={k.isActive}
                          onCheckedChange={() => toggleActive(k.id)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {k.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(k)}
                          aria-label="Edit jadwal"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(k.id)}
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
          <KajianForm
            locations={assignedLocations}
            lockedLocationId={assignedLocations[0]?.id}
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
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
