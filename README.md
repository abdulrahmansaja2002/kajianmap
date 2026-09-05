# KajianMap — MVP

Platform peta interaktif untuk menemukan jadwal kajian Islami secara real-time. Dibangun dengan Next.js 14 (App Router) + TypeScript, Tailwind CSS, komponen bergaya Shadcn UI, dan React-Leaflet.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

```bash
npm run build   # build produksi + type-check
npm run start   # jalankan hasil build
npm run lint    # ESLint
```

## Peta Rute

| Rute | Deskripsi |
|---|---|
| `/` | Peta publik (Map + List + Filter). Tidak perlu login. |
| `/kajian/[id]` | Halaman detail satu kajian yang bisa dibagikan. |
| `/login` | Login mock untuk Admin Masjid & Super Admin. |
| `/admin/jadwal` | Dashboard Admin Masjid — CRUD jadwal kajian miliknya. |
| `/super-admin` | Overview/audit seluruh jadwal aktif. |
| `/super-admin/locations` | CRUD titik lokasi masjid. |
| `/super-admin/users` | CRUD akun Admin Masjid + penugasan lokasi. |

**Login demo (mock, password bebas ≥ 6 karakter):**
- `admin.masjidraya@kajianmap.id` → Admin Masjid
- `superadmin@kajianmap.id` → Super Admin

## Status Data: Mock, Belum Terhubung Backend

Semua data (`src/lib/mock-data.ts`) masih statis di sisi klien — cocok untuk mendemokan alur UI, RBAC, dan validasi form, tapi **CRUD di dashboard admin/super-admin hanya mengubah state React di memori** (hilang saat refresh). Sebelum produksi, sambungkan ke database asli (mis. Postgres + Prisma) melalui `app/api/` atau server actions, dan pindahkan `mockUsers`/auth ke sistem otentikasi sungguhan (NextAuth, Clerk, dll) — jangan gunakan pola login berbasis pola email di `/login` untuk produksi.

## Struktur Folder

```
src/
├── app/
│   ├── (public)/            # Peta publik + detail kajian (tanpa login)
│   ├── (auth)/login/        # Login
│   ├── (dashboard)/         # Rute terproteksi (belum ada middleware auth asli)
│   │   ├── admin/jadwal/
│   │   └── super-admin/
│   └── globals.css
├── components/
│   ├── ui/                  # Primitif ala Shadcn (Button, Dialog, Drawer, dst.)
│   ├── map/                 # MapView (dynamic import) + LeafletMap
│   ├── kajian/               # KajianCard, KajianList, KajianFilterBar, KajianDetailDrawer
│   ├── admin/                # KajianForm, LocationForm, UserForm
│   └── layout/               # Navbar, MobileViewToggle
├── lib/
│   ├── leaflet.ts            # Custom marker icon (mosque glyph + "hari ini" pulse)
│   ├── date-helpers.ts       # Logika hari/tanggal untuk kajian rutin vs insidental
│   ├── kajian-utils.ts       # Filtering & grouping lokasi+kajian
│   ├── mock-data.ts          # Data contoh (masjid-masjid di Bandung)
│   └── validations/          # Skema Zod (kajian, location, user)
├── hooks/                    # useGeolocation, useKajianFilter
└── types/index.ts            # Semua tipe domain (Location, Kajian, User, dst.)
```

## Yang Sudah Diimplementasikan

- Peta interaktif (React-Leaflet, dynamic import `ssr:false`) dengan marker kustom — hijau berkedip untuk kajian **hari ini**, warna lebih redup untuk yang **mendatang**.
- Toggle Peta ⇄ Daftar di mobile; layout split sidebar+peta di desktop.
- Filter: Semua/Hari ini/Tanggal tertentu, Pemateri, Kategori, pencarian bebas.
- Bottom sheet (Shadcn Drawer via `vaul`) saat marker/kartu diklik, berisi seluruh jadwal di lokasi tsb + tombol navigasi Google Maps.
- Auto-center ke lokasi user via Geolocation API (dengan fallback yang sopan jika ditolak).
- Form Tambah/Edit Jadwal Kajian (React Hook Form + Zod), termasuk validasi kondisional rutin/insidental dan validasi waktu selesai > waktu mulai.
- Dashboard Admin Masjid (CRUD miliknya saja) dan Super Admin (kelola lokasi, kelola admin + assignment, overview seluruh jadwal aktif) — RBAC disimulasikan lewat `assignedLocationIds`.

## Langkah Lanjutan yang Disarankan

1. Ganti mock auth di `/login` dengan session asli + middleware yang membatasi `/admin/*` dan `/super-admin/*` sesuai role.
2. Pindahkan `mock-data.ts` ke database + API routes (`app/api/kajian`, `app/api/locations`, dst).
3. Tambahkan pagination/infinite-scroll di `KajianList` bila jumlah masjid besar, dan marker clustering (`react-leaflet-cluster`) bila titik makin padat.
4. Tambahkan upload gambar (poster) alih-alih input URL manual.
