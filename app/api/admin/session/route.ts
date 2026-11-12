import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  isAdminRequest,
  googleAuthConfigured,
  getAdminUser,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authenticated = isAdminRequest(request);
  return NextResponse.json({
    authenticated,
    configured: adminAuthConfigured(),
    googleConfigured: googleAuthConfigured(),
    user: authenticated ? getAdminUser(request) : null,
  });
}
