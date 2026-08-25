import type { NextRequest } from "next/server";
import { AuthService } from "@/server/service/auth.service";
import { ApiResponse } from "@/server/helpers/api-response";

export const AuthHandler = {
  async login(req: NextRequest) {
    try {
      const body = await req.json();
      const result = await AuthService.login(body);
      return ApiResponse.success(result, "Berhasil masuk.");
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },
};
