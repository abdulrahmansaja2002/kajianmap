"use client";

import { useState } from "react";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { mockLocations as initialLocations } from "@/lib/mock-data";
import type { Location } from "@/types";
import type { LocationFormValues } from "@/lib/validations/location";
import { LocationForm } from "@/components/admin/LocationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateLocationMutation, useDeleteLocationMutation, useLocationListQuery, useUpdateLocationMutation } from "@/hooks/queries/useLocation";

export default function SuperAdminLocationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const { data: locations, isFetching: isLoadingLocations } = useLocationListQuery();
  const { mutate: createLocation } = useCreateLocationMutation();
  const { mutate: updateLocation } = useUpdateLocationMutation();
  const { mutate: deleteLocation } = useDeleteLocationMutation();

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(loc: Location) {
    setEditing(loc);
    setDialogOpen(true);
  }
  function handleDelete(id: string) {
    if (!confirm("Hapus lokasi ini? Jadwal kajian yang terhubung juga perlu dipindahkan.")) return;
    deleteLocation(id);
  }

  function handleSubmit(values: LocationFormValues) {
    if (editing) {
      updateLocation({ id: editing.id, values: values });
    } else {
      createLocation(values);
    }
    setDialogOpen(false);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Manajemen Lokasi</h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan titik masjid baru sebelum menugaskannya ke seorang admin.
          </p>
        </div>
        <Button onClick={openCreate} disabled={isLoadingLocations}>
          <Plus className="h-4 w-4" />
          Tambah Lokasi
        </Button>
      </div>

      {isLoadingLocations ? (
        <Card>
          <CardHeader>
            <CardTitle>Semua Lokasi</CardTitle>
            <CardDescription>Memuat data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-full gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Semua Lokasi</CardTitle>
            <CardDescription>{locations?.length} masjid terdaftar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Koordinat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations?.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                      <span className="flex items-start gap-1">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        {loc.address}, {loc.city}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(loc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(loc.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto scroll-slim sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Lokasi" : "Tambah Lokasi"}</DialogTitle>
            <DialogDescription>
              Titik lokasi ini akan muncul sebagai marker di peta publik.
            </DialogDescription>
          </DialogHeader>
          <LocationForm
            defaultValues={editing ?? undefined}
            submitLabel={editing ? "Simpan Perubahan" : "Tambah Lokasi"}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
