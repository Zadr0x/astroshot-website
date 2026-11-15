import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canUseContentCalendarAi, getSupabaseServiceClient } from "@/lib/access-control";
import type { CalendarAiContext, CalendarMediaType } from "@/lib/content-calendar";
import { AI_FACTORY_STORAGE_KEY, DEFAULT_AI_CAPTION_SETTINGS, normalizeCalendarSlug, parseAiFactory, type AiCaptionSettings } from "@/lib/content-calendar";
import { buildKuwaitiCaptionCorpusContext } from "@/lib/kuwaiti-caption-corpus";

type CaptionPayload = {
  slug?: string;
  clientName?: string;
  campaignTitle?: string;
  mediaUrl?: string;
  mediaType?: CalendarMediaType;
  publishDate?: string;
  existingCaption?: string;
  aiContext?: Partial<CalendarAiContext>;
};

function text(value: unknown) {
  return String(value ?? "").trim();
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

function buildPrompt(payload: CaptionPayload, captionSettings: AiCaptionSettings) {
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

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request);
  if (response) return response;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  let payload: CaptionPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (!account || !canUseContentCalendarAi(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mediaUrl = text(payload.mediaUrl);
  if (!mediaUrl) {
    return NextResponse.json({ error: "Upload media before generating a caption" }, { status: 400 });
  }

  if (payload.mediaType === "video") {
    return NextResponse.json({ error: "AI captions currently need an image or thumbnail" }, { status: 400 });
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
            { type: "input_text", text: buildPrompt(payload, captionSettings) },
            { type: "input_image", image_url: mediaUrl, detail: "auto" },
          ],
        },
      ],
      max_output_tokens: 360,
    }),
  });

  const data = await openaiRes.json().catch(() => null);
  if (!openaiRes.ok) {
    const error = data as { error?: { message?: string } } | null;
    return NextResponse.json({ error: error?.error?.message ?? "Could not generate caption" }, { status: 500 });
  }

  const caption = extractOutputText(data);
  if (!caption) {
    return NextResponse.json({ error: "AI returned an empty caption" }, { status: 500 });
  }

  return NextResponse.json({ caption });
}
