import { NextResponse } from "next/server";
import { canAccessCalendarSlug, getSupabaseServiceClient } from "@/lib/access-control";
import { requireTeamAccount } from "@/lib/admin-auth";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import {
  AI_FACTORY_STORAGE_KEY,
  DEFAULT_AI_CAPTION_SETTINGS,
  calendarStorageKey,
  normalizeCalendarSlug,
  parseAiFactory,
  parseContentCalendar,
  type AiCaptionSettings,
  type CalendarAiContext,
  type CalendarMediaType,
} from "@/lib/content-calendar";
import { buildKuwaitiCaptionCorpusContext } from "@/lib/kuwaiti-caption-corpus";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type CaptionPayload = {
  postId?: string;
  slideIndex?: number;
};

type CaptionPromptPayload = {
  clientName?: string;
  campaignTitle?: string;
  mediaUrl?: string;
  mediaType?: CalendarMediaType;
  publishDate?: string;
  existingCaption?: string;
  aiContext?: Partial<CalendarAiContext>;
};

function canAccessPreview(session: { username: string; clientName: string }, slug: string) {
  const normalizedSlug = normalizeCalendarSlug(slug);
  return normalizeCalendarSlug(session.username) === normalizedSlug || normalizeCalendarSlug(session.clientName) === normalizedSlug;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function isImageUrl(sourceUrl: string) {
  try {
    return /\.(jpg|jpeg|png|webp|gif|heic)(?:$|[?#])/i.test(new URL(sourceUrl).pathname);
  } catch {
    return /\.(jpg|jpeg|png|webp|gif|heic)(?:$|[?#])/i.test(sourceUrl);
  }
}

async function getCaptionSettings(): Promise<AiCaptionSettings> {
  const client = getSupabaseServiceClient();
  const { data } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();

  return parseAiFactory(data?.value).captionSettings ?? DEFAULT_AI_CAPTION_SETTINGS;
}

function buildPrompt(payload: CaptionPromptPayload, captionSettings: AiCaptionSettings) {
  const context = payload.aiContext ?? {};
  const corpusContext = buildKuwaitiCaptionCorpusContext({
    referenceStyle: text(context.referenceStyle),
    brandName: text(context.brandName) || text(payload.clientName),
    tone: text(context.tone),
    products: text(context.products),
    audience: text(context.audience),
    captionRules: text(context.captionRules),
    approvedExamples: text(context.approvedExamples),
  });

  return [
    captionSettings.motherPrompt,
    "",
    "Analyze the image and write one ready-to-paste Instagram caption in natural Kuwaiti Arabic dialect.",
    "Use the corpus below as the writing brain: rhythm, Kuwaiti word choice, caption structure, CTA style, and local feeling.",
    "Do not copy any corpus caption or reuse a distinctive phrase from the examples.",
    "Generate the strongest final option only. Before finalizing, internally compare three possible hooks and choose the most local, least generic one.",
    "",
    `Client/brand: ${text(context.brandName) || text(payload.clientName) || "Not provided"}`,
    `Campaign: ${text(payload.campaignTitle) || "Content calendar"}`,
    `Tone: ${text(context.tone) || "Kuwaiti, natural, friendly"}`,
    `Products/services: ${text(context.products) || "Not provided"}`,
    `Target audience: ${text(context.audience) || "Kuwait audience on Instagram"}`,
    `Dialect: ${text(context.dialect) || "Kuwaiti Arabic"}`,
    `Reference style: ${text(context.referenceStyle) || "auto"}`,
    `Extra caption rules: ${text(context.captionRules) || "Keep it short and natural."}`,
    `Publish date: ${text(payload.publishDate) || "Not set"}`,
    payload.existingCaption ? `Existing caption to improve or replace: ${text(payload.existingCaption)}` : "",
    "",
    corpusContext,
    "",
    "Caption quality rules:",
    captionSettings.qualityRules,
    "",
    "Avoid:",
    captionSettings.negativeRules,
    "",
    "Return only the final caption. No explanation.",
  ].filter(Boolean).join("\n");
}

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (response.output_text) return response.output_text.trim();

  const chunks = response.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? "")
    .filter(Boolean);

  return chunks?.join("\n").trim() ?? "";
}

export async function POST(request: Request, context: RouteContext) {
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

  let payload: CaptionPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const postId = text(payload.postId);
  if (!postId) return NextResponse.json({ error: "Missing post ID" }, { status: 400 });

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  if (error) {
    console.error("Client preview caption read failed:", error.message);
    return NextResponse.json({ error: "Could not load preview" }, { status: 500 });
  }

  const calendar = parseContentCalendar(data?.value, normalizedSlug);
  const post = calendar.posts.find((item) => item.id === postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const carouselIndex = Math.max(0, Number(payload.slideIndex ?? 0));
  const carouselItem = post.mediaType === "carousel" ? post.carouselItems[carouselIndex] ?? post.carouselItems[0] : null;
  const selectedMediaType = carouselItem?.mediaType ?? post.mediaType;
  const mediaUrl = carouselItem
    ? carouselItem.mediaType === "video"
      ? carouselItem.thumbnailUrl || carouselItem.url
      : carouselItem.originalUrl || carouselItem.url
    : post.mediaType === "video"
      ? post.thumbnailUrl || post.mediaUrl
      : post.originalMediaUrl || post.mediaUrl;

  if (!mediaUrl) {
    return NextResponse.json({ error: "Upload media before generating a caption" }, { status: 400 });
  }

  if (selectedMediaType === "video" && !isImageUrl(mediaUrl)) {
    return NextResponse.json({ error: "Video caption generation needs a thumbnail image first" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const captionSettings = await getCaptionSettings();
  const model = process.env.OPENAI_CAPTION_MODEL || "gpt-4o";
  const openaiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt({
                clientName: calendar.clientName,
                campaignTitle: calendar.campaignTitle,
                mediaUrl,
                mediaType: selectedMediaType,
                publishDate: post.publishDate,
                existingCaption: post.caption,
                aiContext: calendar.aiContext,
              }, captionSettings),
            },
            { type: "input_image", image_url: mediaUrl, detail: "auto" },
          ],
        },
      ],
      max_output_tokens: 360,
    }),
  });

  const responseData = await openaiRes.json().catch(() => null);
  if (!openaiRes.ok) {
    const openAiError = responseData as { error?: { message?: string } } | null;
    return NextResponse.json({ error: openAiError?.error?.message ?? "Could not generate caption" }, { status: 500 });
  }

  const caption = extractOutputText(responseData);
  if (!caption) {
    return NextResponse.json({ error: "AI returned an empty caption" }, { status: 500 });
  }

  return NextResponse.json({ caption });
}
