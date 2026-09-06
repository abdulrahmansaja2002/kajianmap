import type { NextRequest } from "next/server";
import { KajianHandler } from "@/server/handler/kajian.handler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/kajian/:id — public, powers the shareable detail page.
export async function GET(_req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return KajianHandler.getKajianById(params.id);
}

// PUT /api/kajian/:id — protected, scoped to the caller's masjid unless
// they're a super_admin (enforced in kajian.service.ts, not here).
export async function PUT(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return KajianHandler.updateKajian(req, params.id);
}

// DELETE /api/kajian/:id — same ownership rule as PUT.
export async function DELETE(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return KajianHandler.deleteKajian(req, params.id);
}
