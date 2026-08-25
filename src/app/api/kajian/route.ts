import type { NextRequest } from "next/server";
import { KajianHandler } from "@/server/handler/kajian.handler";

// GET /api/kajian?locationId=&category=&frequency=&isActive=
// Public — no auth required, powers the map/list views.
export async function GET(req: NextRequest) {
  return KajianHandler.getAllKajian(req);
}

// POST /api/kajian
// Protected — requires a valid Bearer token (Admin Masjid or Super Admin).
export async function POST(req: NextRequest) {
  return KajianHandler.createKajian(req);
}
