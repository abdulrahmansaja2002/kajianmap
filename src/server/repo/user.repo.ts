import { prisma } from "@/server/db/client";
import type { Prisma, Role } from "../../../generated/prisma/client";

/** Only the fields `auth.service.ts` actually needs — the password hash to
 *  verify, and `assignedLocations` to populate `locationIds` on the JWT. */
const authProfileSelect = {
  id: true,
  email: true,
  password: true,
  name: true,
  role: true,
  isActive: true,
  assignedLocations: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

export type AuthProfile = Prisma.UserGetPayload<{ select: typeof authProfileSelect }>;

/** Public user row — never includes `password`. `assignedLocations` is the
 *  many-to-many join that the frontend flattens into `assignedLocationIds`. */
const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  assignedLocations: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;

export interface UserListFilter {
  role?: Role;
  isActive?: boolean;
}

export const UserRepo = {
  findByEmailForAuth(email: string): Promise<AuthProfile | null> {
    return prisma.user.findUnique({
      where: { email },
      select: authProfileSelect,
    });
  },

  findMany(filter: UserListFilter = {}): Promise<UserRecord[]> {
    return prisma.user.findMany({
      where: {
        role: filter.role,
        isActive: filter.isActive,
      },
      select: userPublicSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  },

  findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { email },
      select: userPublicSelect,
    });
  },

  countKajianCreated(userId: string): Promise<number> {
    return prisma.kajian.count({ where: { createdById: userId } });
  },

  create(data: Prisma.UserCreateInput): Promise<UserRecord> {
    return prisma.user.create({ data, select: userPublicSelect });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<UserRecord> {
    return prisma.user.update({ where: { id }, data, select: userPublicSelect });
  },

  delete(id: string): Promise<UserRecord> {
    return prisma.user.delete({ where: { id }, select: userPublicSelect });
  },
};
