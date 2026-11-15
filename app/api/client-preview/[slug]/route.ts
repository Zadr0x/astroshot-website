import { NextResponse } from "next/server";
import { canAccessCalendarSlug, getSupabaseServiceClient } from "@/lib/access-control";
import { requireTeamAccount } from "@/lib/admin-auth";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import {
  calendarStorageKey,
  normalizeCalendarSlug,
  parseContentCalendar,
} from "@/lib/content-calendar";
import { saveCalendarSnapshot } from "@/lib/content-calendar-history";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function canAccessPreview(session: { username: string; clientName: string }, slug: string) {
  const normalizedSlug = normalizeCalendarSlug(slug);
  return normalizeCalendarSlug(session.username) === normalizedSlug || normalizeCalendarSlug(session.clientName) === normalizedSlug;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getClientPortalSession();
  const { slug } = await context.params;
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";
  if (!session) {
    const { account, response } = await requireTeamAccount(request, "canViewQuestionnaires");
    if (response) return response;
    if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!canAccessPreview(session, normalizedSlug)) {
    const { account, response } = await requireTeamAccount(request, "canViewQuestionnaires");
    if (response) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  if (error) {
    console.error("Client preview read failed:", error.message);
    return NextResponse.json({ error: "Could not load preview" }, { status: 500 });
  }

  return NextResponse.json({ calendar: parseContentCalendar(data?.value, normalizedSlug) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getClientPortalSession();
  const { slug } = await context.params;
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";
  if (!session) {
    const { account, response } = await requireTeamAccount(request, "canViewQuestionnaires");
    if (response) return response;
    if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!canAccessPreview(session, normalizedSlug)) {
    const { account, response } = await requireTeamAccount(request, "canViewQuestionnaires");
    if (response) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const client = getSupabaseServiceClient();

  let payload: {
    action?: "feedback" | "reorder" | "mark_seen";
    postId?: string;
    postIds?: string[];
    status?: "approved" | "needs_edits" | "posted";
    note?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const action = payload.action === "reorder"
    ? "reorder"
    : payload.action === "mark_seen"
      ? "mark_seen"
      : "feedback";

  if (action === "feedback" && (!payload.postId || !payload.status)) {
    return NextResponse.json({ error: "Missing feedback" }, { status: 400 });
  }

  if (action === "reorder" && (!Array.isArray(payload.postIds) || payload.postIds.length === 0)) {
    return NextResponse.json({ error: "Missing post order" }, { status: 400 });
  }

  if (action === "mark_seen") {
    const hasPostId = Boolean(payload.postId);
    const hasPostIds = Array.isArray(payload.postIds) && payload.postIds.length > 0;
    if (!hasPostId && !hasPostIds) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }
  }

  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  if (error) {
    console.error("Client preview feedback read failed:", error.message);
    return NextResponse.json({ error: "Could not load preview" }, { status: 500 });
  }

  const calendar = parseContentCalendar(data?.value, normalizedSlug);
  await saveCalendarSnapshot(client, normalizedSlug, calendar, {
    actor: "client",
    action: action === "reorder" ? "client_reorder" : "client_feedback",
    summary: action === "reorder" ? "Client changed preview order" : action === "mark_seen" ? "Client viewed new content" : "Client saved preview feedback",
  });
  const submittedAt = new Date().toISOString();
  const posts = action === "reorder"
    ? reorderPosts(calendar.posts, payload.postIds!)
    : action === "mark_seen"
      ? calendar.posts.map((post) => {
          const markAll = Array.isArray(payload.postIds) && payload.postIds.includes(post.id);
          return (post.id === payload.postId || markAll) && post.isNew
            ? { ...post, isNew: false }
            : post;
        })
      : calendar.posts.map((post) => (
          post.id === payload.postId
            ? { ...post, status: payload.status!, clientNote: payload.note ?? post.clientNote, clientNoteSubmittedAt: submittedAt }
            : post
        ));
  const nextCalendar = { ...calendar, posts, updatedAt: new Date().toISOString() };

  const { error: saveError } = await client.from("site_content").upsert({
    key: calendarStorageKey(normalizedSlug),
    value: JSON.stringify(nextCalendar),
    label: `${nextCalendar.clientName} Content Calendar`,
    section: "content-calendar",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (saveError) {
    console.error("Client preview feedback save failed:", saveError.message);
    return NextResponse.json({ error: "Could not save feedback" }, { status: 500 });
  }

  return NextResponse.json({ calendar: nextCalendar });
}

function reorderPosts<T extends { id: string; label: string }>(posts: T[], postIds: string[]) {
  const postById = new Map(posts.map((post) => [post.id, post]));
  const ordered = postIds.map((id) => postById.get(id)).filter((post): post is T => Boolean(post));
  const missing = posts.filter((post) => !postIds.includes(post.id));
  return [...ordered, ...missing].map((post, index) => ({ ...post, label: `Content ${index + 1}` }));
}
