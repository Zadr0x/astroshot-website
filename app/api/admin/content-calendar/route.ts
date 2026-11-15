import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import {
  canAccessCalendarSlug,
  getSupabaseServiceClient,
  isCalendarScopedAccount,
} from "@/lib/access-control";
import {
  aiVideoJobsStorageKey,
  calendarStorageKey,
  emptyContentCalendar,
  normalizeCalendarSlug,
  parseContentCalendar,
  type ContentCalendar,
} from "@/lib/content-calendar";

type CalendarRow = {
  key: string;
  value: string | null;
  updated_at: string | null;
};

function calendarSlugFromKey(key: string) {
  return key.replace(/^content_calendar_/, "");
}

function summarizeCalendar(row: CalendarRow) {
  const slug = calendarSlugFromKey(row.key);
  const calendar = parseContentCalendar(row.value, slug);

  return {
    slug: calendar.slug,
    clientName: calendar.clientName,
    campaignTitle: calendar.campaignTitle,
    logoUrl: calendar.logoUrl,
    totalPosts: calendar.posts.length,
    filledPosts: calendar.posts.filter((post) => Boolean(post.mediaUrl)).length,
    updatedAt: calendar.updatedAt || row.updated_at || "",
  };
}

export async function GET(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("key,value,updated_at")
    .eq("section", "content-calendar")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Content calendar list failed:", error.message);
    return NextResponse.json({ error: "Could not load calendars" }, { status: 500 });
  }

  const calendars = ((data as CalendarRow[] | null) ?? [])
    .filter((row) => row.key.startsWith("content_calendar_"))
    .map(summarizeCalendar)
    .filter((calendar) => account ? canAccessCalendarSlug(account, calendar.slug) : false);

  return NextResponse.json({ calendars });
}

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  if (account && isCalendarScopedAccount(account)) {
    return NextResponse.json({ error: "This account cannot create projects" }, { status: 403 });
  }

  let payload: { clientName?: string; campaignTitle?: string; slug?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const clientName = payload.clientName?.trim();
  if (!clientName) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug || clientName);
  if (!slug) {
    return NextResponse.json({ error: "Could not create project slug" }, { status: 400 });
  }

  const serviceClient = getSupabaseServiceClient();
  const key = calendarStorageKey(slug);
  const existing = await serviceClient
    .from("site_content")
    .select("key")
    .eq("key", key)
    .maybeSingle();

  if (existing.error) {
    console.error("Content calendar duplicate check failed:", existing.error.message);
    return NextResponse.json({ error: "Could not create calendar" }, { status: 500 });
  }

  if (existing.data) {
    return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
  }

  const calendar: ContentCalendar = {
    ...emptyContentCalendar(slug),
    slug,
    clientName,
    campaignTitle: payload.campaignTitle?.trim() || "Content Calendar",
    updatedAt: new Date().toISOString(),
  };

  const { error } = await serviceClient.from("site_content").upsert({
    key,
    value: JSON.stringify(calendar),
    label: `${calendar.clientName} Content Calendar`,
    section: "content-calendar",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) {
    console.error("Content calendar create failed:", error.message);
    return NextResponse.json({ error: "Could not create calendar" }, { status: 500 });
  }

  return NextResponse.json({ calendar }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  if (account && isCalendarScopedAccount(account)) {
    return NextResponse.json({ error: "This account cannot delete projects" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const slug = normalizeCalendarSlug(searchParams.get("slug") ?? "");
  if (!slug) {
    return NextResponse.json({ error: "Project slug is required" }, { status: 400 });
  }

  const serviceClient = getSupabaseServiceClient();
  const { error } = await serviceClient
    .from("site_content")
    .delete()
    .in("key", [calendarStorageKey(slug), aiVideoJobsStorageKey(slug)]);

  if (error) {
    console.error("Content calendar delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete calendar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
