import type { NextRequest } from "next/server";
import { AuthHandler } from "@/server/handler/auth.handler";

// POST /api/auth/login — public. Returns { token, user } on success.
export async function POST(req: NextRequest) {
  return AuthHandler.login(req);
}
