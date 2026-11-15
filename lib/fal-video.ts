import { fal } from "@fal-ai/client";
import { createClient } from "@supabase/supabase-js";
import {
  CONTENT_CALENDAR_BUCKET,
  normalizeCalendarSlug,
} from "@/lib/content-calendar";

export type FalVideoModelKey =
  | "seedance-2-fast-text"
  | "seedance-2-fast"
  | "seedance-2-pro"
  | "kling-2-6"
  | "kling-3"
  | "kling-motion"
  | "veo-3"
  | "veo-3-1"
  | "google-omni";

export type FalVideoPayload = {
  slug?: string;
  postIndex?: number;
  postLabel?: string;
  clientName?: string;
  campaignTitle?: string;
  modelKey?: FalVideoModelKey;
  quality?: string;
  prompt?: string;
  videoPrompt?: string;
  negativePrompt?: string;
  startImageUrl?: string;
  imageUrls?: string[];
  elementImageUrls?: string[];
  endImageUrl?: string;
  referenceVideoUrl?: string;
  referenceAudioUrl?: string;
  duration?: string;
  aspectRatio?: string;
  resolution?: string;
  thumbnailUrl?: string;
  generateAudio?: boolean;
  shotMode?: "single" | "multi";
};

export type FalVideoSubmitResult = {
  endpointId: string;
  requestId: string;
  statusUrl: string;
  responseUrl: string;
  modelKey: FalVideoModelKey;
};

type FalVideoConfig = {
  label: string;
  endpoint: string | ((quality: string | undefined, payload: FalVideoPayload) => string);
  requiresStartImage?: boolean;
  supportsMultipleImages?: boolean;
  supportsEndImage?: boolean;
  supportsReferenceVideo?: boolean;
  requiresReferenceVideo?: boolean;
  supportsReferenceAudio?: boolean;
  supportsAspectRatio?: boolean;
  supportsResolution?: boolean;
  supportsNegativePrompt?: boolean;
  supportsAudio?: boolean;
  input: (payload: FalVideoPayload) => Record<string, unknown>;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function kling3Path(payload: FalVideoPayload) {
  const resolution = text(payload.resolution).toLowerCase();
  if (resolution === "4k") return "4k";
  if (resolution === "1080p") return "pro";
  return "standard";
}

function maybeNumber(value: string | undefined) {
  const clean = text(value);
  if (!clean || clean === "auto") return clean || undefined;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : clean;
}

function veoDuration(value: string | undefined) {
  const clean = text(value);
  if (["4", "6", "8"].includes(clean)) return `${clean}s`;
  if (["4s", "6s", "8s"].includes(clean)) return clean;
  return "8s";
}

function compactInput(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== "" && value !== null),
  );
}

