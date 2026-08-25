import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Same demo password for every seeded account — change immediately in
 *  any environment beyond local development. */
const DEMO_PASSWORD = "password123";

function inDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [masjidRaya, salman, ukhuwwah, pusdai, daarutTauhiid, habiburrahman] =
    await Promise.all([
      prisma.location.upsert({
        where: { id: "loc-1" },
        update: {},
        create: {
          id: "loc-1",
          name: "Masjid Raya Bandung",
          address: "Jl. Dalem Kaum No.14, Balonggede, Regol",
          city: "Bandung",
          province: "Jawa Barat",
          lat: -6.9218,
          lng: 107.607,
          contactPhone: "022-4234892",
        },
      }),
      prisma.location.upsert({
        where: { id: "loc-2" },
        update: {},
        create: {
          id: "loc-2",
          name: "Masjid Salman ITB",
          address: "Jl. Ganesa No.7, Lb. Siliwangi, Coblong",
          city: "Bandung",
          province: "Jawa Barat",
          lat: -6.8915,
          lng: 107.6107,
          contactPhone: "022-2504033",
        },
      }),
      prisma.location.upsert({
        where: { id: "loc-3" },
        update: {},
        create: {
          id: "loc-3",
          name: "Masjid Al-Ukhuwwah",
          address: "Jl. Wastukancana No.34, Babakan Ciamis, Sumur Bandung",
          city: "Bandung",
          province: "Jawa Barat",
          lat: -6.9034,
          lng: 107.6186,
        },
      }),
      prisma.location.upsert({
        where: { id: "loc-4" },
        update: {},
        create: {
          id: "loc-4",
          name: "Masjid Pusdai Jawa Barat",
          address: "Jl. Diponegoro No.63, Citarum, Bandung Wetan",
          city: "Bandung",
          province: "Jawa Barat",
          lat: -6.8998,
          lng: 107.6247,
          contactPhone: "022-7207736",
        },
      }),
      prisma.location.upsert({
        where: { id: "loc-5" },
        update: {},
        create: {
          id: "loc-5",
          name: "Masjid Daarut Tauhiid",
          address: "Jl. Gegerkalong Girang No.38, Isola, Sukasari",
          city: "Bandung",
          province: "Jawa Barat",
          lat: -6.8657,
          lng: 107.5896,
        },
      }),
      prisma.location.upsert({
        where: { id: "loc-6" },
        update: {},
        create: {
          id: "loc-6",
          name: "Masjid Habiburrahman PT DI",
          address: "Jl. Pajajaran No.154, Husein Sastranegara, Cicendo",
          city: "Bandung",
          province: "Jawa Barat",
          lat: -6.9024,
          lng: 107.5776,
        },
      }),
    ]);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@kajianmap.id" },
    update: {},
    create: {
      email: "superadmin@kajianmap.id",
      password,
      name: "Admin Pusat",
      role: "super_admin",
    },
  });

  const adminMasjidRaya = await prisma.user.upsert({
    where: { email: "admin.masjidraya@kajianmap.id" },
    update: {},
    create: {
      email: "admin.masjidraya@kajianmap.id",
      password,
      name: "Ridho Prasetya",
      role: "admin_masjid",
      assignedLocations: { connect: [{ id: masjidRaya.id }] },
    },
  });

  // Demonstrates the multi-location assignment the schema now supports —
  // one admin managing two masjid at once.
  const adminMultiMasjid = await prisma.user.upsert({
    where: { email: "admin.dt@kajianmap.id" },
    update: {},
    create: {
      email: "admin.dt@kajianmap.id",
      password,
      name: "Bagas Wirawan",
      role: "admin_masjid",
      assignedLocations: {
        connect: [{ id: daarutTauhiid.id }, { id: habiburrahman.id }],
      },
    },
  });

  const kajianSeeds = [
    {
      locationId: masjidRaya.id,
      createdById: adminMasjidRaya.id,
      title: "Kajian Tafsir Al-Qur'an Ba'da Subuh",
      ustadz: "Ustadz Fauzan Ridwan, Lc.",
      category: "Tafsir Al-Qur'an",
      frequency: "rutin" as const,
      dayOfWeek: "minggu" as const,
      startTime: "05:15",
      endTime: "06:30",
      description:
        "Kajian rutin pekanan membahas tafsir Al-Qur'an juz demi juz, terbuka untuk umum.",
      contactPerson: "Sekretariat Masjid Raya Bandung",
      contactPhone: "022-4234892",
    },
    {
      locationId: masjidRaya.id,
      createdById: adminMasjidRaya.id,
      title: "Kajian Fiqih Kontemporer",
      ustadz: "Ustadz Hilman Taufiq, M.Ag.",
      category: "Fiqih",
      frequency: "rutin" as const,
      dayOfWeek: "rabu" as const,
      startTime: "19:45",
      endTime: "21:00",
      description:
        "Membahas persoalan fiqih yang relevan dengan kehidupan sehari-hari dan isu kontemporer.",
      contactPerson: "Sekretariat Masjid Raya Bandung",
    },
    {
      locationId: daarutTauhiid.id,
      createdById: adminMultiMasjid.id,
      title: "Kajian Remaja: Muda Berkarya, Taat Beragama",
      ustadz: "Ustadz Rizky Maulana, S.Sos.",
      category: "Kajian Remaja",
      frequency: "rutin" as const,
      dayOfWeek: "jumat" as const,
      startTime: "20:00",
      endTime: "21:30",
      description: "Ruang diskusi santai untuk remaja seputar agama dan pengembangan diri.",
      contactPerson: "Bidang Kepemudaan DT",
    },
    {
      locationId: habiburrahman.id,
      createdById: adminMultiMasjid.id,
      title: "Kajian Muamalah & Ekonomi Syariah",
      ustadz: "Ustadz Zaki Abror, Lc., M.A.",
      category: "Muamalah",
      frequency: "insidental" as const,
      date: inDays(9),
      startTime: "13:00",
      endTime: "15:00",
      description: "Membahas praktik jual-beli, riba, dan akad syariah untuk karyawan dan pelaku usaha.",
      contactPerson: "Takmir Masjid Habiburrahman",
    },
  ];

  for (const kajian of kajianSeeds) {
    const existing = await prisma.kajian.findFirst({
      where: { title: kajian.title, locationId: kajian.locationId },
    });
    if (!existing) {
      await prisma.kajian.create({ data: kajian });
    }
  }

  console.log("Seed selesai.");
  console.log(`  Locations : ${[masjidRaya, salman, ukhuwwah, pusdai, daarutTauhiid, habiburrahman].length}`);
  console.log(`  Users     : ${superAdmin.email}, ${adminMasjidRaya.email}, ${adminMultiMasjid.email}`);
  console.log(`  Password  : ${DEMO_PASSWORD} (semua akun demo)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
