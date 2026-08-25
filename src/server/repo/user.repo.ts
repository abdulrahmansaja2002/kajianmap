import { prisma } from "@/server/db/client";
import type { Prisma } from "../../../generated/prisma/client";

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

export const UserRepo = {
  findByEmailForAuth(email: string): Promise<AuthProfile | null> {
    return prisma.user.findUnique({
      where: { email },
      select: authProfileSelect,
    });
  },
};
