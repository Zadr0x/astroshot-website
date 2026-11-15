import { NextResponse } from "next/server";
import { clearClientPortalSession } from "@/lib/client-portal-auth";

export async function POST() {
  await clearClientPortalSession();
  return NextResponse.json({ ok: true });
}
