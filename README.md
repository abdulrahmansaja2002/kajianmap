# KajianMap — MVP

Platform peta interaktif untuk menemukan jadwal kajian Islami secara real-time. Next.js 14 (App Router) + TypeScript, Tailwind CSS, komponen bergaya Shadcn UI, React-Leaflet di frontend; PostgreSQL + Prisma + Layered Architecture (Repository → Service → Handler) di backend; TanStack Query menjembatani keduanya.

## Menjalankan Secara Lokal

```bash
npm install              # otomatis menjalankan `prisma generate` lewat postinstall
cp .env.example .env      # isi DATABASE_URL & JWT_SECRET
npx prisma db push        # buat skema di database Postgres kamu
npm run db:seed           # isi data contoh + akun demo (lihat di bawah)
npm run dev
```

Buka `http://localhost:3000`.

```bash
npm run build     # build produksi + type-check
npm run start     # jalankan hasil build
npm run lint      # ESLint
npm run db:studio # buka Prisma Studio untuk lihat/edit data langsung
```

**Akun demo setelah `npm run db:seed`** (kata sandi: `password123`):
- `superadmin@kajianmap.id` — Super Admin
- `admin.masjidraya@kajianmap.id` — Admin Masjid (1 lokasi)
- `admin.dt@kajianmap.id` — Admin Masjid (2 lokasi, contoh multi-assignment)

## Peta Rute

| Rute | Deskripsi | Sumber data |
|---|---|---|
| `/` | Peta publik (Map + List + Filter) | **API** — `GET /api/kajian` |
| `/kajian/[id]` | Detail satu kajian, bisa dibagikan | **API** — `GET /api/kajian/:id` |
| `/login` | Login Admin Masjid & Super Admin | **API** — `POST /api/auth/login` |
| `/admin/jadwal` | Dashboard Admin Masjid — CRUD jadwal miliknya | **API** — `/api/kajian` (+ Bearer token) |
| `/super-admin` | Overview seluruh jadwal aktif | ⚠️ mock (belum ada API Location/User) |
| `/super-admin/locations` | CRUD lokasi masjid | ⚠️ mock |
| `/super-admin/users` | CRUD admin + assignment | ⚠️ mock |

## Integrasi Frontend ⇄ Backend (TanStack Query)

```
src/
├── lib/
│   ├── api-client.ts       # fetch wrapper generik: parse envelope {success,data}/{success:false,message,errors}
│   ├── api-mappers.ts      # Prisma null → frontend undefined, embed location/createdBy → bentuk yang UI pakai
│   ├── auth-store.ts       # store eksternal kecil (localStorage) utk token+user, dibaca lintas komponen
│   └── kajian-utils.ts     # + groupKajianRecordsByLocation (versi API dari getFilteredLocationsWithKajian)
├── hooks/
│   ├── useAuth.ts                    # useSyncExternalStore di atas auth-store.ts
│   └── queries/
│       ├── useKajian.ts              # useKajianListQuery, useKajianDetailQuery, useMyKajianListQuery,
│       │                             #   useCreateKajianMutation, useUpdateKajianMutation, useDeleteKajianMutation
│       └── useAuthMutations.ts       # useLoginMutation
└── components/providers/
    └── query-provider.tsx  # <QueryClientProvider> + devtools, dipasang di app/layout.tsx
```

Pola yang dipakai di setiap hook:
1. **Query key factory** (`kajianKeys`) — semua key dibangun lewat satu tempat supaya `invalidateQueries` tidak pernah salah target.
2. **Baca publik, tulis terproteksi** — `useKajianListQuery`/`useKajianDetailQuery` tidak butuh token (route-nya memang publik); mutation hooks memanggil `useAuth()` sendiri untuk mengambil token, jadi komponen pemanggil tidak perlu passing token manual.
3. **Filter server vs client** — hanya `isActive` yang difilter di server; mode tanggal/ustadz/kategori/pencarian bebas tetap di klien (`groupKajianRecordsByLocation`) supaya mengetik di search box tidak memicu request tiap huruf.
4. **Multi-lokasi admin** — karena satu admin bisa punya beberapa masjid (`assignedLocations`), `useMyKajianListQuery` memakai `useQueries` untuk memanggil `/api/kajian?locationId=` sekali per lokasi lalu digabung, alih-alih menambah filter "IN" di backend.

## Status Data

