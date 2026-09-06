import type { NextRequest } from "next/server";
import { LocationHandler } from "@/server/handler/location.handler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/location/:id — public.
export async function GET(_req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return LocationHandler.getLocationById(params.id);
}

// PUT /api/location/:id — protected, super_admin only.
export async function PUT(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return LocationHandler.updateLocation(req, params.id);
}

// DELETE /api/location/:id — same ownership rule as PUT.
export async function DELETE(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return LocationHandler.deleteLocation(req, params.id);
}
