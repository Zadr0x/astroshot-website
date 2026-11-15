export type CalendarMediaType = "image" | "video" | "carousel";
export type CalendarPostStatus = "draft" | "ready" | "approved" | "needs_edits" | "posted";
export type CalendarGeneratedAssetSource = "upload" | "ai-image" | "ai-video" | "ai-edit" | "bulk-generate" | "restore";

export type CalendarHighlight = {
  id: string;
  label: string;
  iconUrl: string;
};

export type CalendarPost = {
  id: string;
  label: string;
  mediaUrl: string;
  originalMediaUrl: string;
  thumbnailUrl: string;
  mediaType: CalendarMediaType;
  previousMediaUrl: string;
  previousThumbnailUrl: string;
  previousMediaType: CalendarMediaType;
  carouselItems: CalendarCarouselItem[];
  generatedMedia: CalendarGeneratedAsset[];
  activeGeneratedMediaId: string;
  caption: string;
  publishDate: string;
  status: CalendarPostStatus;
  clientNote: string;
  clientNoteSubmittedAt: string;
  aiPrompt: string;
  isNew: boolean;
};

export type CalendarCarouselItem = {
  id: string;
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediaType: Exclude<CalendarMediaType, "carousel">;
  createdAt: string;
};

export type CalendarStory = {
  id: string;
  label: string;
  mediaUrl: string;
  originalMediaUrl: string;
  thumbnailUrl: string;
  mediaType: CalendarMediaType;
  status: CalendarPostStatus;
  clientNote: string;
  clientNoteSubmittedAt: string;
  publishDate: string;
};

export type CalendarGeneratedAsset = {
  id: string;
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediaType: CalendarMediaType;
  prompt: string;
  source: CalendarGeneratedAssetSource;
  createdAt: string;
};

export type CalendarAiContext = {
  brandName: string;
  tone: string;
  products: string;
  audience: string;
  dialect: string;
  referenceStyle: string;
  approvedExamples: string;
  captionRules: string;
};

export type CalendarAiAssetType = "product" | "model" | "reference";
export type ReferenceBehavior = "trend-match" | "location-dna" | "visual-vibe" | "product-setup" | "pose-outfit";
export type StyleUsage = "image" | "video" | "both";

export const STYLE_CATEGORIES = [
  { id: "trend", name: "Trend" },
  { id: "travel", name: "Travel" },
  { id: "product", name: "Product" },
  { id: "kuwait", name: "Kuwait" },
  { id: "studio", name: "Studio" },
  { id: "house", name: "House" },
  { id: "outdoor", name: "Outdoor" },
  { id: "portrait", name: "Portrait" },
] as const;

export type StyleCategoryId = typeof STYLE_CATEGORIES[number]["id"];
export const DEFAULT_STYLE_CATEGORY: StyleCategoryId = "studio";

export type CalendarAiAsset = {
  id: string;
  type: CalendarAiAssetType;
  name: string;
  url: string;
  previewUrl: string;
  notes: string;
  createdAt: string;
  styleCategory?: StyleCategoryId;
  referenceBehavior?: ReferenceBehavior;
  styleUsage?: StyleUsage;
};

export type CalendarAiStyle = {
  id: string;
  name: string;
  prompt: string;
};

export type AiVideoJobStatus = "pending" | "processing" | "completed" | "failed";

export type AiVideoJob = {
  id: string;
  slug: string;
  postIndex: number;
  postLabel: string;
  status: AiVideoJobStatus;
  endpointId: string;
  requestId: string;
  statusUrl: string;
  responseUrl: string;
  modelKey: string;
  prompt: string;
  videoPrompt: string;
  thumbnailUrl: string;
  videoUrl: string;
  sourceVideoUrl: string;
  error: string;
  logs: Array<{ message?: string }>;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
};

export type AiCaptionSettings = {
  motherPrompt: string;
  qualityRules: string;
  negativeRules: string;
};

export type AiImageSettings = {
  motherPrompt: string;
  trendMatchPrompt: string;
  locationDnaPrompt: string;
  visualVibePrompt: string;
  productSetupPrompt: string;
  poseOutfitPrompt: string;
  qualityEnhancePrompt: string;
};

