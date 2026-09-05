import { AuthHandler } from "@/server/handler/auth.handler";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return AuthHandler.logout(req);
}