import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/access-control";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const { response } = await requireTeamAccount(request, "canManageAccess");
  if (response) return response;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
  }

  const client = getSupabaseServiceClient();
  const { error } = await client
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Submission delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
