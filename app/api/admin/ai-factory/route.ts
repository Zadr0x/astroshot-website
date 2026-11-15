import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { getSupabaseServiceClient, isCalendarScopedAccount } from "@/lib/access-control";
import {
  AI_FACTORY_STORAGE_KEY,
  emptyAiFactory,
  parseAiFactory,
  type AiFactory,
} from "@/lib/content-calendar";

export async function GET(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;
  if (account && isCalendarScopedAccount(account)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();

  if (error) {
    console.error("AI factory read failed:", error.message);
    return NextResponse.json({ error: "Could not load AI Factory" }, { status: 500 });
  }

  return NextResponse.json({ factory: parseAiFactory(data?.value) });
}

export async function PUT(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;
  if (account && isCalendarScopedAccount(account)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: { factory?: AiFactory };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = parseAiFactory(JSON.stringify(payload.factory ?? emptyAiFactory()));
  const factory: AiFactory = {
    ...parsed,
    updatedAt: new Date().toISOString(),
  };

  const client = getSupabaseServiceClient();
  const { error } = await client.from("site_content").upsert({
    key: AI_FACTORY_STORAGE_KEY,
    value: JSON.stringify(factory),
    label: "AI Factory Assets",
    section: "ai-factory",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) {
    console.error("AI factory save failed:", error.message);
    return NextResponse.json({ error: "Could not save AI Factory" }, { status: 500 });
  }

  return NextResponse.json({ factory });
}