export type CalendarAiAssets = {
  products: CalendarAiAsset[];
  models: CalendarAiAsset[];
  references: CalendarAiAsset[];
};

export type AiFactory = {
  aiAssets: Pick<CalendarAiAssets, "models" | "references">;
  aiStyles: CalendarAiStyle[];
  imageSettings: AiImageSettings;
  captionSettings: AiCaptionSettings;
  updatedAt: string;
};

export type ContentCalendar = {
  slug: string;
  clientName: string;
  campaignTitle: string;
  logoUrl: string;
  bio: string;
  followers: string;
  following: string;
  aiContext: CalendarAiContext;
  aiAssets: CalendarAiAssets;
  aiStyles: CalendarAiStyle[];
  highlights: CalendarHighlight[];
  posts: CalendarPost[];
  stories: CalendarStory[];
  updatedAt: string;
};

export const CONTENT_CALENDAR_BUCKET = "content-calendar-assets";
export const AI_FACTORY_STORAGE_KEY = "ai_factory_assets";

export const DEFAULT_AI_IMAGE_STYLES: CalendarAiStyle[] = [
  {
    id: "cinematic",
    name: "Cinematic",
    prompt: "Make it cinematic: controlled lighting, premium lensing, rich depth, atmospheric but clean commercial mood, strong subject separation, filmic composition, and high-end campaign quality.",
  },
  {
    id: "iphone",
    name: "iPhone Style",
    prompt: "Make the image feel like a polished real-life iPhone capture: natural framing, authentic handheld perspective, casual Kuwaiti lifestyle energy, believable ambient light, not over-produced.",
  },
  {
    id: "anime",
    name: "Anime",
    prompt: "Create a premium anime-inspired commercial image with clean character design, expressive styling, cinematic color, crisp product visibility, and tasteful advertising composition.",
  },
  {
    id: "editorial",
    name: "Editorial",
    prompt: "Make it fashion/editorial: magazine-grade composition, intentional pose, refined styling, strong art direction, premium lighting, confident negative space, and elevated brand taste.",
  },
  {
    id: "surprise",
    name: "Surprise Me",
    prompt: "Be highly creative while staying commercially usable: unexpected POV, fisheye or wide-angle option, playful perspective, clever composition, dynamic movement, and scroll-stopping visual idea.",
  },
];

export const DEFAULT_AI_CAPTION_SETTINGS: AiCaptionSettings = {
  motherPrompt: [
    "You are Astroshot's senior Kuwaiti Arabic social media caption writer.",
    "Your job is not to translate. Your job is to write like a real Kuwaiti account manager who understands Instagram, local rhythm, and what makes people stop scrolling.",
    "Write one ready-to-post caption in Kuwaiti Arabic. It should feel local, casual, clever, and connected to the visual.",
    "Use short lines. Start with a hook. Avoid stiff Fus-ha unless the brand is formal. Keep the caption easy to read on Instagram.",
    "If the image is food, make people crave it without sounding fake. If it is lifestyle, make it feel like a real moment. If it is a product, make the benefit clear without hard-selling.",
  ].join("\n"),
  qualityRules: [
    "Use Kuwaiti wording and sentence rhythm, not generic GCC Arabic.",
    "Make the first line strong enough to stop the scroll.",
    "Keep it specific to the visual and brand.",
    "Use a natural CTA only when it helps.",
    "Use 0-2 emojis maximum unless the brand rules ask for more.",
    "Use 2-5 hashtags only when useful.",
  ].join("\n"),
  negativeRules: [
    "Do not write translated English.",
    "Do not use stiff Modern Standard Arabic.",
    "Do not use generic phrases like لا تفوتكم, تجربة لا تنسى, or الطعم الخيالي unless the brand examples clearly use them.",
    "Do not invent offers, prices, locations, opening hours, ingredients, awards, or claims.",
    "Do not over-explain the image.",
  ].join("\n"),
};

