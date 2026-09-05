import jwt from "jsonwebtoken";
import type { Role } from "../../../generated/prisma/client";
import crypto from 'node:crypto'

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = "7d";

export interface JwtPayload {
  /** User id — kept as `sub` to match standard JWT claim naming. */
  sub: string;
  role: Role;
  /** IDs of every masjid this user is assigned to (empty for super_admin,
   *  who isn't restricted to any single location). Plural because, per
   *  `User.assignedLocations` in the Prisma schema, one admin_masjid can
   *  manage more than one masjid — mirrors `User.assignedLocationIds` on
   *  the frontend. */
  locationIds: string[];
}

function getSecret(): string {
  if (!JWT_SECRET) {
    // Fails loudly rather than silently signing/verifying with `undefined`,
    // which would make every token trivially forgeable.
    throw new Error(
      "JWT_SECRET belum diset. Tambahkan JWT_SECRET ke file .env sebelum menjalankan auth."
    );
  }
  return JWT_SECRET;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRES_IN });
}

/** Returns the decoded payload, or null for any invalid/expired/malformed
 *  token — callers decide how to respond, this never throws. */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}