import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canUseContentCalendarAi } from "@/lib/access-control";
import { normalizeCalendarSlug, type CalendarAiAsset } from "@/lib/content-calendar";

type EnhancePromptPayload = {
  slug?: string;
  clientName?: string;
  campaignTitle?: string;
  postLabel?: string;
  product?: CalendarAiAsset;
  models?: CalendarAiAsset[];
  reference?: CalendarAiAsset;
  style?: string;
  styleName?: string;
  stylePrompt?: string;
  extraPrompt?: string;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function assetSummary(label: string, asset: CalendarAiAsset | undefined) {
  if (!asset) return `${label}: not selected`;
  return [
    `${label}: ${asset.name || "Unnamed"}`,
    asset.notes ? `Notes: ${asset.notes}` : "",
  ].filter(Boolean).join(" | ");
}

function buildEnhancerPrompt(payload: EnhancePromptPayload) {
  const models = Array.isArray(payload.models) ? payload.models : [];
  const referenceBehavior = payload.reference?.referenceBehavior ?? "location-dna";

  return [
    "Rewrite the team's rough AI image direction into one strong production prompt for Nano Banana image generation.",
    "Keep it practical for a vertical 4:5 Instagram post. Do not add fake offers, prices, logos, brand claims, or text overlays.",
    "Preserve the user's intent, but make it clearer, richer, and more useful for image generation.",
    "Use the selected reference image according to its Reference behavior.",
    "If Reference behavior is Trend Match: ask to match the same angle, pose, crop, outfit logic, hand placement, lighting, lens feel, and image structure closely while swapping in the selected model/product.",
    "If Reference behavior is Location DNA: keep the same actual location/zone and preserve flooring, ceiling, architecture, materials, lighting, reflections, scale, and signature elements, but ask for a fresh angle.",
    "If Reference behavior is Visual Vibe: use only mood, color, lens, lighting, editing style, and energy.",
    "If Reference behavior is Product Setup: copy product placement/composition logic.",
    "If Reference behavior is Pose / Outfit: copy pose, wardrobe feel, silhouette, and body language.",
    "Write in English because the image model follows English visual prompts better.",
    "Return only the enhanced prompt, 55-95 words, no title, no bullets.",
    "",
    `Client: ${text(payload.clientName) || "Not provided"}`,
    `Campaign: ${text(payload.campaignTitle) || "Content calendar"}`,
    `Content slot: ${text(payload.postLabel) || "Not provided"}`,
    `Selected style: ${text(payload.styleName) || text(payload.style) || "cinematic"}`,
    `Style behavior: ${text(payload.stylePrompt) || "Use the selected style strongly."}`,
    assetSummary("Product", payload.product),
    models.length ? models.map((asset, index) => assetSummary(`Model ${index + 1}`, asset)).join("\n") : "Models: not selected",
    assetSummary("Reference", payload.reference),
    `Reference behavior: ${referenceBehavior}`,
    "",
    `Team rough direction: ${text(payload.extraPrompt) || "No direction written yet. Create a useful premium production direction from the selected assets and style."}`,
  ].join("\n");
}

function imageInput(url: string | undefined) {
  const cleanUrl = text(url);
  return cleanUrl ? { type: "input_image", image_url: cleanUrl, detail: "auto" } : null;
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

  let payload: EnhancePromptPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (!account || !canUseContentCalendarAi(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const model = process.env.OPENAI_CAPTION_MODEL || "gpt-4o-mini";
  const imageInputs = [
    imageInput(payload.product?.url),
    imageInput(payload.reference?.url),
    ...(Array.isArray(payload.models) ? payload.models.slice(0, 2).map((asset) => imageInput(asset.url)) : []),
  ].filter(Boolean);

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
            { type: "input_text", text: buildEnhancerPrompt(payload) },
            ...imageInputs,
          ],
        },
      ],
      max_output_tokens: 180,
    }),
  });

  const data = await openaiRes.json().catch(() => null);
  if (!openaiRes.ok) {
    const error = data as { error?: { message?: string } } | null;
    return NextResponse.json({ error: error?.error?.message ?? "Could not enhance prompt" }, { status: 500 });
  }

  const prompt = extractOutputText(data);
  if (!prompt) {
    return NextResponse.json({ error: "AI returned an empty prompt" }, { status: 500 });
  }

  return NextResponse.json({ prompt });
}