export const REFERENCE_BEHAVIOR_OPTIONS: Array<{ id: ReferenceBehavior; name: string; description: string }> = [
  { id: "trend-match", name: "Trend Match", description: "Copy angle, pose, crop, outfit logic, and structure closely." },
  { id: "location-dna", name: "Location DNA", description: "Keep the same physical place, but create a fresh composition." },
  { id: "visual-vibe", name: "Visual Vibe", description: "Use mood, color, lens, lighting, and editing style only." },
  { id: "product-setup", name: "Product Setup", description: "Copy product composition, placement, surface, and arrangement logic." },
  { id: "pose-outfit", name: "Pose / Outfit", description: "Copy pose, wardrobe feel, silhouette, and body language." },
];

export const DEFAULT_AI_IMAGE_SETTINGS: AiImageSettings = {
  motherPrompt: [
    "Create one premium vertical Instagram feed image for Astroshot's content calendar.",
    "Use the selected product sheet as the product identity reference. Use selected model sheets as identity and styling references. Use the selected style/reference image according to its reference behavior mode.",
    "The final image must be realistic, commercial, scroll-stopping, and ready for a 4:5 Instagram feed post.",
  ].join("\n"),
  trendMatchPrompt: [
    "STYLE REFERENCE MODE: TREND MATCH.",
    "Recreate the selected style/trend reference as closely as possible. Match the same camera angle, crop, pose, body position, hand placement, outfit logic, lighting direction, background composition, lens feel, and overall image structure.",
    "Replace the person with the selected model while preserving the selected model identity. If a product is selected, place the exact product naturally in the model's hand or the same logical product position from the trend.",
    "Do not reinterpret into a new angle. Do not create a fresh composition. The goal is the same trend image structure with Astroshot's selected model and product.",
  ].join("\n"),
  locationDnaPrompt: [
    "STYLE REFERENCE MODE: LOCATION DNA.",
    "Use the selected style/reference image as the same actual physical location or zone, not just a general vibe.",
    "Preserve recognizable floor, ceiling, architecture, wall/storefront/glass/material language, lighting color, reflections, scale, and signature elements.",
    "Create a fresh frame from the same place with a different camera position, lens feel, crop, perspective, and model/product placement. Do not paste the exact reference as a background plate.",
  ].join("\n"),
  visualVibePrompt: [
    "STYLE REFERENCE MODE: VISUAL VIBE.",
    "Use only the selected reference image's mood, color palette, lighting style, lens feel, editing treatment, energy, and art direction.",
    "Do not copy the exact pose, outfit, place, background, or object layout unless the team direction asks for it.",
  ].join("\n"),
  productSetupPrompt: [
    "STYLE REFERENCE MODE: PRODUCT SETUP.",
    "Copy the product composition logic from the selected reference: product angle, surface, hand/table placement, spacing, lighting, prop density, and camera distance.",
    "Use the selected product identity exactly. Do not invent packaging or extra products.",
  ].join("\n"),
  poseOutfitPrompt: [
    "STYLE REFERENCE MODE: POSE / OUTFIT.",
    "Copy the selected reference's pose, body language, outfit logic, silhouette, styling energy, and camera relationship.",
    "Preserve the selected model identity. Do not force the reference background/location unless the team direction asks for it.",
  ].join("\n"),
  qualityEnhancePrompt: "Ultra-high-resolution 4K enhancement based strictly on the provided reference image. Preserve identity, composition, pose, camera angle, outfit, color, lighting, and background. Improve clarity, sharpness, texture, noise, and compression artifacts only. No relighting, reshaping, smoothing, stylization, hallucinated detail, or changed anatomy.",
};

export function normalizeCalendarSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calendarStorageKey(slug: string) {
  return `content_calendar_${normalizeCalendarSlug(slug)}`;
}

export function aiVideoJobsStorageKey(slug: string) {
  return `ai_video_jobs_${normalizeCalendarSlug(slug)}`;
}

