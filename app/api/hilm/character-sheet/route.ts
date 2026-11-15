import { createClient } from "@supabase/supabase-js";
import { CONTENT_CALENDAR_BUCKET } from "@/lib/content-calendar";
import { jsonWithCors, optionsWithCors } from "@/lib/hilm-cors";

export const OPTIONS = optionsWithCors;

type GeminiPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
  inlineData?: { mimeType: string; data: string };
};

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
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
  const inline = imagePart?.inlineData ?? imagePart?.inline_data;
  if (!inline?.data) return null;

  return {
    buffer: Buffer.from(inline.data, "base64"),
    mimeType: imagePart?.inlineData?.mimeType ?? imagePart?.inline_data?.mime_type ?? "image/png",
  };
}

export async function POST(request: Request) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) {
    return jsonWithCors({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonWithCors({ error: "Storage is not configured" }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const selfie = formData?.get("selfie");
  if (!(selfie instanceof File) || !selfie.type.startsWith("image/")) {
    return jsonWithCors({ error: "Upload an image reference first" }, { status: 400 });
  }

  const buffer = Buffer.from(await selfie.arrayBuffer());
  const imagePart: GeminiPart = {
    inline_data: {
      mime_type: selfie.type,
      data: buffer.toString("base64"),
    },
  };

  const prompt = [
    "Create a clean character sheet from this image reference for a fictional dream-video avatar.",
    "The output must look like a synthetic commercial character reference, not a request to identify or impersonate a private person.",
    "Preserve broad non-identifying visual cues only: general hairstyle, wardrobe color feeling, expression energy, and silhouette.",
    "Do not add text labels. Do not create a celebrity or exact real-person clone.",
    "Show one full-body pose, one waist-up pose, and one close portrait in a polished blue-black dream lighting style.",
    "Square character sheet, premium cinematic quality, clean background, usable as an image-to-video reference.",
  ].join("\n");

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
            imagePart,
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    }),
  });

  const geminiData = await geminiResponse.json().catch(() => null);
  if (!geminiResponse.ok) {
    const error = geminiData as { error?: { message?: string } } | null;
    return jsonWithCors({ error: error?.error?.message || "Could not create character sheet" }, { status: 500 });
  }

  const output = extractGeminiOutput(geminiData);
  if (!output) {
    return jsonWithCors({ error: "Gemini returned no character sheet" }, { status: 500 });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  await client.storage.createBucket(CONTENT_CALENDAR_BUCKET, { public: true });

  const extension = output.mimeType.includes("jpeg") || output.mimeType.includes("jpg") ? "jpg" : "png";
  const path = `dream/character-sheets/${Date.now()}-${sanitizeFileName(selfie.name || "selfie")}.${extension}`;
  const { error } = await client.storage.from(CONTENT_CALENDAR_BUCKET).upload(path, output.buffer, {
    contentType: output.mimeType,
    upsert: true,
  });
  if (error) {
    return jsonWithCors({ error: error.message }, { status: 500 });
  }

  const { data } = client.storage.from(CONTENT_CALENDAR_BUCKET).getPublicUrl(path);
  return jsonWithCors({ characterSheetUrl: data.publicUrl, prompt });
}
