import { prisma } from "@/server/db/client";
import type { Location, Prisma } from "../../../generated/prisma/client";

export interface LocationListFilter {
  city?: string;
  province?: string;
}

/**
 * Repository layer: nothing but Prisma calls. No auth checks, no Zod, no
 * HTTP concerns — that all belongs one layer up in `location.service.ts`.
 */
export const LocationRepo = {
  findMany(filter: LocationListFilter = {}): Promise<Location[]> {
    return prisma.location.findMany({
      where: {
        city: filter.city,
        province: filter.province,
      },
      orderBy: { name: "asc" },
    });
  },

  findById(id: string) {
    return prisma.location.findUnique({ where: { id } });
  },

  findIds(ids: string[]): Promise<{ id: string }[]> {
    return prisma.location.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
  },

  create(data: Prisma.LocationCreateInput): Promise<Location> {
    return prisma.location.create({ data });
  },

  update(id: string, data: Prisma.LocationUpdateInput): Promise<Location> {
    return prisma.location.update({ where: { id }, data });
  },

  delete(id: string): Promise<Location> {
    return prisma.location.delete({ where: { id } });
  },
};
