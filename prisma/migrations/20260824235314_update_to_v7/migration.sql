-- AlterTable
ALTER TABLE "_LocationAdmins" ADD CONSTRAINT "_LocationAdmins_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LocationAdmins_AB_unique";
