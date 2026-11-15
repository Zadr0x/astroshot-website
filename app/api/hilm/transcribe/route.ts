import { jsonWithCors, optionsWithCors } from "@/lib/hilm-cors";

export const OPTIONS = optionsWithCors;

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return jsonWithCors({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const audio = formData?.get("audio");
  if (!(audio instanceof File)) {
    return jsonWithCors({ error: "Record audio first" }, { status: 400 });
  }

  const outbound = new FormData();
  outbound.append("file", audio, audio.name || "dream-recording.webm");
  outbound.append("model", process.env.HILM_TRANSCRIBE_MODEL || "whisper-1");
  outbound.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAiKey}` },
    body: outbound,
  });

  const data = await response.json().catch(() => null) as { text?: string; error?: { message?: string } } | null;
  if (!response.ok) {
    return jsonWithCors({ error: data?.error?.message || "Could not transcribe audio" }, { status: 500 });
  }

  return jsonWithCors({ text: data?.text || "" });
}
