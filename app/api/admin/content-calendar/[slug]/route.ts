import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canAccessCalendarSlug, getSupabaseServiceClient } from "@/lib/access-control";
import {
  AI_FACTORY_STORAGE_KEY,
  applyAiFactory,
  calendarStorageKey,
  emptyContentCalendar,
  normalizeCalendarSlug,
  parseAiFactory,
  parseContentCalendar,
  type ContentCalendar,
} from "@/lib/content-calendar";
import { saveCalendarSnapshot } from "@/lib/content-calendar-history";

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
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  const { data: factoryData } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();

  if (error) {
    console.error("Content calendar read failed:", error.message);
    return NextResponse.json({ error: "Could not load calendar" }, { status: 500 });
  }

  return NextResponse.json({ calendar: applyAiFactory(parseContentCalendar(data?.value, normalizedSlug), parseAiFactory(factoryData?.value)) });
}

export async function PUT(request: Request, context: RouteContext) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  const { slug } = await context.params;
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";
  if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let payload: { calendar?: ContentCalendar; adminOrderChanged?: boolean };

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      payload = JSON.parse(await request.text()) as { calendar?: ContentCalendar; adminOrderChanged?: boolean };
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fallback = emptyContentCalendar(normalizedSlug);
  const client = getSupabaseServiceClient();
  const { data: existingData, error: existingReadError } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  if (existingReadError) {
    console.error("Content calendar conflict read failed:", existingReadError.message);
    return NextResponse.json({ error: "Could not load calendar" }, { status: 500 });
  }

  const existingCalendar = parseContentCalendar(existingData?.value, normalizedSlug);
  const incomingUpdatedAt = payload.calendar?.updatedAt ?? "";
  const hasNewerSavedCalendar = isAfter(existingCalendar.updatedAt, incomingUpdatedAt);
  const incomingPosts = Array.isArray(payload.calendar?.posts) ? payload.calendar.posts : fallback.posts;
  const postsWithConflictHandling = hasNewerSavedCalendar
    ? payload.adminOrderChanged
      ? mergeAdminOrderWithNewerClientFeedback(incomingPosts, existingCalendar.posts)
      : mergeAdminPostsWithNewerClientState(incomingPosts, existingCalendar.posts)
    : incomingPosts;
  const calendar: ContentCalendar = {
    ...fallback,
    ...payload.calendar,
    slug: normalizedSlug,
    highlights: Array.isArray(payload.calendar?.highlights) ? payload.calendar.highlights : fallback.highlights,
    followers: payload.calendar?.followers ?? fallback.followers,
    following: payload.calendar?.following ?? fallback.following,
    aiContext: payload.calendar?.aiContext ?? fallback.aiContext,
    aiAssets: {
      products: payload.calendar?.aiAssets?.products ?? fallback.aiAssets.products,
      models: fallback.aiAssets.models,
      references: fallback.aiAssets.references,
    },
    aiStyles: fallback.aiStyles,
    posts: markNewlyUploadedPosts(postsWithConflictHandling, existingCalendar.posts).map((post, index) => ({
        ...post,
        label: `Content ${index + 1}`,
        thumbnailUrl: post.thumbnailUrl ?? "",
        carouselItems: Array.isArray(post.carouselItems) ? post.carouselItems : [],
        generatedMedia: Array.isArray(post.generatedMedia) ? post.generatedMedia : [],
        activeGeneratedMediaId: post.activeGeneratedMediaId ?? "",
        clientNoteSubmittedAt: post.clientNoteSubmittedAt ?? "",
        aiPrompt: post.aiPrompt ?? "",
      })),
    stories: Array.isArray(payload.calendar?.stories)
      ? payload.calendar.stories.map((story, index) => ({
        ...story,
        label: `Story ${index + 1}`,
        thumbnailUrl: story.thumbnailUrl ?? "",
        originalMediaUrl: story.originalMediaUrl ?? story.mediaUrl ?? "",
        clientNote: story.clientNote ?? "",
        clientNoteSubmittedAt: story.clientNoteSubmittedAt ?? "",
        publishDate: story.publishDate ?? "",
      }))
      : fallback.stories,
    updatedAt: new Date().toISOString(),
  };

  if (existingData?.value) {
    await saveCalendarSnapshot(client, normalizedSlug, existingCalendar, {
      actor: "admin",
      action: "admin_save",
      summary: hasNewerSavedCalendar
        ? "Admin save merged with newer saved client changes"
        : "Admin saved content calendar",
    });
  }

  const { error } = await client.from("site_content").upsert({
    key: calendarStorageKey(normalizedSlug),
    value: JSON.stringify(calendar),
    label: `${calendar.clientName} Content Calendar`,
    section: "content-calendar",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) {
    console.error("Content calendar save failed:", error.message);
    return NextResponse.json({ error: "Could not save calendar" }, { status: 500 });
  }

  const incomingModels = Array.isArray(payload.calendar?.aiAssets?.models) ? payload.calendar.aiAssets.models : [];
  const incomingReferences = Array.isArray(payload.calendar?.aiAssets?.references) ? payload.calendar.aiAssets.references : [];
  const incomingStyles = Array.isArray(payload.calendar?.aiStyles) ? payload.calendar.aiStyles : [];
  const shouldSyncFactory = incomingModels.length > 0 || incomingReferences.length > 0 || incomingStyles.length > 0;

  if (shouldSyncFactory) {
    const { data: existingFactoryData } = await client
      .from("site_content")
      .select("value")
      .eq("key", AI_FACTORY_STORAGE_KEY)
      .maybeSingle();
    const existingFactory = parseAiFactory(existingFactoryData?.value);
    const nextFactory = parseAiFactory(JSON.stringify({
      aiAssets: {
        models: incomingModels,
        references: incomingReferences,
      },
      aiStyles: incomingStyles,
      imageSettings: existingFactory.imageSettings,
      captionSettings: existingFactory.captionSettings,
      updatedAt: new Date().toISOString(),
    }));

    const { error: factoryError } = await client.from("site_content").upsert({
      key: AI_FACTORY_STORAGE_KEY,
      value: JSON.stringify(nextFactory),
      label: "AI Factory Assets",
      section: "ai-factory",
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

    if (factoryError) {
      console.error("AI factory sync from calendar failed:", factoryError.message);
    }
  }

  const { data: factoryData } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();

  return NextResponse.json({
    calendar: applyAiFactory(calendar, parseAiFactory(factoryData?.value)),
    conflictWarning: hasNewerSavedCalendar
      ? payload.adminOrderChanged
        ? "This calendar changed in another tab. Your new order was saved while newer client comments were preserved."
        : "This calendar changed in another tab. Newer client order/comments were preserved while your admin edits were saved."
      : "",
  });
}

function isAfter(leftIso: string, rightIso: string) {
  const left = Date.parse(leftIso);
  const right = Date.parse(rightIso);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  return left > right;
}

function mergeAdminPostsWithNewerClientState(incomingPosts: ContentCalendar["posts"], savedPosts: ContentCalendar["posts"]) {
  const incomingById = new Map(incomingPosts.map((post) => [post.id, post]));
  const savedById = new Map(savedPosts.map((post) => [post.id, post]));
  const merged = savedPosts.map((savedPost) => {
    const incomingPost = incomingById.get(savedPost.id);
    return incomingPost
      ? {
        ...incomingPost,
        status: savedPost.status,
        clientNote: savedPost.clientNote,
        clientNoteSubmittedAt: savedPost.clientNoteSubmittedAt,
      }
      : savedPost;
  });

  for (const incomingPost of incomingPosts) {
    if (!savedById.has(incomingPost.id)) {
      merged.push(incomingPost);
    }
  }

  return merged;
}

function mergeAdminOrderWithNewerClientFeedback(incomingPosts: ContentCalendar["posts"], savedPosts: ContentCalendar["posts"]) {
  const savedById = new Map(savedPosts.map((post) => [post.id, post]));
  return incomingPosts.map((incomingPost) => {
    const savedPost = savedById.get(incomingPost.id);
    return savedPost
      ? {
        ...incomingPost,
        status: savedPost.status,
        clientNote: savedPost.clientNote,
        clientNoteSubmittedAt: savedPost.clientNoteSubmittedAt,
      }
      : incomingPost;
  });
}

function mediaSignature(post: { mediaUrl?: string; originalMediaUrl?: string; carouselItems?: Array<{ url?: string }> }) {
  return JSON.stringify({
    mediaUrl: post.mediaUrl ?? "",
    originalMediaUrl: post.originalMediaUrl ?? "",
    carouselItems: (post.carouselItems ?? []).map((item) => item.url ?? ""),
  });
}

function markNewlyUploadedPosts(
  incomingPosts: ContentCalendar["posts"],
  existingPosts: ContentCalendar["posts"]
) {
  const existingById = new Map(existingPosts.map((post) => [post.id, post]));

  return incomingPosts.map((post) => {
    const existing = existingById.get(post.id);
    if (!existing) {
      return { ...post, isNew: Boolean(post.mediaUrl) };
    }

    const mediaChanged = mediaSignature(post) !== mediaSignature(existing);
    return { ...post, isNew: mediaChanged ? true : Boolean(existing.isNew) };
  });
}
