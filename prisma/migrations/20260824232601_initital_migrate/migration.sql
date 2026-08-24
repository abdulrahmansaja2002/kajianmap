-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'admin_masjid');

-- CreateEnum
CREATE TYPE "KajianFrequency" AS ENUM ('rutin', 'insidental');

-- CreateEnum
CREATE TYPE "KajianDayOfWeek" AS ENUM ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'admin_masjid',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kajian" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ustadz" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" "KajianFrequency" NOT NULL,
    "dayOfWeek" "KajianDayOfWeek",
    "date" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "posterUrl" TEXT,
    "contactPerson" TEXT NOT NULL,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kajian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LocationAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "kajian_locationId_idx" ON "kajian"("locationId");

-- CreateIndex
CREATE INDEX "kajian_date_idx" ON "kajian"("date");

-- CreateIndex
CREATE INDEX "kajian_category_idx" ON "kajian"("category");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationAdmins_AB_unique" ON "_LocationAdmins"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationAdmins_B_index" ON "_LocationAdmins"("B");

-- AddForeignKey
ALTER TABLE "kajian" ADD CONSTRAINT "kajian_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kajian" ADD CONSTRAINT "kajian_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationAdmins" ADD CONSTRAINT "_LocationAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationAdmins" ADD CONSTRAINT "_LocationAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
