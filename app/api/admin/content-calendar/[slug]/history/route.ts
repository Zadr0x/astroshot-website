import { NextResponse } from "next/server";
import { canAccessCalendarSlug, getSupabaseServiceClient } from "@/lib/access-control";
import { requireTeamAccount } from "@/lib/admin-auth";
import {
  AI_FACTORY_STORAGE_KEY,
  applyAiFactory,
  calendarStorageKey,
  normalizeCalendarSlug,
  parseAiFactory,
  parseContentCalendar,
} from "@/lib/content-calendar";
import { readCalendarHistory, saveCalendarSnapshot } from "@/lib/content-calendar-history";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  const { slug } = await context.params;
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";
  if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = getSupabaseServiceClient();
  const snapshots = await readCalendarHistory(client, normalizedSlug);

  return NextResponse.json({
    snapshots: snapshots.map((snapshot) => ({
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      actor: snapshot.actor,
      action: snapshot.action,
      summary: snapshot.summary,
      clientName: snapshot.calendar.clientName,
      postCount: snapshot.calendar.posts.length,
      approvedCount: snapshot.calendar.posts.filter((post) => post.status === "approved").length,
      needsEditsCount: snapshot.calendar.posts.filter((post) => post.status === "needs_edits").length,
      videoCount: snapshot.calendar.posts.filter((post) => post.mediaType === "video").length,
    })),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  const { slug } = await context.params;
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";
  if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: { snapshotId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!payload.snapshotId) {
    return NextResponse.json({ error: "Missing snapshot" }, { status: 400 });
  }

  const client = getSupabaseServiceClient();
  const snapshots = await readCalendarHistory(client, normalizedSlug);
  const snapshot = snapshots.find((item) => item.id === payload.snapshotId);
  if (!snapshot) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  const { data: currentData, error: currentError } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  if (currentError) {
    console.error("Content calendar restore read failed:", currentError.message);
    return NextResponse.json({ error: "Could not load calendar" }, { status: 500 });
  }

  if (currentData?.value) {
    await saveCalendarSnapshot(client, normalizedSlug, parseContentCalendar(currentData.value, normalizedSlug), {
      actor: "admin",
      action: "restore",
      summary: "Snapshot taken before restoring calendar history",
    });
  }

  const restoredCalendar = {
    ...snapshot.calendar,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await client.from("site_content").upsert({
    key: calendarStorageKey(normalizedSlug),
    value: JSON.stringify(restoredCalendar),
    label: `${restoredCalendar.clientName} Content Calendar`,
    section: "content-calendar",
    updated_at: restoredCalendar.updatedAt,
  }, { onConflict: "key" });

  if (error) {
    console.error("Content calendar restore failed:", error.message);
    return NextResponse.json({ error: "Could not restore snapshot" }, { status: 500 });
  }

  const { data: factoryData } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();

  return NextResponse.json({ calendar: applyAiFactory(restoredCalendar, parseAiFactory(factoryData?.value)) });
}

