import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function cleanMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const message = item as Partial<ChatMessage>;
      const role = message.role === "assistant" ? "assistant" : "user";
      const content = String(message.content ?? "").trim();
      return content ? { role, content } : null;
    })
    .filter((item): item is ChatMessage => Boolean(item))
    .slice(-12);
}

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ text?: string }>;
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
  const { response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  let payload: { messages?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages = cleanMessages(payload.messages);
  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Send a message first" }, { status: 400 });
  }

  const model = process.env.OPENAI_CHAT_MODEL || "gpt-5";
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
          role: "system",
          content: "You are Astroshot's AI assistant inside a creative production dashboard. Be concise, practical, and useful for content, video, image generation, marketing, and client work.",
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      max_output_tokens: 900,
    }),
  });

  const data = await openaiRes.json().catch(() => null);
  if (!openaiRes.ok) {
    const error = data as { error?: { message?: string } } | null;
    return NextResponse.json({ error: error?.error?.message ?? "Could not generate reply" }, { status: 500 });
  }

  const reply = extractOutputText(data);
  if (!reply) {
    return NextResponse.json({ error: "AI returned an empty reply" }, { status: 500 });
  }

  return NextResponse.json({ reply });
}
