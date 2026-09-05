import type { NextRequest } from "next/server";
import { AuthHandler } from "@/server/handler/auth.handler";

export async function GET(req: NextRequest) {
  return AuthHandler.me(req);
}