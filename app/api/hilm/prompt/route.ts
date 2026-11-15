import { jsonWithCors, optionsWithCors } from "@/lib/hilm-cors";

export const OPTIONS = optionsWithCors;

function text(value: unknown) {
  return String(value ?? "").trim();
}

function fallbackPrompt(dream: string, hasSelfie: boolean) {
  return [
    "Create a 15-second 16:9 dream film in surreal cinematic realism.",
    hasSelfie
      ? "Use the attached synthetic character sheet as a fictional dream avatar reference. Maintain broad character continuity through hairstyle, wardrobe feeling, silhouette, and expression energy, without naming, identifying, impersonating, cloning, or recreating a real person."
      : "Use a distant fictional dreamer silhouette with no identifiable real-person likeness.",
    `Dream story: ${dream}`,
    "Structure: 0-3s grounded sleep-memory opening, 3-8s impossible dream transformation, 8-13s emotional reveal, 13-15s clean final poster-like frame.",
    "Camera: slow floating push-in, gentle parallax, soft handheld drift, elegant transitions.",
    "Style: night blue palette, moonlight, polished social-video pacing, no horror, no distorted faces, no readable text, no gore.",
  ].join("\n");
}

function finalSeedancePrompt(options: {
  dream: string;
  hasSelfie: boolean;
  visualDirection: string;
  time: string;
  mood: string;
}) {
  const timeDirection = options.time === "day"
    ? "Lighting/time: daytime dream atmosphere, visible sky, soft natural daylight, clear details."
    : "Lighting/time: nighttime dream atmosphere, moonlight, deep blue shadows, glowing highlights.";
  const lookDirection = options.time === "day"
    ? "Look: luminous daytime surreal realism, soft natural color, polished premium social-video pacing."
    : "Look: black-and-blue night palette, moonlit surreal realism, polished premium social-video pacing.";
  const moodDirection = {
    happy: "Mood: happy, hopeful, warm, playful, emotionally uplifting.",
    sad: "Mood: sad, poetic, quiet, melancholic, emotionally gentle.",
    scary: "Mood: scary and mysterious, tense surreal atmosphere, but no gore, no graphic horror, no disturbing faces.",
    normal: "Mood: normal dreamlike realism, calm, cinematic, balanced emotion.",
  }[options.mood] || "Mood: normal dreamlike realism, calm, cinematic, balanced emotion.";

  return [
    "Create a 15-second 16:9 Seedance 2 Fast dream film.",
    options.hasSelfie
      ? "Use the attached image only as a synthetic fictional dream-avatar character sheet. Maintain broad non-identifying continuity through hairstyle, wardrobe feeling, silhouette, expression energy, and body language. Do not identify, name, clone, impersonate, face-swap, match exact likeness, or recreate any real/private person."
      : "Use a distant fictional dreamer silhouette with no identifiable real-person likeness.",
    `Dream source: ${options.dream}`,
    timeDirection,
    moodDirection,
    `Visual direction: ${options.visualDirection}`,
    "Timing: 0-3s grounded memory opening, 3-8s impossible dream transformation, 8-13s emotional reveal, 13-15s clean final poster-like frame.",
    "Camera: slow floating push-in, soft parallax, elegant drifting movement, cinematic transitions.",
    lookDirection,
    "Avoid: horror, gore, distorted faces, readable text, celebrity resemblance, private-person identity matching, face cloning, face swap language, or exact likeness recreation.",
  ].join("\n");
}

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY;

  let payload: { dream?: string; hasSelfie?: boolean; settings?: { time?: string; mood?: string } };
  try {
    payload = await request.json();
  } catch {
    return jsonWithCors({ error: "Invalid request" }, { status: 400 });
  }

  const dream = text(payload.dream);
  if (dream.length < 8) {
    return jsonWithCors({ error: "Write the dream first" }, { status: 400 });
  }

  if (!openAiKey) {
    return jsonWithCors({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const system = [
    "You are the prompt writer for Dream, a minimal dream-to-video app.",
    "Write one safe Seedance 2 Fast image-to-video prompt for a 15-second 16:9 video.",
    "Important safety: if an image reference/character sheet exists, never ask to recreate, clone, impersonate, identify, match the exact real person, or preserve real identity.",
    "Instead, describe it as a synthetic/fictional dream avatar reference and ask for broad non-identifying visual continuity: hairstyle, wardrobe feeling, silhouette, expression energy, and body language.",
    "Avoid celebrity, private person, real person, face swap, exact likeness, identity match, and lookalike wording.",
    "Honor the user's time and mood settings clearly in lighting, color, weather, pacing, and emotional tone.",
    "Keep it cinematic, emotional, simple, and directly usable as a video prompt.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.HILM_OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            `Dream: ${dream}`,
            `Time setting: ${text(payload.settings?.time) || "night"}`,
            `Mood setting: ${text(payload.settings?.mood) || "normal"}`,
            `Image reference/character sheet will be attached: ${payload.hasSelfie ? "yes" : "no"}`,
            "Return only the final video prompt. No headings.",
          ].join("\n"),
        },
      ],
    }),
  });

  const data = await response.json().catch(() => null) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  } | null;

  if (!response.ok) {
    return jsonWithCors({ error: data?.error?.message || "Could not write prompt" }, { status: 500 });
  }

  const visualDirection = text(data?.choices?.[0]?.message?.content) || fallbackPrompt(dream, Boolean(payload.hasSelfie));
  const prompt = finalSeedancePrompt({
    dream,
    hasSelfie: Boolean(payload.hasSelfie),
    visualDirection,
    time: text(payload.settings?.time) || "night",
    mood: text(payload.settings?.mood) || "normal",
  });
  return jsonWithCors({ prompt });
}
