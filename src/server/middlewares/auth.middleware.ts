import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { verifyJwt } from "@/server/helpers/jwt";
import { ForbiddenError, UnauthorizedError } from "@/server/helpers/errors";

export interface AuthContext {
  userId: string;
  role: Role;
  /** Every masjid this user may manage. Empty for super_admin (unrestricted)
   *  and for an admin_masjid with no assignment yet. */
  locationIds: string[];
}

/**
 * Reads the `Authorization: Bearer <token>` header and verifies it.
 * Returns null instead of throwing so callers can choose whether the route
 * is public (ignore null) or protected (see `requireAuth` below).
 *
 * NOTE: this only *verifies* a token issued elsewhere — the actual
 * `POST /api/auth/login` route that signs one isn't part of this pass; wire
 * it up via `signJwt` from `helpers/jwt.ts` once `auth.service.ts` exists.
 */
export function getAuthContext(req: NextRequest): AuthContext | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  return { userId: payload.sub, role: payload.role, locationIds: payload.locationIds };
}

/** Same as `getAuthContext`, but throws `UnauthorizedError` instead of
 *  returning null — the ergonomic choice for handlers guarding a route
 *  that requires *some* authenticated user, regardless of role. */
export function requireAuth(req: NextRequest): AuthContext {
  const ctx = getAuthContext(req);
  if (!ctx) {
    throw new UnauthorizedError("Token tidak valid, kedaluwarsa, atau belum login.");
  }
  return ctx;
}

/** Throws `ForbiddenError` unless the caller's role is in `allowed`. Layer
 *  this on top of `requireAuth` for routes restricted to specific roles
 *  (e.g. only super_admin may create other admins). */
export function requireRole(auth: AuthContext, allowed: Role[]): void {
  if (!allowed.includes(auth.role)) {
    throw new ForbiddenError(
      `Aksi ini hanya diizinkan untuk peran: ${allowed.join(", ")}.`
    );
  }
}
