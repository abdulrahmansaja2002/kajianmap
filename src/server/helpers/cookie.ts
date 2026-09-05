export const AUTH_COOKIE_NAME = "kajianmap_token";
export const REFRESH_COOKIE_NAME = "kajianmap_refresh_token";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;
const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 30;


export function authRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth/refresh", // scope it narrowly
    maxAge: ONE_MONTH_IN_SECONDS,
  };
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  };
}

export function clearedAuthRefreshCookieOptions() {
  return { ...authRefreshCookieOptions(), maxAge: 0 };
}
export function clearedAuthCookieOptions() {
  return { ...authCookieOptions(), maxAge: 0 };
}