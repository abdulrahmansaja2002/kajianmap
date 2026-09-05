import { z } from "zod";
import { UserRecord, UserRepo } from "@/server/repo/user.repo";
import { AuthRepo } from "@/server/repo/auth.repo";
import { comparePassword } from "@/server/helpers/password";
import { generateRefreshToken, hashToken, signJwt } from "@/server/helpers/jwt";
import { UnauthorizedError } from "@/server/helpers/errors";
import { AuthContext } from "../middlewares/auth.middleware";

export const loginSchema = z.object({
  email: z.string().email("Masukkan email yang valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function issueRefreshToken(userId: string) {
  const rawToken = generateRefreshToken();
  await AuthRepo.createToken({
    tokenHash: hashToken(rawToken),
    userId,
    type: "auth_refresh",
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  return rawToken;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "super_admin" | "admin_masjid";
    /** Full objects (not just ids) so the frontend can populate the
     *  KajianForm's location select immediately after login without a
     *  second round-trip — mirrors `assignedLocationIds` conceptually but
     *  gives the admin dashboard the names/labels it needs to render. */
    assignedLocations: { id: string; name: string }[];
  };
}

export const AuthService = {
  async login(rawInput: unknown): Promise<LoginResult> {
    const input = loginSchema.parse(rawInput);

    const profile = await UserRepo.findByEmailForAuth(input.email);
    // Same error for "no such user" and "wrong password" — don't leak
    // which one it was, that's a user-enumeration side channel.
    if (!profile || !profile.isActive) {
      throw new UnauthorizedError("Email atau kata sandi salah.");
    }

    const passwordOk = await comparePassword(input.password, profile.password);
    if (!passwordOk) {
      throw new UnauthorizedError("Email atau kata sandi salah.");
    }

    const locationIds = profile.assignedLocations.map((l) => l.id);
    const accessToken = signJwt({ sub: profile.id, role: profile.role, locationIds });
    const refreshToken = await issueRefreshToken(profile.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        assignedLocations: profile.assignedLocations,
      },
    };
  },
  async me(auth: AuthContext): Promise<UserRecord> {
    const user = await UserRepo.findById(auth.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Sesi tidak valid. Silakan masuk kembali.");
    }
    return user;
  },
  async refresh(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const record = await AuthRepo.findValid(tokenHash, "auth_refresh");
    if (!record) {
      throw new UnauthorizedError("Sesi berakhir, silakan login kembali.");
    }

    // Rotate: revoke the used token, issue a fresh one. If a revoked
    // token's hash is ever presented again, that's a reuse signal —
    // consider revoking the whole family for this user at that point.
    await AuthRepo.revoke(record.id);

    const user = await UserRepo.findById(record.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Sesi tidak valid. Silakan masuk kembali.");
    }

    const locationIds = user.assignedLocations.map((l) => l.id);
    const accessToken = signJwt({ sub: user.id, role: user.role, locationIds });
    const refreshToken = await issueRefreshToken(user.id);

    return { accessToken, refreshToken };
  },

  async logout(rawToken?: string) {
    if (rawToken) {
      await AuthRepo.revokeByHash(hashToken(rawToken));
    }
  },
};
