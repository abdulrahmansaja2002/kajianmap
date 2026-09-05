import { AuthHandler } from "@/server/handler/auth.handler";

export async function POST() {
  return AuthHandler.logout();
}