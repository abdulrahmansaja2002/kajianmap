import type { NextRequest } from "next/server";
import { AuthService } from "@/server/service/auth.service";
import { ApiResponse } from "@/server/helpers/api-response";
import { AUTH_COOKIE_NAME, authCookieOptions, authRefreshCookieOptions, clearedAuthCookieOptions, REFRESH_COOKIE_NAME } from "@/server/helpers/cookie";
import { requireAuth } from "@/server/middlewares/auth.middleware";
import { UnauthorizedError } from "../helpers/errors";


export const AuthHandler = {
  async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { accessToken, refreshToken, user } = await AuthService.login(body);

      const response = ApiResponse.success({ user }, "Berhasil masuk.");
      response.cookies.set(AUTH_COOKIE_NAME, accessToken, authCookieOptions());
      response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, authRefreshCookieOptions())
      return response;
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },

  async me(req: NextRequest) {
    try {
      const auth = await requireAuth(req);
      const user = await AuthService.me(auth);
      return ApiResponse.success(user);
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },
  async refresh(req: NextRequest) {
    try {
      const rawToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
      if (!rawToken) throw new UnauthorizedError("Tidak ada refresh token.");
  
      const { accessToken, refreshToken } = await AuthService.refresh(rawToken);
  
      const response = ApiResponse.success(null, "Token diperbarui.");
      response.cookies.set(AUTH_COOKIE_NAME, accessToken, authCookieOptions());
      response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, authRefreshCookieOptions());
      return response;
    } catch (err) {
      return ApiResponse.fromError(err);
    }
  },
  
  async logout(req: NextRequest) {
    const rawToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    await AuthService.logout(rawToken);
  
    const response = ApiResponse.success(null, "Berhasil keluar.");
    response.cookies.set(AUTH_COOKIE_NAME, "", clearedAuthCookieOptions());
    response.cookies.set(REFRESH_COOKIE_NAME, "", authRefreshCookieOptions());
    return response;
  },
};
