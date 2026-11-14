import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  adminPasswordMatches,
  isSameOriginRequest,
  setAdminSession,
} from "@/lib/admin-auth";
import { getTeamMembers } from "@/lib/studio-db";

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

  const memberId =
    body && typeof body === "object" && "memberId" in body && typeof body.memberId === "string"
      ? body.memberId
      : undefined;

  let resolvedMemberId = memberId;
  let resolvedEmail: string | undefined;

  if (memberId) {
    const members = await getTeamMembers();
    const found = members.find((m) => m.id === memberId);
    if (found) {
      resolvedEmail = found.email;
      resolvedMemberId = found.id;
    }
  }

  const response = NextResponse.json({ authenticated: true, memberId: resolvedMemberId });
  setAdminSession(response, resolvedEmail, resolvedMemberId);
  return response;
}