import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  isAdminRequest,
  googleAuthConfigured,
  getAdminUser,
  getAdminMemberId,
} from "@/lib/admin-auth";
import { getTeamMembers } from "@/lib/studio-db";
import type { TeamMember } from "@/lib/crm-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authenticated = isAdminRequest(request);
  const userEmail = authenticated ? getAdminUser(request) : null;
  const memberId = authenticated ? getAdminMemberId(request) : null;

  const members = await getTeamMembers();
  let currentMember: TeamMember | null = null;

  if (authenticated) {
    if (memberId) {
      currentMember = members.find((m) => m.id === memberId) || null;
    }
    if (!currentMember && userEmail) {
      currentMember =
        members.find(
          (m) => m.email.toLowerCase() === userEmail.toLowerCase()
        ) || null;
    }
    // Default fallback to Principal
    if (!currentMember) {
      currentMember =
        members.find((m) => m.role === "principal") || members[0] || null;
    }
  }

  return NextResponse.json({
    authenticated,
    configured: adminAuthConfigured(),
    googleConfigured: googleAuthConfigured(),
    user: userEmail,
    member: currentMember,
    roster: members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      title: m.title,
      email: m.email,
    })),
  });
}
