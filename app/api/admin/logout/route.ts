import { NextResponse } from "next/server";
import { clearAdminSession, isSameOriginRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  clearAdminSession(response);
  return response;
}