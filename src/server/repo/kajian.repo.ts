import { prisma } from "@/server/db/client";
import type { Kajian, Prisma } from "../../../generated/prisma/client";

export interface KajianListFilter {
  locationId?: string;
  category?: string;
  frequency?: "rutin" | "insidental";
  isActive?: boolean;
}

const withRelations = {
  location: true,
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.KajianInclude;

/**
 * Repository layer: nothing but Prisma calls. No auth checks, no Zod, no
 * HTTP concerns — that all belongs one layer up in `kajian.service.ts`.
 */
export const KajianRepo = {
  findMany(filter: KajianListFilter = {}): Promise<Kajian[]> {
    return prisma.kajian.findMany({
      where: {
        locationId: filter.locationId,
        category: filter.category,
        frequency: filter.frequency,
        isActive: filter.isActive,
      },
      include: withRelations,
      // Rutin entries have no `date` (null sorts first in Postgres by
      // default) — ordering by `createdAt` keeps the list stable instead
      // of clustering every recurring kajian at the top by accident.
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.kajian.findUnique({
      where: { id },
      include: withRelations,
    });
  },

  create(data: Prisma.KajianUncheckedCreateInput): Promise<Kajian> {
    return prisma.kajian.create({ data, include: withRelations });
  },

  update(id: string, data: Prisma.KajianUncheckedUpdateInput): Promise<Kajian> {
    return prisma.kajian.update({ where: { id }, data, include: withRelations });
  },

  delete(id: string): Promise<Kajian> {
    return prisma.kajian.delete({ where: { id } });
  },
};
