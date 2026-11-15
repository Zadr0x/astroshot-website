import { jsonWithCors, optionsWithCors } from "@/lib/hilm-cors";

export const OPTIONS = optionsWithCors;

function text(value: unknown) {
  return String(value ?? "").trim();
}

function fallbackAnalysis(dream: string) {
  return {
    summary: `This dream seems to carry a strong personal image: ${dream.slice(0, 120)}`,
    mood: "Reflective, emotional, curious",
    symbols: ["Night", "Movement", "Memory"],
    themes: ["Change", "Identity", "Desire"],
    insight: "The dream may be pointing toward something you are processing quietly rather than directly.",
  };
}

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return jsonWithCors({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  let payload: { dream?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonWithCors({ error: "Invalid request" }, { status: 400 });
  }

  const dream = text(payload.dream);
  if (dream.length < 8) {
    return jsonWithCors({ error: "Write the dream first" }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.HILM_OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.45,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "Analyze dreams in a simple, non-clinical, reflective way.",
            "Do not diagnose. Do not claim certainty.",
            "Return JSON only with keys: summary, mood, symbols, themes, insight.",
            "symbols and themes must be arrays of 3 short strings each.",
          ].join("\n"),
        },
        { role: "user", content: dream },
      ],
    }),
  });

  const data = await response.json().catch(() => null) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  } | null;

  if (!response.ok) {
    return jsonWithCors({ error: data?.error?.message || "Could not analyze dream" }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}") as {
      summary?: unknown;
      mood?: unknown;
      symbols?: unknown;
      themes?: unknown;
      insight?: unknown;
    };
    return jsonWithCors({
      analysis: {
        summary: text(parsed.summary) || fallbackAnalysis(dream).summary,
        mood: text(parsed.mood) || fallbackAnalysis(dream).mood,
        symbols: Array.isArray(parsed.symbols) ? parsed.symbols.map(text).filter(Boolean).slice(0, 3) : fallbackAnalysis(dream).symbols,
        themes: Array.isArray(parsed.themes) ? parsed.themes.map(text).filter(Boolean).slice(0, 3) : fallbackAnalysis(dream).themes,
        insight: text(parsed.insight) || fallbackAnalysis(dream).insight,
      },
    });
  } catch {
    return jsonWithCors({ analysis: fallbackAnalysis(dream) });
  }
}
