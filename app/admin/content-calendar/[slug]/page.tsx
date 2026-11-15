"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_STYLE_CATEGORY,
  STYLE_CATEGORIES,
  createCalendarHighlight,
  createCalendarPost,
  createCalendarStory,
  emptyContentCalendar,
  type AiVideoJob,
  type CalendarAiAsset,
  type CalendarAiAssetType,
  type CalendarAiContext,
  type CalendarGeneratedAsset,
  type CalendarGeneratedAssetSource,
  type CalendarHighlight,
  type CalendarMediaType,
  type CalendarCarouselItem,
  type CalendarPost,
  type CalendarPostStatus,
  type CalendarStory,
  type ContentCalendar,
  type StyleCategoryId,
} from "@/lib/content-calendar";

type UploadTarget =
  | { type: "logo" }
  | { type: "highlight"; index: number }
  | { type: "post"; index: number }
  | { type: "story"; index: number }
  | { type: "thumbnail"; index: number };

type AiImageModalState = {
  postIndex: number;
  productId: string;
  modelIds: string[];
  referenceId: string;
  customReferenceUrl: string;
  customReferenceName: string;
  style: string;
  extraPrompt: string;
};

type AiPickerType = "product" | "model" | "reference";

type ProductSheetModalState = {
  source: "library" | "picker";
  name: string;
  files: File[];
};

type BulkGenerateSettings = {
  palette: string;
  mode: "Random" | "Studio Product" | "Travel" | "House" | "Local";
  vibe: "Modern" | "Funky" | "Traditional" | "Minimal" | "Retro" | "90s" | "Creative";
  modelIds: string[];
  outfit: string;
};

type AiVideoModelKey =
  | "seedance-2-fast"
  | "seedance-2-pro"
  | "kling-2-6"
  | "kling-3"
  | "kling-motion"
  | "veo-3"
  | "veo-3-1"
  | "google-omni";

type AiVideoModalState = {
  postIndex: number;
  modelKey: AiVideoModelKey;
  quality: string;
  resolution: string;
  duration: string;
  aspectRatio: string;
  shotMode: "single" | "multi";
  modelIds: string[];
  referenceIds: string[];
  startImageUrl: string;
  imageUrls: string[];
  endImageUrl: string;
  referenceVideoUrl: string;
  referenceAudioUrl: string;
  prompt: string;
  negativePrompt: string;
  generateAudio: boolean;
};

type ImagePreviewState = {
  assetId?: string;
  url: string;
  originalUrl: string;
  name: string;
  postIndex: number;
  mediaType: CalendarMediaType;
};

type GalleryItem = CalendarGeneratedAsset & {
  postIndex: number;
  postLabel: string;
  isCurrent?: boolean;
};

type CalendarHistoryItem = {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  summary: string;
  clientName: string;
  postCount: number;
  approvedCount: number;
  needsEditsCount: number;
  videoCount: number;
};

type ImageEditModalState = {
  postIndex: number;
  url: string;
  originalUrl: string;
  name: string;
  instruction: string;
};

type UploadResponse = {
  provider?: "supabase" | "cloudflare-r2" | "upload-relay";
  bucket: string;
  path: string;
  token?: string;
  signedUrl?: string;
  file: {
    url: string;
    type: string;
  };
};

type UploadSignedFileOptions = {
  onProgress?: (progress: number) => void;
};

type AiVideoStatusResponse = {
  status?: string;
  videoUrl?: string;
  logs?: Array<{ message?: string }>;
  job?: AiVideoJob | null;
};

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]";
const areaClass = `${fieldClass} min-h-28 resize-y leading-relaxed`;
const labelClass = "mb-2 block text-[11px] font-semibold text-white/45";
const panelClass = "admin-glass-panel rounded-3xl border border-white/10 p-4 sm:p-5";
const iconButtonClass = "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

const statusLabels: Record<CalendarPostStatus, string> = {
  draft: "Draft",
  ready: "Ready for client",
  approved: "Approved",
  needs_edits: "Needs edits",
  posted: "Posted",
};
const statusOptions = Object.entries(statusLabels) as Array<[CalendarPostStatus, string]>;

const bulkModeOptions: BulkGenerateSettings["mode"][] = ["Random", "Studio Product", "Travel", "House", "Local"];
const bulkVibeOptions: BulkGenerateSettings["vibe"][] = ["Modern", "Funky", "Traditional", "Minimal", "Retro", "90s", "Creative"];
const paletteOptions = ["Yellow + Red", "Black + Green", "Cream + Brown", "Blue + Silver", "Pink + Orange"];
const videoDurationOptions = ["auto", "3", "4", "5", "6", "7", "8", "10", "12", "15"];
const videoAspectOptions = ["auto", "9:16", "16:9", "1:1", "4:3", "3:4", "21:9"];
const videoResolutionOptions = ["480p", "720p", "1080p"];

const videoModelOptions: Array<{
  key: AiVideoModelKey;
  label: string;
  supportsEndImage?: boolean;
  supportsMultipleImages?: boolean;
  supportsReferenceVideo?: boolean;
  supportsReferenceAudio?: boolean;
  supportsAspectRatio?: boolean;
  supportsResolution?: boolean;
  supportsNegativePrompt?: boolean;
  supportsAudio?: boolean;
  supportsShotMode?: boolean;
  disabled?: boolean;
}> = [
  { key: "seedance-2-fast", label: "Seedance 2 Fast", supportsMultipleImages: true, supportsReferenceVideo: true, supportsReferenceAudio: true, supportsAspectRatio: true, supportsResolution: true },
  { key: "seedance-2-pro", label: "Seedance 2 Pro", supportsMultipleImages: true, supportsReferenceVideo: true, supportsReferenceAudio: true, supportsAspectRatio: true, supportsResolution: true },
  { key: "kling-2-6", label: "Kling 2.6", supportsEndImage: true, supportsResolution: true, supportsNegativePrompt: true, supportsAudio: true },
  { key: "kling-3", label: "Kling 3", supportsEndImage: true, supportsAspectRatio: true, supportsResolution: true, supportsNegativePrompt: true, supportsAudio: true, supportsShotMode: true },
  { key: "kling-motion", label: "Kling Motion Control", supportsReferenceVideo: true, supportsResolution: true, supportsNegativePrompt: true },
  { key: "veo-3", label: "Veo 3", supportsAspectRatio: true, supportsResolution: true },
  { key: "veo-3-1", label: "Veo 3.1", supportsAspectRatio: true, supportsResolution: true },
  { key: "google-omni", label: "Google Omni", disabled: true },
];

function defaultBulkGenerateSettings(): BulkGenerateSettings {
  return {
    palette: "",
    mode: "Random",
    vibe: "Modern",
    modelIds: [],
    outfit: "",
  };
}

function videoModelInfo(modelKey: AiVideoModelKey) {
  return videoModelOptions.find((option) => option.key === modelKey) ?? videoModelOptions[0];
}

function videoResolutionChoices(modelKey: AiVideoModelKey) {
  if (modelKey.startsWith("seedance")) return ["480p", "720p", "1080p"];
  if (modelKey === "kling-3") return ["720p", "1080p", "4k"];
  if (modelKey === "kling-2-6") return ["1080p"];
  if (modelKey === "kling-motion") return ["720p", "1080p"];
  if (modelKey === "veo-3" || modelKey === "veo-3-1") return ["720p", "1080p"];
  return videoResolutionOptions;
}

function normalizedVideoResolution(modelKey: AiVideoModelKey, resolution: string) {
  const choices = videoResolutionChoices(modelKey);
  return choices.includes(resolution) ? resolution : choices[0];
}

function videoAssetLimit(modelKey: AiVideoModelKey, type: "model" | "reference", manualImageCount = 0) {
  if (modelKey.startsWith("seedance")) {
    return Math.max(0, 9 - manualImageCount);
  }
  if (modelKey === "kling-3") {
    return type === "model" ? 4 : 1;
  }
  return type === "model" ? 1 : 1;
}

function videoAssetLimitHint(modelKey: AiVideoModelKey) {
  if (modelKey.startsWith("seedance")) return "Seedance accepts up to 9 image references total. AI characters are sent as synthetic fictional character references.";
  if (modelKey === "kling-3") return "Kling 3 accepts up to 4 character/object elements, plus one start/reference image.";
  if (modelKey === "kling-motion") return "Motion Control accepts one character/reference image plus one motion video.";
  return "This model accepts one start image. Choose one character or one reference image.";
}

function readableUiError(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => readableUiError(item, ""))
      .filter(Boolean)
      .join("; ") || fallback;
  }
  if (typeof value === "object") {
    const object = value as {
      error?: unknown;
      message?: unknown;
      detail?: unknown;
      msg?: unknown;
      loc?: unknown;
    };
    const message = object.error ?? object.message ?? object.detail ?? object.msg;
    const prefix = Array.isArray(object.loc) ? `${object.loc.join(".")}: ` : "";
    if (message) return `${prefix}${readableUiError(message, fallback)}`;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

function defaultAiVideoModalState(postIndex: number, post?: CalendarPost): AiVideoModalState {
  const startImageUrl = post?.mediaType === "image" ? post.mediaUrl : post?.thumbnailUrl ?? "";
  return {
    postIndex,
    modelKey: "seedance-2-fast",
    quality: "standard",
    resolution: "720p",
    duration: "5",
    aspectRatio: "9:16",
    shotMode: "single",
    modelIds: [],
    referenceIds: [],
    startImageUrl,
    imageUrls: startImageUrl ? [startImageUrl] : [],
    endImageUrl: "",
    referenceVideoUrl: "",
    referenceAudioUrl: "",
    prompt: "",
    negativePrompt: "blur, distort, low quality, warped hands, broken product shape, unreadable label",
    generateAudio: false,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const referenceStyleOptions = [
  { value: "auto", label: "Auto match" },
  { value: "fnb", label: "F&B / burgers / sandwiches" },
  { value: "bakery", label: "Bakery / cafe" },
  { value: "finance", label: "Finance / professional" },
  { value: "influencer", label: "Influencer / storytelling" },
  { value: "mixed", label: "Mixed Kuwaiti corpus" },
];

function applyPost(calendar: ContentCalendar, index: number, patch: Partial<CalendarPost>) {
  const posts = [...calendar.posts];
  while (posts.length <= index) {
    posts.push(createCalendarPost(posts.length));
  }
  posts[index] = { ...posts[index], ...patch };
  return { ...calendar, posts };
}

function applyStory(calendar: ContentCalendar, index: number, patch: Partial<CalendarStory>) {
  const stories = [...calendar.stories];
  while (stories.length <= index) {
    stories.push(createCalendarStory(stories.length));
  }
  stories[index] = { ...stories[index], ...patch };
  return { ...calendar, stories };
}

function applyHighlight(calendar: ContentCalendar, index: number, patch: Partial<CalendarHighlight>) {
  const highlights = [...calendar.highlights];
  while (highlights.length <= index) {
    highlights.push(createCalendarHighlight(highlights.length));
  }
  highlights[index] = { ...highlights[index], ...patch };
  return { ...calendar, highlights };
}

function addHighlight(calendar: ContentCalendar) {
  return { ...calendar, highlights: [...calendar.highlights, createCalendarHighlight(calendar.highlights.length)] };
}

function removeHighlight(calendar: ContentCalendar, index: number) {
  return { ...calendar, highlights: calendar.highlights.filter((_, highlightIndex) => highlightIndex !== index) };
}

function createGeneratedAsset(options: {
  url: string;
  originalUrl?: string;
  thumbnailUrl?: string;
  mediaType: CalendarMediaType;
  prompt?: string;
  source: CalendarGeneratedAssetSource;
}): CalendarGeneratedAsset {
  return {
    id: `generated-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url: options.url,
    originalUrl: options.originalUrl || options.url,
    thumbnailUrl: options.thumbnailUrl || "",
    mediaType: options.mediaType,
    prompt: options.prompt || "",
    source: options.source,
    createdAt: new Date().toISOString(),
  };
}

function mediaAssetFromPost(post: CalendarPost | undefined, source: CalendarGeneratedAssetSource = "restore"): CalendarGeneratedAsset | null {
  if (!post?.mediaUrl) return null;
  return {
    id: post.activeGeneratedMediaId || `current-${post.id}-${post.mediaUrl}`,
    url: post.mediaUrl,
    originalUrl: post.originalMediaUrl || post.mediaUrl,
    thumbnailUrl: post.thumbnailUrl || "",
    mediaType: post.mediaType,
    prompt: post.aiPrompt || "",
    source,
    createdAt: new Date().toISOString(),
  };
}

function uniqueMediaAssets(items: Array<CalendarGeneratedAsset | null | undefined>) {
  const seen = new Set<string>();
  return items.filter((item): item is CalendarGeneratedAsset => {
    if (!item?.url) return false;
    const key = item.id || item.url;
    if (seen.has(key) || seen.has(item.url)) return false;
    seen.add(key);
    seen.add(item.url);
    return true;
  });
}

function mediaTimeline(post: CalendarPost | undefined) {
  const saved = uniqueMediaAssets(post?.generatedMedia ?? []);
  const activeInSaved = Boolean(post?.activeGeneratedMediaId && saved.some((item) => item.id === post.activeGeneratedMediaId))
    || Boolean(post?.mediaUrl && saved.some((item) => item.url === post.mediaUrl));
  if (activeInSaved) return saved;
  return uniqueMediaAssets([mediaAssetFromPost(post), ...saved]);
}

function nextGeneratedMediaList(post: CalendarPost | undefined, active: CalendarGeneratedAsset) {
  return uniqueMediaAssets([active, ...mediaTimeline(post)]);
}

function activeTimelineIndex(post: CalendarPost | undefined, timeline = mediaTimeline(post)) {
  if (timeline.length === 0) return -1;
  const byId = post?.activeGeneratedMediaId ? timeline.findIndex((item) => item.id === post.activeGeneratedMediaId) : -1;
  if (byId >= 0) return byId;
  const byUrl = post?.mediaUrl ? timeline.findIndex((item) => item.url === post.mediaUrl) : -1;
  return byUrl >= 0 ? byUrl : 0;
}

function timelineNeighbor(post: CalendarPost | undefined, direction: -1 | 1) {
  const timeline = mediaTimeline(post).slice(0, 11);
  const activeIndex = activeTimelineIndex(post, timeline);
  if (activeIndex < 0) return null;
  return timeline[activeIndex + direction] ?? null;
}

function isSameMediaAsset(asset: Pick<CalendarGeneratedAsset, "id" | "url">, target: Pick<CalendarGeneratedAsset, "id" | "url">) {
  return Boolean((target.id && asset.id === target.id) || (target.url && asset.url === target.url));
}

function galleryPreviewUrl(item: Pick<CalendarGeneratedAsset, "url" | "thumbnailUrl" | "mediaType">) {
  return item.mediaType === "video" ? item.thumbnailUrl || item.url : item.url;
}

function mediaTypeFromFile(file: File): CalendarCarouselItem["mediaType"] {
  return file.type.startsWith("video/") ? "video" : "image";
}

function carouselPreviewUrl(item: CalendarCarouselItem | undefined) {
  if (!item) return "";
  return item.mediaType === "video" ? item.thumbnailUrl || item.url : item.url;
}

function createCarouselItem(url: string, options?: { originalUrl?: string; thumbnailUrl?: string; mediaType?: CalendarCarouselItem["mediaType"] }): CalendarCarouselItem {
  return {
    id: `carousel-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url,
    originalUrl: options?.originalUrl || url,
    thumbnailUrl: options?.thumbnailUrl || "",
    mediaType: options?.mediaType || "image",
    createdAt: new Date().toISOString(),
  };
}

function carouselItemsFromPost(post: CalendarPost | undefined) {
  if (!post) return [];
  if (post.mediaType === "carousel" && post.carouselItems.length > 0) return post.carouselItems;
  if (post.mediaUrl) {
    const mediaType = post.mediaType === "carousel"
      ? post.previousMediaType === "video" ? "video" : "image"
      : post.mediaType;
    return [createCarouselItem(post.mediaUrl, {
      originalUrl: post.originalMediaUrl || post.mediaUrl,
      thumbnailUrl: post.thumbnailUrl,
      mediaType,
    })];
  }
  return [];
}

function displayPostLabel(index: number) {
  return `Content ${index + 1}`;
}

function displayStoryLabel(index: number) {
  return `Story ${index + 1}`;
}

function calendarMonthTitle(campaignTitle: string) {
  return campaignTitle.replace(/content\s+calendar/gi, "").replace(/\s+/g, " ").trim() || "Calendar";
}

function formatClientSubmittedAt(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuwait",
  }).format(date);
}

function safeFileName(name: string, mediaType: CalendarMediaType) {
  const extension = mediaType === "video" ? "mp4" : "jpg";
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `astroshot-${mediaType}`}.${extension}`;
}

function addUploading(setter: Dispatch<SetStateAction<string[]>>, id: string) {
  setter((current) => Array.from(new Set([...current, id])));
}

function removeUploading(setter: Dispatch<SetStateAction<string[]>>, id: string) {
  setter((current) => current.filter((item) => item !== id));
}

function relabelCalendarPosts(posts: CalendarPost[]) {
  return posts.map((post, index) => ({ ...post, label: displayPostLabel(index) }));
}

function reorderCalendarPosts(posts: CalendarPost[], fromIndex: number, toIndex: number) {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= posts.length || toIndex >= posts.length || fromIndex === toIndex) return posts;
  const next = [...posts];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return relabelCalendarPosts(next);
}

function selectedAssetName(asset: CalendarAiAsset | undefined, fallback: string) {
  return asset?.name || fallback;
}

function statusTone(status: CalendarPostStatus) {
  if (status === "approved") return "border-[#01F17C]/25 bg-[#01F17C]/10 text-[#01F17C]";
  if (status === "posted") return "border-[#0A84FF]/25 bg-[#0A84FF]/10 text-[#4da3ff]";
  if (status === "ready") return "border-blue-300/20 bg-blue-300/10 text-blue-200";
  if (status === "needs_edits") return "border-amber-300/20 bg-amber-300/10 text-amber-200";
  return "border-white/10 bg-white/[0.04] text-white/45";
}

function statusDot(status: CalendarPostStatus) {
  if (status === "approved") return "bg-[#01F17C]";
  if (status === "posted") return "bg-[#0A84FF]";
  if (status === "ready") return "bg-blue-300";
  if (status === "needs_edits") return "bg-amber-300";
  return "bg-white/30";
}

type IconName = "eye" | "sparkle" | "undo" | "redo" | "trash" | "image" | "video" | "caption" | "x" | "download" | "edit" | "replace" | "settings" | "save" | "plus" | "gallery" | "more";

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    sparkle: (
      <>
        <path d="M12 2l1.7 5.1L19 9l-5.3 1.9L12 16l-1.7-5.1L5 9l5.3-1.9L12 2Z" />
        <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      </>
    ),
    undo: <path d="M9 14 4 9l5-5M5 9h9a6 6 0 0 1 0 12h-2" />,
    redo: <path d="m15 14 5-5-5-5M19 9h-9a6 6 0 0 0 0 12h2" />,
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 16h10l1-16" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8" cy="10" r="1.5" />
        <path d="M21 16l-5-5L5 19" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="M16 10l5-3v10l-5-3" />
      </>
    ),
    caption: (
      <>
        <path d="M12 3l1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3Z" />
        <path d="M5 15h14M7 19h10" />
      </>
    ),
    x: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4l11-11-4-4L4 16v4Z" />
        <path d="m14 6 4 4" />
      </>
    ),
    replace: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 12h8" />
        <path d="m13 9 3 3-3 3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .3 1.7 1.7 0 0 0-.6 1.4V22h-4v-.2a1.7 1.7 0 0 0-.6-1.4 1.7 1.7 0 0 0-2-.3l-.2.1-2-3.4.1-.1A1.7 1.7 0 0 0 6.6 15a1.7 1.7 0 0 0-1.3-1.1H5v-4h.3a1.7 1.7 0 0 0 1.3-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 2-.3A1.7 1.7 0 0 0 11 1.8V2h4v-.2a1.7 1.7 0 0 0 .6 1.4 1.7 1.7 0 0 0 2 .3l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.3 1.1h.3v4h-.3a1.7 1.7 0 0 0-1.3 1.1Z" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l2 2v16H5V3Z" />
        <path d="M8 3v6h8V3" />
        <path d="M8 21v-7h8v7" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    gallery: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="m7 16 3.5-4 3 3 2-2.5L19 16" />
        <circle cx="9" cy="9" r="1" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function MediaActionButton({ title, onClick, disabled, tone = "default", icon }: { title: string; onClick: () => void; disabled?: boolean; tone?: "default" | "green" | "danger"; icon: IconName }) {
  const toneClass = tone === "green"
    ? "border-[#01F17C]/35 bg-[#01F17C]/15 text-[#01F17C] hover:bg-[#01F17C]/25"
    : tone === "danger"
      ? "border-red-400/25 bg-red-500/15 text-red-200 hover:bg-red-500/25"
      : "border-white/15 bg-black/55 text-white/75 hover:bg-black/75 hover:text-white";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`flex h-7 w-full items-center justify-center rounded-lg border backdrop-blur transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${toneClass}`}
    >
      <Icon name={icon} className="h-3 w-3" />
    </button>
  );
}

function MediaUploadAction({
  title,
  accept = "image/*",
  disabled,
  uploading,
  onChange,
}: {
  title: string;
  accept?: string;
  disabled?: boolean;
  uploading?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      title={title}
      aria-label={title}
      className={`flex h-7 w-full items-center justify-center rounded-lg border border-[#01F17C]/35 bg-[#01F17C]/15 text-[#01F17C] backdrop-blur transition-colors hover:bg-[#01F17C]/25 ${disabled ? "pointer-events-none cursor-not-allowed opacity-35" : "cursor-pointer"}`}
    >
      {uploading ? <span className="h-3 w-3 animate-spin rounded-full border border-[#01F17C]/25 border-t-[#01F17C]" /> : <Icon name="gallery" className="h-3 w-3" />}
      <input className="hidden" type="file" accept={accept} multiple disabled={disabled} onChange={onChange} />
    </label>
  );
}

