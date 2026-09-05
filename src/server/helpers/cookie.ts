export const AUTH_COOKIE_NAME = "kajianmap_token";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  };
}

export function clearedAuthCookieOptions() {
  return { ...authCookieOptions(), maxAge: 0 };
}