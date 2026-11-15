import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";

type EnhanceVideoPromptPayload = {
  clientName?: string;
  campaignTitle?: string;
  postLabel?: string;
  modelLabel?: string;
  prompt?: string;
  duration?: string;
  aspectRatio?: string;
  hasStartImage?: boolean;
  imageCount?: number;
  hasEndImage?: boolean;
  hasReferenceVideo?: boolean;
  hasReferenceAudio?: boolean;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function buildEnhancerPrompt(payload: EnhanceVideoPromptPayload) {
  const modelLabel = text(payload.modelLabel);
  const isSeedance = /seedance/i.test(modelLabel);

  return [
    "You are Astroshot's professional AI video prompt engineer for cinematic commercial videos, social media ads, product films, fashion films, surreal comedy, luxury food ads, beauty campaigns, and realistic VFX-style short videos.",
    "Rewrite the team's rough video direction into a detailed final AI video prompt.",
    "Do not summarize or explain. Return only the final enhanced prompt.",
    "",
    isSeedance
      ? "Because the selected model is Seedance, use Astroshot's full Seedance 2 commercial prompt structure exactly."
      : "Use Astroshot's cinematic commercial prompt structure, but keep it compatible with the selected video model.",
    "",
    "Required structure:",
    "FORMAT:",
    "SUBJECT:",
    "CHARACTER / MODEL REFERENCE:",
    "PRODUCT REFERENCE:",
    "SCENE REFERENCE:",
    "WARDROBE:",
    "ENVIRONMENT:",
    "MOOD:",
    "MUSIC:",
    "COLOR LOGIC:",
    "STYLE:",
    "LOGIC RULE:",
    "CHARACTER:",
    "CAMERA:",
    "CINEMATIC TIMELINE:",
    "SOUND DESIGN:",
    "",
    "Writing principles:",
    "- One shot, one clear purpose.",
    "- Lock continuity early for character, product, wardrobe, scene, props, and lighting.",
    "- Use physical realism: condensation, fabric movement, reflections, crumbs, liquid viscosity, shadows, wind, camera vibration, realistic texture.",
    "- Use camera language, not vague adjectives.",
    "- Build it like a short ad edit with timestamps.",
    "- Keep the story simple but visually rich.",
    "- Repeat the product clearly: hero shot, macro detail, hand interaction, usage moment, final packshot when relevant.",
    "- For 15 seconds, usually use 8 to 12 shots. For shorter duration, use fewer shots.",
    "- Each shot must have a clear subject, one main action, camera angle/movement, and continuity note when needed.",
    isSeedance ? "- Seedance character handling: if character images are attached, frame them as synthetic AI-generated fictional commercial character references / digital actors, not real people." : "",
    isSeedance ? "- For Seedance, use @Image role labels clearly: @Image1 as synthetic character reference, @Image2 as wardrobe/product/style/location reference, etc. Keep the action simple and avoid over-describing facial identity." : "",
    "",
    "Camera language examples to use when useful: 85mm macro close-up, shallow depth of field, soft backlight, symmetrical framing, slow push-in, handheld fashion-commercial movement, low-angle hero shot, overhead macro insert, whip pan, orbit shot, tracking shot, natural handheld drift.",
    "",
    "Reference-role examples to follow when relevant:",
    "- @Image1 as first frame / primary product or character reference.",
    "- @Image2 as product detail reference.",
    "- @Image3 as scene/background/style reference.",
    "- @Video1 as camera movement, action choreography, motion rhythm, or effect reference.",
    "- @Audio1 as narration voice, pacing, BGM, or sound energy reference.",
    "",
    "Example commercial structures to imitate when useful:",
    "- Product macro film: hero product, macro texture insert, hand interaction, liquid/food/material motion, usage moment, final packshot.",
    "- Fashion/beauty film: model reference continuity, wardrobe lock, walking/turning/posing action, handheld editorial movement, clean final beauty frame.",
    "- Surreal comedy/VFX social ad: one simple visual joke, grounded physics, clear cause-and-effect, realistic shadows/reflections, final product reveal.",
    "- Reference-motion ad: keep the uploaded image subject/brand consistent while referencing only the motion rhythm/camera/effects from the video.",
    "",
    "Safe character-reference rule:",
    "If a person/model image is provided, write as if it is a synthetic AI-generated fictional commercial character reference / digital actor created for brand production.",
    "The prompt may ask for consistent fictional character design, wardrobe logic, hairstyle, silhouette, pose language, expression energy, body proportions, and commercial styling.",
    "Never write wording that sounds like copying a real person's exact identity, private identity, or celebrity identity.",
    "Do not use phrases like real person, private person, same face, exact likeness, clone, impersonate, recreate identity, preserve identity, or copy the person.",
    "Use wording like: CHARACTER / MODEL REFERENCE: @Image1 is a synthetic AI-generated fictional commercial character reference. Maintain consistent character design, hairstyle, wardrobe styling, body proportions, silhouette, pose energy, wardrobe logic, and fashion energy across shots. No real-person identity, celebrity resemblance, or impersonation.",
    "",
    "Reference handling:",
    `Reference images attached: ${Number(payload.imageCount ?? 0) > 0 ? `${Number(payload.imageCount)} image(s). Treat @Image1 as the first frame / visual continuity anchor when useful, and use the other images as product, character, scene, wardrobe, or style references according to the idea.` : "none."}`,
    `Start image attached: ${payload.hasStartImage ? "yes. Treat it as the first frame / visual continuity anchor." : "no."}`,
    `End image attached: ${payload.hasEndImage ? "yes. Treat it as the final frame / ending composition when the selected model supports it." : "no."}`,
    `Reference motion video attached: ${payload.hasReferenceVideo ? "yes. Reference its camera movement, action rhythm, or motion choreography only where compatible." : "no."}`,
    `Reference voice/audio attached: ${payload.hasReferenceAudio ? "yes. Reference its voice tone, rhythm, pacing, or sound energy only where compatible." : "no."}`,
    "",
    "Output requirements:",
    `The prompt should fit a ${text(payload.duration) || "short"} second video.`,
    text(payload.aspectRatio) ? `Respect ${text(payload.aspectRatio)} aspect ratio composition.` : "",
    "Write in English because video models follow English visual prompts better.",
    isSeedance ? "For Seedance, write the final result as a synthetic-character commercial direction: uploaded character refs are AI-generated digital actors; no celebrity, no public figure, no private person, no real-person identity, no face-swap wording." : "",
    "Do not use vague words like nice, beautiful, cool, amazing, or cinematic vibe unless paired with exact film language.",
    "Do not invent fake offers, prices, claims, logos, or on-screen text.",
    "Do not overload the timeline with too many unrelated actions.",
    "",
    `Client: ${text(payload.clientName) || "Not provided"}`,
    `Campaign: ${text(payload.campaignTitle) || "Content calendar"}`,
    `Content slot: ${text(payload.postLabel) || "Not provided"}`,
    `Video model: ${modelLabel || "Not provided"}`,
    `Duration: ${text(payload.duration) || "Not set"}`,
    `Aspect ratio: ${text(payload.aspectRatio) || "Not set"}`,
    "",
    `Team rough direction: ${text(payload.prompt) || "No direction written yet. Create a premium commercial motion direction from the available inputs."}`,
  ].join("\n");
}

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
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

  let payload: EnhanceVideoPromptPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const model = process.env.OPENAI_CAPTION_MODEL || "gpt-4o-mini";
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
          role: "user",
          content: [{ type: "input_text", text: buildEnhancerPrompt(payload) }],
        },
      ],
      max_output_tokens: 950,
    }),
  });

  const data = await openaiRes.json().catch(() => null);
  if (!openaiRes.ok) {
    const error = data as { error?: { message?: string } } | null;
    return NextResponse.json({ error: error?.error?.message ?? "Could not enhance video prompt" }, { status: 500 });
  }

  const prompt = extractOutputText(data);
  if (!prompt) {
    return NextResponse.json({ error: "AI returned an empty prompt" }, { status: 500 });
  }

  return NextResponse.json({ prompt });
}
