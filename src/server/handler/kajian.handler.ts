import type { NextRequest } from "next/server";
import { KajianService } from "@/server/service/kajian.service";
import { ApiResponse } from "@/server/helpers/api-response";
import { requireAuth } from "@/server/middlewares/auth.middleware";

/**
 * HTTP layer: read the request, call the service, format the response.
 * No business logic lives here — every method is a thin try/catch so
 * `app/api/kajian/**` route files can stay a one-line passthrough.
 */
export const KajianHandler = {
  async getAllKajian(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const data = await KajianService.list({
        locationId: searchParams.get("locationId") ?? undefined,
        category: searchParams.get("category") ?? undefined,
        frequency: (searchParams.get("frequency") as "rutin" | "insidental" | null) ?? undefined,
        isActive: searchParams.get("isActive") ?? undefined,
      });
      return ApiResponse.success(data);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async createKajian(req: NextRequest) {
    try {
      const auth = requireAuth(req);
      const body = await req.json();
      const data = await KajianService.create(body, auth);
      return ApiResponse.created(data, "Jadwal kajian berhasil dibuat.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async getKajianById(id: string) {
    try {
      const data = await KajianService.getById(id);
      return ApiResponse.success(data);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async updateKajian(req: NextRequest, id: string) {
    try {
      const auth = requireAuth(req);
      const body = await req.json();
      const data = await KajianService.update(id, body, auth);
      return ApiResponse.success(data, "Jadwal kajian berhasil diperbarui.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async deleteKajian(req: NextRequest, id: string) {
    try {
      const auth = requireAuth(req);
      await KajianService.remove(id, auth);
      return ApiResponse.success(null, "Jadwal kajian berhasil dihapus.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },
};
