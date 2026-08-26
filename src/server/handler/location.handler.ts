import type { NextRequest } from "next/server";
import { LocationService } from "@/server/service/location.service";
import { ApiResponse } from "@/server/helpers/api-response";
import { requireAuth } from "@/server/middlewares/auth.middleware";

/**
 * HTTP layer: read the request, call the service, format the response.
 * No business logic lives here — every method is a thin try/catch so
 * `app/api/location/**` route files can stay a one-line passthrough.
 */
export const LocationHandler = {
  async getAllLocations(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const data = await LocationService.list({
        city: searchParams.get("city") ?? undefined,
        province: searchParams.get("province") ?? undefined,
      });
      return ApiResponse.success(data);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async createLocation(req: NextRequest) {
    try {
      const auth = requireAuth(req);
      const body = await req.json();
      const data = await LocationService.create(body, auth);
      return ApiResponse.created(data, "Lokasi berhasil dibuat.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async getLocationById(id: string) {
    try {
      const data = await LocationService.getById(id);
      return ApiResponse.success(data);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async updateLocation(req: NextRequest, id: string) {
    try {
      const auth = requireAuth(req);
      const body = await req.json();
      const data = await LocationService.update(id, body, auth);
      return ApiResponse.success(data, "Lokasi berhasil diperbarui.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async deleteLocation(req: NextRequest, id: string) {
    try {
      const auth = requireAuth(req);
      await LocationService.remove(id, auth);
      return ApiResponse.success(null, "Lokasi berhasil dihapus.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },
};
