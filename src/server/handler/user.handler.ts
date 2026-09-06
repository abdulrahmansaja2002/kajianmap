import type { NextRequest } from "next/server";
import { UserService } from "@/server/service/user.service";
import { ApiResponse } from "@/server/helpers/api-response";
import { requireAuth } from "@/server/middlewares/auth.middleware";

/**
 * HTTP layer: read the request, call the service, format the response.
 * No business logic lives here — every method is a thin try/catch so
 * `app/api/user/**` route files can stay a one-line passthrough.
 */
export const UserHandler = {
  async getAllUsers(req: NextRequest) {
    try {
      const auth = await requireAuth(req);
      const { searchParams } = new URL(req.url);
      const role = searchParams.get("role");
      const data = await UserService.list(
        {
          role: role === "super_admin" || role === "admin_masjid" ? role : undefined,
          isActive: searchParams.get("isActive") ?? undefined,
        },
        auth
      );
      return ApiResponse.success(data);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async createUser(req: NextRequest) {
    try {
      const auth = await requireAuth(req);
      const body = await req.json();
      const data = await UserService.create(body, auth);
      return ApiResponse.created(data, "Akun admin berhasil dibuat.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async getUserById(req: NextRequest, id: string) {
    try {
      const auth = await requireAuth(req);
      const data = await UserService.getById(id, auth);
      return ApiResponse.success(data);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async updateUser(req: NextRequest, id: string) {
    try {
      const auth = await requireAuth(req);
      const body = await req.json();
      const data = await UserService.update(id, body, auth);
      return ApiResponse.success(data, "Akun admin berhasil diperbarui.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async deleteUser(req: NextRequest, id: string) {
    try {
      const auth = await requireAuth(req);
      await UserService.remove(id, auth);
      return ApiResponse.success(null, "Akun admin berhasil dihapus.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },
};