const CALENDAR_UPLOAD_MAX_BYTES = 500 * 1024 * 1024;
const VIDEO_THUMBNAIL_TIMEOUT_MS = 8000;

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)}MB`;
}

function uploadStatusLabel(progress?: number, fallback = "Uploading...") {
  return typeof progress === "number" ? `Uploading ${progress}%` : fallback;
}

function uploadViaSignedUrl(signedUrl: string, file: File, options?: UploadSignedFileOptions) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUrl);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options?.onProgress) return;
      options.onProgress(Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100))));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        options?.onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(request.responseText || `Upload failed with ${request.status}`));
    };
    request.onerror = () => reject(new Error("Upload failed. Check the connection and try again."));
    request.onabort = () => reject(new Error("Upload was cancelled."));
    request.send(file);
  });
}

function captureVideoThumbnail(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    let settled = false;
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const finish = (thumbnail: File | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };

    const timeout = window.setTimeout(() => finish(null), VIDEO_THUMBNAIL_TIMEOUT_MS);

    video.onerror = () => {
      finish(null);
    };

    video.onloadedmetadata = () => {
      try {
        video.currentTime = Math.min(0.2, video.duration || 0);
      } catch {
        finish(null);
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1080;
        const context = canvas.getContext("2d");
        if (!context) {
          finish(null);
          return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) {
            finish(null);
            return;
          }
          finish(new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-thumbnail.jpg`, { type: "image/jpeg" }));
        }, "image/jpeg", 0.82);
      } catch {
        finish(null);
      }
    };
  });
}

