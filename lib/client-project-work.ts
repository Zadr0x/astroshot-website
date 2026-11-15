import { createClient } from "@supabase/supabase-js";

export const CLIENT_PROJECT_WORK_SERVICE = "Client Project Workspace";

export type IdeaProposalItem = {
  id: string;
  title: string;
  description: string;
  visualUrl: string;
  referenceUrl: string;
  notes: string;
  status: "draft" | "shared" | "approved" | "revision";
  clientDecision: "pending" | "approved" | "revision";
  clientComment: string;
  clientRespondedAt: string;
  feedbackThread: ClientFeedbackMessage[];
};

export type MoodboardImage = {
  id: string;
  url: string;
  caption: string;
};

export type ModelSelection = {
  selectedModelIds: string[];
  notes: string;
  submittedAt: string;
};

export type ClientFeedbackMessage = {
  id: string;
  author: "client" | "astroshot";
  message: string;
  decision?: "approved" | "revision";
  createdAt: string;
};

export type VisualApprovalImage = {
  id: string;
  url: string;
  caption: string;
};

export type VisualApprovalItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  images: VisualApprovalImage[];
  notes: string;
  status: "draft" | "shared" | "approved" | "revision";
  clientDecision: "pending" | "approved" | "revision";
  clientComment: string;
  clientRespondedAt: string;
  feedbackThread: ClientFeedbackMessage[];
};

export type VisualApprovalSection = {
  title: string;
  intro: string;
  items: VisualApprovalItem[];
};

export type BrandGuidelineItem = {
  id: string;
  type: "do" | "dont";
  text: string;
  imageUrl: string;
  persianText: string;
};

export type BrandSampleLink = {
  id: string;
  title: string;
  url: string;
  notes: string;
  persianNotes: string;
};

export type BrandAssetFile = {
  id: string;
  label: string;
  url: string;
  fileName: string;
  fileType: "logo" | "brand_identity" | "font" | "other";
};

export type ContentBriefProductImage = {
  id: string;
  url: string;
  sizeNotes: string;
};

export type ContentBriefProduct = {
  id: string;
  name: string;
  images: ContentBriefProductImage[];
};

export type ContentBriefAudience = {
  genders: string[];
  age: string;
  lifestyleStatus: string[];
  socialStatus: string[];
};

export type ContentBriefVideo = {
  id: string;
  title: string;
  sampleLink: string;
  products: string;
};

export type ContentBriefSampleImage = {
  id: string;
  url: string;
  products: string;
};

export type ContentBriefSection = {
  products: ContentBriefProduct[];
  competitiveAdvantage: string;
  targetAudienceSimple: string;
  audience: ContentBriefAudience;
  customerJourney: string;
  videos: ContentBriefVideo[];
  sampleImages: ContentBriefSampleImage[];
};

export type BrandIdentitySection = {
  title: string;
  summary: string;
  persianSummary: string;
  guidelines: BrandGuidelineItem[];
  sampleLinks: BrandSampleLink[];
  files: BrandAssetFile[];
};

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "upcoming" | "in_progress" | "done" | "waiting";
};

export type ClientProjectWorkspace = {
  type: "client_project_workspace";
  clientUsername: string;
  clientName: string;
  updatedAt: string;
  ideaProposal: {
    title: string;
    intro: string;
    moodboard: MoodboardImage[];
    items: IdeaProposalItem[];
  };
  modelSelection: ModelSelection;
  brandIdentity: BrandIdentitySection;
  contentBrief: ContentBriefSection;
  outfitSelection: VisualApprovalSection;
  locationSelection: VisualApprovalSection;
  timeline: {
    title: string;
    items: TimelineItem[];
  };
};

