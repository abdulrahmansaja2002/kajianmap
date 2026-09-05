import type { NextRequest } from "next/server";
import { AuthHandler } from "@/server/handler/auth.handler";

// POST /api/auth/refresh
export async function POST(req: NextRequest) {
  return AuthHandler.refresh(req);
}