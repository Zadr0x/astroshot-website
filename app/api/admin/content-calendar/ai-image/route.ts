import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canUseContentCalendarAi } from "@/lib/access-control";
import { generateImageWithOpenAi, type OpenAiImageInput, type OpenAiImageOutput } from "@/lib/openai-image-generation";
import {
  AI_FACTORY_STORAGE_KEY,
  CONTENT_CALENDAR_BUCKET,
  DEFAULT_AI_IMAGE_SETTINGS,
  normalizeCalendarSlug,
  parseAiFactory,
  type AiImageSettings,
  type CalendarAiAsset,
} from "@/lib/content-calendar";

type GenerateImagePayload = {
  slug?: string;
  clientName?: string;
  campaignTitle?: string;
  postLabel?: string;
  product?: CalendarAiAsset;
  model?: CalendarAiAsset;
  models?: CalendarAiAsset[];
  reference?: CalendarAiAsset;
  customReferenceUrl?: string;
  customReferenceName?: string;
  currentPostImageUrl?: string;
  style?: string;
  styleName?: string;
  stylePrompt?: string;
  extraPrompt?: string;
};

type GeminiPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
  inlineData?: { mimeType: string; data: string };
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function assetLine(label: string, asset: CalendarAiAsset | undefined) {
  if (!asset?.url) return `${label}: not provided`;
  return [
    `${label}: ${asset.name || "Unnamed"}`,
    asset.notes ? `Notes: ${asset.notes}` : "",
  ].filter(Boolean).join("\n");
}

function styleInstruction(payload: GenerateImagePayload) {
  if (text(payload.stylePrompt)) {
    return [`Selected style: ${text(payload.styleName) || text(payload.style) || "Custom style"}.`, text(payload.stylePrompt)].join("\n");
  }
  return [
    "Selected style: Cinematic.",
    "Make it cinematic: controlled lighting, premium lensing, rich depth, atmospheric but clean commercial mood, strong subject separation, filmic composition, and high-end campaign quality.",
  ].join("\n");
}

function stripStaleLocationConstraints(value: string) {
  return value
    .replace(/\n?\s*Hard location constraint:[\s\S]*?(?:Do not use the exact reference image as a pasted background plate\.|$)/gi, "")
    .trim();
}

function currentLocationConstraint(reference: CalendarAiAsset | undefined, customReferenceName: string | undefined) {
  const name = text(reference?.name) || text(customReferenceName) || "the selected location reference";
  if (!text(reference?.name) && !text(customReferenceName)) return "";
  const isMallLocation = /avenues|mall|shopping/i.test(name);
  return [
    `Current location authority: use only the currently selected location reference (${name}) for the physical place.`,
    "Ignore any old or conflicting location names that may appear in the team direction.",
    isMallLocation ? "" : "Do not generate a mall, shopping center, indoor storefront corridor, mall ceiling, mall polished floor, or Avenues-style environment unless the currently selected location reference actually shows that.",
    "Preserve this selected location's recognizable floor, ceiling, architecture, wall/storefront/glass/material language, lighting color, reflections, scale, and signature elements.",
    "Create a fresh frame from the same place with a different camera position, lens feel, crop, perspective, and model/product placement. Do not use the exact reference image as a pasted background plate.",
  ].filter(Boolean).join(" ");
}

function behaviorPrompt(settings: AiImageSettings, behavior: CalendarAiAsset["referenceBehavior"] | undefined) {
  switch (behavior) {
    case "trend-match":
      return settings.trendMatchPrompt;
    case "visual-vibe":
      return settings.visualVibePrompt;
    case "product-setup":
      return settings.productSetupPrompt;
    case "pose-outfit":
      return settings.poseOutfitPrompt;
    case "location-dna":
    default:
      return settings.locationDnaPrompt;
  }
}

