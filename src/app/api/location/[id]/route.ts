import type { NextRequest } from "next/server";
import { LocationHandler } from "@/server/handler/location.handler";

interface RouteParams {
  params: { id: string };
}

// GET /api/location/:id — public.
export async function GET(_req: NextRequest, { params }: RouteParams) {
  return LocationHandler.getLocationById(params.id);
}

// PUT /api/location/:id — protected, super_admin only.
export async function PUT(req: NextRequest, { params }: RouteParams) {
  return LocationHandler.updateLocation(req, params.id);
}

// DELETE /api/location/:id — same ownership rule as PUT.
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return LocationHandler.deleteLocation(req, params.id);
}
