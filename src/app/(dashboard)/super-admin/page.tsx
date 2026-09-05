"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, Loader2, MapPinned, ShieldCheck, Users } from "lucide-react";
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
import { useKajianListQuery } from "@/hooks/queries/useKajian";
import { useLocationListQuery } from "@/hooks/queries/useLocation";
import { useUserListQuery } from "@/hooks/queries/useUser";

const STAT_CARDS = [
  { key: "locations", label: "Lokasi Terdaftar", icon: MapPinned },
  { key: "kajian", label: "Jadwal Kajian Aktif", icon: CalendarCheck2 },
  { key: "today", label: "Kajian Hari Ini", icon: ShieldCheck },
  { key: "admins", label: "Admin Masjid", icon: Users },
] as const;

export default function SuperAdminOverviewPage() {
  const [locationFilter, setLocationFilter] = useState<string>("semua");
  const { data: activeKajianWithLocation, isLoading: isLoadingKajian } = useKajianListQuery({isActive: true})
  const { data: locations, isLoading: isLoadingLocations } = useLocationListQuery()
  const { data: admins, isLoading: isLoadingAdmins } = useUserListQuery({role: "admin_masjid"})

  const statsLoadingMap = {
    locations: isLoadingLocations,
    kajian: isLoadingKajian,
    today: isLoadingKajian,
    admins: isLoadingAdmins,
  } as const;

  const isLoading = isLoadingLocations || isLoadingKajian || isLoadingAdmins;

  const activeKajian = useMemo(
    () => activeKajianWithLocation?.map((k) => k.kajian),
    [activeKajianWithLocation]
  );
  const todayCount = useMemo(
    () => activeKajianWithLocation?.filter((k) => occursToday(k.kajian)).length,
    [activeKajianWithLocation]
  );

  const stats: Record<(typeof STAT_CARDS)[number]["key"], number> = {
    locations: locations?.length ?? 0,
    kajian: activeKajian?.length ?? 0,
    today: todayCount ?? 0,
    admins: admins?.length ?? 0,
  };

  const filteredKajian =
    locationFilter === "semua"
      ? activeKajianWithLocation
      : activeKajianWithLocation?.filter((k) => k.location.id === locationFilter);

  function locationName(id: string) {
    return locations?.find((l) => l.id === id)?.name ?? "—";
  }
  function adminName(id: string) {
    return admins?.find((u) => u.id === id)?.name ?? "—";
  }

  return (
    //  1: Padding pembungkus disesuaikan untuk HP (p-4) dan Desktop (sm:p-6)
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Overview & Audit</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan seluruh jadwal kajian aktif di semua lokasi yang terdaftar.
        </p>
      </div>

      {/*  2: grid-cols-1 di HP (agar lega), sm:grid-cols-2 di Tablet, lg:grid-cols-4 di Desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-xl font-bold leading-none">{
                statsLoadingMap[key] ? <Loader2 className="h-4 w-4 animate-spin" /> : stats[key]
                }</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      ) : (
        // 3: overflow-hidden ditambahkan agar tabel tidak keluar batas Card
        <Card className="overflow-hidden">
          
          {/*  4: flex-col di HP (atas-bawah), md:flex-row di Desktop (kiri-kanan) */}
          <CardHeader className="flex flex-col items-start gap-4 space-y-0 md:flex-row md:items-center md:justify-between p-4 sm:p-6">
            <div>
              <CardTitle>Semua Jadwal Aktif</CardTitle>
              <CardDescription className="mt-1">Diurutkan berdasarkan lokasi masjid.</CardDescription>
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              {/*  5: SelectTrigger lebar penuh (w-full) di HP, lebar fix (w-48) di Desktop */}
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua lokasi</SelectItem>
                {locations?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          
          {/*  6: Tambahkan overflow-x-auto agar tabel bisa di-scroll horizontal (digeser) di HP */}
          <CardContent className="p-0 sm:p-6 sm:pt-0 overflow-x-auto">
            {/*  7: Beri min-width (700px) pada Table agar kolom/teks tidak saling tergencet */}
            <Table className="min-w-[700px] sm:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-2">Judul</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Dikelola oleh</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead className="pr-4 sm:pr-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKajian?.map((k) => (
                  <TableRow key={k.kajian.id}>
                    <TableCell className="max-w-[200px] truncate font-medium pl-4 sm:pl-2">
                      {k.kajian.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {locationName(k.location.id)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {adminName(k.kajian.createdBy)}
                    </TableCell>
                    <TableCell className="text-sm">{scheduleWithTimeLabel(k.kajian)}</TableCell>
                    <TableCell className="pr-4 sm:pr-2">
                      {occursToday(k.kajian) ? (
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
      )}

    </div>
  );
}