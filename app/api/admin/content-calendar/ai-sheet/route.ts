import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canUseContentCalendarAi } from "@/lib/access-control";
import { generateImageWithOpenAi, type OpenAiImageInput, type OpenAiImageOutput } from "@/lib/openai-image-generation";
import {
  CONTENT_CALENDAR_BUCKET,
  normalizeCalendarSlug,
} from "@/lib/content-calendar";

type SheetKind = "product" | "character";

type GenerateSheetPayload = {
  slug?: string;
  kind?: SheetKind;
  name?: string;
  sourceUrls?: string[];
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

function buildPrompt(kind: SheetKind, name: string, imageCount: number) {
  if (kind === "product") {
    return [
      "Create one clean AI product reference sheet on a pure white background.",
      "Use the attached product photos as source references for the same product.",
      "The sheet must show the product from multiple useful angles: front, side, three-quarter angle, back/top/detail angle where relevant.",
      "Keep the product identity, shape, packaging, colors, label logic, material, proportions, and scale consistent across every angle.",
      "Arrange the views as a polished commercial product sheet/grid with soft studio shadow, crisp edges, and no environment.",
      "Do not invent new packaging, flavors, logos, text, accessories, hands, people, backgrounds, or extra products.",
      "If the source is food or an unpackaged item, show only that same item from multiple angles without adding packaging.",
      `Product name: ${name || "Unnamed product"}`,
      `Source images provided: ${imageCount}`,
    ].join("\n");
  }

  return [
    "Create one clean AI character/model reference sheet on a pure white background.",
    "Use the attached person/model image as visual continuity for a fictional commercial model reference.",
    "Generate a multi-angle sheet with exactly four clear views: two close-up face angles and two full-body angles.",
    "Close-up views: front face and three-quarter face. Full-body views: front standing and three-quarter/side standing.",
    "Preserve overall appearance, hairstyle, skin tone range, body proportions, fashion energy, and wardrobe styling from the source image.",
    "Keep the model consistent across all four views, with neutral studio lighting, no environment, no props, no text labels, and no extra people.",
    "Avoid celebrity/real-person identity claims. Treat the output as a fictional commercial model sheet guided by the uploaded visual reference.",
    `Character name: ${name || "Unnamed character"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request);
  if (response) return response;

  let payload: GenerateSheetPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (!account || !canUseContentCalendarAi(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const kind: SheetKind = payload.kind === "character" ? "character" : "product";
  const sourceUrls = Array.isArray(payload.sourceUrls) ? payload.sourceUrls.map(text).filter(Boolean) : [];
  if (kind === "product" && sourceUrls.length < 1) {
    return NextResponse.json({ error: "Upload at least one product image to generate a product sheet." }, { status: 400 });
  }
  if (kind === "character" && sourceUrls.length < 1) {
    return NextResponse.json({ error: "Upload one character image to generate a character sheet." }, { status: 400 });
  }

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

  let sourceParts: GeminiPart[];
  try {
    sourceParts = await Promise.all(sourceUrls.slice(0, kind === "product" ? 10 : 1).map((url, index) => fetchImagePart(url, `${kind} source ${index + 1}`)));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read source images" }, { status: 400 });
  }

  const name = text(payload.name) || (kind === "product" ? "Generated Product Sheet" : "Generated Character Sheet");
  const prompt = buildPrompt(kind, name, sourceParts.length);
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
              ...sourceParts.flatMap((part, index) => [
                { text: `INPUT IMAGE ${index + 1} - ${kind.toUpperCase()} SOURCE REFERENCE.` },
                part,
              ]),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: kind === "product" ? "1:1" : "4:5",
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
      geminiError = error?.error?.message ?? "Could not generate sheet";
    }
  }

  if (!output && openAiKey) {
    try {
      output = await generateImageWithOpenAi({
        apiKey: openAiKey,
        prompt,
        images: sourceParts.map(toOpenAiImageInput).filter(isOpenAiImageInput),
        action: "generate",
      });
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error
          ? `Gemini failed${geminiError ? `: ${geminiError}` : ""}. OpenAI fallback failed: ${error.message}`
          : "Could not generate sheet",
      }, { status: 500 });
    }
  }

  if (!output) {
    return NextResponse.json({ error: geminiError || "Could not generate sheet" }, { status: 500 });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  await client.storage.createBucket(CONTENT_CALENDAR_BUCKET, { public: true });

  const extension = output.mimeType.includes("jpeg") || output.mimeType.includes("jpg") ? "jpg" : "png";
  const path = `${slug}/ai-sheets/${Date.now()}-${sanitizeFileName(name || kind)}.${extension}`;
  const { error: uploadError } = await client.storage.from(CONTENT_CALENDAR_BUCKET).upload(path, output.buffer, {
    contentType: output.mimeType,
    upsert: true,
  });

  if (uploadError) {
    console.error("Generated sheet upload failed:", uploadError.message);
    return NextResponse.json({ error: "Generated sheet could not be saved" }, { status: 500 });
  }

  const { data: urlData } = client.storage.from(CONTENT_CALENDAR_BUCKET).getPublicUrl(path);
  return NextResponse.json({
    imageUrl: urlData.publicUrl,
    prompt,
    description: output.description,
  });
}
