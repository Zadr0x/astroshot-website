import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canUseContentCalendarAi } from "@/lib/access-control";
import { generateImageWithOpenAi, type OpenAiImageInput, type OpenAiImageOutput } from "@/lib/openai-image-generation";
import {
  CONTENT_CALENDAR_BUCKET,
  normalizeCalendarSlug,
} from "@/lib/content-calendar";

type EditImagePayload = {
  slug?: string;
  postLabel?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  editPrompt?: string;
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

async function fetchImagePart(url: string): Promise<GeminiPart> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not fetch source image");
  }

  const contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Source must be an image");
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
  const inline = imagePart?.inlineData ?? imagePart?.inline_data;
  const dataBase64 = inline?.data;
  if (!dataBase64) return null;

  return {
    buffer: Buffer.from(dataBase64, "base64"),
    mimeType: imagePart?.inlineData?.mimeType ?? imagePart?.inline_data?.mime_type ?? "image/png",
    description,
  };
}

function toOpenAiImageInput(part: GeminiPart | null) {
  const inlineData = part?.inlineData;
  const inlineDataSnake = part?.inline_data;
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

function buildEditPrompt(payload: EditImagePayload) {
  return [
    "You are editing the attached image. The requested edit is mandatory and must be visibly applied.",
    "Do not return the same image unchanged. If the user asks to make something smaller, larger, remove something, or change clothing, the final image must clearly show that exact change.",
    "Preserve the same composition, camera angle, location, lighting direction, lens feel, subject placement, perspective, and realism except where the requested edit requires a change.",
    "Apply only the requested edit; do not redesign the scene, change location, change crop, invent new products, add text, add logos, or alter unrelated details.",
    "If the edit asks to resize an object, identify that object and visibly change its scale. For 'make it smaller', reduce it significantly while keeping its perspective, contact points, shadows, reflections, and natural placement believable.",
    "If the edit asks to remove an item, remove it completely and reconstruct the background naturally.",
    "If the edit asks to change outfit, keep the same person, face, body proportions, pose, location, and lighting while changing only the outfit.",
    "Preserve image sharpness, realistic texture, clean edges, skin/product detail, and natural grain. Avoid softness, over-smoothing, plastic texture, compression artifacts, or painterly/low-resolution output.",
    "If an original clean source image is provided, use it as the detail and sharpness reference so repeated edits do not compound softness or compression.",
    "After editing, review the result mentally: the requested change must be obvious to a human comparing before and after.",
    "Keep output vertical 4:5 and premium realistic commercial quality at the highest available detail.",
    "",
    `Content slot: ${text(payload.postLabel) || "Content image"}`,
    `MANDATORY EDIT REQUEST: ${text(payload.editPrompt)}`,
  ].join("\n");
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

  let payload: EditImagePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (!account || !canUseContentCalendarAi(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const imageUrl = text(payload.imageUrl);
  const editPrompt = text(payload.editPrompt);
  if (!imageUrl || !editPrompt) {
    return NextResponse.json({ error: "Open an image and write what to edit first" }, { status: 400 });
  }

  let sourceImage: GeminiPart;
  let originalImage: GeminiPart | null = null;
  try {
    sourceImage = await fetchImagePart(imageUrl);
    const originalImageUrl = text(payload.originalImageUrl);
    if (originalImageUrl && originalImageUrl !== imageUrl) {
      originalImage = await fetchImagePart(originalImageUrl);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read source image" }, { status: 400 });
  }

  const prompt = buildEditPrompt(payload);
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
              { text: "INPUT IMAGE A - CURRENT IMAGE STATE TO EDIT. Use this for the visible scene state and apply the mandatory edit request visibly; do not output the source image unchanged." },
              sourceImage,
              ...(originalImage
                ? [
                    { text: "INPUT IMAGE B - ORIGINAL CLEAN QUALITY REFERENCE. Use this only to preserve sharp details, realistic texture, edges, faces/products, grain, and overall quality. Do not undo the current image state unless the mandatory edit requests it." },
                    originalImage,
                  ]
                : []),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "4:5",
            imageSize: "2K",
          },
        },
      }),
    });

    const geminiData = await geminiResponse.json().catch(() => null);
    if (geminiResponse.ok) {
      output = extractGeminiOutput(geminiData);
      if (!output) geminiError = "Gemini returned no edited image";
    } else {
      const error = geminiData as { error?: { message?: string } } | null;
      geminiError = error?.error?.message ?? "Could not edit image";
    }
  }

  if (!output && openAiKey) {
    try {
      output = await generateImageWithOpenAi({
        apiKey: openAiKey,
        prompt,
        images: [toOpenAiImageInput(sourceImage), toOpenAiImageInput(originalImage)].filter(isOpenAiImageInput),
        action: "edit",
      });
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error
          ? `Gemini failed${geminiError ? `: ${geminiError}` : ""}. OpenAI fallback failed: ${error.message}`
          : "Could not edit image",
      }, { status: 500 });
    }
  }

  if (!output) {
    return NextResponse.json({ error: geminiError || "Could not edit image" }, { status: 500 });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  await client.storage.createBucket(CONTENT_CALENDAR_BUCKET, { public: true });

  const extension = output.mimeType.includes("jpeg") || output.mimeType.includes("jpg") ? "jpg" : "png";
  const path = `${slug}/generated/edits/${Date.now()}-${sanitizeFileName(payload.postLabel || "ai-edit")}.${extension}`;
  const { error: uploadError } = await client.storage.from(CONTENT_CALENDAR_BUCKET).upload(path, output.buffer, {
    contentType: output.mimeType,
    upsert: true,
  });

  if (uploadError) {
    console.error("Edited image upload failed:", uploadError.message);
    return NextResponse.json({ error: "Edited image could not be saved" }, { status: 500 });
  }

  const { data: urlData } = client.storage.from(CONTENT_CALENDAR_BUCKET).getPublicUrl(path);
  return NextResponse.json({
    imageUrl: urlData.publicUrl,
    prompt,
    description: output.description,
  });
}
