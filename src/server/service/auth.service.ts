import { z } from "zod";
import { UserRecord, UserRepo } from "@/server/repo/user.repo";
import { comparePassword } from "@/server/helpers/password";
import { signJwt } from "@/server/helpers/jwt";
import { UnauthorizedError } from "@/server/helpers/errors";
import { AuthContext } from "../middlewares/auth.middleware";

export const loginSchema = z.object({
  email: z.string().email("Masukkan email yang valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginResult {
  token: string;
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
    const token = signJwt({ sub: profile.id, role: profile.role, locationIds });

    return {
      token,
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
};
