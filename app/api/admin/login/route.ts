import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
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
    body = {};
  }

  const memberId =
    body && typeof body === "object" && "memberId" in body && typeof body.memberId === "string"
      ? body.memberId
      : undefined;

  let resolvedMemberId = memberId;
  let resolvedEmail: string | undefined;

  const members = await getTeamMembers();
  if (memberId) {
    const found = members.find((m) => m.id === memberId);
    if (found) {
      resolvedEmail = found.email;
      resolvedMemberId = found.id;
    }
  } else if (members.length > 0) {
    const principal = members.find((m) => m.role === "principal") || members[0];
    resolvedEmail = principal.email;
    resolvedMemberId = principal.id;
  }

  const response = NextResponse.json({ authenticated: true, memberId: resolvedMemberId });
  setAdminSession(response, resolvedEmail, resolvedMemberId);
  return response;
}