function buildPrompt(payload: GenerateImagePayload, imageSettings: AiImageSettings = DEFAULT_AI_IMAGE_SETTINGS) {
  const models = payload.models?.length ? payload.models : payload.model ? [payload.model] : [];
  const cleanedExtraPrompt = stripStaleLocationConstraints(text(payload.extraPrompt));
  const hasLocationReference = Boolean(text(payload.reference?.url || payload.customReferenceUrl));
  const referenceBehavior = payload.reference?.referenceBehavior ?? "location-dna";
  const isLocationDna = referenceBehavior === "location-dna";
  const isTrendMatch = referenceBehavior === "trend-match";
  return [
    imageSettings.motherPrompt,
    "Use the attached product sheet as the product identity reference.",
    models.length > 1
      ? "Use the attached model character sheets as the identity/style references for all selected people or characters. Compose them naturally together only if it fits the reference and team direction."
      : models.length === 1
        ? "Use the attached model character sheet as the identity/style reference for the person or character."
        : "No model character sheet is selected. Create a product-only commercial image unless the team direction explicitly asks for hands, people, or a character; if adding people without a model sheet, keep them secondary and do not invent a hero character.",
    hasLocationReference ? behaviorPrompt(imageSettings, referenceBehavior) : "No style/reference image is selected. Create an original premium commercial setting that fits the product, client, selected style, and team direction.",
    hasLocationReference && isTrendMatch ? "For Trend Match, prioritize the selected reference image's structure over generic creativity. Keep the reference's pose/composition/angle logic dominant." : "",
    "",
    "Output requirements:",
    "- Vertical Instagram post composition, 4:5 aspect ratio, designed for 1080x1350 feed usage.",
    "- Premium commercial advertising quality, realistic lighting, clean composition, no clutter.",
    "- Preserve product packaging details as accurately as possible.",
    "- Do not invent packaging. If the selected product sheet clearly shows only unpackaged food/product, show only the product with no package, no box, no bag, no wrapper, and no label. If packaging is visible in the product sheet, include only that exact packaging logic.",
    models.length
      ? "- Preserve the model/character identity, outfit logic, and proportions from the character sheet."
      : "- Product-only mode: make the product the hero. Do not add a main model, face, or character unless the team direction explicitly requests it.",
    hasLocationReference && isLocationDna ? "- Match the reference image's actual location elements while avoiding its exact layout, exact background frame, exact people, exact object placement, unrelated logos, or readable text." : "",
    hasLocationReference && isLocationDna ? "- Reinterpret the reference into a believable alternate angle or moment from the same physical environment, keeping the same floor, ceiling, lighting, materials, and signature features recognizable." : "",
    hasLocationReference && isTrendMatch ? "- Match the selected trend image layout closely. Do not change to a new angle or unrelated composition." : "",
    !hasLocationReference ? "- Since no style/reference image is selected, choose a clean premium setting that makes the product feel campaign-ready and avoids clutter." : "",
    "- No random text, no fake brand names, no extra products, no distorted hands or faces.",
    "- Leave clean negative space if the design could later need caption/offer text.",
    "",
    `Client: ${text(payload.clientName) || "Not provided"}`,
    `Campaign: ${text(payload.campaignTitle) || "Content calendar"}`,
    `Content slot: ${text(payload.postLabel) || "Not provided"}`,
    "",
    styleInstruction(payload),
    "",
    assetLine("Product sheet", payload.product),
    "",
    models.length
      ? models.map((asset, index) => assetLine(`Model character sheet ${index + 1}`, asset)).join("\n\n")
      : "Model character sheet: not provided",
    "",
    hasLocationReference && payload.reference?.url
      ? assetLine(`Style/reference image (${referenceBehavior})`, payload.reference)
      : hasLocationReference
        ? `Style/reference image: ${text(payload.customReferenceName) || "custom uploaded reference"}`
        : "Style/reference image: not selected",
    "",
    hasLocationReference && isLocationDna ? "Reference handling rule: preserve the same actual location and recognizable elements, then invent only a fresh composition. Same place and materials, different exact frame." : "",
    hasLocationReference && isLocationDna ? currentLocationConstraint(payload.reference, payload.customReferenceName) : "",
    "",
    cleanedExtraPrompt ? `Team direction: ${cleanedExtraPrompt}` : "",
  ].filter(Boolean).join("\n");
}