function readableFalError(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => readableFalError(item, ""))
      .filter(Boolean)
      .join("; ") || fallback;
  }
  if (typeof value === "object") {
    const object = value as {
      msg?: unknown;
      message?: unknown;
      detail?: unknown;
      error?: unknown;
      loc?: unknown;
    };
    const message = object.msg ?? object.message ?? object.detail ?? object.error;
    const prefix = Array.isArray(object.loc) ? `${object.loc.join(".")}: ` : "";
    if (message) return `${prefix}${readableFalError(message, fallback)}`;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

function seedanceImageUrls(payload: FalVideoPayload) {
  const urls = Array.from(new Set([
    ...(Array.isArray(payload.imageUrls) ? payload.imageUrls : []),
    text(payload.startImageUrl),
  ].map(text).filter(Boolean))).slice(0, 9);

  return urls;
}

function seedanceSafePrompt(value: unknown) {
  let prompt = text(value)
    .replace(/\breal\s+person\b/gi, "fictional commercial model")
    .replace(/\bprivate\s+person\b/gi, "fictional commercial model")
    .replace(/\bcelebrity\b/gi, "fictional commercial talent")
    .replace(/\bimpersonat(e|ing|ion)\b/gi, "use fictional commercial styling")
    .replace(/\bcopy\s+(the\s+)?(person|face|identity)\b/gi, "keep broad visual continuity")
    .replace(/\bclone\s+(the\s+)?(person|face|identity)\b/gi, "keep broad visual continuity")
    .replace(/\brecreate\s+(the\s+)?(person|face|identity)\b/gi, "keep broad visual continuity")
    .replace(/\bexact\s+(same\s+)?(person|face|identity|likeness)\b/gi, "consistent fictional commercial model look")
    .replace(/\bsame\s+(person|face|identity|likeness)\b/gi, "consistent fictional commercial model look")
    .replace(/\bpreserve\s+(the\s+)?(person's\s+)?identity\b/gi, "preserve non-identifying visual continuity")
    .replace(/\bmatch\s+(the\s+)?(person's\s+)?identity\b/gi, "match non-identifying visual continuity")
    .replace(/\buse\s+(the\s+)?(person's\s+)?identity\b/gi, "use non-identifying visual continuity");

  const policyGuard = [
    "SEEDANCE SYNTHETIC CHARACTER POLICY CONTEXT:",
    "All attached human character images are synthetic AI-generated fictional commercial characters / digital actors created for licensed brand production.",
    "Use @Image character references to maintain consistent fictional character design, wardrobe logic, hairstyle, silhouette, pose language, expression energy, body proportions, and commercial styling.",
    "Do not identify, name, impersonate, clone, or recreate any real person, celebrity, public figure, or private identity.",
    "Avoid describing the request as a face swap, real-person likeness recreation, celebrity resemblance, or private-person identity match.",
  ].join("\n");

  return `${policyGuard}\n\n${prompt}`;
}

function kling3Elements(payload: FalVideoPayload) {
  const urls = Array.from(new Set((Array.isArray(payload.elementImageUrls) ? payload.elementImageUrls : []).map(text).filter(Boolean))).slice(0, 4);
  return urls.map((url) => ({ frontal_image_url: url, reference_image_urls: [] }));
}

function configureFalClient(falKey: string) {
  fal.config({ credentials: falKey });
}

export const FAL_VIDEO_MODELS: Record<FalVideoModelKey, FalVideoConfig> = {
  "seedance-2-fast-text": {
    label: "Seedance 2 Fast Text",
    endpoint: "bytedance/seedance-2.0/fast/text-to-video",
    supportsResolution: true,
    supportsAspectRatio: true,
    input: (payload) => compactInput({
      prompt: seedanceSafePrompt(payload.prompt),
      resolution: text(payload.resolution) || "720p",
      duration: text(payload.duration) || "auto",
      aspect_ratio: text(payload.aspectRatio) || "9:16",
    }),
  },
  "seedance-2-fast": {
    label: "Seedance 2 Fast",
    endpoint: "bytedance/seedance-2.0/fast/image-to-video",
    requiresStartImage: true,
    supportsMultipleImages: true,
    supportsReferenceVideo: true,
    supportsReferenceAudio: true,
    supportsResolution: true,
    input: (payload) => compactInput({
      prompt: seedanceSafePrompt(payload.prompt),
      image_url: seedanceImageUrls(payload)[0],
      image_urls: seedanceImageUrls(payload),
      video_url: text(payload.referenceVideoUrl),
      audio_url: text(payload.referenceAudioUrl),
      resolution: text(payload.resolution) || "720p",
      duration: text(payload.duration) || "auto",
      aspect_ratio: text(payload.aspectRatio) || "auto",
    }),
  },
  "seedance-2-pro": {
    label: "Seedance 2 Pro",
    endpoint: "bytedance/seedance-2.0/image-to-video",
    requiresStartImage: true,
    supportsMultipleImages: true,
    supportsReferenceVideo: true,
    supportsReferenceAudio: true,
    supportsResolution: true,
    input: (payload) => compactInput({
      prompt: seedanceSafePrompt(payload.prompt),
      image_url: seedanceImageUrls(payload)[0],
      image_urls: seedanceImageUrls(payload),
      video_url: text(payload.referenceVideoUrl),
      audio_url: text(payload.referenceAudioUrl),
      resolution: text(payload.resolution) || "720p",
      duration: text(payload.duration) || "auto",
      aspect_ratio: text(payload.aspectRatio) || "auto",
    }),
  },
  "kling-2-6": {
    label: "Kling 2.6",
    endpoint: "fal-ai/kling-video/v2.6/pro/image-to-video",
    requiresStartImage: true,
    supportsEndImage: true,
    supportsResolution: true,
    supportsNegativePrompt: true,
    supportsAudio: true,
    input: (payload) => compactInput({
      prompt: text(payload.prompt),
      start_image_url: text(payload.startImageUrl),
      end_image_url: text(payload.endImageUrl),
      duration: maybeNumber(payload.duration) || "5",
      negative_prompt: text(payload.negativePrompt),
      generate_audio: Boolean(payload.generateAudio),
    }),
  },
  "kling-3": {
    label: "Kling 3",
    endpoint: (_quality, payload) => `fal-ai/kling-video/v3/${kling3Path(payload)}/image-to-video`,
    requiresStartImage: true,
    supportsEndImage: true,
    supportsAspectRatio: true,
    supportsResolution: true,
    supportsNegativePrompt: true,
    supportsAudio: true,
    input: (payload) => compactInput({
      prompt: text(payload.prompt),
      start_image_url: text(payload.startImageUrl),
      end_image_url: text(payload.endImageUrl),
      duration: maybeNumber(payload.duration) || "5",
      aspect_ratio: text(payload.aspectRatio) || "9:16",
      elements: kling3Elements(payload).length ? kling3Elements(payload) : undefined,
      shot_type: payload.shotMode === "multi" ? "intelligent" : undefined,
      negative_prompt: text(payload.negativePrompt),
      generate_audio: Boolean(payload.generateAudio),
    }),
  },
  "kling-motion": {
    label: "Kling Motion Control",
    endpoint: "fal-ai/kling-video/motion-control",
    requiresStartImage: true,
    supportsReferenceVideo: true,
    requiresReferenceVideo: true,
    supportsResolution: true,
    supportsNegativePrompt: true,
    input: (payload) => compactInput({
      prompt: text(payload.prompt),
      image_url: text(payload.startImageUrl),
      video_url: text(payload.referenceVideoUrl),
      duration: maybeNumber(payload.duration) || "5",
      resolution: text(payload.resolution) || "720p",
      negative_prompt: text(payload.negativePrompt),
    }),
  },
  "veo-3": {
    label: "Veo 3",
    endpoint: "fal-ai/veo3/image-to-video",
    requiresStartImage: true,
    supportsAspectRatio: true,
    input: (payload) => compactInput({
      prompt: text(payload.prompt),
      image_url: text(payload.startImageUrl),
      duration: veoDuration(payload.duration),
      aspect_ratio: text(payload.aspectRatio) || "9:16",
      resolution: text(payload.resolution) || "720p",
    }),
  },
  "veo-3-1": {
    label: "Veo 3.1",
    endpoint: (quality) => text(quality).toLowerCase() === "fast"
      ? "fal-ai/veo3.1/fast/image-to-video"
      : "fal-ai/veo3.1/image-to-video",
    requiresStartImage: true,
    supportsAspectRatio: true,
    input: (payload) => compactInput({
      prompt: text(payload.prompt),
      image_url: text(payload.startImageUrl),
      duration: veoDuration(payload.duration),
      aspect_ratio: text(payload.aspectRatio) || "9:16",
      resolution: text(payload.resolution) || "720p",
    }),
  },
  "google-omni": {
    label: "Google Omni",
    endpoint: "",
    input: () => ({}),
  },
};

export function getFalKey() {
  return process.env.FAL_KEY || process.env.FAL_API_KEY || process.env.FAL_AI_API_KEY;
}

export function getFalVideoConfig(modelKey: string | undefined) {
  const key = (modelKey || "seedance-2-fast") as FalVideoModelKey;
  return {
    key,
    config: FAL_VIDEO_MODELS[key],
  };
}

export function getFalEndpoint(config: FalVideoConfig, payload: FalVideoPayload) {
  return typeof config.endpoint === "function" ? config.endpoint(payload.quality, payload) : config.endpoint;
}

export function validateFalVideoPayload(payload: FalVideoPayload, config: FalVideoConfig, endpoint: string) {
  if (!endpoint) {
    return `${config.label} is not available through the configured fal.ai endpoints yet.`;
  }
  if (!text(payload.prompt)) {
    return "Write a video prompt first.";
  }
  if (config.requiresStartImage && config.supportsMultipleImages && seedanceImageUrls(payload).length === 0) {
    return `${config.label} needs at least one reference image.`;
  }
  if (config.requiresStartImage && !config.supportsMultipleImages && !text(payload.startImageUrl)) {
    return `${config.label} needs a start image.`;
  }
  if (config.requiresReferenceVideo && !text(payload.referenceVideoUrl)) {
    return `${config.label} needs a reference motion video.`;
  }
  return "";
}

export async function submitFalVideo(payload: FalVideoPayload): Promise<FalVideoSubmitResult> {
  const falKey = getFalKey();
  if (!falKey) {
    throw new Error("FAL_KEY is not configured");
  }
  configureFalClient(falKey);

  const { key, config } = getFalVideoConfig(payload.modelKey);
  if (!config) {
    throw new Error("Unsupported video model");
  }

  const endpointId = getFalEndpoint(config, payload);
  const validationError = validateFalVideoPayload(payload, config, endpointId);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const data = await fal.queue.submit(endpointId, {
      input: config.input(payload),
    });

    return {
      endpointId,
      requestId: data.request_id,
      statusUrl: data.status_url,
      responseUrl: data.response_url,
      modelKey: key,
    };
  } catch (error) {
    const value = error as { body?: unknown; detail?: unknown; message?: unknown; error?: unknown };
    throw new Error(readableFalError(value.body ?? value.detail ?? value.message ?? value.error ?? error, "Could not start fal video generation"));
  }
}

export async function getFalStatus(endpointId: string, requestId: string, _statusUrl?: string) {
  const falKey = getFalKey();
  if (!falKey) {
    throw new Error("FAL_KEY is not configured");
  }
  configureFalClient(falKey);

  try {
    const status = await fal.queue.status(endpointId, {
      requestId,
      logs: true,
    });
    return status as { status?: string; response_url?: string; logs?: Array<{ message?: string }> };
  } catch (error) {
    const value = error as { body?: unknown; detail?: unknown; message?: unknown; error?: unknown };
    throw new Error(readableFalError(value.body ?? value.detail ?? value.message ?? value.error ?? error, "Could not read fal video status"));
  }
}

export async function getFalResult(endpointId: string, requestId: string, _responseUrl?: string) {
  const falKey = getFalKey();
  if (!falKey) {
    throw new Error("FAL_KEY is not configured");
  }
  configureFalClient(falKey);

  try {
    const result = await fal.queue.result(endpointId, { requestId });
    return result.data;
  } catch (error) {
    const value = error as { body?: unknown; detail?: unknown; message?: unknown; error?: unknown };
    throw new Error(readableFalError(value.body ?? value.detail ?? value.message ?? value.error ?? error, "Could not read fal video result"));
  }
}

export function extractFalVideoUrl(data: unknown): string {
  const value = data as {
    video?: { url?: string };
    videos?: Array<{ url?: string }>;
    output?: { url?: string } | Array<{ url?: string }>;
    url?: string;
  };

  if (value.video?.url) return value.video.url;
  if (value.videos?.[0]?.url) return value.videos[0].url;
  if (Array.isArray(value.output) && value.output[0]?.url) return value.output[0].url;
  if (!Array.isArray(value.output) && value.output?.url) return value.output.url;
  if (value.url) return value.url;
  return "";
}

export async function uploadGeneratedVideoToSupabase(options: {
  slug?: string;
  postLabel?: string;
  videoUrl: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Storage is not configured");
  }

  const videoResponse = await fetch(options.videoUrl);
  if (!videoResponse.ok) {
    throw new Error("Could not fetch generated video");
  }

  const contentType = videoResponse.headers.get("content-type")?.split(";")[0] || "video/mp4";
  const buffer = Buffer.from(await videoResponse.arrayBuffer());
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  await client.storage.createBucket(CONTENT_CALENDAR_BUCKET, { public: true });

  const slug = normalizeCalendarSlug(options.slug ?? "content-calendar") || "content-calendar";
  const label = sanitizeFileName(options.postLabel || "ai-video");
  const path = `${slug}/generated-videos/${Date.now()}-${label}.mp4`;
  const { error } = await client.storage.from(CONTENT_CALENDAR_BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(CONTENT_CALENDAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