export function createCalendarPost(index: number): CalendarPost {
  return {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2)}-${index + 1}`,
    label: `Content ${index + 1}`,
    mediaUrl: "",
    originalMediaUrl: "",
    thumbnailUrl: "",
    mediaType: "image",
    previousMediaUrl: "",
    previousThumbnailUrl: "",
    previousMediaType: "image",
    carouselItems: [],
    generatedMedia: [],
    activeGeneratedMediaId: "",
    caption: "",
    publishDate: "",
    status: "draft",
    clientNote: "",
    clientNoteSubmittedAt: "",
    aiPrompt: "",
    isNew: false,
  };
}

export function createCalendarStory(index: number): CalendarStory {
  return {
    id: `story-${Date.now()}-${Math.random().toString(36).slice(2)}-${index + 1}`,
    label: `Story ${index + 1}`,
    mediaUrl: "",
    originalMediaUrl: "",
    thumbnailUrl: "",
    mediaType: "image",
    status: "draft",
    clientNote: "",
    clientNoteSubmittedAt: "",
    publishDate: "",
  };
}

export function createCalendarHighlight(index: number): CalendarHighlight {
  return {
    id: `highlight-${Date.now()}-${Math.random().toString(36).slice(2)}-${index + 1}`,
    label: ["Menu", "Offers", "New", "Events", "Reviews"][index] ?? `Highlight ${index + 1}`,
    iconUrl: "",
  };
}

function emptyAiAssets(): CalendarAiAssets {
  return {
    products: [],
    models: [],
    references: [],
  };
}

export function emptyContentCalendar(slug = "lil-orbit"): ContentCalendar {
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";

  return {
    slug: normalizedSlug,
    clientName: normalizedSlug === "lil-orbit" ? "Lil Orbit" : normalizedSlug,
    campaignTitle: normalizedSlug === "lil-orbit" ? "June Content Calendar" : "Content Calendar",
    logoUrl: "",
    bio: "",
    followers: "",
    following: "",
    aiContext: {
      brandName: normalizedSlug === "lil-orbit" ? "Lil Orbit" : normalizedSlug,
      tone: "Kuwaiti, friendly, natural, premium but not formal.",
      products: "",
      audience: "Kuwait audience on Instagram.",
      dialect: "Kuwaiti Arabic",
      referenceStyle: "auto",
      approvedExamples: "",
      captionRules: "Write like a real Kuwaiti social media caption. Keep it natural, short, and useful. Avoid overused marketing words.",
    },
    aiAssets: emptyAiAssets(),
    aiStyles: DEFAULT_AI_IMAGE_STYLES,
    highlights: Array.from({ length: 5 }).map((_, index) => createCalendarHighlight(index)),
    posts: Array.from({ length: 12 }).map((_, index) => ({
      ...createCalendarPost(index),
      id: `post-${index + 1}`,
      mediaType: index === 11 ? "video" : "image",
    })),
    stories: Array.from({ length: 6 }).map((_, index) => ({
      ...createCalendarStory(index),
      id: `story-${index + 1}`,
    })),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeAiContext(context: Partial<CalendarAiContext> | undefined, fallback: CalendarAiContext): CalendarAiContext {
  return {
    brandName: context?.brandName ?? fallback.brandName,
    tone: context?.tone ?? fallback.tone,
    products: context?.products ?? fallback.products,
    audience: context?.audience ?? fallback.audience,
    dialect: context?.dialect ?? fallback.dialect,
    referenceStyle: context?.referenceStyle ?? fallback.referenceStyle,
    approvedExamples: context?.approvedExamples ?? fallback.approvedExamples,
    captionRules: context?.captionRules ?? fallback.captionRules,
  };
}

function normalizePost(post: Partial<CalendarPost>, index: number): CalendarPost {
  const fallback = createCalendarPost(index);
  const generatedMedia: CalendarGeneratedAsset[] = Array.isArray(post.generatedMedia)
    ? post.generatedMedia
        .filter((asset) => Boolean(asset?.url))
        .map((asset, assetIndex) => ({
          id: asset.id || `generated-${Date.now()}-${Math.random().toString(36).slice(2)}-${index + 1}-${assetIndex + 1}`,
          url: asset.url ?? "",
          originalUrl: asset.originalUrl ?? asset.url ?? "",
          thumbnailUrl: asset.thumbnailUrl ?? "",
          mediaType: asset.mediaType === "video" ? "video" : "image",
          prompt: asset.prompt ?? "",
          source: asset.source ?? "ai-image",
          createdAt: asset.createdAt ?? new Date().toISOString(),
        }))
    : [];

  if (post.previousMediaUrl && !generatedMedia.some((asset) => asset.url === post.previousMediaUrl)) {
    generatedMedia.push({
      id: `legacy-previous-${index + 1}`,
      url: post.previousMediaUrl,
      originalUrl: post.previousMediaUrl,
      thumbnailUrl: post.previousThumbnailUrl ?? "",
      mediaType: post.previousMediaType === "video" ? "video" : "image",
      prompt: "",
      source: "restore",
      createdAt: new Date().toISOString(),
    } as CalendarGeneratedAsset);
  }

  return {
    ...fallback,
    ...post,
    id: post.id || fallback.id,
    label: `Content ${index + 1}`,
    mediaUrl: post.mediaUrl ?? "",
    originalMediaUrl: post.originalMediaUrl ?? post.mediaUrl ?? "",
    thumbnailUrl: post.thumbnailUrl ?? "",
    mediaType: post.mediaType === "video" ? "video" : post.mediaType === "carousel" ? "carousel" : "image",
    previousMediaUrl: post.previousMediaUrl ?? "",
    previousThumbnailUrl: post.previousThumbnailUrl ?? "",
    previousMediaType: post.previousMediaType === "video" ? "video" : post.previousMediaType === "carousel" ? "carousel" : "image",
    carouselItems: Array.isArray(post.carouselItems)
      ? post.carouselItems
          .filter((item) => Boolean(item?.url))
          .map((item, itemIndex) => ({
            id: item.id || `carousel-${Date.now()}-${Math.random().toString(36).slice(2)}-${index + 1}-${itemIndex + 1}`,
            url: item.url ?? "",
            originalUrl: item.originalUrl ?? item.url ?? "",
            thumbnailUrl: item.thumbnailUrl ?? "",
            mediaType: item.mediaType === "video" ? "video" : "image",
            createdAt: item.createdAt ?? new Date().toISOString(),
          }))
      : [],
    generatedMedia,
    activeGeneratedMediaId: post.activeGeneratedMediaId ?? generatedMedia.find((asset) => asset.url === (post.mediaUrl ?? ""))?.id ?? "",
    caption: post.caption ?? "",
    publishDate: post.publishDate ?? "",
    status: post.status ?? "draft",
    clientNote: post.clientNote ?? "",
    clientNoteSubmittedAt: post.clientNoteSubmittedAt ?? "",
    aiPrompt: post.aiPrompt ?? "",
    isNew: Boolean(post.isNew),
  };
}

function normalizeStory(story: Partial<CalendarStory>, index: number): CalendarStory {
  const fallback = createCalendarStory(index);
  return {
    ...fallback,
    ...story,
    id: story.id || fallback.id,
    label: `Story ${index + 1}`,
    mediaUrl: story.mediaUrl ?? "",
    originalMediaUrl: story.originalMediaUrl ?? story.mediaUrl ?? "",
    thumbnailUrl: story.thumbnailUrl ?? "",
    mediaType: story.mediaType === "video" ? "video" : "image",
    status: story.status ?? "draft",
    clientNote: story.clientNote ?? "",
    clientNoteSubmittedAt: story.clientNoteSubmittedAt ?? "",
    publishDate: story.publishDate ?? "",
  };
}

function normalizeHighlight(highlight: Partial<CalendarHighlight>, index: number): CalendarHighlight {
  const fallback = createCalendarHighlight(index);
  return {
    ...fallback,
    ...highlight,
    id: highlight.id || fallback.id,
    label: highlight.label ?? fallback.label,
    iconUrl: highlight.iconUrl ?? "",
  };
}

function normalizeAiAsset(asset: Partial<CalendarAiAsset>, type: CalendarAiAssetType): CalendarAiAsset {
  const styleCategory = STYLE_CATEGORIES.some((category) => category.id === asset.styleCategory)
    ? asset.styleCategory
    : DEFAULT_STYLE_CATEGORY;
  const referenceBehavior = REFERENCE_BEHAVIOR_OPTIONS.some((option) => option.id === asset.referenceBehavior)
    ? asset.referenceBehavior
    : "location-dna";
  const styleUsage: StyleUsage = asset.styleUsage === "image" || asset.styleUsage === "video" || asset.styleUsage === "both"
    ? asset.styleUsage
    : "both";

  return {
    id: asset.id || `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    name: asset.name ?? "",
    url: asset.url ?? "",
    previewUrl: asset.previewUrl ?? "",
    notes: asset.notes ?? "",
    createdAt: asset.createdAt ?? new Date().toISOString(),
    ...(type === "reference" ? { styleCategory, referenceBehavior, styleUsage } : {}),
  };
}

