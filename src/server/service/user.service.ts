import { z } from "zod";
import { UserRepo, type UserRecord } from "@/server/repo/user.repo";
import { LocationRepo } from "@/server/repo/location.repo";
import { hashPassword } from "@/server/helpers/password";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/helpers/errors";
import { requireRole, type AuthContext } from "@/server/middlewares/auth.middleware";

/**
 * Field rules mirror `userFormSchema` in the frontend
 * (`src/lib/validations/user.ts`) — same name/email constraints and the
 * same `assignedLocationIds` requirement as `User` in `@/types`.
 *
 * `password` is required on create and optional on update (blank = keep
 * the existing hash). It is never returned on the public user record.
 */
const userFields = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Masukkan email yang valid"),
  assignedLocationIds: z
    .array(z.string().min(1))
    .min(1, "Pilih minimal satu masjid untuk ditugaskan"),
  isActive: z.boolean(),
  avatarUrl: z.string().url("URL avatar tidak valid").optional().or(z.literal("")),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").optional().or(z.literal("")),
});

export const createUserSchema = userFields.superRefine((data, ctx) => {
  if (!data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "Kata sandi wajib diisi",
    });
  }
});

export const updateUserSchema = userFields.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface ListUserQuery {
  role?: "super_admin" | "admin_masjid";
  isActive?: string;
}

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

async function assertLocationsExist(ids: string[]): Promise<void> {
  const found = await LocationRepo.findIds(ids);
  if (found.length !== ids.length) {
    throw new NotFoundError("Satu atau lebih lokasi yang ditugaskan tidak ditemukan.");
  }
}

export const UserService = {
  /** Protected — only super_admin may list accounts. */
  async list(query: ListUserQuery, auth: AuthContext): Promise<UserRecord[]> {
    requireRole(auth, ["super_admin"]);
    return UserRepo.findMany({
      role: query.role,
      isActive: query.isActive === undefined ? undefined : query.isActive === "true",
    });
  },

  /** Protected — only super_admin may read another account. */
  async getById(id: string, auth: AuthContext): Promise<UserRecord> {
    requireRole(auth, ["super_admin"]);
    const user = await UserRepo.findById(id);
    if (!user) throw new NotFoundError("Akun admin tidak ditemukan.");
    return user;
  },

  /** Protected — creates an `admin_masjid` assigned to one or more masjid. */
  async create(rawInput: unknown, auth: AuthContext): Promise<UserRecord> {
    requireRole(auth, ["super_admin"]);
    const input = createUserSchema.parse(rawInput);

    const existing = await UserRepo.findByEmail(input.email);
    if (existing) throw new ConflictError("Email sudah terdaftar.");

    await assertLocationsExist(input.assignedLocationIds);

    return UserRepo.create({
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password!),
      role: "admin_masjid",
      isActive: input.isActive,
      avatarUrl: emptyToNull(input.avatarUrl),
      assignedLocations: {
        connect: input.assignedLocationIds.map((id) => ({ id })),
      },
    });
  },

  /** Protected — super_admin may edit name/email/assignment/status/password. */
  async update(id: string, rawInput: unknown, auth: AuthContext): Promise<UserRecord> {
    requireRole(auth, ["super_admin"]);
    const existing = await UserRepo.findById(id);
    if (!existing) throw new NotFoundError("Akun admin tidak ditemukan.");

    const input = updateUserSchema.parse(rawInput);

    if (input.email && input.email !== existing.email) {
      const taken = await UserRepo.findByEmail(input.email);
      if (taken) throw new ConflictError("Email sudah terdaftar.");
    }

    if (input.assignedLocationIds) {
      await assertLocationsExist(input.assignedLocationIds);
    }

    const passwordHash =
      input.password && input.password.trim() !== ""
        ? await hashPassword(input.password)
        : undefined;

    return UserRepo.update(id, {
      name: input.name,
      email: input.email,
      isActive: input.isActive,
      avatarUrl: emptyToNull(input.avatarUrl),
      password: passwordHash,
      assignedLocations: input.assignedLocationIds
        ? { set: input.assignedLocationIds.map((locId) => ({ id: locId })) }
        : undefined,
    });
  },

  /** Protected — cannot delete yourself, or an admin who still owns kajian. */
  async remove(id: string, auth: AuthContext): Promise<UserRecord> {
    requireRole(auth, ["super_admin"]);
    if (id === auth.userId) {
      throw new ForbiddenError("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    const existing = await UserRepo.findById(id);
    if (!existing) throw new NotFoundError("Akun admin tidak ditemukan.");

    const kajianCount = await UserRepo.countKajianCreated(id);
    if (kajianCount > 0) {
      throw new ForbiddenError(
        "Tidak dapat menghapus admin yang masih memiliki jadwal kajian. Nonaktifkan akun sebagai gantinya."
      );
    }

    return UserRepo.delete(id);
  },
};
