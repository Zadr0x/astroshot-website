import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/access-control";
import { AI_FACTORY_STORAGE_KEY, parseAiFactory } from "@/lib/content-calendar";

export async function GET() {
  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();

  if (error) {
    console.error("Astro Magic factory read failed:", error.message);
    return NextResponse.json({ error: "Could not load Astro Magic assets." }, { status: 500 });
  }

  return NextResponse.json({ factory: parseAiFactory(data?.value) });
}