function normalizeAiStyle(style: Partial<CalendarAiStyle>, index: number): CalendarAiStyle {
  const fallback = DEFAULT_AI_IMAGE_STYLES[index] ?? DEFAULT_AI_IMAGE_STYLES[0];
  return {
    id: style.id || `style-${Date.now()}-${Math.random().toString(36).slice(2)}-${index + 1}`,
    name: style.name ?? fallback.name,
    prompt: style.prompt ?? fallback.prompt,
  };
}

function normalizeAiAssets(assets: Partial<CalendarAiAssets> | undefined): CalendarAiAssets {
  return {
    products: Array.isArray(assets?.products) ? assets.products.map((asset) => normalizeAiAsset(asset, "product")) : [],
    models: Array.isArray(assets?.models) ? assets.models.map((asset) => normalizeAiAsset(asset, "model")) : [],
    references: Array.isArray(assets?.references) ? assets.references.map((asset) => normalizeAiAsset(asset, "reference")) : [],
  };
}

function normalizeAiStyles(styles: Partial<CalendarAiStyle>[] | undefined): CalendarAiStyle[] {
  return Array.isArray(styles) && styles.length > 0 ? styles.map(normalizeAiStyle) : DEFAULT_AI_IMAGE_STYLES;
}

export function emptyAiFactory(): AiFactory {
  return {
    aiAssets: {
      models: [],
      references: [],
    },
    aiStyles: DEFAULT_AI_IMAGE_STYLES,
    imageSettings: DEFAULT_AI_IMAGE_SETTINGS,
    captionSettings: DEFAULT_AI_CAPTION_SETTINGS,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeImageSettings(settings: Partial<AiImageSettings> | undefined): AiImageSettings {
  return {
    motherPrompt: settings?.motherPrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.motherPrompt,
    trendMatchPrompt: settings?.trendMatchPrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.trendMatchPrompt,
    locationDnaPrompt: settings?.locationDnaPrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.locationDnaPrompt,
    visualVibePrompt: settings?.visualVibePrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.visualVibePrompt,
    productSetupPrompt: settings?.productSetupPrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.productSetupPrompt,
    poseOutfitPrompt: settings?.poseOutfitPrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.poseOutfitPrompt,
    qualityEnhancePrompt: settings?.qualityEnhancePrompt?.trim() || DEFAULT_AI_IMAGE_SETTINGS.qualityEnhancePrompt,
  };
}

function normalizeCaptionSettings(settings: Partial<AiCaptionSettings> | undefined): AiCaptionSettings {
  return {
    motherPrompt: settings?.motherPrompt?.trim() || DEFAULT_AI_CAPTION_SETTINGS.motherPrompt,
    qualityRules: settings?.qualityRules?.trim() || DEFAULT_AI_CAPTION_SETTINGS.qualityRules,
    negativeRules: settings?.negativeRules?.trim() || DEFAULT_AI_CAPTION_SETTINGS.negativeRules,
  };
}

export function parseAiFactory(value: string | null | undefined): AiFactory {
  if (!value) return emptyAiFactory();

  try {
    const parsed = JSON.parse(value) as Partial<AiFactory>;
    return {
      aiAssets: {
        models: Array.isArray(parsed.aiAssets?.models) ? parsed.aiAssets.models.map((asset) => normalizeAiAsset(asset, "model")) : [],
        references: Array.isArray(parsed.aiAssets?.references) ? parsed.aiAssets.references.map((asset) => normalizeAiAsset(asset, "reference")) : [],
      },
      aiStyles: normalizeAiStyles(parsed.aiStyles),
      imageSettings: normalizeImageSettings(parsed.imageSettings),
      captionSettings: normalizeCaptionSettings(parsed.captionSettings),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return emptyAiFactory();
  }
}

export function applyAiFactory(calendar: ContentCalendar, factory: AiFactory): ContentCalendar {
  return {
    ...calendar,
    aiAssets: {
      ...calendar.aiAssets,
      models: factory.aiAssets.models.length > 0 ? factory.aiAssets.models : calendar.aiAssets.models,
      references: factory.aiAssets.references.length > 0 ? factory.aiAssets.references : calendar.aiAssets.references,
    },
    aiStyles: factory.aiStyles.length > 0 ? factory.aiStyles : calendar.aiStyles,
  };
}

export function parseContentCalendar(value: string | null | undefined, slug: string) {
  if (!value) return emptyContentCalendar(slug);

  try {
    const parsed = JSON.parse(value) as Partial<ContentCalendar>;
    const fallback = emptyContentCalendar(slug);

    return {
      ...fallback,
      ...parsed,
      slug: normalizeCalendarSlug(parsed.slug ?? slug) || fallback.slug,
      followers: parsed.followers ?? fallback.followers,
      following: parsed.following ?? fallback.following,
      aiContext: normalizeAiContext(parsed.aiContext, fallback.aiContext),
      aiAssets: normalizeAiAssets(parsed.aiAssets),
      aiStyles: normalizeAiStyles(parsed.aiStyles),
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(normalizeHighlight) : fallback.highlights,
      posts: Array.isArray(parsed.posts) ? parsed.posts.map(normalizePost) : fallback.posts,
      stories: Array.isArray(parsed.stories) ? parsed.stories.map(normalizeStory) : fallback.stories,
      updatedAt: parsed.updatedAt ?? fallback.updatedAt,
    } satisfies ContentCalendar;
  } catch {
    return emptyContentCalendar(slug);
  }
}

export function arrangePostsForInstagramGrid<T>(posts: T[]) {
  return [...posts].reverse();
}

export function restorePostsFromInstagramGrid<T>(posts: T[]) {
  return arrangePostsForInstagramGrid(posts);
}

function normalizeAiVideoJob(job: Partial<AiVideoJob>): AiVideoJob {
  const now = new Date().toISOString();
  const slug = normalizeCalendarSlug(job.slug ?? "content-calendar") || "content-calendar";
  const postIndex = Number.isFinite(Number(job.postIndex)) ? Math.max(0, Number(job.postIndex)) : 0;
  const status: AiVideoJobStatus = job.status === "processing" || job.status === "completed" || job.status === "failed"
    ? job.status
    : "pending";

  return {
    id: job.id || `video-job-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    slug,
    postIndex,
    postLabel: job.postLabel || `Content ${postIndex + 1}`,
    status,
    endpointId: job.endpointId ?? "",
    requestId: job.requestId ?? "",
    statusUrl: job.statusUrl ?? "",
    responseUrl: job.responseUrl ?? "",
    modelKey: job.modelKey ?? "",
    prompt: job.prompt ?? "",
    videoPrompt: job.videoPrompt ?? "",
    thumbnailUrl: job.thumbnailUrl ?? "",
    videoUrl: job.videoUrl ?? "",
    sourceVideoUrl: job.sourceVideoUrl ?? "",
    error: job.error ?? "",
    logs: Array.isArray(job.logs) ? job.logs : [],
    createdAt: job.createdAt ?? now,
    updatedAt: job.updatedAt ?? now,
    completedAt: job.completedAt ?? "",
  };
}

export function parseAiVideoJobs(value: string | null | undefined): AiVideoJob[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    const jobs = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { jobs?: unknown }).jobs)
        ? (parsed as { jobs: unknown[] }).jobs
        : [];

    return jobs
      .map((job) => normalizeAiVideoJob(job as Partial<AiVideoJob>))
      .filter((job) => job.endpointId && job.requestId);
  } catch {
    return [];
  }
}

export function isAllowedCalendarUpload(type: string) {
  return type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/");
}
