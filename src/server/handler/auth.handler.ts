import type { NextRequest } from "next/server";
import { AuthService } from "@/server/service/auth.service";
import { ApiResponse } from "@/server/helpers/api-response";
import { AUTH_COOKIE_NAME, authCookieOptions, clearedAuthCookieOptions } from "@/server/helpers/cookie";
import { requireAuth } from "@/server/middlewares/auth.middleware";

export const AuthHandler = {
  async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { token, user } = await AuthService.login(body);

      const response = ApiResponse.success({ user }, "Berhasil masuk.");
      response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
      return response;
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async me(req: NextRequest) {
    try {
      const auth = requireAuth(req);
      const user = await AuthService.me(auth);
      return ApiResponse.success(user);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async logout() {
    const response = ApiResponse.success(null, "Berhasil keluar.");
    response.cookies.set(AUTH_COOKIE_NAME, "", clearedAuthCookieOptions());
    return response;
  },
};
