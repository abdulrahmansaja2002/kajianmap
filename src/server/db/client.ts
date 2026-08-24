import { PrismaClient } from "@prisma/client";

/**
 * Next.js's dev server hot-reloads modules on every file change, which — if
 * we naively did `new PrismaClient()` at module scope — would open a fresh
 * connection pool on every reload and quickly exhaust Postgres' connection
 * limit. Stashing the instance on `globalThis` survives the reload and
 * keeps a single client alive for the life of the process. In production
 * each server instance still only creates one client, so this is a no-op
 * there beyond the initial assignment.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prisma;
}