export function emptyClientProjectWorkspace(clientUsername: string, clientName: string): ClientProjectWorkspace {
  return {
    type: "client_project_workspace",
    clientUsername,
    clientName,
    updatedAt: new Date().toISOString(),
    ideaProposal: {
      title: "Idea Proposal",
      intro: "",
      moodboard: [],
      items: [],
    },
    modelSelection: {
      selectedModelIds: [],
      notes: "",
      submittedAt: "",
    },
    brandIdentity: {
      title: "Brand Identity",
      summary: "",
      persianSummary: "",
      guidelines: [],
      sampleLinks: [],
      files: [],
    },
    contentBrief: {
      products: [],
      competitiveAdvantage: "",
      targetAudienceSimple: "",
      audience: {
        genders: [],
        age: "",
        lifestyleStatus: [],
        socialStatus: [],
      },
      customerJourney: "",
      videos: [
        { id: `content-video-${Date.now()}-0`, title: "Video 1", sampleLink: "", products: "" },
        { id: `content-video-${Date.now()}-1`, title: "Video 2", sampleLink: "", products: "" },
        { id: `content-video-${Date.now()}-2`, title: "Video 3", sampleLink: "", products: "" },
      ],
      sampleImages: [],
    },
    outfitSelection: {
      title: "Outfit Selection",
      intro: "",
      items: [],
    },
    locationSelection: {
      title: "Location Selection",
      intro: "",
      items: [],
    },
    timeline: {
      title: "Project Timeline",
      items: [],
    },
  };
}

export function cleanMoodboardImage(item: Partial<MoodboardImage>, index: number): MoodboardImage {
  return {
    id: item.id?.trim() || `moodboard-${Date.now()}-${index}`,
    url: item.url?.trim() || "",
    caption: item.caption?.trim() || "",
  };
}

export function cleanModelSelection(selection: Partial<ModelSelection> | undefined): ModelSelection {
  return {
    selectedModelIds: Array.from(new Set((selection?.selectedModelIds ?? []).map((id) => id.trim()).filter(Boolean))),
    notes: selection?.notes?.trim() || "",
    submittedAt: selection?.submittedAt?.trim() || "",
  };
}

export function cleanFeedbackMessage(item: Partial<ClientFeedbackMessage>, index: number): ClientFeedbackMessage {
  const author = item.author === "astroshot" ? "astroshot" : "client";
  const decision = item.decision === "approved" || item.decision === "revision" ? item.decision : undefined;
  return {
    id: item.id?.trim() || `feedback-${Date.now()}-${index}`,
    author,
    message: item.message?.trim() || "",
    ...(decision ? { decision } : {}),
    createdAt: item.createdAt?.trim() || new Date().toISOString(),
  };
}

function legacyFeedbackThread(item: { clientComment?: string; clientRespondedAt?: string; clientDecision?: string }): ClientFeedbackMessage[] {
  const message = item.clientComment?.trim() || "";
  if (!message) return [];
  const decision: ClientFeedbackMessage["decision"] =
    item.clientDecision === "approved" || item.clientDecision === "revision" ? item.clientDecision : undefined;
  return [{
    id: `legacy-client-${item.clientRespondedAt || Date.now()}`,
    author: "client" as const,
    message,
    ...(decision ? { decision } : {}),
    createdAt: item.clientRespondedAt?.trim() || new Date().toISOString(),
  }];
}

export function cleanFeedbackThread(
  thread: Partial<ClientFeedbackMessage>[] | undefined,
  legacyItem?: { clientComment?: string; clientRespondedAt?: string; clientDecision?: string }
): ClientFeedbackMessage[] {
  const cleaned = (thread ?? []).map(cleanFeedbackMessage).filter((entry) => entry.message);
  return cleaned.length ? cleaned : legacyItem ? legacyFeedbackThread(legacyItem) : [];
}

export function cleanVisualApprovalImage(item: Partial<VisualApprovalImage>, index: number): VisualApprovalImage {
  return {
    id: item.id?.trim() || `selection-image-${Date.now()}-${index}`,
    url: item.url?.trim() || "",
    caption: item.caption?.trim() || "",
  };
}

