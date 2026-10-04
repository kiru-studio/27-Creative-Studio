import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  adminPasswordMatches,
  isSameOriginRequest,
  setAdminSession,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin authentication is not configured." },
      { status: 503 },
    );
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password =
    body && typeof body === "object" && "password" in body
      ? body.password
      : undefined;
  if (typeof password !== "string" || !adminPasswordMatches(password)) {
    return NextResponse.json({ error: "Password not recognised." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  setAdminSession(response);
  return response;
}