export default function ContentCalendarAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "lil-orbit";
  const [calendar, setCalendar] = useState<ContentCalendar>(() => emptyContentCalendar(slug));
  const [contentMode, setContentMode] = useState<"posts" | "stories">("posts");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [uploading, setUploading] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [generatingCaption, setGeneratingCaption] = useState<number | null>(null);
  const [aiImageModal, setAiImageModal] = useState<AiImageModalState | null>(null);
  const [aiVideoModal, setAiVideoModal] = useState<AiVideoModalState | null>(null);
  const [aiPicker, setAiPicker] = useState<AiPickerType | null>(null);
  const [stylePickerCategory, setStylePickerCategory] = useState<StyleCategoryId>(DEFAULT_STYLE_CATEGORY);
  const [productSheetModal, setProductSheetModal] = useState<ProductSheetModalState | null>(null);
  const [bulkGenerateModal, setBulkGenerateModal] = useState<BulkGenerateSettings | null>(null);
  const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
  const [generatingVideoIndex, setGeneratingVideoIndex] = useState<number | null>(null);
  const [bulkGeneratingImageIndexes, setBulkGeneratingImageIndexes] = useState<number[]>([]);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [revealingImageIndex, setRevealingImageIndex] = useState<number | null>(null);
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [enhancingVideoPrompt, setEnhancingVideoPrompt] = useState(false);
  const [generatingSheet, setGeneratingSheet] = useState<"product" | "character" | null>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const [imageEditModal, setImageEditModal] = useState<ImageEditModalState | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<CalendarHistoryItem[]>([]);
  const [restoringHistoryId, setRestoringHistoryId] = useState("");
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [captionBriefOpen, setCaptionBriefOpen] = useState(false);
  const [productAssetsOpen, setProductAssetsOpen] = useState(false);
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const [openCardMenuIndex, setOpenCardMenuIndex] = useState<number | null>(null);
  const [draggingPostIndex, setDraggingPostIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<ContentCalendar[]>([]);
  const [redoStack, setRedoStack] = useState<ContentCalendar[]>([]);
  const isHistoryNavigation = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasLoadedCalendar, setHasLoadedCalendar] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCalendar = useRef(calendar);
  const lastSavedCalendarJson = useRef("");
  const hasLoadedCalendarRef = useRef(false);
  const sessionToken = useRef("");
  const pendingAdminOrderChange = useRef(false);
  const resumingVideoJobs = useRef<Set<string>>(new Set());
  const handledMagicLink = useRef("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }
      sessionToken.current = session.access_token;

      const res = await fetch(`/api/admin/content-calendar/${slug}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setError("Could not load content calendar.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { calendar: ContentCalendar };
      setCalendar(data.calendar);
      latestCalendar.current = data.calendar;
      lastSavedCalendarJson.current = JSON.stringify(data.calendar);
      hasLoadedCalendarRef.current = true;
      setHasLoadedCalendar(true);
      setLoading(false);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
    }

    load();
  }, [router, slug]);

  useEffect(() => {
    if (!hasLoadedCalendar || isHistoryNavigation.current) {
      latestCalendar.current = calendar;
      isHistoryNavigation.current = false;
      return;
    }
    const previous = latestCalendar.current;
    if (JSON.stringify(previous) === JSON.stringify(calendar)) return;
    setUndoStack((current) => [previous, ...current].slice(0, 40));
    setRedoStack([]);
    latestCalendar.current = calendar;
  }, [calendar, hasLoadedCalendar]);

  useEffect(() => {
    const hasOpenModal = Boolean(aiImageModal || aiVideoModal || aiPicker || productSheetModal || bulkGenerateModal || imagePreview || imageEditModal || galleryOpen || historyOpen);
    document.documentElement.classList.toggle("admin-modal-open", hasOpenModal);
    document.body.classList.toggle("admin-modal-open", hasOpenModal);
    return () => {
      document.documentElement.classList.remove("admin-modal-open");
      document.body.classList.remove("admin-modal-open");
    };
  }, [aiImageModal, aiPicker, aiVideoModal, bulkGenerateModal, galleryOpen, historyOpen, imageEditModal, imagePreview, productSheetModal]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const persistCalendar = useCallback(async (calendarToSave: ContentCalendar, options?: { silent?: boolean }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (!options?.silent) router.push("/admin/login");
      return false;
    }
    sessionToken.current = session.access_token;

    if (!options?.silent) {
      setSaving(true);
      setError("");
      setSaveState("");
    } else {
      setSaveState("Autosaving...");
    }

    const savedCalendarJson = JSON.stringify(calendarToSave);
    const adminOrderChanged = pendingAdminOrderChange.current;
    const res = await fetch(`/api/admin/content-calendar/${calendarToSave.slug}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ calendar: calendarToSave, adminOrderChanged }),
    });

    if (!options?.silent) setSaving(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save calendar");
      return false;
    }

    const data = (await res.json()) as { calendar: ContentCalendar; conflictWarning?: string };
    const hasNewerLocalChanges = JSON.stringify(latestCalendar.current) !== savedCalendarJson;
    if (!hasNewerLocalChanges) {
      latestCalendar.current = data.calendar;
      lastSavedCalendarJson.current = JSON.stringify(data.calendar);
      pendingAdminOrderChange.current = false;
      setCalendar(data.calendar);
      setSaveState(data.conflictWarning || (options?.silent ? "Autosaved." : "Saved. Preview is updated."));
    } else if (!options?.silent) {
      setSaveState("Saved. New local edits are still pending autosave.");
    }
    return true;
  }, [router]);

  const loadHistory = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    setHistoryLoading(true);
    setError("");
    const res = await fetch(`/api/admin/content-calendar/${calendar.slug}/history`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setHistoryLoading(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not load version history");
      return;
    }

    const data = (await res.json()) as { snapshots: CalendarHistoryItem[] };
    setHistoryItems(data.snapshots);
  }, [calendar.slug, router]);

  const openHistory = () => {
    setHistoryOpen(true);
    loadHistory();
  };

  const undoCalendarChange = () => {
    const previous = undoStack[0];
    if (!previous) return;
    isHistoryNavigation.current = true;
    setRedoStack((current) => [calendar, ...current].slice(0, 40));
    setUndoStack((current) => current.slice(1));
    setCalendar(previous);
    latestCalendar.current = previous;
    setSaveState("Undo applied. Autosaving...");
  };

  const redoCalendarChange = () => {
    const next = redoStack[0];
    if (!next) return;
    isHistoryNavigation.current = true;
    setUndoStack((current) => [calendar, ...current].slice(0, 40));
    setRedoStack((current) => current.slice(1));
    setCalendar(next);
    latestCalendar.current = next;
    setSaveState("Redo applied. Autosaving...");
  };

  const restoreHistorySnapshot = async (snapshotId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    setRestoringHistoryId(snapshotId);
    setError("");
    const res = await fetch(`/api/admin/content-calendar/${calendar.slug}/history`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ snapshotId }),
    });
    setRestoringHistoryId("");

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not restore snapshot");
      return;
    }

    const data = (await res.json()) as { calendar: ContentCalendar };
    isHistoryNavigation.current = true;
    setCalendar(data.calendar);
    latestCalendar.current = data.calendar;
    lastSavedCalendarJson.current = JSON.stringify(data.calendar);
    setSaveState("Version restored. Preview is updated.");
    setNotice("Version restored");
    setHistoryOpen(false);
  };

  useEffect(() => {
    if (!hasLoadedCalendar || loading || saving || generatingImageIndex !== null || generatingVideoIndex !== null || generatingSheet !== null || bulkGeneratingImageIndexes.length > 0 || editingImageIndex !== null) return;
    if (JSON.stringify(calendar) === lastSavedCalendarJson.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persistCalendar(latestCalendar.current, { silent: true });
    }, 900);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [bulkGeneratingImageIndexes.length, calendar, editingImageIndex, generatingImageIndex, generatingSheet, generatingVideoIndex, hasLoadedCalendar, loading, persistCalendar, saving]);

  useEffect(() => {
    const flush = () => {
      const calendarToSave = latestCalendar.current;
      if (!hasLoadedCalendarRef.current || !sessionToken.current || JSON.stringify(calendarToSave) === lastSavedCalendarJson.current) return;
      fetch(`/api/admin/content-calendar/${calendarToSave.slug}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${sessionToken.current}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ calendar: calendarToSave, adminOrderChanged: pendingAdminOrderChange.current }),
        keepalive: true,
      }).catch(() => undefined);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  const previewUrl = `/client/preview/${calendar.slug}`;
  const storiesPreviewUrl = `/client/preview/${calendar.slug}/stories`;
  const activePreviewUrl = contentMode === "stories" ? storiesPreviewUrl : previewUrl;
  const pageTitle = `${calendar.clientName || "Project"} Content Calendar - ${calendarMonthTitle(calendar.campaignTitle)}`;
  const visibleSaveState = saveState && !["Autosaving...", "Autosaved.", "Saved. Preview is updated."].includes(saveState)
    ? saveState
    : "";
  const autosaveLabel = saving || saveState === "Autosaving..." ? "Saving..." : "Saved";
  const toolbarIconClass = "admin-action-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-35";
  const clientFeedbackItems = useMemo(() => [
    ...calendar.posts
      .map((post, index) => ({
        id: post.id,
        type: "post" as const,
        index,
        label: displayPostLabel(index),
        status: post.status,
        note: post.clientNote?.trim() ?? "",
        submittedAt: post.clientNoteSubmittedAt ?? "",
      }))
      .filter((item) => item.note || item.status === "approved" || item.status === "needs_edits"),
    ...calendar.stories
      .map((story, index) => ({
        id: story.id,
        type: "story" as const,
        index,
        label: displayStoryLabel(index),
        status: story.status,
        note: story.clientNote?.trim() ?? "",
        submittedAt: story.clientNoteSubmittedAt ?? "",
      }))
      .filter((item) => item.note || item.status === "approved" || item.status === "needs_edits"),
  ], [calendar.posts, calendar.stories]);
  const galleryItems = useMemo<GalleryItem[]>(() => calendar.posts.flatMap((post, postIndex) => {
    const postLabel = displayPostLabel(postIndex);
    return mediaTimeline(post).map((item) => ({
      ...item,
      postIndex,
      postLabel,
      isCurrent: item.id === post.activeGeneratedMediaId || item.url === post.mediaUrl,
    }));
  }), [calendar.posts]);

  const selectedVideoModelAssets = (modal: AiVideoModalState) => modal.modelIds
    .map((id) => calendar.aiAssets.models.find((asset) => asset.id === id))
    .filter((asset): asset is CalendarAiAsset => Boolean(asset));

  const selectedVideoReferenceAssets = (modal: AiVideoModalState) => modal.referenceIds
    .map((id) => calendar.aiAssets.references.find((asset) => asset.id === id))
    .filter((asset): asset is CalendarAiAsset => Boolean(asset));

  const selectedVideoAssets = (modal: AiVideoModalState) => [
    ...modal.modelIds
      .map((id) => calendar.aiAssets.models.find((asset) => asset.id === id))
      .filter((asset): asset is CalendarAiAsset => Boolean(asset)),
    ...modal.referenceIds
      .map((id) => calendar.aiAssets.references.find((asset) => asset.id === id))
      .filter((asset): asset is CalendarAiAsset => Boolean(asset)),
  ];

  const videoImageUrls = (modal: AiVideoModalState) => Array.from(new Set([
    ...selectedVideoAssets(modal).map((asset) => asset.url),
    modal.startImageUrl,
    ...modal.imageUrls,
  ].filter(Boolean))).slice(0, 9);

  const primaryVideoImageUrl = (modal: AiVideoModalState) => modal.startImageUrl || selectedVideoReferenceAssets(modal)[0]?.url || selectedVideoModelAssets(modal)[0]?.url || modal.imageUrls[0] || "";

  const kling3ElementUrls = (modal: AiVideoModalState) => selectedVideoModelAssets(modal).map((asset) => asset.url).slice(0, 4);

  const toggleVideoAsset = (type: "model" | "reference", assetId: string) => {
    setAiVideoModal((current) => {
      if (!current) return current;
      const key = type === "model" ? "modelIds" : "referenceIds";
      const isSelected = current[key].includes(assetId);
      const limit = videoAssetLimit(current.modelKey, type, current.imageUrls.length);
      const currentSelectedCount = current[key].length;
      if (!isSelected && currentSelectedCount >= limit) {
        setNotice(current.modelKey.startsWith("seedance")
          ? `Seedance allows ${limit} selected library image${limit === 1 ? "" : "s"} after uploads.`
          : type === "model" ? `This model allows ${limit} character reference${limit === 1 ? "" : "s"}.` : `This model allows ${limit} reference image${limit === 1 ? "" : "s"}.`);
        return current;
      }
      const selected = isSelected ? current[key].filter((id) => id !== assetId) : [...current[key], assetId];
      return { ...current, [key]: selected };
    });
  };

  const insertVideoImageTag = (tag: string) => {
    setAiVideoModal((current) => current ? { ...current, prompt: `${current.prompt.trimEnd()}${current.prompt.trim() ? " " : ""}${tag}` } : current);
  };

  const uploadSignedFile = async (file: File, options?: UploadSignedFileOptions) => {
    if (file.size > CALENDAR_UPLOAD_MAX_BYTES) {
      throw new Error(`${file.name} is ${formatFileSize(file.size)}. The dashboard supports uploads up to 500MB.`);
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      throw new Error("Not signed in");
    }

    const presignRes = await fetch("/api/admin/content-calendar/presign", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: calendar.slug,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
      }),
    });

    if (!presignRes.ok) {
      const data = (await presignRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Could not prepare upload");
    }

    const data = (await presignRes.json()) as UploadResponse;
    if (data.provider === "cloudflare-r2" || data.provider === "upload-relay") {
      if (!data.signedUrl) throw new Error("Could not prepare upload");
      await uploadViaSignedUrl(data.signedUrl, file, options);
      return data;
    }

    if (!data.token) throw new Error("Could not prepare upload");
    const { error: uploadError } = await supabase.storage
      .from(data.bucket)
      .uploadToSignedUrl(data.path, data.token, file, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) throw new Error(uploadError.message);
    return data;
  };

  const uploadFile = async (file: File, target: UploadTarget) => {
    setError("");
    setSaveState("");
    const uploadId = target.type === "post"
      ? `post-${target.index}`
      : target.type === "story"
        ? `story-${target.index}`
      : target.type === "thumbnail"
        ? `thumbnail-${target.index}`
        : target.type === "highlight"
          ? `highlight-${target.index}`
          : "logo";
    addUploading(setUploading, uploadId);
    setUploadProgress((current) => ({ ...current, [uploadId]: 0 }));
    setSaveState(`Preparing ${file.name} (${formatFileSize(file.size)})...`);

    try {
      const thumbnailPromise = (target.type === "post" || target.type === "story") && file.type.startsWith("video/")
        ? captureVideoThumbnail(file)
        : Promise.resolve(null);
      const [data, thumbnailFile] = await Promise.all([
        uploadSignedFile(file, {
          onProgress: (progress) => {
            setUploadProgress((current) => ({ ...current, [uploadId]: progress }));
            setSaveState(`Uploading ${file.name}: ${progress}%`);
          },
        }),
        thumbnailPromise,
      ]);
      setSaveState(`${file.type.startsWith("video/") ? "Video" : "Media"} uploaded. Autosaving...`);
      const thumbnailData = thumbnailFile ? await uploadSignedFile(thumbnailFile) : null;
      setCalendar((current) => {
        if (target.type === "logo") {
          return { ...current, logoUrl: data.file.url };
        }
        if (target.type === "highlight") {
          return applyHighlight(current, target.index, { iconUrl: data.file.url });
        }
        if (target.type === "thumbnail") {
          return applyPost(current, target.index, { thumbnailUrl: data.file.url });
        }
        if (target.type === "story") {
          const mediaType = mediaTypeFromFile(file);
          return applyStory(current, target.index, {
            mediaUrl: data.file.url,
            originalMediaUrl: data.file.url,
            thumbnailUrl: thumbnailData?.file.url ?? "",
            mediaType,
          });
        }
        const post = current.posts[target.index];
        const mediaType = mediaTypeFromFile(file);
        const activeAsset = createGeneratedAsset({
          url: data.file.url,
          originalUrl: data.file.url,
          thumbnailUrl: thumbnailData?.file.url ?? "",
          mediaType,
          source: "upload",
        });
        return applyPost(current, target.index, {
          previousMediaUrl: post?.mediaUrl ?? "",
          previousThumbnailUrl: post?.thumbnailUrl ?? "",
          previousMediaType: post?.mediaType ?? "image",
          generatedMedia: nextGeneratedMediaList(post, activeAsset),
          activeGeneratedMediaId: activeAsset.id,
          mediaUrl: data.file.url,
          originalMediaUrl: data.file.url,
          thumbnailUrl: thumbnailData?.file.url ?? "",
          mediaType,
        });
      });
      if (target.type === "post") {
        setImagePreview((current) => current?.postIndex === target.index
          ? { ...current, assetId: undefined, url: data.file.url, originalUrl: data.file.url, mediaType: mediaTypeFromFile(file) }
          : current);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      setSaveState("");
    } finally {
      removeUploading(setUploading, uploadId);
      setUploadProgress((current) => {
        const next = { ...current };
        delete next[uploadId];
        return next;
      });
    }
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>, target: UploadTarget) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (target.type === "post") {
      const carouselFiles = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
      if (files.length > 1 && carouselFiles.length === files.length) {
        handleCarouselFiles(carouselFiles, target.index);
        return;
      }
    }
    const file = files[0];
    if (!file) return;
    uploadFile(file, target);
  };

  const handleBulkFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError("");
    setSaveState("");

    const emptyIndexes = calendar.posts
      .map((post, index) => (post.mediaUrl ? -1 : index))
      .filter((index) => index >= 0);
    const extraNeeded = Math.max(0, files.length - emptyIndexes.length);
    const startLength = calendar.posts.length;
    const targetIndexes = [
      ...emptyIndexes.slice(0, files.length),
      ...Array.from({ length: extraNeeded }).map((_, index) => startLength + index),
    ];

    if (extraNeeded > 0) {
      setCalendar((current) => ({
        ...current,
        posts: [
          ...current.posts,
          ...Array.from({ length: extraNeeded }).map((_, index) => createCalendarPost(current.posts.length + index)),
        ],
      }));
    }

    await Promise.allSettled(files.map((file, index) => uploadFile(file, { type: "post", index: targetIndexes[index] })));
  };

  const handleCarouselFiles = async (input: React.ChangeEvent<HTMLInputElement> | File[], postIndex: number) => {
    const files = Array.isArray(input)
      ? input.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      : Array.from(input.target.files ?? []).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (!Array.isArray(input)) input.target.value = "";
    if (files.length === 0) return;

    setError("");
    setSaveState("");
    const uploadId = `carousel-${postIndex}`;
    addUploading(setUploading, uploadId);
    setUploadProgress((current) => ({ ...current, [uploadId]: 0 }));
    setSaveState(`Preparing ${files.length} carousel slide${files.length === 1 ? "" : "s"}...`);

    try {
      let completed = 0;
      const uploaded = await Promise.all(files.map(async (file) => {
        const mediaType = mediaTypeFromFile(file);
        const thumbnailPromise = mediaType === "video" ? captureVideoThumbnail(file) : Promise.resolve(null);
        const [result, thumbnailFile] = await Promise.all([
          uploadSignedFile(file, {
            onProgress: (progress) => {
              const totalProgress = Math.round(((completed * 100) + progress) / files.length);
              setUploadProgress((current) => ({ ...current, [uploadId]: totalProgress }));
              setSaveState(`Uploading carousel slides: ${totalProgress}%`);
            },
          }),
          thumbnailPromise,
        ]);
        const thumbnailData = thumbnailFile ? await uploadSignedFile(thumbnailFile) : null;
        completed += 1;
        return { result, mediaType, thumbnailUrl: thumbnailData?.file.url ?? "" };
      }));
      const items = uploaded.map((item) => createCarouselItem(item.result.file.url, {
        originalUrl: item.result.file.url,
        thumbnailUrl: item.thumbnailUrl,
        mediaType: item.mediaType,
      }));
      setCalendar((current) => {
        const post = current.posts[postIndex];
        const existingItems = carouselItemsFromPost(post);
        const nextItems = [...existingItems, ...items];
        const first = nextItems[0];
        return applyPost(current, postIndex, {
          mediaType: "carousel",
          mediaUrl: first?.url ?? "",
          originalMediaUrl: first?.originalUrl ?? first?.url ?? "",
          thumbnailUrl: first?.thumbnailUrl ?? "",
          carouselItems: nextItems,
        });
      });
      setSaveState(`${items.length} carousel slide${items.length === 1 ? "" : "s"} uploaded. Autosaving...`);
      setNotice(`${items.length} carousel slide${items.length === 1 ? "" : "s"} added`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Carousel upload failed");
    } finally {
      removeUploading(setUploading, uploadId);
      setUploadProgress((current) => {
        const next = { ...current };
        delete next[uploadId];
        return next;
      });
    }
  };

  const handleQuickUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const emptyIndex = calendar.posts.findIndex((post) => !post.mediaUrl);
    const targetIndex = emptyIndex >= 0 ? emptyIndex : calendar.posts.length;
    if (emptyIndex < 0) {
      setCalendar((current) => ({
        ...current,
        posts: [...current.posts, createCalendarPost(current.posts.length)],
      }));
    }
    setToolbarMenuOpen(false);
    await uploadFile(file, { type: "post", index: targetIndex });
  };

  const updateAiContext = (patch: Partial<CalendarAiContext>) => {
    setCalendar((current) => ({
      ...current,
      aiContext: { ...current.aiContext, ...patch },
    }));
  };

  const aiAssetsForType = (type: CalendarAiAssetType) => {
    if (type === "product") return calendar.aiAssets.products;
    if (type === "model") return calendar.aiAssets.models;
    return calendar.aiAssets.references;
  };

  const updateAiAsset = (type: CalendarAiAssetType, id: string, patch: Partial<CalendarAiAsset>) => {
    const key = type === "product" ? "products" : type === "model" ? "models" : "references";
    setCalendar((current) => ({
      ...current,
      aiAssets: {
        ...current.aiAssets,
        [key]: current.aiAssets[key].map((asset) => asset.id === id ? { ...asset, ...patch } : asset),
      },
    }));
  };

  const removeAiAsset = (type: CalendarAiAssetType, id: string) => {
    const key = type === "product" ? "products" : type === "model" ? "models" : "references";
    setCalendar((current) => ({
      ...current,
      aiAssets: {
        ...current.aiAssets,
        [key]: current.aiAssets[key].filter((asset) => asset.id !== id),
      },
    }));
  };

  const addAiAsset = async (file: File, type: CalendarAiAssetType) => {
    setError("");
    setSaveState("");
    const uploadId = `ai-${type}`;
    addUploading(setUploading, uploadId);

    try {
      const data = await uploadSignedFile(file);
      const key = type === "product" ? "products" : "references";
      const asset: CalendarAiAsset = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        url: data.file.url,
        previewUrl: "",
        notes: "",
        createdAt: new Date().toISOString(),
        ...(type === "reference" ? { styleCategory: DEFAULT_STYLE_CATEGORY, referenceBehavior: "location-dna" as const, styleUsage: "both" as const } : {}),
      };
      setCalendar((current) => ({
        ...current,
        aiAssets: {
          ...current.aiAssets,
          [key]: [...current.aiAssets[key], asset],
        },
      }));
      setSaveState("AI asset uploaded. Save the calendar to keep it.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      removeUploading(setUploading, uploadId);
    }
  };

  const appendAiAsset = (asset: CalendarAiAsset) => {
    const key = asset.type === "product" ? "products" : asset.type === "model" ? "models" : "references";
    setCalendar((current) => ({
      ...current,
      aiAssets: {
        ...current.aiAssets,
        [key]: [...current.aiAssets[key], asset],
      },
    }));
  };

  const generateAiSheet = async (options: {
    kind: "product" | "character";
    files: File[];
    name: string;
    source: "library" | "picker";
  }) => {
    if (options.kind === "product" && options.files.length < 4) {
      setError("Upload at least 4 product images to generate a product sheet.");
      return;
    }
    if (options.kind === "character" && options.files.length < 1) {
      setError("Upload one character image to generate a character sheet.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      throw new Error("Not signed in");
    }

    setGeneratingSheet(options.kind);
    setError("");
    setSaveState(options.kind === "product" ? "Uploading product angles..." : "Uploading character reference...");

    try {
      const uploaded = await Promise.all(options.files.map((file) => uploadSignedFile(file)));
      setSaveState(options.kind === "product" ? "Generating product sheet..." : "Generating character sheet...");

      const res = await fetch("/api/admin/content-calendar/ai-sheet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: calendar.slug,
          kind: options.kind,
          name: options.name,
          sourceUrls: uploaded.map((item) => item.file.url),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not generate sheet.");
      }

      const data = (await res.json()) as { imageUrl: string; prompt?: string; description?: string };
      const assetType: CalendarAiAssetType = options.kind === "product" ? "product" : "model";
      const fallbackName = options.kind === "product" ? "Generated Product Sheet" : "Generated Character Sheet";
      const asset: CalendarAiAsset = {
        id: `${assetType}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: assetType,
        name: options.name.trim() || fallbackName,
        url: data.imageUrl,
        previewUrl: "",
        notes: options.kind === "product"
          ? "AI-generated product sheet on white background with multiple product angles."
          : "AI-generated character sheet on white background with close-up face angles and full-body angles.",
        createdAt: new Date().toISOString(),
      };

      appendAiAsset(asset);
      if (options.source === "picker" && aiImageModal) {
        if (assetType === "product") {
          setAiImageModal({ ...aiImageModal, productId: asset.id });
          setAiPicker(null);
        } else {
          setAiImageModal({
            ...aiImageModal,
            modelIds: aiImageModal.modelIds.length >= 2 ? [aiImageModal.modelIds[0], asset.id] : [...aiImageModal.modelIds, asset.id],
          });
        }
      }
      setProductSheetModal(null);
      setSaveState(`${options.kind === "product" ? "Product" : "Character"} sheet generated. Autosaving...`);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Could not generate sheet.");
      setSaveState("");
    } finally {
      setGeneratingSheet(null);
    }
  };

  const uploadDirectProductSheet = async (event: React.ChangeEvent<HTMLInputElement>, source: "library" | "picker") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Product sheet must be an image.");
      return;
    }

    const uploadId = "ai-product";
    addUploading(setUploading, uploadId);
    setError("");
    setSaveState("");

    try {
      const data = await uploadSignedFile(file);
      const asset: CalendarAiAsset = {
        id: `product-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: "product",
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        url: data.file.url,
        previewUrl: "",
        notes: "",
        createdAt: new Date().toISOString(),
      };
      appendAiAsset(asset);
      if (source === "picker" && aiImageModal) {
        setAiImageModal({ ...aiImageModal, productId: asset.id });
        setAiPicker(null);
      }
      setProductSheetModal(null);
      setSaveState("Product sheet uploaded. Autosaving...");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      removeUploading(setUploading, uploadId);
    }
  };

  const handleAiAssetFile = (event: React.ChangeEvent<HTMLInputElement>, type: CalendarAiAssetType) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("AI product, model, and reference assets must be images for this generator.");
      return;
    }
    addAiAsset(file, type);
  };

  const openAiImageModal = (postIndex: number) => {
    setAiImageModal({
      postIndex,
      productId: calendar.aiAssets.products[0]?.id ?? "",
      modelIds: [],
      referenceId: "",
      customReferenceUrl: "",
      customReferenceName: "",
      style: calendar.aiStyles[0]?.id ?? "cinematic",
      extraPrompt: "",
    });
  };

  const openAiVideoModal = (postIndex: number) => {
    setAiVideoModal(defaultAiVideoModalState(postIndex, calendar.posts[postIndex]));
  };

  useEffect(() => {
    if (!hasLoadedCalendar) return;
    const magic = searchParams.get("magic");
    const referenceId = searchParams.get("ref") ?? "";
    const idea = searchParams.get("idea") ?? "";
    if (magic !== "image" && magic !== "video") return;

    const key = `${magic}:${referenceId}`;
    if (handledMagicLink.current === key) return;
    handledMagicLink.current = key;

    const postIndex = 0;
    if (magic === "video") {
      setAiVideoModal({
        ...defaultAiVideoModalState(postIndex, calendar.posts[postIndex]),
        referenceIds: referenceId ? [referenceId] : [],
        prompt: idea,
      });
      return;
    }

    setAiImageModal({
      postIndex,
      productId: calendar.aiAssets.products[0]?.id ?? "",
      modelIds: [],
      referenceId,
      customReferenceUrl: "",
      customReferenceName: "",
      style: calendar.aiStyles[0]?.id ?? "cinematic",
      extraPrompt: idea,
    });
  }, [calendar.aiAssets.products, calendar.aiStyles, calendar.posts, hasLoadedCalendar, searchParams]);

  const uploadVideoInput = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "startImageUrl" | "endImageUrl" | "referenceVideoUrl" | "referenceAudioUrl" | "imageUrls",
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || !aiVideoModal) return;

    const expectsVideo = key === "referenceVideoUrl";
    const expectsAudio = key === "referenceAudioUrl";
    const expectsImage = key === "startImageUrl" || key === "endImageUrl" || key === "imageUrls";
    const invalid = files.find((file) => {
      if (expectsVideo) return !file.type.startsWith("video/");
      if (expectsAudio) return !file.type.startsWith("audio/");
      if (expectsImage) return !file.type.startsWith("image/");
      return false;
    });
    if (invalid) {
      setError(expectsAudio ? "Reference voice must be an audio file." : expectsVideo ? "Reference motion must be a video." : "Seedance references must be images.");
      return;
    }

    const uploadId = `video-${key}`;
    addUploading(setUploading, uploadId);
    setUploadProgress((current) => ({ ...current, [uploadId]: 0 }));
    setError("");
    setSaveState(`Preparing ${files.length > 1 ? `${files.length} files` : files[0].name}...`);

    try {
      let completed = 0;
      const uploaded = await Promise.all(files.map((file) => uploadSignedFile(file, {
        onProgress: (progress) => {
          const totalProgress = Math.round(((completed * 100) + progress) / files.length);
          setUploadProgress((current) => ({ ...current, [uploadId]: totalProgress }));
          setSaveState(`Uploading ${files.length > 1 ? `${files.length} files` : file.name}: ${totalProgress}%`);
        },
      }).then((result) => {
        completed += 1;
        return result;
      })));
      setSaveState("Reference uploaded.");
      setAiVideoModal((current) => {
        if (!current) return current;
        if (key === "imageUrls") {
          const urls = Array.from(new Set([...current.imageUrls, ...uploaded.map((item) => item.file.url)])).slice(0, 9);
          return { ...current, imageUrls: urls, startImageUrl: urls[0] ?? "" };
        }
        const url = uploaded[0].file.url;
        if (key === "startImageUrl") {
          const urls = Array.from(new Set([url, ...current.imageUrls])).slice(0, 9);
          return { ...current, startImageUrl: url, imageUrls: urls };
        }
        return { ...current, [key]: url };
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      setSaveState("");
    } finally {
      removeUploading(setUploading, uploadId);
      setUploadProgress((current) => {
        const next = { ...current };
        delete next[uploadId];
        return next;
      });
    }
  };

  const removeSeedanceImage = (url: string) => {
    setAiVideoModal((current) => {
      if (!current) return current;
      const imageUrls = current.imageUrls.filter((item) => item !== url);
      return {
        ...current,
        imageUrls,
        startImageUrl: current.startImageUrl === url ? imageUrls[0] ?? "" : current.startImageUrl,
      };
    });
  };

  const enhanceAiVideoPrompt = async () => {
    if (!aiVideoModal) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      throw new Error("Not signed in");
    }

    const model = videoModelInfo(aiVideoModal.modelKey);
    const attachedImageUrls = videoImageUrls(aiVideoModal);
    setEnhancingVideoPrompt(true);
    setError("");

    const res = await fetch("/api/admin/content-calendar/ai-video/prompt-enhance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: calendar.slug,
        clientName: calendar.clientName,
        campaignTitle: calendar.campaignTitle,
        postLabel: displayPostLabel(aiVideoModal.postIndex),
        modelLabel: model.label,
        duration: aiVideoModal.duration,
        aspectRatio: aiVideoModal.aspectRatio,
        shotMode: aiVideoModal.shotMode,
        imageCount: attachedImageUrls.length,
        hasStartImage: Boolean(primaryVideoImageUrl(aiVideoModal)),
        hasEndImage: Boolean(aiVideoModal.endImageUrl),
        hasReferenceVideo: Boolean(aiVideoModal.referenceVideoUrl),
        hasReferenceAudio: Boolean(aiVideoModal.referenceAudioUrl),
        prompt: aiVideoModal.prompt,
      }),
    });

    setEnhancingVideoPrompt(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not enhance video prompt.");
      return;
    }

    const data = (await res.json()) as { prompt: string };
    setAiVideoModal((current) => current ? { ...current, prompt: data.prompt } : current);
  };

  const getEnhancedVideoPrompt = async (modal: AiVideoModalState, sessionTokenValue: string) => {
    const model = videoModelInfo(modal.modelKey);
    const attachedImageUrls = videoImageUrls(modal);
    const res = await fetch("/api/admin/content-calendar/ai-video/prompt-enhance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionTokenValue}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: calendar.slug,
        clientName: calendar.clientName,
        campaignTitle: calendar.campaignTitle,
        postLabel: displayPostLabel(modal.postIndex),
        modelLabel: model.label,
        duration: modal.duration,
        aspectRatio: modal.aspectRatio,
        imageCount: attachedImageUrls.length,
        hasStartImage: Boolean(primaryVideoImageUrl(modal)),
        hasEndImage: Boolean(modal.endImageUrl),
        hasReferenceVideo: Boolean(modal.referenceVideoUrl),
        hasReferenceAudio: Boolean(modal.referenceAudioUrl),
        prompt: modal.prompt,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Could not enhance video prompt.");
    }

    const data = (await res.json()) as { prompt: string };
    return data.prompt;
  };

  const pollAiVideoResult = async (options: {
    endpointId: string;
    requestId: string;
    statusUrl?: string;
    responseUrl?: string;
    postIndex: number;
  }): Promise<{ videoUrl: string; job?: AiVideoJob | null }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      throw new Error("Not signed in");
    }

    let statusErrorCount = 0;
    for (let attempt = 0; attempt < 90; attempt += 1) {
      await sleep(attempt < 8 ? 3500 : 6000);
      const statusRes = await fetch("/api/admin/content-calendar/ai-video/status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpointId: options.endpointId,
          requestId: options.requestId,
          statusUrl: options.statusUrl,
          responseUrl: options.responseUrl,
          slug: calendar.slug,
          postLabel: displayPostLabel(options.postIndex),
        }),
      });

      if (!statusRes.ok) {
        const data = (await statusRes.json().catch(() => ({}))) as { error?: unknown };
        const statusError = readableUiError(data.error, "fal is still preparing the result");
        statusErrorCount += 1;
        if (statusErrorCount < 8) {
          setSaveState(`Checking video status again... ${statusError}`);
          continue;
        }
        throw new Error(readableUiError(data.error, "Could not generate video."));
      }

      statusErrorCount = 0;
      const data = (await statusRes.json()) as AiVideoStatusResponse;
      if (data.videoUrl) {
        return { videoUrl: data.videoUrl, job: data.job };
      }

      const latestLog = data.logs?.map((log) => log.message).filter(Boolean).at(-1);
      setSaveState(latestLog ? `Generating video: ${latestLog}` : `Generating video: ${data.status ?? "queued"}...`);
    }

    throw new Error("Video generation is still running. Try again in a moment.");
  };

  const applyAiVideoResult = useCallback((options: {
    postIndex: number;
    videoUrl: string;
    thumbnailUrl?: string;
    videoPrompt?: string;
  }) => {
    setCalendar((current) => {
      const currentPost = current.posts[options.postIndex];
      const activeAsset = createGeneratedAsset({
        url: options.videoUrl,
        originalUrl: options.videoUrl,
        thumbnailUrl: options.thumbnailUrl,
        mediaType: "video",
        prompt: options.videoPrompt,
        source: "ai-video",
      });
      return applyPost(current, options.postIndex, {
        previousMediaUrl: currentPost?.mediaUrl ?? "",
        previousThumbnailUrl: currentPost?.thumbnailUrl ?? "",
        previousMediaType: currentPost?.mediaType ?? "image",
        generatedMedia: nextGeneratedMediaList(currentPost, activeAsset),
        activeGeneratedMediaId: activeAsset.id,
        mediaUrl: options.videoUrl,
        originalMediaUrl: options.videoUrl,
        thumbnailUrl: options.thumbnailUrl ?? "",
        mediaType: "video",
        aiPrompt: options.videoPrompt ?? "",
      });
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedCalendar || loading) return;
    let cancelled = false;

    async function resumeAiVideoJobs() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;

      const res = await fetch(`/api/admin/content-calendar/ai-video/jobs?slug=${encodeURIComponent(calendar.slug)}&includeCompleted=1`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok || cancelled) return;

      const data = (await res.json()) as { jobs?: AiVideoJob[] };
      const jobs = (data.jobs ?? []).filter((job) => job.status !== "failed");
      for (const job of jobs) {
        if (cancelled || resumingVideoJobs.current.has(job.requestId)) continue;
        if (job.videoUrl && job.status === "completed") {
          const currentPost = latestCalendar.current.posts[job.postIndex];
          if (currentPost?.mediaUrl !== job.videoUrl) {
            applyAiVideoResult({
              postIndex: job.postIndex,
              videoUrl: job.videoUrl,
              thumbnailUrl: job.thumbnailUrl,
              videoPrompt: job.videoPrompt,
            });
            setSaveState(`${job.postLabel} video recovered. Autosaving...`);
          }
          continue;
        }

        if (job.status !== "pending" && job.status !== "processing") continue;
        resumingVideoJobs.current.add(job.requestId);
        setGeneratingVideoIndex(job.postIndex);
        setSaveState(`Resuming ${job.postLabel} video generation...`);
        try {
          const result = await pollAiVideoResult({
            endpointId: job.endpointId,
            requestId: job.requestId,
            statusUrl: job.statusUrl,
            responseUrl: job.responseUrl,
            postIndex: job.postIndex,
          });
          if (!cancelled && result.videoUrl) {
            applyAiVideoResult({
              postIndex: job.postIndex,
              videoUrl: result.videoUrl,
              thumbnailUrl: result.job?.thumbnailUrl || job.thumbnailUrl,
              videoPrompt: result.job?.videoPrompt || job.videoPrompt,
            });
            setSaveState(`${job.postLabel} video recovered. Autosaving...`);
          }
        } catch (resumeError) {
          if (!cancelled) {
            setNotice(resumeError instanceof Error ? resumeError.message : "Video job is still running.");
          }
        } finally {
          resumingVideoJobs.current.delete(job.requestId);
          if (!cancelled) setGeneratingVideoIndex(null);
        }
      }
    }

    resumeAiVideoJobs();
    return () => {
      cancelled = true;
    };
  }, [applyAiVideoResult, calendar.slug, hasLoadedCalendar, loading]);

  const generateAiVideo = async () => {
    if (!aiVideoModal) return;
    const model = videoModelInfo(aiVideoModal.modelKey);
    if (model.disabled) {
      setError(`${model.label} is not available through fal yet.`);
      return;
    }
    if (!aiVideoModal.prompt.trim()) {
      setError("Write a video prompt first.");
      return;
    }
    const modalImageUrls = videoImageUrls(aiVideoModal);
    const modalStartImageUrl = primaryVideoImageUrl(aiVideoModal);
    if (model.supportsMultipleImages && modalImageUrls.length === 0) {
      setError("Upload at least one Seedance reference image.");
      return;
    }
    if (!model.supportsMultipleImages && !modalStartImageUrl.trim()) {
      setError("Upload or choose a start image, character, or reference first.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const modal = aiVideoModal;
    setGeneratingVideoIndex(modal.postIndex);
    setAiVideoModal(null);
    setError("");
    setSaveState("Enhancing prompt...");

    try {
	      setEnhancingVideoPrompt(true);
	      const enhancedPrompt = await getEnhancedVideoPrompt(modal, session.access_token);
	      setEnhancingVideoPrompt(false);
	      setSaveState("Starting video generation...");
	      const attachedLibraryAssets = selectedVideoAssets(modal);
	      const seedanceCharacterPrompt = modal.modelKey.startsWith("seedance") && attachedLibraryAssets.length
	        ? [
	          "SEEDANCE AI CHARACTER REFERENCE MAP:",
	          ...selectedVideoModelAssets(modal).map((asset, index) => `@Image${index + 1} is a synthetic AI-generated fictional character reference named ${asset.name}. Treat it as a digital actor / character design reference for consistent character design, wardrobe logic, hairstyle, silhouette, styling, expression energy, pose language, and body proportions. It is not a real person, not a celebrity, and not a private identity.`),
	          ...selectedVideoReferenceAssets(modal).map((asset, index) => `@Image${selectedVideoModelAssets(modal).length + index + 1} is a style, scene, product, wardrobe, or motion-look reference named ${asset.name}. Use only its assigned visual role; do not treat it as a real-person identity.`),
	          modal.startImageUrl && !attachedLibraryAssets.some((asset) => asset.url === modal.startImageUrl) ? `@Image${attachedLibraryAssets.length + 1} is the opening frame / visual continuity anchor.` : "",
	          ...modal.imageUrls.map((url, index) => {
	            const previousCount = attachedLibraryAssets.length + (modal.startImageUrl && !attachedLibraryAssets.some((asset) => asset.url === modal.startImageUrl) ? 1 : 0);
	            return `@Image${previousCount + index + 1} is an uploaded visual reference for product, style, scene, wardrobe, or character continuity.`;
	          }),
	          "Prompting rule: describe characters as synthetic fictional digital actors and character designs. Avoid real-person, celebrity, private identity, impersonation, face-swap, or exact-likeness wording.",
	        ].filter(Boolean).join("\n")
	        : "";
	      const finalGenerationPrompt = [seedanceCharacterPrompt, enhancedPrompt].filter(Boolean).join("\n\n");
	      const videoPrompt = [
	        `Video model: ${model.label}`,
	        modal.modelKey === "veo-3-1" ? `Speed: ${modal.quality}` : "",
	        `Resolution: ${normalizedVideoResolution(modal.modelKey, modal.resolution)}`,
	        `Duration: ${modal.duration}`,
	        `Aspect ratio: ${modal.aspectRatio}`,
	        model.supportsShotMode ? `Shot mode: ${modal.shotMode === "multi" ? "Multi shots" : "One shot"}` : "",
	        `References: ${model.supportsMultipleImages ? `${videoImageUrls(modal).length} image(s)` : "1 start image"}`,
	        attachedLibraryAssets.length ? `Attached library assets: ${modal.modelKey === "kling-3" ? [
	          ...selectedVideoModelAssets(modal).map((asset, index) => `@Element${index + 1} ${asset.name}`),
	          ...selectedVideoReferenceAssets(modal).map((asset, index) => `@Image${index + 1} ${asset.name}`),
	        ].join(", ") : attachedLibraryAssets.map((asset, index) => `@Image${index + 1} ${asset.name}`).join(", ")}` : "",
	        modal.referenceVideoUrl ? "Reference video: attached" : "",
	        modal.referenceAudioUrl ? "Reference voice/audio: attached" : "",
	        "",
	        finalGenerationPrompt,
	      ].filter(Boolean).join("\n");

	      const res = await fetch("/api/admin/content-calendar/ai-video", {
	        method: "POST",
	        headers: {
	          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
	        body: JSON.stringify({
	          slug: calendar.slug,
	          postIndex: modal.postIndex,
	          clientName: calendar.clientName,
	          campaignTitle: calendar.campaignTitle,
	          postLabel: displayPostLabel(modal.postIndex),
	          modelKey: modal.modelKey,
          quality: modal.quality,
          resolution: normalizedVideoResolution(modal.modelKey, modal.resolution),
          duration: modal.duration,
          aspectRatio: modal.aspectRatio,
          shotMode: modal.shotMode,
          startImageUrl: primaryVideoImageUrl(modal),
          imageUrls: model.supportsMultipleImages ? videoImageUrls(modal) : [],
          elementImageUrls: modal.modelKey === "kling-3" ? kling3ElementUrls(modal) : [],
          endImageUrl: model.supportsEndImage ? modal.endImageUrl : "",
	          referenceVideoUrl: model.supportsReferenceVideo ? modal.referenceVideoUrl : "",
	          referenceAudioUrl: model.supportsReferenceAudio ? modal.referenceAudioUrl : "",
	          prompt: finalGenerationPrompt,
	          videoPrompt,
	          thumbnailUrl: modal.startImageUrl,
	          negativePrompt: model.supportsNegativePrompt ? modal.negativePrompt : "",
	          generateAudio: model.supportsAudio ? modal.generateAudio : false,
	        }),
	      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(readableUiError(data.error, "Could not start video generation."));
      }

	      const data = (await res.json()) as { endpointId: string; requestId: string; statusUrl?: string; responseUrl?: string };
	      setSaveState(`Video job queued: ${data.requestId}`);
	      const result = await pollAiVideoResult({
	        endpointId: data.endpointId,
	        requestId: data.requestId,
	        statusUrl: data.statusUrl,
	        responseUrl: data.responseUrl,
	        postIndex: modal.postIndex,
	      });
	      if (!result.videoUrl) throw new Error("fal returned no video URL");
	      applyAiVideoResult({
	        postIndex: modal.postIndex,
	        videoUrl: result.videoUrl,
	        thumbnailUrl: result.job?.thumbnailUrl || modal.startImageUrl,
	        videoPrompt: result.job?.videoPrompt || videoPrompt,
	      });
	      setSaveState("AI video generated. Autosaving...");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Could not generate video.");
      setSaveState("");
    } finally {
      setEnhancingVideoPrompt(false);
      setGeneratingVideoIndex(null);
    }
  };

  const uploadModalAsset = async (event: React.ChangeEvent<HTMLInputElement>, type: AiPickerType) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !aiImageModal) return;
    if (!file.type.startsWith("image/")) {
      setError("Astro Magic uploads must be images.");
      return;
    }

    if (type === "model") {
      await generateAiSheet({
        kind: "character",
        files: [file],
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        source: "picker",
      });
      return;
    }

    const uploadId = `ai-modal-${type}`;
    addUploading(setUploading, uploadId);
    setError("");

    try {
      const data = await uploadSignedFile(file);
      const key = type === "product" ? "products" : "references";
      const asset: CalendarAiAsset = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        url: data.file.url,
        previewUrl: "",
        notes: "",
        createdAt: new Date().toISOString(),
        ...(type === "reference" ? { styleCategory: stylePickerCategory, referenceBehavior: "location-dna" as const, styleUsage: "both" as const } : {}),
      };
      setCalendar((current) => ({
        ...current,
        aiAssets: {
          ...current.aiAssets,
          [key]: [...current.aiAssets[key], asset],
        },
      }));
      if (type === "product") {
        setAiImageModal({ ...aiImageModal, productId: asset.id });
        setAiPicker(null);
      } else {
        setAiImageModal({
          ...aiImageModal,
          referenceId: asset.id,
          customReferenceUrl: "",
          customReferenceName: "",
        });
        setAiPicker(null);
      }
      setSaveState(`${type === "product" ? "Product" : "Style"} image saved. Autosaving...`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      removeUploading(setUploading, uploadId);
    }
  };

  const generateAiImage = async () => {
    if (!aiImageModal) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const post = calendar.posts[aiImageModal.postIndex];
    const product = calendar.aiAssets.products.find((asset) => asset.id === aiImageModal.productId);
    const models = calendar.aiAssets.models.filter((asset) => aiImageModal.modelIds.includes(asset.id));
    const reference = calendar.aiAssets.references.find((asset) => asset.id === aiImageModal.referenceId);
    const selectedStyle = calendar.aiStyles.find((style) => style.id === aiImageModal.style);

    if (!product) {
      setError("Select a product sheet first. Model and location are optional.");
      return;
    }

    setGeneratingImageIndex(aiImageModal.postIndex);
    setAiImageModal(null);
    setAiPicker(null);
    setError("");
    setSaveState("");

    const res = await fetch("/api/admin/content-calendar/ai-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: calendar.slug,
        clientName: calendar.clientName,
        campaignTitle: calendar.campaignTitle,
        postLabel: displayPostLabel(aiImageModal.postIndex),
        product,
        models,
        reference,
        customReferenceUrl: aiImageModal.customReferenceUrl,
        customReferenceName: aiImageModal.customReferenceName,
        currentPostImageUrl: post?.mediaType === "image" ? post.mediaUrl : post?.thumbnailUrl,
        style: selectedStyle?.id ?? aiImageModal.style,
        styleName: selectedStyle?.name ?? aiImageModal.style,
        stylePrompt: selectedStyle?.prompt ?? "",
        extraPrompt: aiImageModal.extraPrompt,
      }),
    });

    setGeneratingImageIndex(null);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not generate image.");
      return;
    }

    const data = (await res.json()) as { imageUrl: string; prompt: string };
    setCalendar((current) => {
      const currentPost = current.posts[aiImageModal.postIndex];
      const activeAsset = createGeneratedAsset({
        url: data.imageUrl,
        originalUrl: data.imageUrl,
        mediaType: "image",
        prompt: data.prompt,
        source: "ai-image",
      });
      return applyPost(current, aiImageModal.postIndex, {
        previousMediaUrl: currentPost?.mediaUrl ?? "",
        previousThumbnailUrl: currentPost?.thumbnailUrl ?? "",
        previousMediaType: currentPost?.mediaType ?? "image",
        generatedMedia: nextGeneratedMediaList(currentPost, activeAsset),
        activeGeneratedMediaId: activeAsset.id,
        mediaUrl: data.imageUrl,
        originalMediaUrl: data.imageUrl,
        thumbnailUrl: "",
        mediaType: "image",
        aiPrompt: data.prompt,
      });
    });
    setSaveState("AI image generated. Autosaving...");
  };

  const bulkGenerateImages = async (settings: BulkGenerateSettings) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    if (calendar.aiAssets.products.length === 0) {
      setError("Upload at least one product first.");
      return;
    }

    const targetIndexes = calendar.posts
      .map((post, index) => (post.mediaType === "image" ? index : -1))
      .filter((index) => index >= 0);

    if (targetIndexes.length === 0) {
      setError("No image posts found to generate.");
      return;
    }

    const selectedStyle = calendar.aiStyles[0];
    const selectedModels = calendar.aiAssets.models.filter((asset) => settings.modelIds.includes(asset.id));
    const selectedModelNames = selectedModels.map((asset) => asset.name).filter(Boolean).join(", ");
    const palette = settings.palette.trim();
    const outfit = settings.outfit.trim();
    setBulkGeneratingImageIndexes(targetIndexes);
    setBulkGenerateModal(null);
    setError("");
    setSaveState(`Bulk generating ${targetIndexes.length} images...`);

    const results = await Promise.allSettled(targetIndexes.map(async (postIndex, sequenceIndex) => {
      const product = calendar.aiAssets.products[sequenceIndex % calendar.aiAssets.products.length];
      const randomMode = settings.mode === "Random";
      const modelPool = selectedModels.length > 0 ? selectedModels : [];
      const models = randomMode && modelPool.length > 0
        ? [modelPool[sequenceIndex % modelPool.length]]
        : modelPool;
      const reference = calendar.aiAssets.references.length > 0 ? calendar.aiAssets.references[sequenceIndex % calendar.aiAssets.references.length] : undefined;
      const creativeMode = randomMode
        ? "Random. Make this post feel different from the other generated posts; vary setting, angle, composition, styling, camera distance, and product moment."
        : settings.mode;

      const res = await fetch("/api/admin/content-calendar/ai-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: calendar.slug,
          clientName: calendar.clientName,
          campaignTitle: calendar.campaignTitle,
          postLabel: displayPostLabel(postIndex),
          product,
          models,
          reference,
          style: selectedStyle?.id ?? "cinematic",
          styleName: selectedStyle?.name ?? "Cinematic",
          stylePrompt: selectedStyle?.prompt ?? "",
          extraPrompt: [
            `Bulk Generate setup for all posts:`,
            palette ? `Color palette: ${palette}. Make this palette visible through wardrobe, props, surfaces, lighting accents, background styling, or art direction where natural.` : "",
            `Mode: ${creativeMode}.`,
            `Vibe: ${settings.vibe}.`,
            selectedModelNames ? `Selected models/characters to use as attached references: ${selectedModelNames}.` : "No model selected; make it product-led unless people are naturally needed.",
            outfit ? `Outfit direction: ${outfit}. Apply this outfit direction to selected model references when models are attached.` : "",
            `Create a distinct image for ${displayPostLabel(postIndex)}. Keep it different from the other generated posts in composition, angle, staging, and product moment while respecting the shared setup above.`,
          ].filter(Boolean).join("\n"),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Could not generate ${displayPostLabel(postIndex)}.`);
      }

      const data = (await res.json()) as { imageUrl: string; prompt: string };
      return { postIndex, imageUrl: data.imageUrl, prompt: data.prompt };
    }));

    const successful = results
      .filter((result): result is PromiseFulfilledResult<{ postIndex: number; imageUrl: string; prompt: string }> => result.status === "fulfilled")
      .map((result) => result.value);
    const failed = results.filter((result) => result.status === "rejected");

    if (successful.length > 0) {
      setCalendar((current) => {
        const posts = current.posts.map((post, index) => {
          const generated = successful.find((item) => item.postIndex === index);
          if (!generated) return post;
          const activeAsset = createGeneratedAsset({
            url: generated.imageUrl,
            originalUrl: generated.imageUrl,
            mediaType: "image",
            prompt: generated.prompt,
            source: "bulk-generate",
          });
          return {
            ...post,
            previousMediaUrl: post.mediaUrl,
            previousThumbnailUrl: post.thumbnailUrl,
            previousMediaType: post.mediaType,
            generatedMedia: nextGeneratedMediaList(post, activeAsset),
            activeGeneratedMediaId: activeAsset.id,
            mediaUrl: generated.imageUrl,
            originalMediaUrl: generated.imageUrl,
            thumbnailUrl: "",
            mediaType: "image" as const,
            aiPrompt: generated.prompt,
          };
        });
        return { ...current, posts };
      });
    }

    setBulkGeneratingImageIndexes([]);
    setSaveState(failed.length > 0 ? `Generated ${successful.length}/${targetIndexes.length}. ${failed.length} failed.` : `Generated ${successful.length} images. Autosaving...`);
    if (failed.length > 0) {
      const firstError = failed[0].reason instanceof Error ? failed[0].reason.message : "Some images failed.";
      setError(firstError);
    }
  };

  const enhanceAiImagePrompt = async () => {
    if (!aiImageModal) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const product = calendar.aiAssets.products.find((asset) => asset.id === aiImageModal.productId);
    const models = calendar.aiAssets.models.filter((asset) => aiImageModal.modelIds.includes(asset.id));
    const reference = calendar.aiAssets.references.find((asset) => asset.id === aiImageModal.referenceId);
    const selectedStyle = calendar.aiStyles.find((style) => style.id === aiImageModal.style);

    setEnhancingPrompt(true);
    setError("");

    const res = await fetch("/api/admin/content-calendar/ai-image/prompt-enhance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName: calendar.clientName,
        campaignTitle: calendar.campaignTitle,
        postLabel: displayPostLabel(aiImageModal.postIndex),
        product,
        models,
        reference,
        style: selectedStyle?.id ?? aiImageModal.style,
        styleName: selectedStyle?.name ?? aiImageModal.style,
        stylePrompt: selectedStyle?.prompt ?? "",
        extraPrompt: aiImageModal.extraPrompt,
      }),
    });

    setEnhancingPrompt(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not enhance prompt.");
      return;
    }

    const data = (await res.json()) as { prompt: string };
    setAiImageModal((current) => current ? { ...current, extraPrompt: data.prompt } : current);
  };

  const undoGeneratedImage = (index: number) => {
    const post = calendar.posts[index];
    const previousItem = timelineNeighbor(post, 1);
    if (!previousItem) return;
    restoreGeneratedMedia(index, previousItem, { updatePreview: false });
  };

  const redoGeneratedImage = (index: number) => {
    const post = calendar.posts[index];
    const nextItem = timelineNeighbor(post, -1);
    if (!nextItem) return;
    restoreGeneratedMedia(index, nextItem, { updatePreview: false });
  };

  const restoreGeneratedMedia = (index: number, item: CalendarGeneratedAsset, options?: { updatePreview?: boolean }) => {
    const scrollPosition = typeof window !== "undefined" ? { x: window.scrollX, y: window.scrollY } : null;
    setCalendar((current) => applyPost(current, index, {
      mediaUrl: item.url,
      originalMediaUrl: item.originalUrl || item.url,
      thumbnailUrl: item.thumbnailUrl,
      mediaType: item.mediaType,
      previousMediaUrl: current.posts[index]?.mediaUrl ?? "",
      previousThumbnailUrl: current.posts[index]?.thumbnailUrl ?? "",
      previousMediaType: current.posts[index]?.mediaType ?? "image",
      generatedMedia: uniqueMediaAssets([...mediaTimeline(current.posts[index]), item]),
      activeGeneratedMediaId: item.id,
    }));
    if (options?.updatePreview !== false) {
      setImagePreview({
        assetId: item.id,
        url: item.url,
        originalUrl: item.originalUrl || item.url,
        name: `${calendar.clientName || "Content"} - ${displayPostLabel(index)}`,
        postIndex: index,
        mediaType: item.mediaType,
      });
    }
    if (scrollPosition) {
      requestAnimationFrame(() => window.scrollTo(scrollPosition.x, scrollPosition.y));
    }
    setSaveState("Previous content restored. Autosaving...");
  };

  const deletePostMedia = (index: number, item: Pick<CalendarGeneratedAsset, "id" | "url">) => {
    const currentPost = calendar.posts[index];
    const currentRemaining = currentPost ? mediaTimeline(currentPost).filter((asset) => !isSameMediaAsset(asset, item)) : [];
    const deletingCurrentMedia = Boolean(
      currentPost
      && ((currentPost.activeGeneratedMediaId && item.id === currentPost.activeGeneratedMediaId) || (currentPost.mediaUrl && item.url === currentPost.mediaUrl))
    );
    const previewFallback = deletingCurrentMedia ? currentRemaining[0] : null;
    const nextPreview: ImagePreviewState | null = previewFallback
      ? {
          assetId: previewFallback.id,
          url: previewFallback.url,
          originalUrl: previewFallback.originalUrl || previewFallback.url,
          name: `${calendar.clientName || "Content"} - ${displayPostLabel(index)}`,
          postIndex: index,
          mediaType: previewFallback.mediaType,
        }
      : null;

    setCalendar((current) => {
      const post = current.posts[index];
      if (!post) return current;

      const remaining = mediaTimeline(post).filter((asset) => !isSameMediaAsset(asset, item));
      const isDeletingActive = Boolean(
        (post.activeGeneratedMediaId && item.id === post.activeGeneratedMediaId)
        || (post.mediaUrl && item.url === post.mediaUrl)
      );

      const nextActive = isDeletingActive ? remaining[0] : remaining.find((asset) => asset.id === post.activeGeneratedMediaId || asset.url === post.mediaUrl);
      const nextGeneratedMedia = uniqueMediaAssets(remaining);

      if (nextActive) {
        return applyPost(current, index, {
          mediaUrl: nextActive.url,
          originalMediaUrl: nextActive.originalUrl || nextActive.url,
          thumbnailUrl: nextActive.thumbnailUrl,
          mediaType: nextActive.mediaType,
          generatedMedia: nextGeneratedMedia,
          activeGeneratedMediaId: nextActive.id,
        });
      }

      if (isDeletingActive || item.url === post.mediaUrl) {
        return applyPost(current, index, {
          mediaUrl: "",
          originalMediaUrl: "",
          thumbnailUrl: "",
          previousMediaUrl: "",
          previousThumbnailUrl: "",
          previousMediaType: "image",
          carouselItems: post.mediaType === "carousel" ? [] : post.carouselItems,
          generatedMedia: nextGeneratedMedia,
          activeGeneratedMediaId: "",
        });
      }

      return applyPost(current, index, {
        generatedMedia: nextGeneratedMedia,
      });
    });

    setImagePreview((current) => {
      if (!current || current.postIndex !== index) return current;
      if (!isSameMediaAsset({ id: current.assetId ?? "", url: current.url }, item)) return current;
      return nextPreview;
    });
    setNotice("Media deleted");
    setSaveState("Media deleted. Autosaving...");
  };

  const removeCarouselItem = (postIndex: number, itemId: string) => {
    setCalendar((current) => {
      const post = current.posts[postIndex];
      if (!post) return current;
      const nextItems = (post.carouselItems ?? []).filter((item) => item.id !== itemId);
      return applyPost(current, postIndex, {
        carouselItems: nextItems,
        mediaUrl: nextItems[0]?.url ?? "",
        originalMediaUrl: nextItems[0]?.originalUrl ?? nextItems[0]?.url ?? "",
        thumbnailUrl: nextItems[0]?.thumbnailUrl ?? "",
        activeGeneratedMediaId: nextItems.length > 0 ? post.activeGeneratedMediaId : "",
      });
    });
    setNotice("Carousel slide deleted");
    setSaveState("Carousel slide deleted. Autosaving...");
  };

  const editPreviewImage = async () => {
    if (!imageEditModal) return;
    const instruction = imageEditModal.instruction.trim();
    if (!instruction) {
      setError("Write what you want to edit first.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const post = calendar.posts[imageEditModal.postIndex];
    setEditingImageIndex(imageEditModal.postIndex);
    setImageEditModal(null);
    setError("");
    setSaveState("");

    const res = await fetch("/api/admin/content-calendar/ai-image/edit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: calendar.slug,
        postLabel: displayPostLabel(imageEditModal.postIndex),
        imageUrl: imageEditModal.url,
        originalImageUrl: imageEditModal.originalUrl,
        editPrompt: instruction,
      }),
    });

    setEditingImageIndex(null);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not edit image.");
      return;
    }

    const data = (await res.json()) as { imageUrl: string; prompt: string };
    setRevealingImageIndex(imageEditModal.postIndex);
    setCalendar((current) => {
      const currentPost = current.posts[imageEditModal.postIndex];
      const activeAsset = createGeneratedAsset({
        url: data.imageUrl,
        originalUrl: currentPost?.originalMediaUrl || currentPost?.mediaUrl || data.imageUrl,
        mediaType: "image",
        prompt: data.prompt,
        source: "ai-edit",
      });
      return applyPost(current, imageEditModal.postIndex, {
        previousMediaUrl: currentPost?.mediaUrl ?? "",
        previousThumbnailUrl: currentPost?.thumbnailUrl ?? "",
        previousMediaType: currentPost?.mediaType ?? "image",
        generatedMedia: nextGeneratedMediaList(currentPost, activeAsset),
        activeGeneratedMediaId: activeAsset.id,
        mediaUrl: data.imageUrl,
        originalMediaUrl: currentPost?.originalMediaUrl || currentPost?.mediaUrl || data.imageUrl,
        thumbnailUrl: "",
        mediaType: "image",
        aiPrompt: data.prompt,
      });
    });
    setImagePreview({
      url: data.imageUrl,
      originalUrl: post?.originalMediaUrl || post?.mediaUrl || data.imageUrl,
      name: imageEditModal.name,
      postIndex: imageEditModal.postIndex,
      mediaType: "image",
    });
    window.setTimeout(() => setRevealingImageIndex(null), 1400);
    setSaveState("Image edited. Autosaving...");
  };

  const downloadImage = async (url: string, name: string, mediaType: CalendarMediaType = "image") => {
    const fileName = safeFileName(name, mediaType);
    const isTouchDevice = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      if (isTouchDevice) {
        const mimeType = mediaType === "video" ? "video/mp4" : "image/jpeg";
        const file = new File([blob], fileName, { type: blob.type || mimeType });
        const shareNavigator = navigator as Navigator & {
          canShare?: (data: ShareData) => boolean;
          share?: (data: ShareData) => Promise<void>;
        };
        if (shareNavigator.share && (!shareNavigator.canShare || shareNavigator.canShare({ files: [file] }))) {
          await shareNavigator.share({
            files: [file],
            title: name,
          });
          setNotice(mediaType === "video" ? "Use Save Video in the share sheet." : "Use Save Image in the share sheet.");
          return;
        }
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
      setNotice("Opened media. Use Share to save it.");
    }
  };

  const generateCaption = async (index: number) => {
    const post = calendar.posts[index];
    if (!post?.mediaUrl) {
      setError("Upload media before generating a caption.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    setError("");
    setSaveState("");
    setGeneratingCaption(index);

    const captionCarouselItem = post.mediaType === "carousel" ? post.carouselItems?.[0] : null;
    const captionMediaUrl = post.mediaType === "video"
      ? post.thumbnailUrl
      : captionCarouselItem?.mediaType === "video"
        ? captionCarouselItem.thumbnailUrl
        : captionCarouselItem?.url || post.mediaUrl;
    if (!captionMediaUrl) {
      setGeneratingCaption(null);
      setError("Video caption generation needs a thumbnail image first.");
      return;
    }

    const res = await fetch("/api/admin/content-calendar/ai-caption", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName: calendar.clientName,
        campaignTitle: calendar.campaignTitle,
        mediaUrl: captionMediaUrl,
        mediaType: "image",
        publishDate: post.publishDate,
        existingCaption: post.caption,
        aiContext: calendar.aiContext,
      }),
    });

    setGeneratingCaption(null);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not generate caption.");
      return;
    }

    const data = (await res.json()) as { caption: string };
    setCalendar((current) => applyPost(current, index, { caption: data.caption }));
    setSaveState("AI caption generated. Autosaving...");
  };

  const movePost = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= calendar.posts.length) return;
    pendingAdminOrderChange.current = true;
    setCalendar((current) => {
      return { ...current, posts: reorderCalendarPosts(current.posts, index, targetIndex) };
    });
  };

  const movePostToIndex = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    pendingAdminOrderChange.current = true;
    setCalendar((current) => ({ ...current, posts: reorderCalendarPosts(current.posts, fromIndex, toIndex) }));
    setNotice(`Moved to ${displayPostLabel(toIndex)}`);
  };

  const addContentSlot = () => {
    let nextIndex = 0;
    setCalendar((current) => {
      nextIndex = current.posts.length;
      return {
        ...current,
        posts: [...current.posts, createCalendarPost(current.posts.length)],
      };
    });
    setNotice(`${displayPostLabel(nextIndex)} added`);
  };

  const removeContentSlot = (index: number) => {
    setCalendar((current) => ({
      ...current,
      posts: current.posts.filter((_, postIndex) => postIndex !== index).map((post, postIndex) => ({
        ...post,
        label: displayPostLabel(postIndex),
      })),
    }));
    setNotice(`${displayPostLabel(index)} deleted`);
  };

  const duplicateContentSlot = (index: number) => {
    setCalendar((current) => {
      const source = current.posts[index];
      if (!source) return current;
      const duplicate = {
        ...source,
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
      return {
        ...current,
        posts: relabelCalendarPosts([
          ...current.posts.slice(0, index + 1),
          duplicate,
          ...current.posts.slice(index + 1),
        ]),
      };
    });
    setNotice(`${displayPostLabel(index)} duplicated`);
  };

  const addStorySlot = () => {
    let nextIndex = 0;
    setCalendar((current) => {
      nextIndex = current.stories.length;
      return {
        ...current,
        stories: [...current.stories, createCalendarStory(current.stories.length)],
      };
    });
    setNotice(`${displayStoryLabel(nextIndex)} added`);
  };

  const removeStorySlot = (index: number) => {
    setCalendar((current) => ({
      ...current,
      stories: current.stories.filter((_, storyIndex) => storyIndex !== index).map((story, storyIndex) => ({
        ...story,
        label: displayStoryLabel(storyIndex),
      })),
    }));
    setNotice(`${displayStoryLabel(index)} deleted`);
  };

  const handleStoryBulkFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError("");
    setSaveState("");

    const emptyIndexes = calendar.stories
      .map((story, index) => (story.mediaUrl ? -1 : index))
      .filter((index) => index >= 0);
    const extraNeeded = Math.max(0, files.length - emptyIndexes.length);
    const startLength = calendar.stories.length;
    const targetIndexes = [
      ...emptyIndexes.slice(0, files.length),
      ...Array.from({ length: extraNeeded }).map((_, index) => startLength + index),
    ];

    if (extraNeeded > 0) {
      setCalendar((current) => ({
        ...current,
        stories: [
          ...current.stories,
          ...Array.from({ length: extraNeeded }).map((_, index) => createCalendarStory(current.stories.length + index)),
        ],
      }));
    }

    await Promise.allSettled(files.map((file, index) => uploadFile(file, { type: "story", index: targetIndexes[index] })));
  };

  const aiPickerAssets = aiPicker === "product"
    ? calendar.aiAssets.products
    : aiPicker === "model"
      ? calendar.aiAssets.models
      : aiPicker === "reference"
        ? calendar.aiAssets.references.filter((asset) => (asset.styleCategory ?? DEFAULT_STYLE_CATEGORY) === stylePickerCategory && (asset.styleUsage ?? "both") !== "video")
        : [];
  const stylePickerCategoryName = STYLE_CATEGORIES.find((category) => category.id === stylePickerCategory)?.name ?? "Studio";

  if (loading) {
    return <div className="p-6 lg:p-10"><div className="h-96 rounded-2xl bg-[#111] animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] p-4 lg:p-8">
      {notice && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-[#01F17C]/25 bg-[#07140d]/95 px-4 py-2 text-sm font-semibold text-[#01F17C] shadow-2xl shadow-black/30 backdrop-blur">
          {notice}
        </div>
      )}
      <AdminHeader
        title={pageTitle}
        actions={
          <>
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 text-xs font-semibold text-white/45">
              <span className={`h-1.5 w-1.5 rounded-full ${saving || saveState === "Autosaving..." ? "animate-pulse bg-[#01F17C]" : "bg-white/30"}`} />
              {autosaveLabel}
            </span>
            <button
              type="button"
              onClick={undoCalendarChange}
              disabled={undoStack.length === 0}
              title="Undo last dashboard change"
              aria-label="Undo last dashboard change"
              className={toolbarIconClass}
            >
              <Icon name="undo" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={redoCalendarChange}
              disabled={redoStack.length === 0}
              title="Redo dashboard change"
              aria-label="Redo dashboard change"
              className={toolbarIconClass}
            >
              <Icon name="redo" className="h-4 w-4" />
            </button>
            <Link
              href={activePreviewUrl}
              target="_blank"
              title={contentMode === "stories" ? "Stories preview" : "Posts preview"}
              aria-label={contentMode === "stories" ? "Stories preview" : "Posts preview"}
              className={toolbarIconClass}
            >
              <Icon name="eye" className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setContentMode((mode) => mode === "posts" ? "stories" : "posts");
                setToolbarMenuOpen(false);
                setOpenCardMenuIndex(null);
              }}
              title={contentMode === "stories" ? "Switch to posts" : "Switch to stories"}
              aria-label={contentMode === "stories" ? "Switch to posts" : "Switch to stories"}
              className="admin-action-secondary inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-black uppercase tracking-[0.16em] text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              {contentMode === "stories" ? "Posts" : "Stories"}
            </button>
            <button
              type="button"
              onClick={() => setProjectSettingsOpen((open) => !open)}
              title={projectSettingsOpen ? "Close settings" : "Settings"}
              aria-label={projectSettingsOpen ? "Close settings" : "Settings"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                projectSettingsOpen
                  ? "admin-action-danger border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/15"
                  : "admin-action-secondary border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
              aria-expanded={projectSettingsOpen}
            >
              <Icon name="settings" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              disabled={galleryItems.length === 0}
              title="Gallery"
              aria-label="Gallery"
              className={toolbarIconClass}
            >
              <Icon name="gallery" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={openHistory}
              title="Version history"
              aria-label="Version history"
              className={toolbarIconClass}
            >
              <Icon name="undo" className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolbarMenuOpen((open) => !open)}
                title="Add"
                aria-label="Add"
                aria-expanded={toolbarMenuOpen}
                className="admin-action-primary inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#01F17C] text-black transition-colors hover:bg-[#00d96e]"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
              {toolbarMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-1.5 shadow-2xl shadow-black/50">
                  {contentMode === "stories" ? (
                    <>
                      <button type="button" onClick={() => { addStorySlot(); setToolbarMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <Icon name="plus" className="h-4 w-4 text-[#01F17C]" />
                        Add story
                      </button>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <Icon name="gallery" className="h-4 w-4 text-white/45" />
                        Bulk upload stories
                        <input className="hidden" type="file" accept="image/*,video/*" multiple onChange={(event) => { setToolbarMenuOpen(false); handleStoryBulkFiles(event); }} />
                      </label>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => { addContentSlot(); setToolbarMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <Icon name="plus" className="h-4 w-4 text-[#01F17C]" />
                        Add content
                      </button>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <Icon name="replace" className="h-4 w-4 text-white/45" />
                        Upload media
                        <input className="hidden" type="file" accept="image/*,video/*" onChange={handleQuickUpload} />
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <Icon name="gallery" className="h-4 w-4 text-white/45" />
                        Bulk upload
                        <input className="hidden" type="file" accept="image/*,video/*" multiple onChange={(event) => { setToolbarMenuOpen(false); handleBulkFiles(event); }} />
                      </label>
                      <button type="button" onClick={() => { setBulkGenerateModal(defaultBulkGenerateSettings()); setToolbarMenuOpen(false); }} disabled={bulkGeneratingImageIndexes.length > 0 || generatingImageIndex !== null} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
                        <Icon name="sparkle" className="h-4 w-4 text-white/45" />
                        Bulk generate
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        }
      />

      {(error || visibleSaveState) && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-[#01F17C]/20 bg-[#01F17C]/10 text-[#01F17C]"}`}>
          {error || visibleSaveState}
        </div>
      )}

      {clientFeedbackItems.length > 0 && (
        <section className="mb-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/45">Client Feedback</p>
              <h2 className="mt-1 text-base font-black text-white">{clientFeedbackItems.length} item{clientFeedbackItems.length === 1 ? "" : "s"} need review</h2>
            </div>
            <button
              type="button"
              onClick={openHistory}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/60 transition-colors hover:bg-black/40 hover:text-white"
            >
              <Icon name="undo" className="h-3.5 w-3.5" />
              History
            </button>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {clientFeedbackItems.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => {
                  setContentMode(item.type === "story" ? "stories" : "posts");
                  window.requestAnimationFrame(() => {
                    document.getElementById(item.type === "story" ? `story-slot-${item.index}` : `content-slot-${item.index}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  });
                }}
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-left transition-colors hover:border-amber-200/25 hover:bg-black/30"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white">{item.label}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusTone(item.status)}`}>
                    {statusLabels[item.status]}
                  </span>
                </div>
                <p className="line-clamp-3 whitespace-pre-wrap text-xs font-medium leading-5 text-amber-50/82">
                  {item.note || "No written comment."}
                </p>
                {item.submittedAt ? (
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                    Submitted {formatClientSubmittedAt(item.submittedAt)}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      )}

      {(projectSettingsOpen || calendar.posts.length === 0) && (
      <div className={panelClass}>

        <section className="mt-5">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <p className={labelClass}>Client logo</p>
            <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-center text-xs font-bold uppercase tracking-widest text-white/35 transition-colors hover:border-[#01F17C]/50">
              {calendar.logoUrl ? (
                <img src={calendar.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : uploading.includes("logo") ? (
                uploadStatusLabel(uploadProgress.logo)
              ) : (
                "Upload logo"
              )}
              <input className="hidden" type="file" accept="image/*" onChange={(event) => handleFile(event, { type: "logo" })} />
            </label>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Client</span>
                <input className={fieldClass} value={calendar.clientName} onChange={(event) => setCalendar({ ...calendar, clientName: event.target.value })} />
              </label>
              <label>
                <span className={labelClass}>Campaign</span>
                <input className={fieldClass} value={calendar.campaignTitle} onChange={(event) => setCalendar({ ...calendar, campaignTitle: event.target.value })} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className={labelClass}>Followers</span>
                <input className={fieldClass} value={calendar.followers} onChange={(event) => setCalendar({ ...calendar, followers: event.target.value })} placeholder="Example: 12.4K" />
              </label>
              <label>
                <span className={labelClass}>Following</span>
                <input className={fieldClass} value={calendar.following} onChange={(event) => setCalendar({ ...calendar, following: event.target.value })} placeholder="Example: 240" />
              </label>
            </div>
            <label>
              <span className={labelClass}>Bio copy</span>
              <textarea className={areaClass} value={calendar.bio} onChange={(event) => setCalendar({ ...calendar, bio: event.target.value })} placeholder="Short profile copy the client will see under the name." />
            </label>
          </div>
        </div>
        </section>

      <section className="mt-6 border-t border-white/10 pt-5">
        <div className={`${captionBriefOpen ? "mb-5" : ""} flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">AI Caption Brief</p>
            <h2 className="mt-2 text-lg font-black text-white">Kuwaiti caption writer</h2>
            <p className="mt-1 text-sm text-white/45">Brand voice, dialect, audience, rules, and approved examples.</p>
          </div>
          <button
            type="button"
            onClick={() => setCaptionBriefOpen((open) => !open)}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-expanded={captionBriefOpen}
          >
            {captionBriefOpen ? "Close" : "Open"}
          </button>
        </div>

        {captionBriefOpen && (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Brand name</span>
              <input className={fieldClass} value={calendar.aiContext.brandName} onChange={(event) => updateAiContext({ brandName: event.target.value })} placeholder="Example: Lil Orbit" />
            </label>
            <label>
              <span className={labelClass}>Dialect</span>
              <input className={fieldClass} value={calendar.aiContext.dialect} onChange={(event) => updateAiContext({ dialect: event.target.value })} placeholder="Kuwaiti Arabic" />
            </label>
            <label>
              <span className={labelClass}>Caption visual style</span>
              <select className={fieldClass} value={calendar.aiContext.referenceStyle} onChange={(event) => updateAiContext({ referenceStyle: event.target.value })}>
                {referenceStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Tone</span>
              <textarea className={areaClass} value={calendar.aiContext.tone} onChange={(event) => updateAiContext({ tone: event.target.value })} placeholder="Friendly, premium, playful..." />
            </label>
            <label>
              <span className={labelClass}>Products / services</span>
              <textarea className={areaClass} value={calendar.aiContext.products} onChange={(event) => updateAiContext({ products: event.target.value })} placeholder="What does the brand sell? Main products, offers, categories..." />
            </label>
            <label>
              <span className={labelClass}>Target audience</span>
              <textarea className={areaClass} value={calendar.aiContext.audience} onChange={(event) => updateAiContext({ audience: event.target.value })} placeholder="Families, Gen Z, beauty audience, foodies..." />
            </label>
            <label>
              <span className={labelClass}>Caption rules</span>
              <textarea className={areaClass} value={calendar.aiContext.captionRules} onChange={(event) => updateAiContext({ captionRules: event.target.value })} placeholder="Short captions, no emojis, mention location, add CTA..." />
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Approved caption examples</span>
              <textarea
                className={areaClass}
                value={calendar.aiContext.approvedExamples}
                onChange={(event) => updateAiContext({ approvedExamples: event.target.value })}
                placeholder="Paste strong client-approved Kuwaiti captions here. These will guide future AI captions for this calendar."
              />
            </label>
          </div>
        )}
      </section>

      <section className="mt-6 border-t border-white/10 pt-5">
        <div className={`${productAssetsOpen ? "mb-5" : ""} flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">AI Production Assets</p>
            <h2 className="mt-2 text-lg font-black text-white">Product sheet library</h2>
            <p className="mt-1 text-sm text-white/45">{calendar.aiAssets.products.length} product sheet{calendar.aiAssets.products.length === 1 ? "" : "s"} saved. Models and styles stay inside the AI Image popup.</p>
          </div>
          <button
            type="button"
            onClick={() => setProductAssetsOpen((open) => !open)}
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-widest text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-expanded={productAssetsOpen}
          >
            {productAssetsOpen ? "Close" : "Open"}
          </button>
        </div>

        {productAssetsOpen && (
          <>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setProductSheetModal({ source: "library", name: "", files: [] })}
                className="rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20"
              >
                Upload Product Sheet
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {calendar.aiAssets.products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm font-semibold text-white/30 sm:col-span-2 xl:col-span-4">No product sheets yet.</div>
              ) : calendar.aiAssets.products.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white/[0.04]">
                    <img src={asset.url} alt="" className="h-full w-full object-cover" />
                  </div>
                  <input
                    className={`${fieldClass} mt-3 py-2`}
                    value={asset.name}
                    onChange={(event) => updateAiAsset("product", asset.id, { name: event.target.value })}
                    placeholder="Product name"
                  />
                  <textarea
                    className={`${areaClass} mt-2 min-h-20 py-2`}
                    value={asset.notes}
                    onChange={(event) => updateAiAsset("product", asset.id, { notes: event.target.value })}
                    placeholder="Product notes for AI"
                  />
                  <button type="button" onClick={() => removeAiAsset("product", asset.id)} className="mt-2 text-xs font-bold uppercase tracking-widest text-red-300/80 hover:text-red-200">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Instagram Highlights</h2>
            <p className="mt-1 text-sm text-white/40">Upload the small story highlight icons shown under the profile bio. Add extra highlights when a client has more than five.</p>
          </div>
          <button
            type="button"
            onClick={() => setCalendar((current) => addHighlight(current))}
            className="rounded-xl border border-[#01F17C]/30 bg-[#01F17C]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] transition hover:bg-[#01F17C]/15"
          >
            Add highlight
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {calendar.highlights.map((highlight, index) => (
            <div key={highlight.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Highlight {index + 1}</span>
                {index >= 5 && (
                  <button
                    type="button"
                    onClick={() => setCalendar((current) => removeHighlight(current, index))}
                    className="text-[10px] font-black uppercase tracking-widest text-red-300/80 hover:text-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className="mx-auto mb-3 flex aspect-square w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/15 bg-white/[0.03] text-center text-[10px] font-bold uppercase tracking-widest text-white/30 hover:border-[#01F17C]/50">
                {highlight.iconUrl ? (
                  <img src={highlight.iconUrl} alt="" className="h-full w-full object-cover" />
                ) : uploading.includes(`highlight-${index}`) ? (
                  uploadStatusLabel(uploadProgress[`highlight-${index}`], "...")
                ) : (
                  "Icon"
                )}
                <input className="hidden" type="file" accept="image/*" onChange={(event) => handleFile(event, { type: "highlight", index })} />
              </label>
              <input
                className={fieldClass}
                value={highlight.label}
                onChange={(event) => setCalendar((current) => applyHighlight(current, index, { label: event.target.value }))}
                placeholder="Label"
              />
            </div>
          ))}
        </div>
      </section>

      </div>
      )}

      {contentMode === "stories" && (
      <section className={`${panelClass} mb-6`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">Instagram Stories</p>
            <h2 className="mt-2 text-lg font-black text-white">Story uploads</h2>
            <p className="mt-1 text-sm text-white/45">Upload vertical story frames here. Clients review them in a separate Stories preview.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={storiesPreviewUrl}
              target="_blank"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-widest text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Stories preview
            </Link>
            <button
              type="button"
              onClick={addStorySlot}
              className="inline-flex items-center justify-center rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] transition-colors hover:bg-[#01F17C]/20"
            >
              Add story
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#01F17C] px-3 py-2 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-[#00d96e]">
              Bulk upload
              <input className="hidden" type="file" accept="image/*,video/*" multiple onChange={handleStoryBulkFiles} />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {calendar.stories.map((story, index) => (
            <article id={`story-slot-${index}`} key={`${story.id}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 scroll-mt-6">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{displayStoryLabel(index)}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">{story.mediaType}</p>
                </div>
                <button type="button" onClick={() => removeStorySlot(index)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-white/45 transition-colors hover:bg-red-500/10 hover:text-red-200" aria-label={`Delete ${displayStoryLabel(index)}`}>
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>

              <label className="relative flex aspect-[9/16] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-black/35 text-center text-xs font-bold uppercase tracking-widest text-white/30 transition-colors hover:border-[#01F17C]/50">
                {story.mediaUrl ? (
                  story.mediaType === "video" ? (
                    <>
                      {story.thumbnailUrl ? (
                        <img src={story.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={story.mediaUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                      )}
                      <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">Video</span>
                    </>
                  ) : (
                    <img src={story.mediaUrl} alt="" className="h-full w-full object-cover" />
                  )
                ) : uploading.includes(`story-${index}`) ? (
                  uploadStatusLabel(uploadProgress[`story-${index}`])
                ) : (
                  "Upload story"
                )}
                <input className="hidden" type="file" accept="image/*,video/*" onChange={(event) => handleFile(event, { type: "story", index })} />
              </label>

              <div className="mt-3 grid gap-2">
                <select
                  className={`${fieldClass} py-2`}
                  value={story.status}
                  onChange={(event) => setCalendar((current) => applyStory(current, index, { status: event.target.value as CalendarPostStatus }))}
                >
                  {statusOptions.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  className={`${fieldClass} py-2`}
                  value={story.publishDate}
                  onChange={(event) => setCalendar((current) => applyStory(current, index, { publishDate: event.target.value }))}
                  placeholder="Story date / sequence"
                />
                <textarea
                  className={`${areaClass} min-h-20 py-2`}
                  value={story.clientNote}
                  onChange={(event) => setCalendar((current) => applyStory(current, index, { clientNote: event.target.value }))}
                  placeholder="Internal/client note"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      {contentMode === "posts" && (
      <section className="pt-0">
        <div className="grid gap-4 xl:grid-cols-2">
          {calendar.posts.map((post, index) => (
            <article
              id={`content-slot-${index}`}
              key={`${post.id}-${index}`}
              draggable={contentMode === "posts"}
              onDragStart={(event) => {
                setDraggingPostIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const fromIndex = draggingPostIndex ?? Number(event.dataTransfer.getData("text/plain"));
                setDraggingPostIndex(null);
                if (Number.isFinite(fromIndex)) movePostToIndex(fromIndex, index);
              }}
              onDragEnd={() => setDraggingPostIndex(null)}
              className={`admin-glass-panel relative rounded-2xl border border-white/10 p-3 scroll-mt-6 transition-all hover:border-white/18 hover:shadow-[0_22px_60px_rgba(0,0,0,0.26)] ${openCardMenuIndex === index ? "z-[80]" : "z-0"} ${draggingPostIndex === index ? "opacity-45 ring-2 ring-[#01F17C]/40" : ""}`}
            >
	              {(() => {
	                const isGeneratingThisImage = generatingImageIndex === index || bulkGeneratingImageIndexes.includes(index);
	                const isGeneratingThisVideo = generatingVideoIndex === index;
	                const isEditingThisImage = editingImageIndex === index;
                const isRevealingThisImage = revealingImageIndex === index;
                const previewSource = post.mediaUrl;
                const previewName = `${calendar.clientName || "Content"} - ${displayPostLabel(index)}`;
                const mediaFrameClass = previewSource
                  ? "aspect-[4/5]"
                  : "h-28 sm:h-auto sm:aspect-[4/5]";

                return (
                  <>
              <div className="mb-2.5 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="cursor-grab select-none rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-black text-white/35 active:cursor-grabbing" title="Drag to reorder">::</span>
                  <p className="truncate text-sm font-semibold text-white">{displayPostLabel(index)}</p>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot(post.status)}`} title={statusLabels[post.status]} />
                  {post.mediaType === "video" && <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">Video</span>}
                  {post.mediaType === "carousel" && <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">Carousel</span>}
                  {isGeneratingThisVideo && <span className="rounded-full bg-[#01F17C]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#01F17C]">Generating</span>}
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenCardMenuIndex((current) => current === index ? null : index)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"
                    aria-label="Content options"
                    aria-expanded={openCardMenuIndex === index}
                  >
                    <Icon name="more" className="h-4 w-4" />
                  </button>
                  {openCardMenuIndex === index && (
                    <div className="fixed inset-x-3 bottom-3 z-[90] max-h-[min(54dvh,24rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#111111]/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl sm:absolute sm:inset-auto sm:right-0 sm:top-[calc(100%+6px)] sm:z-[90] sm:w-64 sm:max-h-[min(64vh,26rem)] sm:rounded-2xl sm:p-2">
                      <div className="mb-1 flex items-center justify-between px-2 py-1 sm:hidden">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">{displayPostLabel(index)}</p>
                        <button type="button" onClick={() => setOpenCardMenuIndex(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/60" aria-label="Close options">
                          <Icon name="x" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button type="button" onClick={() => { duplicateContentSlot(index); setOpenCardMenuIndex(null); }} className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white">
                          <Icon name="replace" className="h-3.5 w-3.5 text-white/40" />
                          Duplicate
                        </button>
                        {post.mediaUrl && (
                          <button type="button" onClick={() => { downloadImage(post.mediaUrl, previewName, post.mediaType); setOpenCardMenuIndex(null); }} className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white">
                            <Icon name="download" className="h-3.5 w-3.5 text-white/40" />
                            Download
                          </button>
                        )}
                        {post.mediaUrl && (
                          <button type="button" onClick={() => { deletePostMedia(index, { id: post.activeGeneratedMediaId, url: post.mediaUrl }); setOpenCardMenuIndex(null); }} className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-200/80 transition-colors hover:bg-red-500/10 hover:text-red-100">
                            <Icon name="trash" className="h-3.5 w-3.5" />
                            Remove media
                          </button>
                        )}
                        <button type="button" onClick={() => { movePost(index, -1); setOpenCardMenuIndex(null); }} disabled={index === 0} className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                          <span className="text-white/40">↑</span>
                          Move up
                        </button>
                        <button type="button" onClick={() => { movePost(index, 1); setOpenCardMenuIndex(null); }} disabled={index === calendar.posts.length - 1} className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                          <span className="text-white/40">↓</span>
                          Move down
                        </button>
                      </div>
                      <div className="my-1 border-t border-white/10" />
                      <p className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Status</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {statusOptions.map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setCalendar((current) => applyPost(current, index, { status: value }));
                              setOpenCardMenuIndex(null);
                            }}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${post.status === value ? "bg-[#01F17C]/10 text-[#01F17C]" : "text-white/65 hover:bg-white/[0.06] hover:text-white"}`}
                          >
                            <span>{label}</span>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot(value)}`} />
                          </button>
                        ))}
                      </div>
                      <div className="my-1 border-t border-white/10" />
                      <p className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Type</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["image", "video", "carousel"] as CalendarMediaType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setCalendar((current) => {
                                const postToUpdate = current.posts[index];
                                if (type === "carousel") {
                                  const carouselItems = carouselItemsFromPost(postToUpdate);
                                  const first = carouselItems[0];
                                  return applyPost(current, index, {
                                    mediaType: "carousel",
                                    mediaUrl: first?.url ?? postToUpdate?.mediaUrl ?? "",
                                    originalMediaUrl: first?.originalUrl ?? first?.url ?? postToUpdate?.originalMediaUrl ?? "",
                                    thumbnailUrl: first?.thumbnailUrl ?? postToUpdate?.thumbnailUrl ?? "",
                                    carouselItems,
                                  });
                                }
                                return applyPost(current, index, { mediaType: type });
                              });
                              setOpenCardMenuIndex(null);
                            }}
                            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-colors ${post.mediaType === type ? "bg-[#01F17C]/10 text-[#01F17C]" : "text-white/65 hover:bg-white/[0.06] hover:text-white"}`}
                          >
                            <Icon name={type === "carousel" ? "gallery" : type} className="h-3.5 w-3.5 text-white/40" />
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="my-1 border-t border-white/10" />
                      <button type="button" onClick={() => { removeContentSlot(index); setOpenCardMenuIndex(null); }} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-200/80 transition-colors hover:bg-red-500/10 hover:text-red-100">
                        <Icon name="trash" className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 sm:grid-cols-[128px_minmax(0,1fr)] 2xl:grid-cols-[136px_minmax(0,1fr)]">
                <div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => previewSource ? setImagePreview({ assetId: post.activeGeneratedMediaId || undefined, url: previewSource, originalUrl: post.originalMediaUrl || previewSource, name: previewName, postIndex: index, mediaType: post.mediaType }) : undefined}
                    className={`relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-center text-xs font-bold uppercase tracking-widest text-white/35 hover:border-[#01F17C]/50 ${mediaFrameClass}`}
                    aria-label={previewSource ? "Open media preview" : "Upload media"}
                  >
	                    {(isGeneratingThisImage || isGeneratingThisVideo || isEditingThisImage) && (
	                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
	                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#01F17C]/20 border-t-[#01F17C]" />
	                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#01F17C]">{isEditingThisImage ? "Editing" : isGeneratingThisVideo ? "Video" : "Generating"}</span>
	                      </div>
	                    )}
                    {post.mediaUrl ? (
                      post.mediaType === "video" ? (
                        <>
                          {post.thumbnailUrl ? (
                            <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <video src={post.mediaUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                          )}
                          <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">Reel</span>
                        </>
                      ) : post.mediaType === "carousel" ? (
                        <>
                          {post.carouselItems?.[0]?.mediaType === "video" ? (
                            post.carouselItems[0].thumbnailUrl ? (
                              <img src={post.carouselItems[0].thumbnailUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <video src={post.carouselItems[0].url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                            )
                          ) : (
                            <img src={carouselPreviewUrl(post.carouselItems?.[0]) || post.mediaUrl} alt="" className="h-full w-full object-cover" />
                          )}
                          <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">{post.carouselItems?.length || 1} slides</span>
                        </>
                      ) : (
                        <img src={post.mediaUrl} alt="" className={`h-full w-full object-cover ${isRevealingThisImage ? "astro-magic-reveal" : ""}`} />
                      )
                    ) : uploading.includes(`post-${index}`) ? (
                      uploadStatusLabel(uploadProgress[`post-${index}`])
                    ) : (
                      "Upload media"
                    )}
                  </button>
                  {!previewSource && (
                    <label className="absolute inset-0 cursor-pointer" aria-label="Upload media">
                      <input className="hidden" type="file" accept={post.mediaType === "video" ? "video/*" : "image/*,video/*"} multiple={post.mediaType !== "video"} onChange={(event) => post.mediaType === "carousel" ? handleCarouselFiles(event, index) : handleFile(event, { type: "post", index })} />
                    </label>
                  )}
	                </div>
	                {post.mediaType === "carousel" ? (
                    <div className="mt-2 grid gap-2">
                      <label className="flex cursor-pointer items-center justify-center rounded-lg border border-[#01F17C]/20 bg-[#01F17C]/10 px-3 py-2 text-[11px] font-semibold text-[#01F17C] transition-colors hover:bg-[#01F17C]/18">
                        {uploading.includes(`carousel-${index}`) ? "Uploading..." : "Add carousel slides"}
                        <input className="hidden" type="file" accept="image/*,video/*" multiple onChange={(event) => handleCarouselFiles(event, index)} />
                      </label>
                      {(post.carouselItems ?? []).length > 0 && (
                        <div className="grid grid-cols-3 gap-1">
                          {(post.carouselItems ?? []).map((item, itemIndex) => (
                            <div key={item.id} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-black/35">
                              {item.mediaType === "video" ? (
                                item.thumbnailUrl ? (
                                  <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                ) : (
                                  <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                )
                              ) : (
                                <img src={item.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                              )}
                              <span className="absolute left-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[8px] font-bold text-white/80">{itemIndex + 1}</span>
                              {item.mediaType === "video" && <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[8px] font-bold text-white/80">Video</span>}
                              <button
                                type="button"
                                onClick={() => removeCarouselItem(index, item.id)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border border-red-300/20 bg-black/70 text-red-100 opacity-100 transition-colors hover:bg-red-500/25 sm:opacity-0 sm:group-hover:opacity-100"
                                title="Delete carousel slide"
                                aria-label={`Delete carousel slide ${itemIndex + 1}`}
                              >
                                <Icon name="trash" className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
	                <div className="mt-2 grid grid-cols-4 gap-1">
                    {post.mediaType === "video" ? (
                      <>
                        <MediaActionButton
                          title="Astro Magic Image"
                          icon="gallery"
                          tone="green"
                          disabled={isGeneratingThisImage || isGeneratingThisVideo || isEditingThisImage}
                          onClick={() => openAiImageModal(index)}
                        />
                        <MediaActionButton
                          title="Astro Magic Video"
                          icon="sparkle"
                          tone="green"
                          disabled={isGeneratingThisImage || isGeneratingThisVideo || isEditingThisImage}
                          onClick={() => openAiVideoModal(index)}
                        />
                      </>
                    ) : (
                      <MediaActionButton
                        title="Astro Magic Image"
                        icon="sparkle"
                        tone="green"
                        disabled={isGeneratingThisImage || isGeneratingThisVideo || isEditingThisImage}
                        onClick={() => openAiImageModal(index)}
                      />
                    )}
                    {post.mediaType !== "video" && (
                      <MediaUploadAction
                        title="Upload carousel slides"
                        accept="image/*,video/*"
                        uploading={uploading.includes(`carousel-${index}`)}
                        disabled={isGeneratingThisImage || isGeneratingThisVideo || isEditingThisImage}
                        onChange={(event) => handleCarouselFiles(event, index)}
                      />
                    )}
	                  <MediaActionButton title="Previous content" icon="undo" disabled={!timelineNeighbor(post, 1)} onClick={() => undoGeneratedImage(index)} />
	                  <MediaActionButton title="Next content" icon="redo" disabled={!timelineNeighbor(post, -1)} onClick={() => redoGeneratedImage(index)} />
	                </div>
                  )}
	                {(isGeneratingThisImage || isGeneratingThisVideo || isEditingThisImage) && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-[#01F17C]" />
                  </div>
                )}
                </div>

              <div className="grid content-start gap-2.5">
                <label>
                  <div className="relative">
                    <textarea
                      className={`${areaClass} min-h-[112px] pb-3 pr-4 pt-2 sm:min-h-[132px] sm:pb-11`}
                      value={post.caption}
                      onChange={(event) => setCalendar((current) => applyPost(current, index, { caption: event.target.value }))}
                      placeholder="Paste or generate caption."
                    />
                    <button
                      onClick={() => generateCaption(index)}
                      disabled={generatingCaption === index || !post.mediaUrl}
                      title="Generate AI caption"
                      aria-label="Generate AI caption"
                      className="mt-1.5 flex w-full justify-center rounded-lg border border-[#01F17C]/20 bg-[#01F17C]/10 px-3 py-1.5 text-[11px] font-semibold leading-none text-[#01F17C] transition-colors hover:bg-[#01F17C]/18 hover:text-[#7cffb9] disabled:cursor-not-allowed disabled:opacity-40 sm:absolute sm:bottom-4 sm:right-2 sm:mt-0 sm:w-auto"
                      type="button"
                    >
                      {generatingCaption === index ? "Generating..." : "Generate caption"}
                    </button>
                  </div>
                </label>
                <div className={`rounded-xl border p-3 ${post.clientNote?.trim() ? "border-amber-300/20 bg-amber-300/[0.07]" : "border-white/10 bg-white/[0.025]"}`}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Client comment</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusTone(post.status)}`}>
                      {statusLabels[post.status]}
                    </span>
                  </div>
                  {post.clientNote?.trim() ? (
                    <>
                      <p className="whitespace-pre-wrap text-xs font-medium leading-5 text-amber-50/85">{post.clientNote}</p>
                      {post.clientNoteSubmittedAt ? (
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                          Submitted {formatClientSubmittedAt(post.clientNoteSubmittedAt)}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-xs font-medium text-white/28">No client comment.</p>
                  )}
                </div>
              </div>
              </div>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      </section>
      )}

      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setGalleryOpen(false)}>
          <div className="admin-glass-panel max-h-[calc(100dvh-1rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">Gallery</p>
                <h2 className="mt-1 text-xl font-black text-white">Generated content library</h2>
                <p className="mt-1 text-sm text-white/40">{galleryItems.length} image/video item{galleryItems.length === 1 ? "" : "s"} across this calendar.</p>
              </div>
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                title="Close gallery"
                aria-label="Close gallery"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-4">
              {galleryItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-sm font-semibold text-white/35">
                  No generated content yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {galleryItems.map((item, itemIndex) => (
                    <div key={`${item.id}-${item.postIndex}-${itemIndex}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview({
                            assetId: item.id,
                            url: item.url,
                            originalUrl: item.originalUrl || item.url,
                            name: `${calendar.clientName || "Content"} - ${item.postLabel}`,
                            postIndex: item.postIndex,
                            mediaType: item.mediaType,
                          });
                        }}
                        className="group block w-full text-left"
                      >
                        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-black/40">
                          {item.mediaType === "video" ? (
                            <>
                              {item.thumbnailUrl ? (
                                <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
                              ) : (
                                <video src={item.url} className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" muted playsInline preload="none" />
                              )}
                              <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white">Video</span>
                            </>
                          ) : (
                            <img src={galleryPreviewUrl(item)} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
                          )}
                          {item.isCurrent && <span className="absolute left-2 top-2 rounded-md bg-[#01F17C] px-2 py-1 text-[10px] font-black text-black">Current</span>}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-bold text-white">{item.postLabel}</p>
                          <p className="mt-1 truncate text-xs text-white/35">{item.source.replace(/-/g, " ")}</p>
                        </div>
                      </button>
                      {!item.isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryOpen(false);
                            restoreGeneratedMedia(item.postIndex, item);
                          }}
                          className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] justify-center rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] transition-colors hover:bg-[#01F17C]/20"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deletePostMedia(item.postIndex, item)}
                        className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] justify-center rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-100 transition-colors hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" onMouseDown={(event) => event.currentTarget === event.target && setHistoryOpen(false)}>
          <div className="max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101010] p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Recovery</p>
                <h2 className="mt-1 text-lg font-black text-white">Version History</h2>
                <p className="mt-1 text-sm font-medium text-white/45">Restore a previous saved calendar state if order, comments, or media are overwritten.</p>
              </div>
              <button type="button" onClick={() => setHistoryOpen(false)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-white/60 hover:text-white">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            {historyLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm font-semibold text-white/40">Loading history...</div>
            ) : historyItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm font-semibold text-white/35">No snapshots yet. New saves will be tracked from now on.</div>
            ) : (
              <div className="space-y-2">
                {historyItems.map((item) => (
                  <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{item.summary}</p>
                      <p className="mt-1 text-xs font-semibold text-white/40">{new Date(item.createdAt).toLocaleString()} · {item.actor.replace(/_/g, " ")} · {item.action.replace(/_/g, " ")}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
                        <span>{item.postCount} posts</span>
                        <span>{item.videoCount} videos</span>
                        <span>{item.approvedCount} approved</span>
                        <span>{item.needsEditsCount} edits</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => restoreHistorySnapshot(item.id)}
                      disabled={Boolean(restoringHistoryId)}
                      className="inline-flex items-center justify-center rounded-xl border border-[#01F17C]/25 bg-[#01F17C]/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#01F17C] transition-colors hover:bg-[#01F17C]/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {restoringHistoryId === item.id ? "Restoring..." : "Restore"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setImagePreview(null)}>
          <div className="admin-glass-panel relative flex max-h-[calc(100dvh-1rem)] w-fit min-w-[min(92vw,320px)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/70 text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
              title="Close"
              aria-label="Close"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
            <div className="shrink-0 flex max-w-full flex-col gap-3 border-b border-white/10 p-3 pr-12 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="min-w-0 max-w-[min(64vw,24rem)] sm:max-w-[min(46vw,30rem)]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">{imagePreview.mediaType === "video" ? "Video Preview" : "Image Preview"}</p>
                <h2 className="mt-1 truncate text-xs font-medium text-white/70 sm:text-sm">{imagePreview.name}</h2>
              </div>
              <div className="flex max-w-full flex-wrap gap-1.5 sm:shrink-0 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/65 transition-colors hover:bg-white/10 hover:text-white sm:flex"
                  title="Close"
                  aria-label="Close"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => downloadImage(imagePreview.url, imagePreview.name, imagePreview.mediaType)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 text-[#01F17C] transition-colors hover:bg-[#01F17C]/20"
                  title={imagePreview.mediaType === "video" ? "Save video" : "Save image"}
                  aria-label={imagePreview.mediaType === "video" ? "Save video" : "Save image"}
                >
                  <Icon name="download" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deletePostMedia(imagePreview.postIndex, { id: imagePreview.assetId ?? "", url: imagePreview.url })}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/20 bg-red-500/10 text-red-100 transition-colors hover:bg-red-500/20"
                  title="Delete media"
                  aria-label="Delete media"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
                {imagePreview.mediaType === "image" && (
                  <button
                    type="button"
                    onClick={() => setImageEditModal({ ...imagePreview, instruction: "" })}
                    disabled={editingImageIndex === imagePreview.postIndex}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
                    title="Edit"
                    aria-label="Edit"
                  >
                    {editingImageIndex === imagePreview.postIndex ? <span className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white" /> : <Icon name="edit" className="h-4 w-4" />}
                  </button>
                )}
                <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white" title="Replace" aria-label="Replace">
                  <Icon name="replace" className="h-4 w-4" />
                  <input className="hidden" type="file" accept={imagePreview.mediaType === "video" ? "video/*" : "image/*"} onChange={(event) => handleFile(event, { type: "post", index: imagePreview.postIndex })} />
                </label>
                {imagePreview.mediaType === "video" && (
                  <label className="flex h-9 cursor-pointer items-center rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-white/10">
                    Thumbnail
                    <input className="hidden" type="file" accept="image/*" onChange={(event) => handleFile(event, { type: "thumbnail", index: imagePreview.postIndex })} />
                  </label>
                )}
              </div>
            </div>
            <div className="relative flex min-h-0 shrink-0 self-center items-center justify-center overflow-hidden bg-black">
              {(editingImageIndex === imagePreview.postIndex || revealingImageIndex === imagePreview.postIndex) && (
                <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                  <div className="astro-magic-particles" />
                  {editingImageIndex === imagePreview.postIndex && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 backdrop-blur-sm">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#01F17C]/20 border-t-[#01F17C]" />
                      <span className="text-xs font-black uppercase tracking-[0.24em] text-[#01F17C]">Editing</span>
                    </div>
                  )}
                </div>
              )}
              {imagePreview.mediaType === "video" ? (
                <video src={imagePreview.url} className="max-h-[calc(100dvh-15rem)] max-w-[calc(100vw-1rem)] bg-black object-contain" style={{ width: "auto", height: "auto" }} controls playsInline />
              ) : (
                <img src={imagePreview.url} alt="" className={`max-h-[calc(100dvh-15rem)] max-w-[calc(100vw-1rem)] object-contain ${revealingImageIndex === imagePreview.postIndex ? "astro-magic-reveal" : ""}`} style={{ width: "auto", height: "auto" }} />
              )}
              {(() => {
                const previewPost = calendar.posts[imagePreview.postIndex];
                const previewHistory = mediaTimeline(previewPost).slice(0, 10);
                if (previewHistory.length === 0) return null;
                const filmstripWidth = Math.min(336, Math.max(48, previewHistory.length * 44 + 16));

                return (
                  <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center px-2 sm:bottom-3 sm:px-3">
                    <div className="preview-history-glass rounded-[18px] p-1.5" style={{ width: `min(${filmstripWidth}px, 100%)` }}>
                      <div className="preview-history-strip flex items-center gap-2 overflow-x-auto px-0.5 py-1">
                        {previewHistory.map((item, historyIndex) => {
                          const isActivePreview = imagePreview.assetId ? item.id === imagePreview.assetId : item.url === imagePreview.url;
                          return (
                            <div key={item.id} className={`preview-history-item ${isActivePreview ? "preview-history-item-active" : ""} group relative flex h-11 w-8 shrink-0 items-center justify-center overflow-visible rounded-[10px] border bg-transparent sm:h-12 sm:w-9`}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isActivePreview) return;
                                  setImagePreview({
                                    assetId: item.id,
                                    url: item.url,
                                    originalUrl: item.originalUrl || item.url,
                                    name: `${calendar.clientName || "Content"} - ${displayPostLabel(imagePreview.postIndex)} - Version ${historyIndex + 1}`,
                                    postIndex: imagePreview.postIndex,
                                    mediaType: item.mediaType,
                                  });
                                }}
                                className="flex h-full w-full items-center justify-center overflow-visible rounded-[10px]"
                                title={isActivePreview ? "Current preview" : "Preview generated content"}
                                aria-label={isActivePreview ? "Current preview" : "Preview generated content"}
                                aria-current={isActivePreview ? "true" : undefined}
                              >
                                {item.mediaType === "video" ? (
                                  <>
                                    {item.thumbnailUrl ? (
                                <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full rounded-[8px] object-contain shadow-sm" />
                              ) : (
                                <video src={item.url} className="max-h-full max-w-full rounded-[8px] object-contain shadow-sm" muted playsInline preload="none" />
                              )}
                                    <span className="absolute right-0.5 top-0.5 rounded bg-black/45 px-1 py-0.5 text-[7px] font-bold text-white backdrop-blur">Vid</span>
                                  </>
                                ) : (
                              <img src={item.url} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full rounded-[8px] object-contain shadow-sm" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deletePostMedia(imagePreview.postIndex, item);
                                }}
                                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-red-300/20 bg-black/85 text-red-100 shadow-lg opacity-100 transition-colors hover:bg-red-500/35 sm:opacity-0 sm:group-hover:opacity-100"
                                title="Delete this version"
                                aria-label={`Delete version ${historyIndex + 1}`}
                              >
                                <Icon name="trash" className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {imageEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/75 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setImageEditModal(null)}>
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#01F17C]">Edit Image</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">{imageEditModal.name}</h2>
                <p className="mt-1 text-sm text-white/45">Tell Astro Magic what to change. It will keep the same image unless you ask otherwise.</p>
              </div>
              <button type="button" title="Close" aria-label="Close" onClick={() => setImageEditModal(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/60 hover:text-white">
                Close
              </button>
            </div>
            <textarea
              className={`${areaClass} min-h-36`}
              value={imageEditModal.instruction}
              onChange={(event) => setImageEditModal({ ...imageEditModal, instruction: event.target.value })}
              placeholder="Example: make the product smaller, remove the extra cup, keep the same exact image but change the outfit to a black abaya..."
            />
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setImageEditModal(null)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Cancel
              </button>
              <button
                type="button"
                onClick={editPreviewImage}
                disabled={editingImageIndex !== null}
                className="rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:cursor-wait disabled:opacity-60"
              >
                {editingImageIndex !== null ? "Editing..." : "Apply Edit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/75 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setBulkGenerateModal(null)}>
          <div className="max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl sm:p-5" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#01F17C]">Bulk Generate</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">Astro Magic Batch</h2>
                <p className="mt-1 text-sm text-white/45">Set the shared direction for every generated image post.</p>
              </div>
              <button type="button" title="Close" aria-label="Close" onClick={() => setBulkGenerateModal(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/60 hover:text-white">
                Close
              </button>
            </div>

            <label className="block">
              <span className={labelClass}>Color palette</span>
              <input
                className={fieldClass}
                value={bulkGenerateModal.palette}
                onChange={(event) => setBulkGenerateModal({ ...bulkGenerateModal, palette: event.target.value })}
                placeholder="Example: yellow and red"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {paletteOptions.map((palette) => (
                <button
                  key={palette}
                  type="button"
                  onClick={() => setBulkGenerateModal({ ...bulkGenerateModal, palette })}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${bulkGenerateModal.palette === palette ? "border-[#01F17C] bg-[#01F17C]/15 text-[#01F17C]" : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"}`}
                >
                  {palette}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <span className={labelClass}>Mode</span>
              <div className="grid gap-2 sm:grid-cols-5">
                {bulkModeOptions.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBulkGenerateModal({ ...bulkGenerateModal, mode })}
                    className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors ${bulkGenerateModal.mode === mode ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className={labelClass}>Vibe</span>
              <div className="grid gap-2 sm:grid-cols-4">
                {bulkVibeOptions.map((vibe) => (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => setBulkGenerateModal({ ...bulkGenerateModal, vibe })}
                    className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors ${bulkGenerateModal.vibe === vibe ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"}`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className={labelClass}>Models</span>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {calendar.aiAssets.models.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm font-semibold text-white/35">
                    No models uploaded. Bulk Generate will create product-led images.
                  </div>
                ) : calendar.aiAssets.models.map((model) => {
                  const selected = bulkGenerateModal.modelIds.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setBulkGenerateModal({
                        ...bulkGenerateModal,
                        modelIds: selected ? bulkGenerateModal.modelIds.filter((id) => id !== model.id) : [...bulkGenerateModal.modelIds, model.id],
                      })}
                      className={`overflow-hidden rounded-2xl border bg-black/30 text-left transition-all ${selected ? "border-[#01F17C] ring-2 ring-[#01F17C]/20" : "border-white/10 hover:border-white/25"}`}
                    >
                      <div className="relative flex aspect-square items-center justify-center bg-white p-3">
                        <img src={model.previewUrl || model.url} alt="" className="h-full w-full rounded-full object-cover object-top" />
                        <span className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-black ${selected ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-black/15 bg-white text-black/20"}`}>
                          {selected ? "✓" : ""}
                        </span>
                      </div>
                      <p className="truncate px-3 py-2 text-xs font-bold text-white/70">{model.name || "Unnamed"}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-5 block">
              <span className={labelClass}>Outfit</span>
              <textarea
                className={`${areaClass} min-h-24`}
                value={bulkGenerateModal.outfit}
                onChange={(event) => setBulkGenerateModal({ ...bulkGenerateModal, outfit: event.target.value })}
                placeholder="Example: traditional Kuwaiti outfit, red accents, clean styling..."
              />
            </label>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setBulkGenerateModal(null)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => bulkGenerateImages(bulkGenerateModal)}
                disabled={bulkGeneratingImageIndexes.length > 0}
                className="rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:cursor-wait disabled:opacity-60"
              >
                {bulkGeneratingImageIndexes.length > 0 ? "Generating..." : "Generate Batch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {aiVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/75 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setAiVideoModal(null)}>
          <div className="max-h-[calc(100dvh-1rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl sm:p-5" onMouseDown={(event) => event.stopPropagation()}>
            {(() => {
              const model = videoModelInfo(aiVideoModal.modelKey);
              const showQuality = aiVideoModal.modelKey === "veo-3-1";
              const resolutionChoices = videoResolutionChoices(aiVideoModal.modelKey);
              const isSeedanceVideo = aiVideoModal.modelKey.startsWith("seedance");
              const selectedLibraryVideoAssets = selectedVideoAssets(aiVideoModal);
              const selectedModelVideoAssets = selectedVideoModelAssets(aiVideoModal);
              const selectedReferenceVideoAssets = selectedVideoReferenceAssets(aiVideoModal);
              const videoStyleAssets = calendar.aiAssets.references.filter((asset) => (asset.styleUsage ?? "both") !== "image");
              const attachedVideoImageUrls = videoImageUrls(aiVideoModal);
              const seedanceLibrarySlotsLeft = isSeedanceVideo
                ? Math.max(0, 9 - aiVideoModal.imageUrls.length - selectedLibraryVideoAssets.length)
                : 0;
              const modelAssetLimit = isSeedanceVideo
                ? videoAssetLimit(aiVideoModal.modelKey, "model", aiVideoModal.imageUrls.length)
                : videoAssetLimit(aiVideoModal.modelKey, "model", aiVideoModal.imageUrls.length);
              const referenceAssetLimit = isSeedanceVideo
                ? aiVideoModal.referenceIds.length + seedanceLibrarySlotsLeft
                : videoAssetLimit(aiVideoModal.modelKey, "reference", aiVideoModal.imageUrls.length);

              return (
                <>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#01F17C]">Astro Magic Video</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">{displayPostLabel(aiVideoModal.postIndex)}</h2>
                    </div>
                    <button type="button" onClick={() => setAiVideoModal(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white" aria-label="Close">
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className={labelClass}>Write your prompt</span>
                      <button
                        type="button"
                        onClick={enhanceAiVideoPrompt}
                        disabled={enhancingVideoPrompt || !aiVideoModal.prompt.trim()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 text-sm font-black text-[#01F17C] transition-colors hover:bg-[#01F17C]/20 disabled:cursor-not-allowed disabled:opacity-35"
                        title="Enhance prompt"
                        aria-label="Enhance prompt"
                      >
                        ✦
                      </button>
                    </div>
                    <textarea
                      className={`${areaClass} min-h-24 text-base`}
                      value={aiVideoModal.prompt}
                      onChange={(event) => setAiVideoModal({ ...aiVideoModal, prompt: event.target.value })}
                      placeholder="Describe the motion. Example: slow cinematic push-in, product glows softly, premium realistic movement..."
                    />
                  </label>

                  <details className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-white/55 marker:text-white/30">Advanced video controls</summary>
                    <div className="mt-4">
                  <div>
                    <span className={labelClass}>Video mode</span>
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                      {videoModelOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => setAiVideoModal({
                            ...aiVideoModal,
                            modelKey: option.key,
                            quality: option.key === "veo-3-1" ? "fast" : "standard",
                            resolution: normalizedVideoResolution(option.key, aiVideoModal.resolution),
                            aspectRatio: option.key === "veo-3" || option.key === "veo-3-1" ? "9:16" : aiVideoModal.aspectRatio,
                            duration: option.key.startsWith("seedance") ? "5" : option.key === "veo-3" || option.key === "veo-3-1" ? "8" : "5",
                            shotMode: option.key === "kling-3" ? aiVideoModal.shotMode : "single",
                            modelIds: aiVideoModal.modelIds.slice(0, videoAssetLimit(option.key, "model", aiVideoModal.imageUrls.length)),
                            referenceIds: aiVideoModal.referenceIds.slice(0, videoAssetLimit(option.key, "reference", aiVideoModal.imageUrls.length)),
                          })}
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${aiVideoModal.modelKey === option.key ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
                        >
                          <span className="block font-black">{option.label}</span>
                          {option.disabled && <span className="mt-1 block text-[10px] opacity-70">Endpoint pending</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {showQuality && (
                      <label>
                        <span className={labelClass}>Speed</span>
                        <select
                          className={fieldClass}
                          value={aiVideoModal.quality}
                          onChange={(event) => setAiVideoModal({ ...aiVideoModal, quality: event.target.value })}
                        >
                          <option value="fast">Fast</option>
                          <option value="standard">Standard</option>
                        </select>
                      </label>
                    )}
                    {model.supportsResolution && (
                      <label>
                        <span className={labelClass}>Resolution</span>
                        <select
                          className={fieldClass}
                          value={normalizedVideoResolution(aiVideoModal.modelKey, aiVideoModal.resolution)}
                          onChange={(event) => setAiVideoModal({ ...aiVideoModal, resolution: event.target.value })}
                        >
                          {resolutionChoices.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label>
                      <span className={labelClass}>Duration</span>
                      <select
                        className={fieldClass}
                        value={aiVideoModal.duration}
                        onChange={(event) => setAiVideoModal({ ...aiVideoModal, duration: event.target.value })}
                      >
                        {videoDurationOptions.map((option) => (
                          <option key={option} value={option}>{option === "auto" ? "Auto" : `${option}s`}</option>
                        ))}
                      </select>
                    </label>
                    {model.supportsAspectRatio && (
                      <label>
                        <span className={labelClass}>Aspect ratio</span>
                        <select
                          className={fieldClass}
                          value={aiVideoModal.aspectRatio}
                          onChange={(event) => setAiVideoModal({ ...aiVideoModal, aspectRatio: event.target.value })}
                        >
                          {videoAspectOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    {model.supportsShotMode && (
                      <label>
                        <span className={labelClass}>Shot mode</span>
                        <select
                          className={fieldClass}
                          value={aiVideoModal.shotMode}
                          onChange={(event) => setAiVideoModal({ ...aiVideoModal, shotMode: event.target.value as AiVideoModalState["shotMode"] })}
                        >
                          <option value="single">One shot</option>
                          <option value="multi">Multi shots</option>
                        </select>
                      </label>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <VideoAssetLibrary
                      title="Characters"
                      emptyLabel="No character sheets yet"
                      assets={calendar.aiAssets.models}
                      selectedIds={aiVideoModal.modelIds}
                      maxSelected={modelAssetLimit}
                      onToggle={(assetId) => toggleVideoAsset("model", assetId)}
                    />
                    <VideoAssetLibrary
                      title="Style images"
                      emptyLabel="No saved styles yet"
                      assets={videoStyleAssets}
                      selectedIds={aiVideoModal.referenceIds}
                      maxSelected={referenceAssetLimit}
                      onToggle={(assetId) => toggleVideoAsset("reference", assetId)}
                    />
                  </div>

                  {isSeedanceVideo && selectedModelVideoAssets.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-3">
                      <p className="text-xs font-semibold leading-5 text-amber-100/80">
                        Seedance character mode: selected character sheets are uploaded and labeled in the prompt as synthetic AI-generated fictional character references, not real-person identity references.
                      </p>
                    </div>
                  )}

                  {selectedLibraryVideoAssets.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-[#01F17C]/20 bg-[#01F17C]/[0.06] p-3">
                      <span className={labelClass}>Tag selected images in prompt</span>
                      <div className="flex flex-wrap gap-2">
                        {aiVideoModal.modelKey === "kling-3" ? selectedModelVideoAssets.map((asset, index) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => insertVideoImageTag(`@Element${index + 1}`)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#01F17C]/25 bg-black/30 px-2.5 py-1.5 text-xs font-bold text-[#01F17C] hover:bg-[#01F17C]/10"
                          >
                            <span>@Element{index + 1}</span>
                            <span className="max-w-32 truncate text-white/55">{asset.name}</span>
                          </button>
                        )) : selectedLibraryVideoAssets.map((asset, index) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => insertVideoImageTag(`@Image${index + 1}`)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#01F17C]/25 bg-black/30 px-2.5 py-1.5 text-xs font-bold text-[#01F17C] hover:bg-[#01F17C]/10"
                          >
                            <span>@Image{index + 1}</span>
                            <span className="max-w-32 truncate text-white/55">{asset.name}</span>
                          </button>
                        ))}
                        {aiVideoModal.modelKey === "kling-3" && selectedReferenceVideoAssets.map((asset, index) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => insertVideoImageTag(`@Image${index + 1}`)}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10"
                          >
                            <span>@Image{index + 1}</span>
                            <span className="max-w-32 truncate text-white/55">{asset.name}</span>
                          </button>
                        ))}
                      </div>
                      {model.supportsMultipleImages ? (
                        <p className="mt-2 text-xs text-white/35">Selected AI characters and style images are attached to Seedance in this order.</p>
                      ) : aiVideoModal.modelKey === "kling-3" ? (
                        <p className="mt-2 text-xs text-white/35">Kling 3 sends selected characters as @Element references. One reference image can be used as the start image when no start image is uploaded.</p>
                      ) : (
                        <p className="mt-2 text-xs text-white/35">For Kling/Veo, the first selected asset can be used as the start image when no start image is uploaded.</p>
                      )}
                      <p className="mt-1 text-xs text-white/30">{videoAssetLimitHint(aiVideoModal.modelKey)}</p>
                    </div>
                  )}

	                  <div className="mt-4 grid gap-3 md:grid-cols-3">
	                    {model.supportsMultipleImages ? (
	                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:col-span-2">
	                        <div className="mb-3 flex items-center justify-between gap-2">
	                          <div>
	                            <span className={labelClass}>Seedance reference images</span>
	                            <p className="text-xs text-white/35">{attachedVideoImageUrls.length}/9 images. First image becomes the primary visual anchor.</p>
	                          </div>
	                          <label className="cursor-pointer text-xs font-semibold text-[#01F17C] hover:text-[#7cffb9]">
		                            {uploading.includes("video-imageUrls") ? uploadStatusLabel(uploadProgress["video-imageUrls"]) : "Upload images"}
	                            <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => uploadVideoInput(event, "imageUrls")} />
	                          </label>
	                        </div>
	                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
	                          {attachedVideoImageUrls.length === 0 ? (
	                            <div className="col-span-full flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/40 text-center text-xs font-semibold text-white/30">
	                              No references
	                            </div>
	                          ) : attachedVideoImageUrls.map((url, imageIndex) => (
	                            <div key={`${url}-${imageIndex}`} className="relative overflow-hidden rounded-xl bg-black/40">
	                              <img src={url} alt="" className="aspect-square h-full w-full object-cover" />
	                              <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">@Image{imageIndex + 1}</span>
                                {aiVideoModal.imageUrls.includes(url) && (
  	                              <button
  	                                type="button"
  	                                onClick={() => removeSeedanceImage(url)}
  	                                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded bg-black/70 text-xs text-white/75 hover:text-white"
  	                                aria-label="Remove Seedance image"
  	                              >
  	                                ×
  	                              </button>
                                )}
	                            </div>
	                          ))}
	                        </div>
	                      </div>
	                    ) : (
	                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
	                        <div className="mb-2 flex items-center justify-between gap-2">
	                          <span className={labelClass}>Start image</span>
	                          <label className="cursor-pointer text-xs font-semibold text-[#01F17C] hover:text-[#7cffb9]">
		                            {uploading.includes("video-startImageUrl") ? uploadStatusLabel(uploadProgress["video-startImageUrl"]) : "Upload"}
	                            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadVideoInput(event, "startImageUrl")} />
	                          </label>
	                        </div>
	                        <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-black/40 text-center text-xs font-semibold text-white/30">
	                          {aiVideoModal.startImageUrl ? <img src={aiVideoModal.startImageUrl} alt="" className="h-full w-full object-cover" /> : "No start image"}
	                        </div>
	                      </div>
	                    )}

	                    {model.supportsEndImage && !model.supportsMultipleImages && (
	                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
	                        <div className="mb-2 flex items-center justify-between gap-2">
	                          <span className={labelClass}>End image</span>
	                          <label className="cursor-pointer text-xs font-semibold text-[#01F17C] hover:text-[#7cffb9]">
		                            {uploading.includes("video-endImageUrl") ? uploadStatusLabel(uploadProgress["video-endImageUrl"]) : "Upload"}
	                            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadVideoInput(event, "endImageUrl")} />
	                          </label>
	                        </div>
	                        <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-black/40 text-center text-xs font-semibold text-white/30">
	                          {aiVideoModal.endImageUrl ? <img src={aiVideoModal.endImageUrl} alt="" className="h-full w-full object-cover" /> : "Optional"}
	                        </div>
	                      </div>
	                    )}

	                    {model.supportsReferenceVideo && (
	                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
	                        <div className="mb-2 flex items-center justify-between gap-2">
	                          <span className={labelClass}>Reference video</span>
	                          <label className="cursor-pointer text-xs font-semibold text-[#01F17C] hover:text-[#7cffb9]">
		                            {uploading.includes("video-referenceVideoUrl") ? uploadStatusLabel(uploadProgress["video-referenceVideoUrl"]) : "Upload"}
	                            <input className="hidden" type="file" accept="video/*" onChange={(event) => uploadVideoInput(event, "referenceVideoUrl")} />
	                          </label>
	                        </div>
	                        <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-black/40 text-center text-xs font-semibold text-white/30">
	                          {aiVideoModal.referenceVideoUrl ? <video src={aiVideoModal.referenceVideoUrl} className="h-full w-full object-cover" muted playsInline controls /> : model.key === "kling-motion" ? "Required for motion" : "Optional motion reference"}
	                        </div>
	                      </div>
	                    )}

	                    {model.supportsReferenceAudio && (
	                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
	                        <div className="mb-2 flex items-center justify-between gap-2">
	                          <span className={labelClass}>Reference voice</span>
	                          <label className="cursor-pointer text-xs font-semibold text-[#01F17C] hover:text-[#7cffb9]">
	                            {uploading.includes("video-referenceAudioUrl") ? uploadStatusLabel(uploadProgress["video-referenceAudioUrl"]) : "Upload"}
	                            <input className="hidden" type="file" accept="audio/*" onChange={(event) => uploadVideoInput(event, "referenceAudioUrl")} />
	                          </label>
	                        </div>
	                        <div className="flex min-h-20 items-center justify-center overflow-hidden rounded-xl bg-black/40 p-3 text-center text-xs font-semibold text-white/30">
	                          {aiVideoModal.referenceAudioUrl ? <audio src={aiVideoModal.referenceAudioUrl} className="w-full" controls /> : "Optional voice/audio reference"}
	                        </div>
	                      </div>
	                    )}
	                  </div>

                  {model.supportsAudio && (
                    <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm font-semibold text-white/65">
                      <input
                        type="checkbox"
                        checked={aiVideoModal.generateAudio}
                        onChange={(event) => setAiVideoModal({ ...aiVideoModal, generateAudio: event.target.checked })}
                      />
                      Generate native audio when supported
                    </label>
                  )}

                  {model.supportsNegativePrompt && (
                    <label className="mt-4 block">
                      <span className={labelClass}>Negative prompt</span>
                      <input
                        className={fieldClass}
                        value={aiVideoModal.negativePrompt}
                        onChange={(event) => setAiVideoModal({ ...aiVideoModal, negativePrompt: event.target.value })}
                        placeholder="blur, distort, low quality..."
                      />
                    </label>
                  )}
                    </div>
                  </details>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => setAiVideoModal(null)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={generateAiVideo}
                      disabled={generatingVideoIndex !== null || model.disabled}
                      className="rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generatingVideoIndex !== null ? "Generating..." : "Generate Video"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {productSheetModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black/80 p-2 backdrop-blur-md sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setProductSheetModal(null)}>
          <div className="max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#101010] p-4 shadow-2xl sm:p-5" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">Product sheet library</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">Add product sheet</h2>
                <p className="mt-1 text-sm text-white/45">Upload a ready sheet, or generate one from 4+ product photos.</p>
              </div>
              <button type="button" title="Close" aria-label="Close" onClick={() => setProductSheetModal(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white/60 hover:text-white">
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-36 cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.08]">
                <span>
                  <span className="block text-sm font-black uppercase tracking-widest text-white">Upload image</span>
                  <span className="mt-2 block text-sm leading-relaxed text-white/45">Use this when the file is already a finished product sheet.</span>
                </span>
                <span className="mt-5 inline-flex w-fit rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C]">
                  {uploading.includes("ai-product") ? "Uploading..." : "Choose file"}
                </span>
                <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadDirectProductSheet(event, productSheetModal.source)} />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="block text-sm font-black uppercase tracking-widest text-white">Generate product sheet</span>
                <p className="mt-2 text-sm leading-relaxed text-white/45">Upload minimum 4 product images. AI will create one white-background multi-angle sheet.</p>

                <label className="mt-4 block">
                  <span className={labelClass}>Product name</span>
                  <input
                    className={fieldClass}
                    value={productSheetModal.name}
                    onChange={(event) => setProductSheetModal({ ...productSheetModal, name: event.target.value })}
                    placeholder="Example: Lil Orbit Chocolate Box"
                  />
                </label>

                <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-4 text-center text-sm font-bold text-white/55 hover:border-[#01F17C]/40 hover:text-[#01F17C]">
                  {productSheetModal.files.length ? `${productSheetModal.files.length} image(s) selected` : "Choose 4+ product images"}
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
                      event.target.value = "";
                      setProductSheetModal({ ...productSheetModal, files });
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => generateAiSheet({
                    kind: "product",
                    files: productSheetModal.files,
                    name: productSheetModal.name,
                    source: productSheetModal.source,
                  })}
                  disabled={generatingSheet === "product" || productSheetModal.files.length < 4}
                  className="mt-4 w-full rounded-xl bg-[#01F17C] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {generatingSheet === "product" ? "Generating..." : "Generate Product Sheet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {aiImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/75 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setAiImageModal(null)}>
          <div className="admin-glass-panel max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 p-4 shadow-2xl sm:p-5" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#01F17C]">Astro Magic Image</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">{displayPostLabel(aiImageModal.postIndex)}</h2>
              </div>
              <button type="button" onClick={() => setAiImageModal(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white" aria-label="Close">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            <label className="block">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={labelClass}>Image idea</span>
                <button
                  type="button"
                  onClick={enhanceAiImagePrompt}
                  disabled={enhancingPrompt || !aiImageModal.extraPrompt.trim()}
                  title="Enhance prompt"
                  aria-label="Enhance prompt"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#01F17C]/25 bg-[#01F17C]/10 text-sm font-black text-[#01F17C] transition-colors hover:bg-[#01F17C]/20 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ✦
                </button>
              </div>
              <textarea
                className={`${areaClass} min-h-36 text-base`}
                value={aiImageModal.extraPrompt}
                onChange={(event) => setAiImageModal({ ...aiImageModal, extraPrompt: event.target.value })}
                placeholder="Describe the image. Example: premium studio campaign image, soft daylight, product held naturally..."
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              {(() => {
                const product = calendar.aiAssets.products.find((asset) => asset.id === aiImageModal.productId);
                const selectedModels = calendar.aiAssets.models.filter((asset) => aiImageModal.modelIds.includes(asset.id));
                const reference = calendar.aiAssets.references.find((asset) => asset.id === aiImageModal.referenceId) ?? (aiImageModal.customReferenceUrl ? { id: "custom", type: "reference" as const, name: aiImageModal.customReferenceName || "Custom style", url: aiImageModal.customReferenceUrl, previewUrl: "", notes: "", createdAt: "", styleCategory: DEFAULT_STYLE_CATEGORY, referenceBehavior: "location-dna" as const, styleUsage: "both" as const } : undefined);
                const primaryModel = selectedModels[0];

                return (
                  <>
                    <AssetSelectorBubble title="Product" name={selectedAssetName(product, "Choose product")} url={product?.url} onClick={() => setAiPicker("product")} />
                    <AssetSelectorBubble title="Style" name={selectedAssetName(reference, "Choose style")} url={reference?.previewUrl || reference?.url} onClick={() => setAiPicker("reference")} />
                    <AssetSelectorBubble
                      title="Model"
                      name={selectedModels.length ? selectedModels.length === 1 ? primaryModel.name : `${selectedModels.length} selected` : "No model"}
                      url={primaryModel?.previewUrl || primaryModel?.url}
                      selected={selectedModels.length > 0}
                      onClick={() => setAiPicker("model")}
                    />
                  </>
                );
              })()}
            </div>

            <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <summary className="cursor-pointer text-sm font-semibold text-white/55 marker:text-white/30">More options</summary>
              <div className="mt-4">
                <span className={labelClass}>Finish</span>
                <div className="grid gap-2 sm:grid-cols-5">
                  {calendar.aiStyles.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAiImageModal({ ...aiImageModal, style: option.id })}
                      className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors ${aiImageModal.style === option.id ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"}`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setAiImageModal(null)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Cancel
              </button>
              <button
                type="button"
                onClick={generateAiImage}
                disabled={generatingImageIndex !== null || bulkGeneratingImageIndexes.length > 0}
                className="rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingImageIndex !== null ? "Generating..." : "Generate Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {aiImageModal && aiPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/80 p-2 backdrop-blur-md sm:p-4" onMouseDown={(event) => event.currentTarget === event.target && setAiPicker(null)}>
          <div className="admin-glass-panel max-h-[calc(100dvh-1rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 p-4 shadow-2xl sm:p-5" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">Select {aiPicker === "reference" ? "style" : aiPicker}</p>
                <h3 className="mt-2 text-xl font-black text-white">
                  {aiPicker === "product" ? "Product Sheets" : aiPicker === "model" ? "Model Sheets" : "Styles"}
                </h3>
              </div>
              <button type="button" onClick={() => setAiPicker(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-white/60 hover:text-white">
                {aiPicker === "model" ? "Done" : "Back"}
              </button>
            </div>

            {aiPicker === "reference" && (
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white/60">{stylePickerCategoryName} folder</p>
                  <p className="text-xs font-semibold text-white/35">{aiPickerAssets.length} style{aiPickerAssets.length === 1 ? "" : "s"}</p>
                </div>
                <div className="preview-history-strip -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
                  {STYLE_CATEGORIES.map((category) => {
                    const count = calendar.aiAssets.references.filter((asset) => (asset.styleCategory ?? DEFAULT_STYLE_CATEGORY) === category.id).length;
                    const active = stylePickerCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setStylePickerCategory(category.id)}
                        className={`style-folder-pill min-w-[106px] flex-none rounded-xl border px-3 py-2 text-left transition-colors sm:min-w-0 ${active ? "border-[#01F17C]/60 bg-[#01F17C]/15 text-white" : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white"}`}
                      >
                        <span className="block text-xs font-black">{category.name}</span>
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{count} saved</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {aiPicker === "product" && (
              <button
                type="button"
                onClick={() => setProductSheetModal({ source: "picker", name: "", files: [] })}
                className="mb-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-[#01F17C]/30 bg-[#01F17C]/10 px-4 py-4 text-sm font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20"
              >
                Add Product Sheet
              </button>
            )}

            {aiPicker === "model" && (
              <label className="mb-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#01F17C]/30 bg-[#01F17C]/10 px-4 py-4 text-sm font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20">
                {generatingSheet === "character" ? "Generating Character Sheet..." : "Upload Character Image"}
                <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadModalAsset(event, aiPicker)} />
              </label>
            )}

            {aiPicker === "reference" && (
              <label className="mb-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#01F17C]/30 bg-[#01F17C]/10 px-4 py-4 text-sm font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20">
                {uploading.includes("ai-modal-reference") ? "Uploading..." : `Upload Custom Style to ${stylePickerCategoryName}`}
                <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadModalAsset(event, aiPicker)} />
              </label>
            )}

            <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
              {aiPickerAssets.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm font-semibold text-white/35">
                  {aiPicker === "product" ? "No product sheets uploaded yet. Upload a product above." : aiPicker === "model" ? "No character sheets uploaded yet. Model is optional, or upload a character above." : "No styles in this folder yet. Upload a custom style above."}
                </div>
              ) : aiPickerAssets.map((asset) => {
                const selected = aiPicker === "product"
                  ? aiImageModal.productId === asset.id
                  : aiPicker === "model"
                    ? aiImageModal.modelIds.includes(asset.id)
                    : aiImageModal.referenceId === asset.id;

                return (
                  <div key={asset.id} className={`overflow-hidden rounded-2xl border bg-black/30 transition-all ${selected ? "border-[#01F17C] ring-2 ring-[#01F17C]/20" : "border-white/10"}`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (aiPicker === "product") {
                          setAiImageModal({ ...aiImageModal, productId: asset.id });
                          setAiPicker(null);
                        }
                        if (aiPicker === "model") {
                          if (!selected && aiImageModal.modelIds.length >= 2) {
                            setError("Maximum 2 models can be selected.");
                            return;
                          }
                          const modelIds = selected
                            ? aiImageModal.modelIds.filter((id) => id !== asset.id)
                            : [...aiImageModal.modelIds, asset.id];
                          setAiImageModal({ ...aiImageModal, modelIds });
                        }
                        if (aiPicker === "reference") {
                          setAiImageModal({ ...aiImageModal, referenceId: asset.id, customReferenceUrl: "", customReferenceName: "" });
                          setAiPicker(null);
                        }
                      }}
                      className="block w-full text-left transition-transform hover:-translate-y-0.5"
                    >
                      <div className={`relative ${aiPicker === "model" ? "flex aspect-square items-center justify-center bg-white p-2" : "aspect-square bg-white/[0.03]"}`}>
                        <img
                          src={aiPicker === "model" ? asset.previewUrl || asset.url : asset.url}
                          alt=""
                          className={aiPicker === "model" ? "h-full w-full rounded-full object-cover object-top" : "h-full w-full object-cover"}
                        />
                        {selected && (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#01F17C] text-[10px] font-black text-black">✓</span>
                        )}
                      </div>
                      <p className="truncate px-2 py-1.5 text-[11px] font-bold text-white/70">{asset.name || "Unnamed"}</p>
                    </button>
                    {aiPicker === "reference" && (
                      <input
                        className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]"
                        value={asset.name}
                        onChange={(event) => updateAiAsset("reference", asset.id, { name: event.target.value })}
                        placeholder="Style name"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetSelectorBubble({
  title,
  name,
  url,
  selected,
  onClick,
}: {
  title: string;
  name: string;
  url?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group flex min-w-20 flex-col items-center gap-1.5">
      <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border bg-white transition-colors sm:h-16 sm:w-16 ${selected ? "border-[#01F17C] ring-4 ring-[#01F17C]/15" : "border-white/10 group-hover:border-white/30"}`}>
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <span className="text-base font-semibold text-black/25">+</span>
        )}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-medium text-white/40">{title}</p>
        <p className="max-w-20 truncate text-xs font-medium text-white sm:max-w-24">{name}</p>
      </div>
    </button>
  );
}

function VideoAssetLibrary({
  title,
  emptyLabel,
  assets,
  selectedIds,
  maxSelected,
  onToggle,
}: {
  title: string;
  emptyLabel: string;
  assets: CalendarAiAsset[];
  selectedIds: string[];
  maxSelected: number;
  onToggle: (assetId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={labelClass}>{title}</span>
        <span className="text-[11px] font-semibold text-white/35">{selectedIds.length}/{maxSelected} selected</span>
      </div>
      {assets.length === 0 ? (
        <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 text-center text-xs font-semibold text-white/30">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid max-h-36 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => {
            const selected = selectedIds.includes(asset.id);
            const disabled = !selected && selectedIds.length >= maxSelected;
            return (
              <button
                key={asset.id}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(asset.id)}
                className={`group flex min-h-[78px] min-w-0 flex-col items-center justify-start gap-1 overflow-hidden rounded-xl border px-1.5 py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${selected ? "border-[#01F17C] bg-[#01F17C]/10" : "border-white/10 bg-black/30 hover:border-white/25"}`}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white sm:h-11 sm:w-11">
                  <img src={asset.previewUrl || asset.url} alt="" className="h-full w-full object-cover object-center transition-transform group-hover:scale-[1.03]" />
                  {selected && <span className="absolute inset-0 flex items-center justify-center bg-[#01F17C]/78 text-xs font-black text-black">✓</span>}
                </div>
                <span className="block max-w-full truncate text-[10px] font-semibold text-white/60">{asset.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
