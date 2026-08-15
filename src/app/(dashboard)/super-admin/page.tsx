"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, MapPinned, ShieldCheck, Users } from "lucide-react";
import { mockKajian, mockLocations, mockUsers } from "@/lib/mock-data";
import { occursToday, scheduleWithTimeLabel } from "@/lib/date-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STAT_CARDS = [
  { key: "locations", label: "Lokasi Terdaftar", icon: MapPinned },
  { key: "kajian", label: "Jadwal Kajian Aktif", icon: CalendarCheck2 },
  { key: "today", label: "Kajian Hari Ini", icon: ShieldCheck },
  { key: "admins", label: "Admin Masjid", icon: Users },
] as const;

export default function SuperAdminOverviewPage() {
  const [locationFilter, setLocationFilter] = useState<string>("semua");

  const activeKajian = useMemo(() => mockKajian.filter((k) => k.isActive), []);
  const todayCount = useMemo(
    () => activeKajian.filter((k) => occursToday(k)).length,
    [activeKajian]
  );
  const admins = useMemo(
    () => mockUsers.filter((u) => u.role === "admin_masjid"),
    []
  );

  const stats: Record<(typeof STAT_CARDS)[number]["key"], number> = {
    locations: mockLocations.length,
    kajian: activeKajian.length,
    today: todayCount,
    admins: admins.length,
  };

  const filteredKajian =
    locationFilter === "semua"
      ? activeKajian
      : activeKajian.filter((k) => k.locationId === locationFilter);

  function locationName(id: string) {
    return mockLocations.find((l) => l.id === id)?.name ?? "—";
  }
  function adminName(id: string) {
    return mockUsers.find((u) => u.id === id)?.name ?? "—";
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Overview & Audit</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan seluruh jadwal kajian aktif di semua lokasi yang terdaftar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-xl font-bold leading-none">{stats[key]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Semua Jadwal Aktif</CardTitle>
            <CardDescription>Diurutkan berdasarkan lokasi masjid.</CardDescription>
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua lokasi</SelectItem>
              {mockLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Dikelola oleh</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKajian.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {k.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {locationName(k.locationId)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {adminName(k.createdBy)}
                  </TableCell>
                  <TableCell className="text-sm">{scheduleWithTimeLabel(k)}</TableCell>
                  <TableCell>
                    {occursToday(k) ? (
                      <Badge variant="today">Hari ini</Badge>
                    ) : (
                      <Badge variant="muted">Terjadwal</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
