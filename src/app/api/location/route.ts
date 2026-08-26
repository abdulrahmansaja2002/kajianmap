import type { NextRequest } from "next/server";
import { LocationHandler } from "@/server/handler/location.handler";

// GET /api/location?city=&province=
// Public — no auth required, powers the map and location pickers.
export async function GET(req: NextRequest) {
  return LocationHandler.getAllLocations(req);
}

// POST /api/location
// Protected — super_admin only (enforced in location.service.ts).
export async function POST(req: NextRequest) {
  return LocationHandler.createLocation(req);
}
