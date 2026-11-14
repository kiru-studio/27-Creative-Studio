import { NextResponse } from "next/server";
import {
  updateInquiryStatus,
  deleteInquiry,
  updateClient,
  updateShootStatus,
  toggleShootGear,
  syncClientSocials,
  updateTeamMemberRole,
  deleteTeamMember,
} from "@/lib/studio-db";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { type, status, notes, patch, gearItem, role, title } = body;

    if (type === "inquiry") {
      const updated = await updateInquiryStatus(id, status, notes);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "client") {
      const updated = await updateClient(id, patch);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "sync_socials") {
      const updated = await syncClientSocials(id);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "shoot") {
      const updated = await updateShootStatus(id, status);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "shoot_gear") {
      const updated = await toggleShootGear(id, gearItem);
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === "team_member") {
      const updated = await updateTeamMemberRole(id, role, title);
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[CRM_PATCH_ERR]", err);
    return NextResponse.json(
      { error: "Failed to update record", details: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type === "team_member") {
      await deleteTeamMember(id);
      return NextResponse.json({ success: true });
    }

    await deleteInquiry(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[CRM_DELETE_ERR]", err);
    return NextResponse.json(
      { error: "Failed to delete record", details: err?.message },
      { status: 500 }
    );
  }
}
