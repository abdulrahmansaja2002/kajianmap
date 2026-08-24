import bcrypt from "bcryptjs";

/** Cost factor for bcrypt's key-stretching. 10 is bcrypt's own recommended
 *  floor as of 2026 hardware — high enough to resist offline brute force,
 *  low enough not to make login noticeably slow. */
const SALT_ROUNDS = 10;

/** Hashes a plain-text password for storage. Never persist the raw value —
 *  only this hash belongs in `User.password`. */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/** Compares a login attempt against the stored hash. Returns false for any
 *  mismatch — never throws on a "wrong password", only on malformed input. */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
