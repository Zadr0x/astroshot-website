import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";

type LocationBriefPayload = {
  clientName?: string;
  product?: string;
  idea?: string;
  description?: string;
  imageUrl?: string;
};

type GeminiPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

async function fetchImagePart(url: string): Promise<GeminiPart> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not fetch location image");
  }

  const contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Location reference must be an image");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    inline_data: {
      mime_type: contentType,
      data: buffer.toString("base64"),
    },
  };
}

function extractText(data: unknown) {
  const response = data as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return response.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n").trim() || "";
}

export async function POST(request: Request) {
  const { response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  let payload: LocationBriefPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const description = text(payload.description);
  const imageUrl = text(payload.imageUrl);
  if (!description && !imageUrl) {
    return NextResponse.json({ error: "Describe the location or upload a location image first." }, { status: 400 });
  }

  let imagePart: GeminiPart | null = null;
  try {
    imagePart = imageUrl ? await fetchImagePart(imageUrl) : null;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read location image" }, { status: 400 });
  }

  const prompt = [
    "Create a concise AI film location brief for a premium commercial production.",
    "The output must be practical for image generation, angle generation, and video generation continuity.",
    "",
    `Client: ${text(payload.clientName) || "Not provided"}`,
    `Product: ${text(payload.product) || "Not provided"}`,
    `Idea: ${text(payload.idea) || "Not provided"}`,
    description ? `User location direction: ${description}` : "",
    imagePart ? "A location reference image is attached. Read its architecture, materials, lighting, scale, color temperature, floor/ceiling/wall details, and camera opportunities." : "",
    "",
    "Return only this structure:",
    "LOCATION BRIEF:",
    "VISUAL DNA:",
    "LIGHTING:",
    "CAMERA OPPORTUNITIES:",
    "CONTINUITY RULES:",
    "IMAGE GENERATION PROMPT:",
  ].filter(Boolean).join("\n");

  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
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
            ...(imagePart ? [imagePart] : []),
          ],
        },
      ],
    }),
  });

  const data = await geminiResponse.json().catch(() => null);
  if (!geminiResponse.ok) {
    const error = data as { error?: { message?: string } } | null;
    return NextResponse.json({ error: error?.error?.message ?? "Could not generate location brief" }, { status: 500 });
  }

  const brief = extractText(data);
  if (!brief) {
    return NextResponse.json({ error: "Gemini returned no location brief" }, { status: 500 });
  }

  return NextResponse.json({ brief });
}
