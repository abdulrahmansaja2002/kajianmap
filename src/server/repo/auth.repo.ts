import { prisma } from "@/server/db/client";
import type { Prisma, UserTokenType } from "../../../generated/prisma/client";

const userTokenSelect = {
  id: true,
  tokenHash: true,
  type: true,
  userId: true,
  expiresAt: true,
  revokedAt: true,
  createdAt: true,
} satisfies Prisma.UserTokenSelect;

export type UserTokenRecord = Prisma.UserTokenGetPayload<{ select: typeof userTokenSelect }>;

export interface CreateUserTokenInput {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  type?: UserTokenType; // defaults to auth_refresh
}

export const AuthRepo = {
  createToken(data: CreateUserTokenInput): Promise<UserTokenRecord> {
    return prisma.userToken.create({
      data: {
        tokenHash: data.tokenHash,
        userId: data.userId,
        type: data.type ?? "auth_refresh",
        expiresAt: data.expiresAt,
      },
      select: userTokenSelect,
    });
  },

  /** Scoped by `type` so a reset-password token can never be presented
   *  where a refresh token is expected, or vice versa. */
  findByHash(tokenHash: string, type: UserTokenType): Promise<UserTokenRecord | null> {
    return prisma.userToken.findFirst({
      where: { tokenHash, type },
      select: userTokenSelect,
    });
  },

  /** True only if the token exists, matches type, and is neither
   *  revoked nor expired. Callers should still branch on the reason
   *  (not-found vs revoked vs expired) if they want distinct error copy. */
  async findValid(tokenHash: string, type: UserTokenType): Promise<UserTokenRecord | null> {
    const record = await this.findByHash(tokenHash, type);
    if (!record || record.revokedAt || record.expiresAt < new Date()) return null;
    return record;
  },

  revoke(id: string): Promise<UserTokenRecord> {
    return prisma.userToken.update({
      where: { id },
      data: { revokedAt: new Date() },
      select: userTokenSelect,
    });
  },

  revokeByHash(tokenHash: string): Promise<Prisma.BatchPayload> {
    return prisma.userToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  /** e.g. "log out of all devices", or invalidating outstanding
   *  reset-password links after a successful password change. */
  revokeAllForUser(userId: string, type: UserTokenType): Promise<Prisma.BatchPayload> {
    return prisma.userToken.updateMany({
      where: { userId, type, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  /** Housekeeping — wire this into a cron job, not the request path. */
  deleteExpired(): Promise<Prisma.BatchPayload> {
    return prisma.userToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};