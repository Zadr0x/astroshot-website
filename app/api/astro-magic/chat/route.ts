import { NextResponse } from "next/server";

const CHAT_MODEL = "gemini-2.5-flash";

type IncomingMessage = {
  role?: string;
  content?: string;
};

function cleanMessages(messages: IncomingMessage[]) {
  return messages
    .filter((message) => (message.role === "user" || message.role === "assistant") && message.content?.trim())
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content!.trim().slice(0, 4000) }],
    }));
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
  }

  let payload: { messages?: IncomingMessage[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const contents = cleanMessages(Array.isArray(payload.messages) ? payload.messages : []);
  if (contents.length === 0 || contents[contents.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Send a message first." }, { status: 400 });
  }

  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: [
            "You are Astro Magic's creative AI assistant inside a premium AI production product by Astroshot.",
            "Help users create image prompts, video prompts, voice-over scripts, captions, and content calendar ideas.",
            "Keep answers concise, practical, and production-ready. Use Astroshot's premium cinematic style.",
            "When useful, give a clean prompt the user can paste directly into Astro Magic.",
          ].join(" "),
        }],
      },
      contents,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 700,
      },
    }),
  });

  if (!geminiResponse.ok) {
    const data = await geminiResponse.json().catch(() => ({}));
    return NextResponse.json({ error: data?.error?.message ?? "Chat failed." }, { status: 500 });
  }

  const data = await geminiResponse.json();
  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!reply) {
    return NextResponse.json({ error: "Gemini did not return a reply." }, { status: 500 });
  }

  return NextResponse.json({ reply });
}
