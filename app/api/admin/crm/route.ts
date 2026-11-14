import { NextResponse } from "next/server";
import {
  getClients,
  getInquiries,
  getShoots,
  getAnalyticsSummary,
  getTeamMembers,
  createInquiry,
  createClient,
  createShoot,
  createTeamMember,
} from "@/lib/studio-db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Allow authenticated admin requests
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [clients, inquiries, shoots, analytics, teamMembers] = await Promise.all([
      getClients(),
      getInquiries(),
      getShoots(),
      getAnalyticsSummary(),
      getTeamMembers(),
    ]);

    return NextResponse.json({
      success: true,
      isSupabaseConfigured,
      analytics,
      inquiries,
      clients,
      shoots,
      teamMembers,
    });
  } catch (err: any) {
    console.error("[CRM_GET_ERR]", err);
    return NextResponse.json(
      { error: "Failed to load CRM data", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "inquiry") {
      const created = await createInquiry(data);
      return NextResponse.json({ success: true, item: created });
    }

    if (type === "client") {
      const created = await createClient(data);
      return NextResponse.json({ success: true, item: created });
    }

    if (type === "shoot") {
      const created = await createShoot(data);
      return NextResponse.json({ success: true, item: created });
    }

    if (type === "team_member") {
      const created = await createTeamMember(data);
      return NextResponse.json({ success: true, item: created });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[CRM_POST_ERR]", err);
    return NextResponse.json(
      { error: "Failed to create record", details: err?.message },
      { status: 500 }
    );
  }
}