export function cleanIdeaItem(item: Partial<IdeaProposalItem>, index: number): IdeaProposalItem {
  const feedbackThread = cleanFeedbackThread(item.feedbackThread, item);
  return {
    id: item.id?.trim() || `idea-${Date.now()}-${index}`,
    title: item.title?.trim() || `Post ${index + 1}`,
    description: item.description?.trim() || "",
    visualUrl: item.visualUrl?.trim() || "",
    referenceUrl: item.referenceUrl?.trim() || "",
    notes: item.notes?.trim() || "",
    status: item.status === "approved" || item.status === "revision" || item.status === "shared" ? item.status : "draft",
    clientDecision: item.clientDecision === "approved" || item.clientDecision === "revision" ? item.clientDecision : "pending",
    clientComment: item.clientComment?.trim() || "",
    clientRespondedAt: item.clientRespondedAt?.trim() || "",
    feedbackThread,
  };
}

export function cleanVisualApprovalItem(item: Partial<VisualApprovalItem>, index: number, fallbackLabel = "Option"): VisualApprovalItem {
  const legacyImage = item.imageUrl?.trim() || "";
  const images = (item.images ?? []).map(cleanVisualApprovalImage).filter((image) => image.url);
  const feedbackThread = cleanFeedbackThread(item.feedbackThread, item);
  return {
    id: item.id?.trim() || `${fallbackLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${index}`,
    title: item.title?.trim() || `${fallbackLabel} ${index + 1}`,
    description: item.description?.trim() || "",
    imageUrl: legacyImage || images[0]?.url || "",
    images: images.length ? images : legacyImage ? [{ id: "legacy-image", url: legacyImage, caption: "" }] : [],
    notes: item.notes?.trim() || "",
    status: item.status === "approved" || item.status === "revision" || item.status === "shared" ? item.status : "draft",
    clientDecision: item.clientDecision === "approved" || item.clientDecision === "revision" ? item.clientDecision : "pending",
    clientComment: item.clientComment?.trim() || "",
    clientRespondedAt: item.clientRespondedAt?.trim() || "",
    feedbackThread,
  };
}

export function cleanVisualApprovalSection(section: Partial<VisualApprovalSection> | undefined, fallbackTitle: string): VisualApprovalSection {
  return {
    title: section?.title?.trim() || fallbackTitle,
    intro: section?.intro?.trim() || "",
    items: (section?.items ?? []).map((item, index) => cleanVisualApprovalItem(item, index, fallbackTitle.replace(" Selection", ""))),
  };
}

export function cleanBrandGuidelineItem(item: Partial<BrandGuidelineItem>, index: number): BrandGuidelineItem {
  return {
    id: item.id?.trim() || `brand-guideline-${Date.now()}-${index}`,
    type: item.type === "dont" ? "dont" : "do",
    text: item.text?.trim() || "",
    imageUrl: item.imageUrl?.trim() || "",
    persianText: item.persianText?.trim() || "",
  };
}

export function cleanBrandSampleLink(item: Partial<BrandSampleLink>, index: number): BrandSampleLink {
  return {
    id: item.id?.trim() || `brand-sample-${Date.now()}-${index}`,
    title: item.title?.trim() || `Sample ${index + 1}`,
    url: item.url?.trim() || "",
    notes: item.notes?.trim() || "",
    persianNotes: item.persianNotes?.trim() || "",
  };
}

export function cleanBrandAssetFile(item: Partial<BrandAssetFile>, index: number): BrandAssetFile {
  const fileType: BrandAssetFile["fileType"] =
    item.fileType === "logo" || item.fileType === "brand_identity" || item.fileType === "font" ? item.fileType : "other";
  return {
    id: item.id?.trim() || `brand-file-${Date.now()}-${index}`,
    label: item.label?.trim() || "",
    url: item.url?.trim() || "",
    fileName: item.fileName?.trim() || "",
    fileType,
  };
}

