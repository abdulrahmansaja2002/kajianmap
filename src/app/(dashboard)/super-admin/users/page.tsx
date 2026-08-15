"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { mockLocations, mockUsers as initialUsers } from "@/lib/mock-data";
import type { User } from "@/types";
import type { UserFormValues } from "@/lib/validations/user";
import { UserForm } from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>(
    initialUsers.filter((u) => u.role === "admin_masjid")
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(user: User) {
    setEditing(user);
    setDialogOpen(true);
  }
  function handleDelete(id: string) {
    if (!confirm("Hapus akun admin ini? Akses masjid yang ditugaskan akan dicabut.")) return;
    setUsers((list) => list.filter((u) => u.id !== id));
  }

  function handleSubmit(values: UserFormValues) {
    if (editing) {
      setUsers((list) =>
        list.map((u) => (u.id === editing.id ? { ...u, ...values } : u))
      );
    } else {
      const newUser: User = {
        id: `admin-${Date.now()}`,
        role: "admin_masjid",
        createdAt: new Date().toISOString(),
        ...values,
      };
      setUsers((list) => [newUser, ...list]);
    }
    setDialogOpen(false);
  }

  function locationNames(ids: string[]) {
    return ids
      .map((id) => mockLocations.find((l) => l.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Manajemen Admin Masjid</h1>
          <p className="text-sm text-muted-foreground">
            Buat akun admin dan tugaskan ke satu atau beberapa masjid.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Admin Masjid</CardTitle>
          <CardDescription>{users.length} akun terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Masjid Ditugaskan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                    {locationNames(user.assignedLocationIds) || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "muted"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(user.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto scroll-slim sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Admin" : "Tambah Admin Masjid"}</DialogTitle>
            <DialogDescription>
              Admin hanya dapat mengelola jadwal pada masjid yang ditugaskan di sini.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            locations={mockLocations}
            defaultValues={editing ?? undefined}
            submitLabel={editing ? "Simpan Perubahan" : "Tambah Admin"}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