async function fetchImagePart(url: string, label: string): Promise<GeminiPart> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch ${label}`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error(`${label} must be an image`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    inline_data: {
      mime_type: contentType,
      data: buffer.toString("base64"),
    },
  };
}

function extractGeminiOutput(data: unknown) {
  const response = data as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
          inlineData?: { mimeType?: string; data?: string };
          inline_data?: { mime_type?: string; data?: string };
        }>;
      };
    }>;
  };

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const description = parts.map((part) => part.text).filter(Boolean).join("\n").trim();

  const inlineData = imagePart?.inlineData;
  const inlineDataSnake = imagePart?.inline_data;
  const inline = inlineData ?? inlineDataSnake;
  const dataBase64 = inline?.data;
  if (!dataBase64) return null;

  return {
    buffer: Buffer.from(dataBase64, "base64"),
    mimeType: inlineData?.mimeType ?? inlineDataSnake?.mime_type ?? "image/png",
    description,
  };
}

function toOpenAiImageInput(part: GeminiPart) {
  const inlineData = part.inlineData;
  const inlineDataSnake = part.inline_data;
  const inline = inlineData ?? inlineDataSnake;
  const dataBase64 = inline?.data;
  if (!dataBase64) return null;
  return {
    mimeType: inlineData?.mimeType ?? inlineDataSnake?.mime_type ?? "image/jpeg",
    dataBase64,
  };
}

function isOpenAiImageInput(value: OpenAiImageInput | null): value is OpenAiImageInput {
  return Boolean(value);
}

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request);
  if (response) return response;

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!geminiKey && !openAiKey) {
    return NextResponse.json({ error: "No image generation provider is configured" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
  }

  let payload: GenerateImagePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (!account || !canUseContentCalendarAi(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const productUrl = text(payload.product?.url);
  const selectedModels = payload.models?.length ? payload.models : payload.model ? [payload.model] : [];
  const modelUrls = selectedModels.map((asset) => text(asset.url)).filter(Boolean);
  const referenceUrl = text(payload.reference?.url || payload.customReferenceUrl);
  const referenceBehavior = payload.reference?.referenceBehavior ?? "location-dna";

  if (!productUrl) {
    return NextResponse.json({ error: "Select a product sheet first. Model and reference are optional." }, { status: 400 });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data: factoryData } = await client
    .from("site_content")
    .select("value")
    .eq("key", AI_FACTORY_STORAGE_KEY)
    .maybeSingle();
  const imageSettings = parseAiFactory(factoryData?.value).imageSettings;

  let imageParts: GeminiPart[];
  try {
    const productPart = await fetchImagePart(productUrl, "product sheet");
    const modelParts = await Promise.all(modelUrls.map((url, index) => fetchImagePart(url, `model character sheet ${index + 1}`)));
    const referencePart = referenceUrl ? await fetchImagePart(referenceUrl, "reference/location DNA image") : null;

    imageParts = [
      { text: "INPUT IMAGE A - PRODUCT SHEET. Preserve product identity and packaging/product logic from this image." },
      productPart,
      ...modelParts.flatMap((part, index) => [
        { text: `INPUT IMAGE ${String.fromCharCode(66 + index)} - MODEL CHARACTER SHEET ${index + 1}. Preserve identity, face, body proportions, and outfit logic from this image.` },
        part,
      ]),
      ...(referencePart
        ? [
            { text: `INPUT IMAGE R - CURRENTLY SELECTED STYLE/REFERENCE IMAGE: ${text(payload.reference?.name) || text(payload.customReferenceName) || "Custom style"}. Reference behavior mode: ${referenceBehavior}. Follow the matching reference behavior instructions from the prompt. If this is trend-match, copy the reference structure closely. If this is location-dna, preserve the same physical place while creating a fresh angle. If this is visual-vibe, use mood and visual language only.` },
            referencePart,
          ]
        : []),
    ];
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read input images" }, { status: 400 });
  }

  const prompt = buildPrompt(payload, imageSettings);
  let output: OpenAiImageOutput | ReturnType<typeof extractGeminiOutput> = null;
  let geminiError = "";
  if (geminiKey && process.env.PREFER_GEMINI_IMAGE === "1") {
    const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview";
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": geminiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...imageParts,
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "4:5",
            imageSize: "1K",
          },
        },
      }),
    });

    const geminiData = await geminiResponse.json().catch(() => null);
    if (geminiResponse.ok) {
      output = extractGeminiOutput(geminiData);
      if (!output) geminiError = "Gemini returned no image";
    } else {
      const error = geminiData as { error?: { message?: string } } | null;
      geminiError = error?.error?.message ?? "Could not generate image";
    }
  }

  if (!output && openAiKey) {
    try {
      output = await generateImageWithOpenAi({
        apiKey: openAiKey,
        prompt,
        images: imageParts.map(toOpenAiImageInput).filter(isOpenAiImageInput),
        action: "generate",
      });
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error
          ? `Gemini failed${geminiError ? `: ${geminiError}` : ""}. OpenAI fallback failed: ${error.message}`
          : "Could not generate image",
      }, { status: 500 });
    }
  }

  if (!output) {
    return NextResponse.json({ error: geminiError || "Could not generate image" }, { status: 500 });
  }

  await client.storage.createBucket(CONTENT_CALENDAR_BUCKET, { public: true });

  const extension = output.mimeType.includes("jpeg") || output.mimeType.includes("jpg") ? "jpg" : "png";
  const path = `${slug}/generated/${Date.now()}-${sanitizeFileName(payload.postLabel || "ai-image")}.${extension}`;
  const { error: uploadError } = await client.storage.from(CONTENT_CALENDAR_BUCKET).upload(path, output.buffer, {
    contentType: output.mimeType,
    upsert: true,
  });

  if (uploadError) {
    console.error("Generated image upload failed:", uploadError.message);
    return NextResponse.json({ error: "Generated image could not be saved" }, { status: 500 });
  }

  const { data: urlData } = client.storage.from(CONTENT_CALENDAR_BUCKET).getPublicUrl(path);
  return NextResponse.json({
    imageUrl: urlData.publicUrl,
    prompt,
    description: output.description,
  });
}
