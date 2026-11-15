import { jsonWithCors, optionsWithCors } from "@/lib/hilm-cors";
import { submitFalVideo } from "@/lib/fal-video";

export const OPTIONS = optionsWithCors;

function text(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  let payload: { prompt?: string; characterSheetUrl?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonWithCors({ error: "Invalid request" }, { status: 400 });
  }

  const prompt = text(payload.prompt);
  const characterSheetUrl = text(payload.characterSheetUrl);
  if (!prompt) {
    return jsonWithCors({ error: "Prompt is required" }, { status: 400 });
  }
  try {
    const result = await submitFalVideo({
      modelKey: characterSheetUrl ? "seedance-2-fast" : "seedance-2-fast-text",
      prompt,
      startImageUrl: characterSheetUrl,
      imageUrls: characterSheetUrl ? [characterSheetUrl] : [],
      duration: "auto",
      aspectRatio: "16:9",
      resolution: "720p",
    });

    return jsonWithCors(result);
  } catch (error) {
    return jsonWithCors({ error: error instanceof Error ? error.message : "Could not start video generation" }, { status: 500 });
  }
}