export function cleanBrandIdentitySection(section: Partial<BrandIdentitySection> | undefined): BrandIdentitySection {
  return {
    title: section?.title?.trim() || "Brand Identity",
    summary: section?.summary?.trim() || "",
    persianSummary: section?.persianSummary?.trim() || "",
    guidelines: (section?.guidelines ?? []).map(cleanBrandGuidelineItem).filter((item) => item.text || item.imageUrl),
    sampleLinks: (section?.sampleLinks ?? []).map(cleanBrandSampleLink).filter((item) => item.url || item.notes || item.title),
    files: (section?.files ?? []).map(cleanBrandAssetFile).filter((item) => item.url),
  };
}

export function cleanContentBriefProductImage(item: Partial<ContentBriefProductImage>, index: number): ContentBriefProductImage {
  return {
    id: item.id?.trim() || `content-product-image-${Date.now()}-${index}`,
    url: item.url?.trim() || "",
    sizeNotes: item.sizeNotes?.trim() || "",
  };
}

export function cleanContentBriefProduct(item: Partial<ContentBriefProduct>, index: number): ContentBriefProduct {
  return {
    id: item.id?.trim() || `content-product-${Date.now()}-${index}`,
    name: item.name?.trim() || `Product ${index + 1}`,
    images: (item.images ?? []).map(cleanContentBriefProductImage).filter((image) => image.url || image.sizeNotes),
  };
}

export function cleanContentBriefAudience(audience: Partial<ContentBriefAudience> | undefined): ContentBriefAudience {
  const cleanChoice = (value: unknown) => String(value || "").trim();
  return {
    genders: Array.from(new Set((audience?.genders ?? []).map(cleanChoice).filter((item) => ["Male", "Female"].includes(item)))),
    age: audience?.age?.trim() || "",
    lifestyleStatus: Array.from(new Set((audience?.lifestyleStatus ?? []).map(cleanChoice).filter((item) => ["Luxury", "Average"].includes(item)))),
    socialStatus: Array.from(new Set((audience?.socialStatus ?? []).map(cleanChoice).filter((item) => ["Family", "Single"].includes(item)))),
  };
}

export function cleanContentBriefVideo(item: Partial<ContentBriefVideo>, index: number): ContentBriefVideo {
  return {
    id: item.id?.trim() || `content-video-${Date.now()}-${index}`,
    title: item.title?.trim() || `Video ${index + 1}`,
    sampleLink: item.sampleLink?.trim() || "",
    products: item.products?.trim() || "",
  };
}

export function cleanContentBriefSampleImage(item: Partial<ContentBriefSampleImage>, index: number): ContentBriefSampleImage {
  return {
    id: item.id?.trim() || `content-sample-image-${Date.now()}-${index}`,
    url: item.url?.trim() || "",
    products: item.products?.trim() || "",
  };
}

export function cleanContentBriefSection(section: Partial<ContentBriefSection> | undefined): ContentBriefSection {
  return {
    products: (section?.products ?? []).map(cleanContentBriefProduct).filter((product) => product.name || product.images.length),
    competitiveAdvantage: section?.competitiveAdvantage?.trim() || "",
    targetAudienceSimple: section?.targetAudienceSimple?.trim() || "",
    audience: cleanContentBriefAudience(section?.audience),
    customerJourney: section?.customerJourney?.trim() || "",
    videos: (section?.videos ?? []).map(cleanContentBriefVideo).filter((video) => video.title || video.sampleLink || video.products),
    sampleImages: (section?.sampleImages ?? []).map(cleanContentBriefSampleImage).filter((image) => image.url || image.products),
  };
}

export function cleanTimelineItem(item: Partial<TimelineItem>, index: number): TimelineItem {
  return {
    id: item.id?.trim() || `timeline-${Date.now()}-${index}`,
    date: item.date?.trim() || "",
    title: item.title?.trim() || `Milestone ${index + 1}`,
    description: item.description?.trim() || "",
    status: item.status === "done" || item.status === "in_progress" || item.status === "waiting" ? item.status : "upcoming",
  };
}

