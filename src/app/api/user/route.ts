import type { NextRequest } from "next/server";
import { UserHandler } from "@/server/handler/user.handler";

// GET /api/user?role=&isActive=
// Protected — super_admin only (enforced in user.service.ts).
export async function GET(req: NextRequest) {
  return UserHandler.getAllUsers(req);
}

// POST /api/user
// Protected — creates an admin_masjid account.
export async function POST(req: NextRequest) {
  return UserHandler.createUser(req);
}
