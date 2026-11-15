import { NextResponse } from "next/server";

const TTS_MODEL = "gemini-3.1-flash-tts-preview";
const ALLOWED_VOICES = new Set(["Kore", "Puck", "Zephyr", "Aoede", "Sulafat", "Achird"]);

function wavFromPcm(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
  }

  let payload: { script?: string; voice?: string; tone?: string; brand?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const script = payload.script?.trim();
  if (!script) {
    return NextResponse.json({ error: "Write a script first." }, { status: 400 });
  }

  const voice = ALLOWED_VOICES.has(payload.voice ?? "") ? payload.voice : "Kore";
  const tone = payload.tone?.trim() || "Formal";
  const brandLine = payload.brand?.trim() ? `Brand: ${payload.brand.trim()}.` : "";
  const text = [
    `Say in a ${tone.toLowerCase()} commercial voice.`,
    brandLine,
    "Keep pronunciation clear and premium. Read the script exactly unless tone guidance requires small pauses.",
    script,
  ].filter(Boolean).join("\n");

  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
      model: TTS_MODEL,
    }),
  });

  if (!geminiResponse.ok) {
    const data = await geminiResponse.json().catch(() => ({}));
    return NextResponse.json({ error: data?.error?.message ?? "Could not generate voice." }, { status: 500 });
  }

  const data = await geminiResponse.json();
  const audioBase64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) {
    return NextResponse.json({ error: "Gemini did not return audio." }, { status: 500 });
  }

  const pcm = Buffer.from(audioBase64, "base64");
  const wav = wavFromPcm(pcm);

  return NextResponse.json({
    audio: `data:audio/wav;base64,${wav.toString("base64")}`,
    voice,
  });
}