export function getProjectWorkClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export async function readClientProjectWorkspace(clientUsername: string, clientName: string) {
  const supabase = getProjectWorkClient();
  if (!supabase) throw new Error("Client project workspace storage is not configured");

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id,message,created_at")
    .eq("service", CLIENT_PROJECT_WORK_SERVICE)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const row = (data ?? []).find((entry) => {
    try {
      const parsed = JSON.parse(entry.message) as Partial<ClientProjectWorkspace>;
      return parsed.clientUsername === clientUsername;
    } catch {
      return false;
    }
  });

  if (!row) return { id: null, workspace: emptyClientProjectWorkspace(clientUsername, clientName) };

  try {
    const parsed = JSON.parse(row.message) as ClientProjectWorkspace;
    return {
      id: row.id as string,
      workspace: {
        ...emptyClientProjectWorkspace(clientUsername, clientName),
        ...parsed,
        clientUsername,
        clientName: parsed.clientName || clientName,
        ideaProposal: {
          title: parsed.ideaProposal?.title || "Idea Proposal",
          intro: parsed.ideaProposal?.intro || "",
          moodboard: (parsed.ideaProposal?.moodboard ?? []).map(cleanMoodboardImage).filter((item) => item.url),
          items: (parsed.ideaProposal?.items ?? []).map(cleanIdeaItem),
        },
        modelSelection: cleanModelSelection(parsed.modelSelection),
        brandIdentity: cleanBrandIdentitySection(parsed.brandIdentity),
        contentBrief: cleanContentBriefSection(parsed.contentBrief),
        outfitSelection: cleanVisualApprovalSection(parsed.outfitSelection, "Outfit Selection"),
        locationSelection: cleanVisualApprovalSection(parsed.locationSelection, "Location Selection"),
        timeline: {
          title: parsed.timeline?.title || "Project Timeline",
          items: (parsed.timeline?.items ?? []).map(cleanTimelineItem),
        },
      },
    };
  } catch {
    return { id: row.id as string, workspace: emptyClientProjectWorkspace(clientUsername, clientName) };
  }
}

export async function saveClientProjectWorkspace(workspace: ClientProjectWorkspace) {
  const supabase = getProjectWorkClient();
  if (!supabase) throw new Error("Client project workspace storage is not configured");

  const clean: ClientProjectWorkspace = {
    ...workspace,
    updatedAt: new Date().toISOString(),
    ideaProposal: {
      title: workspace.ideaProposal.title.trim() || "Idea Proposal",
      intro: workspace.ideaProposal.intro.trim(),
      moodboard: (workspace.ideaProposal.moodboard ?? []).map(cleanMoodboardImage).filter((item) => item.url),
      items: (workspace.ideaProposal.items ?? []).map(cleanIdeaItem),
    },
    modelSelection: cleanModelSelection(workspace.modelSelection),
    brandIdentity: cleanBrandIdentitySection(workspace.brandIdentity),
    contentBrief: cleanContentBriefSection(workspace.contentBrief),
    outfitSelection: cleanVisualApprovalSection(workspace.outfitSelection, "Outfit Selection"),
    locationSelection: cleanVisualApprovalSection(workspace.locationSelection, "Location Selection"),
    timeline: {
      title: workspace.timeline.title.trim() || "Project Timeline",
      items: (workspace.timeline.items ?? []).map(cleanTimelineItem),
    },
  };

  const { id } = await readClientProjectWorkspace(clean.clientUsername, clean.clientName);
  const payload = {
    name: clean.clientName,
    company: clean.clientName,
    service: CLIENT_PROJECT_WORK_SERVICE,
    message: JSON.stringify(clean, null, 2),
    status: "read",
  };

  const { error } = id
    ? await supabase.from("contact_submissions").update(payload).eq("id", id)
    : await supabase.from("contact_submissions").insert(payload);

  if (error) throw error;
  return clean;
}
