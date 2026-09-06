import type { NextRequest } from "next/server";
import { UserHandler } from "@/server/handler/user.handler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/user/:id — protected, super_admin only.
export async function GET(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return UserHandler.getUserById(req, params.id);
}

// PUT /api/user/:id — protected, super_admin only.
export async function PUT(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return UserHandler.updateUser(req, params.id);
}

// DELETE /api/user/:id — same ownership rule as PUT.
export async function DELETE(req: NextRequest, props: RouteParams) {
  const params = await props.params;
  return UserHandler.deleteUser(req, params.id);
}