- **Kajian**: sepenuhnya API-driven (`/`, `/kajian/[id]`, `/admin/jadwal`).
- **Auth**: `/api/auth/login` asli (bcrypt + JWT), token disimpan di `localStorage` lewat `useAuth()`. Untuk produksi, ganti ke httpOnly cookie — lihat catatan di `lib/auth-store.ts`.
- **Location & User (Super Admin)**: **masih mock** (`src/lib/mock-data.ts`), state di memori React, hilang saat refresh. Belum ada `location.repo/service/handler` atau `user.repo/service/handler` + route `/api/locations`, `/api/admin/users` — polanya tinggal disalin persis dari modul Kajian (`src/server/{repo,service,handler}/kajian.*.ts` + `src/hooks/queries/useKajian.ts`) begitu modul itu dibuat.

## Struktur Folder

```
src/
├── app/
│   ├── (public)/              # Peta publik + detail kajian (tanpa login)
│   ├── (auth)/login/          # Login
│   ├── (dashboard)/           # Rute terproteksi — layout.tsx redirect ke /login bila belum auth
│   │   ├── admin/jadwal/
│   │   └── super-admin/
│   └── api/                   # Route handlers (lihat bagian Backend di bawah)
├── components/
│   ├── ui/                    # Primitif ala Shadcn (Button, Dialog, Drawer, dst.)
│   ├── map/                   # MapView (dynamic import) + LeafletMap
│   ├── kajian/                 # KajianCard, KajianList, KajianFilterBar, KajianDetailDrawer
│   ├── admin/                  # KajianForm, LocationForm, UserForm
│   ├── layout/                 # Navbar (auth-aware), MobileViewToggle
│   └── providers/               # QueryProvider
├── lib/                        # api-client, api-mappers, auth-store, date-helpers, kajian-utils, validations/
├── hooks/                      # useAuth, useGeolocation, useKajianFilter, queries/
├── server/                     # Backend layered architecture (lihat di bawah)
└── types/index.ts              # Tipe domain bersama — frontend & backend Zod schema sama-sama mengacu ke sini

prisma/
├── schema.prisma               # User, Location, Kajian — field & enum 1:1 dgn src/types/index.ts
└── seed.ts                     # Data contoh + akun demo
```

### Backend (`src/server/`)

```
server/
├── db/client.ts                 # Prisma Client singleton (aman utk hot-reload dev)
├── helpers/
│   ├── password.ts              # bcrypt hash/compare
│   ├── jwt.ts                   # sign/verify JWT
│   ├── errors.ts                # UnauthorizedError/ForbiddenError/NotFoundError
│   └── api-response.ts          # Formatter respons + error→HTTP status mapping terpusat
├── middlewares/auth.middleware.ts  # requireAuth/requireRole, baca Bearer token
├── repo/       # kajian.repo.ts, user.repo.ts — murni query Prisma
├── service/    # kajian.service.ts (Zod + RBAC), auth.service.ts (login)
└── handler/    # kajian.handler.ts, auth.handler.ts — parse request, panggil service, format respons
```

RBAC intinya satu fungsi di `kajian.service.ts`: `admin_masjid` cuma boleh CRUD di `locationId` yang ada dalam `auth.locationIds` (array — karena satu admin bisa pegang beberapa masjid); `super_admin` bebas semua lokasi.

## Yang Sudah Diimplementasikan

- Peta interaktif dengan marker kustom — hijau berkedip untuk kajian **hari ini**, redup untuk **mendatang**.
- Toggle Peta ⇄ Daftar di mobile; split sidebar+peta di desktop.
- Filter: Semua/Hari ini/Tanggal tertentu, Pemateri, Kategori, pencarian bebas.
- Bottom sheet (Shadcn Drawer via `vaul`) saat marker/kartu diklik + tombol navigasi Google Maps.
- Auto-center ke lokasi user via Geolocation API.
- Form Tambah/Edit Jadwal Kajian (RHF + Zod) — validasi kondisional rutin/insidental sama persis di frontend & backend.
- Login asli (bcrypt + JWT), dashboard Admin Masjid CRUD via API sungguhan dengan RBAC per-lokasi, mendukung admin dengan banyak lokasi.

## Langkah Lanjutan yang Disarankan

1. Bangun `location.repo/service/handler` + `user.repo/service/handler` (pola sama persis dengan modul Kajian) supaya 3 halaman Super Admin lepas dari mock data.
2. Ganti token di `localStorage` dengan httpOnly cookie yang di-set oleh `/api/auth/login`.
3. Tambahkan `middleware.ts` Next.js untuk memvalidasi token di edge sebelum route `/admin/*`/`/super-admin/*` di-render, sebagai lapisan tambahan di luar redirect client-side yang sudah ada.
4. Marker clustering (`react-leaflet-cluster`) bila jumlah masjid makin padat; upload gambar poster alih-alih input URL manual.
