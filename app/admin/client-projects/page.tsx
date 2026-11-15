"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import type { ClientPortalAccount } from "@/lib/access-control";
import type { BrandAssetFile, BrandGuidelineItem, BrandSampleLink, ClientProjectWorkspace, ContentBriefProduct, ContentBriefSampleImage, ContentBriefVideo, IdeaProposalItem, MoodboardImage, TimelineItem, VisualApprovalItem } from "@/lib/client-project-work";
import type { AiFactory, CalendarAiAsset } from "@/lib/content-calendar";
import type { BrandQuestionnairePayload, ExplanatoryAnimationQuestionnairePayload, MonthlyProductFocus, QuestionnairePayload } from "@/lib/client-questionnaire";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]";
const textClass = `${inputClass} min-h-24 resize-y leading-7`;
const compactTextClass = `${inputClass} min-h-16 resize-y py-2.5 leading-6`;
type AdminProjectTab = "moodboard" | "ideas" | "brand" | "contentBrief" | "models" | "outfits" | "locations" | "timeline" | "questionnaire" | "monthly" | "calendar";

type RelatedClientProjectData = {
  questionnaire: { id: string; createdAt: string; status: string; parsed: { questionnaire?: Partial<QuestionnairePayload> | Partial<ExplanatoryAnimationQuestionnairePayload> | Partial<BrandQuestionnairePayload> } } | null;
  monthlyIntakes: Array<{ id: string; createdAt: string; status: string; parsed: { monthlyPlan?: QuestionnairePayload["monthlyPlan"] } }>;
  calendars: Array<{ slug: string; clientName: string; campaignTitle: string; totalPosts: number; filledPosts: number; updatedAt: string }>;
};

const adminProjectTabs: Array<[AdminProjectTab, string]> = [
  ["moodboard", "Mood"],
  ["ideas", "Ideas"],
  ["brand", "Brand"],
  ["contentBrief", "Content Brief"],
  ["questionnaire", "Q&A"],
  ["monthly", "Intake"],
  ["calendar", "Calendar"],
  ["models", "Models"],
  ["outfits", "Outfits"],
  ["locations", "Locations"],
  ["timeline", "Timeline"],
];

function newIdea(index: number): IdeaProposalItem {
  return {
    id: `idea-${Date.now()}-${index}`,
    title: `Post ${index + 1}`,
    description: "",
    visualUrl: "",
    referenceUrl: "",
    notes: "",
    status: "shared",
    clientDecision: "pending",
    clientComment: "",
    clientRespondedAt: "",
    feedbackThread: [],
  };
}

function newMoodboardImage(index: number): MoodboardImage {
  return {
    id: `moodboard-${Date.now()}-${index}`,
    url: "",
    caption: "",
  };
}

function newVisualApprovalItem(kind: "outfit" | "location", index: number): VisualApprovalItem {
  const label = kind === "outfit" ? "Outfit" : "Location";
  return {
    id: `${kind}-${Date.now()}-${index}`,
    title: `${label} ${index + 1}`,
    description: "",
    imageUrl: "",
    images: [],
    notes: "",
    status: "shared",
    clientDecision: "pending",
    clientComment: "",
    clientRespondedAt: "",
    feedbackThread: [],
  };
}

function newTimeline(index: number): TimelineItem {
  return {
    id: `timeline-${Date.now()}-${index}`,
    date: "",
    title: `Milestone ${index + 1}`,
    description: "",
    status: "upcoming",
  };
}

function newBrandGuideline(type: "do" | "dont", index: number): BrandGuidelineItem {
  return {
    id: `brand-guideline-${Date.now()}-${index}`,
    type,
    text: "",
    imageUrl: "",
    persianText: "",
  };
}

function newBrandSampleLink(index: number): BrandSampleLink {
  return {
    id: `brand-sample-${Date.now()}-${index}`,
    title: `Sample ${index + 1}`,
    url: "",
    notes: "",
    persianNotes: "",
  };
}

function newContentBriefProduct(index: number): ContentBriefProduct {
  return {
    id: `content-product-${Date.now()}-${index}`,
    name: `Product ${index + 1}`,
    images: [],
  };
}

function newContentBriefProductImage(index: number, url = "") {
  return {
    id: `content-product-image-${Date.now()}-${index}`,
    url,
    sizeNotes: "",
  };
}

function newContentBriefVideo(index: number): ContentBriefVideo {
  return {
    id: `content-video-${Date.now()}-${index}`,
    title: `Video ${index + 1}`,
    sampleLink: "",
    products: "",
  };
}

function newContentBriefSampleImage(index: number, url = ""): ContentBriefSampleImage {
  return {
    id: `content-sample-image-${Date.now()}-${index}`,
    url,
    products: "",
  };
}

export default function AdminClientProjectsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientPortalAccount[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [workspace, setWorkspace] = useState<ClientProjectWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdeaId, setUploadingIdeaId] = useState<string | null>(null);
  const [uploadingMoodboardId, setUploadingMoodboardId] = useState<string | null>(null);
  const [uploadingSelectionId, setUploadingSelectionId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<CalendarAiAsset[]>([]);
  const [message, setMessage] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeAdminTab, setActiveAdminTab] = useState<AdminProjectTab>("moodboard");
  const [uploadingBrandId, setUploadingBrandId] = useState<string | null>(null);
  const [uploadingContentBriefId, setUploadingContentBriefId] = useState<string | null>(null);
  const [relatedData, setRelatedData] = useState<RelatedClientProjectData>({ questionnaire: null, monthlyIntakes: [], calendars: [] });

  const loadWorkspace = useCallback(async (token?: string, clientUsername = selectedClient) => {
    setLoading(true);
    setMessage("");
    const { data: { session } } = token ? { data: { session: { access_token: token } } } : await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const query = clientUsername ? `?client=${encodeURIComponent(clientUsername)}` : "";
    const res = await fetch(`/api/admin/client-project-work${query}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setMessage("Could not load client workspace.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { clients: ClientPortalAccount[]; workspace: ClientProjectWorkspace | null; related?: RelatedClientProjectData };
    setClients(data.clients);
    if (!selectedClient && data.workspace?.clientUsername) setSelectedClient(data.workspace.clientUsername);
    if (clientUsername && data.workspace?.clientUsername) setSelectedClient(data.workspace.clientUsername);
    setWorkspace(data.workspace);
    setRelatedData(data.related ?? { questionnaire: null, monthlyIntakes: [], calendars: [] });
    setLoading(false);
  }, [router, selectedClient]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      loadWorkspace(session.access_token);
    });
  }, [loadWorkspace, router]);

  useEffect(() => {
    fetch("/api/astro-magic/factory")
      .then((res) => res.json())
      .then((data: { factory?: AiFactory }) => setAvailableModels(data.factory?.aiAssets.models ?? []))
      .catch(() => setAvailableModels([]));
  }, []);

  const saveWorkspace = async (workspaceToSave = workspace) => {
    if (!workspaceToSave) return;
    setSaving(true);
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const res = await fetch("/api/admin/client-project-work", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workspaceToSave),
    });

    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(data.error ?? "Save failed.");
      return;
    }

    const data = (await res.json()) as { workspace: ClientProjectWorkspace };
    setWorkspace(data.workspace);
    setMessage("Saved to client dashboard.");
  };

  const createContentCalendarForClient = async () => {
    if (!workspace) return;
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const res = await fetch("/api/admin/content-calendar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName: workspace.clientName,
        campaignTitle: `${workspace.clientName} Content Calendar`,
        slug: workspace.clientUsername,
      }),
    });

    if (res.status === 409) {
      router.push(`/admin/content-calendar/${workspace.clientUsername}`);
      return;
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(data.error ?? "Could not create content calendar.");
      return;
    }

    const data = (await res.json()) as { calendar?: { slug: string } };
    router.push(`/admin/content-calendar/${data.calendar?.slug || workspace.clientUsername}`);
  };

  const setIdea = (id: string, patch: Partial<IdeaProposalItem>) => {
    setWorkspace((current) => current ? ({
      ...current,
      ideaProposal: {
        ...current.ideaProposal,
        items: current.ideaProposal.items.map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    }) : current);
  };

  const setTimeline = (id: string, patch: Partial<TimelineItem>) => {
    setWorkspace((current) => current ? ({
      ...current,
      timeline: {
        ...current.timeline,
        items: current.timeline.items.map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    }) : current);
  };

  const setVisualApprovalItem = (section: "outfitSelection" | "locationSelection", id: string, patch: Partial<VisualApprovalItem>) => {
    setWorkspace((current) => current ? ({
      ...current,
      [section]: {
        ...current[section],
        items: current[section].items.map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    }) : current);
  };

  const uploadVisualApprovalImage = async (section: "outfitSelection" | "locationSelection", itemId: string, files?: FileList | File[]) => {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;
    setUploadingSelectionId(itemId);
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    const uploaded: { url: string }[] = [];
    for (const file of selectedFiles) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/client-project-work/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      if (!res.ok) {
        setUploadingSelectionId(null);
        setMessage("Selection image upload failed.");
        return;
      }
      const data = (await res.json()) as { file: { url: string } };
      uploaded.push({ url: data.file.url });
    }
    setUploadingSelectionId(null);
    setWorkspace((current) => current ? ({
      ...current,
      [section]: {
        ...current[section],
        items: current[section].items.map((item) => {
          if (item.id !== itemId) return item;
          const nextImages = [
            ...(item.images ?? []),
            ...uploaded.map((file, index) => ({ id: `selection-image-${Date.now()}-${index}`, url: file.url, caption: "" })),
          ];
          return { ...item, imageUrl: item.imageUrl || nextImages[0]?.url || "", images: nextImages };
        }),
      },
    }) : current);
  };

  const setVisualApprovalImageCaption = (section: "outfitSelection" | "locationSelection", itemId: string, imageId: string, caption: string) => {
    setWorkspace((current) => current ? ({
      ...current,
      [section]: {
        ...current[section],
        items: current[section].items.map((item) => item.id === itemId ? {
          ...item,
          images: (item.images ?? []).map((image) => image.id === imageId ? { ...image, caption } : image),
        } : item),
      },
    }) : current);
  };

  const removeVisualApprovalImage = (section: "outfitSelection" | "locationSelection", itemId: string, imageId: string) => {
    setWorkspace((current) => current ? ({
      ...current,
      [section]: {
        ...current[section],
        items: current[section].items.map((item) => {
          if (item.id !== itemId) return item;
          const nextImages = (item.images ?? []).filter((image) => image.id !== imageId);
          return { ...item, images: nextImages, imageUrl: nextImages[0]?.url || "" };
        }),
      },
    }) : current);
  };

  const saveAdminReply = async (target: { type: "idea"; id: string } | { type: "visual"; section: "outfitSelection" | "locationSelection"; id: string }) => {
    if (!workspace) return;
    const draftKey = target.type === "idea" ? `idea:${target.id}` : `${target.section}:${target.id}`;
    const reply = replyDrafts[draftKey]?.trim();
    if (!reply) {
      setMessage("Write a reply first.");
      return;
    }
    const createdAt = new Date().toISOString();
    const entry = {
      id: `astroshot-${createdAt}`,
      author: "astroshot" as const,
      message: reply,
      createdAt,
    };
    const nextWorkspace: ClientProjectWorkspace = target.type === "idea" ? {
      ...workspace,
      ideaProposal: {
        ...workspace.ideaProposal,
        items: workspace.ideaProposal.items.map((item) => item.id === target.id ? {
          ...item,
          feedbackThread: [...(item.feedbackThread ?? []), entry],
        } : item),
      },
    } : {
      ...workspace,
      [target.section]: {
        ...workspace[target.section],
        items: workspace[target.section].items.map((item) => item.id === target.id ? {
          ...item,
          feedbackThread: [...(item.feedbackThread ?? []), entry],
        } : item),
      },
    };
    setReplyDrafts((current) => ({ ...current, [draftKey]: "" }));
    await saveWorkspace(nextWorkspace);
  };

  const uploadIdeaImage = async (ideaId: string, file?: File) => {
    if (!file) return;
    setUploadingIdeaId(ideaId);
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/client-project-work/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    });
    setUploadingIdeaId(null);
    if (!res.ok) {
      setMessage("Image upload failed.");
      return;
    }
    const data = (await res.json()) as { file: { url: string } };
    setIdea(ideaId, { visualUrl: data.file.url });
  };

  const setMoodboardImage = (id: string, patch: Partial<MoodboardImage>) => {
    setWorkspace((current) => current ? ({
      ...current,
      ideaProposal: {
        ...current.ideaProposal,
        moodboard: (current.ideaProposal.moodboard ?? []).map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    }) : current);
  };

  const uploadMoodboardImage = async (imageId: string, file?: File) => {
    if (!file || !workspace) return;
    setUploadingMoodboardId(imageId);
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/client-project-work/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    });
    setUploadingMoodboardId(null);
    if (!res.ok) {
      setMessage("Moodboard upload failed.");
      return;
    }
    const data = (await res.json()) as { file: { url: string } };
    const nextWorkspace = {
      ...workspace,
      ideaProposal: {
        ...workspace.ideaProposal,
        moodboard: (workspace.ideaProposal.moodboard ?? []).map((item) =>
          item.id === imageId ? { ...item, url: data.file.url } : item
        ),
      },
    };
    setWorkspace(nextWorkspace);
    await saveWorkspace(nextWorkspace);
  };

  const selectedClientName = clients.find((client) => client.username === selectedClient)?.clientName;
  const selectedModelIds = workspace?.modelSelection.selectedModelIds ?? [];
  const selectedModels = availableModels.filter((model) => selectedModelIds.includes(model.id));

  const uploadProjectFile = async (file?: File) => {
    if (!file) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return null;
    }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/client-project-work/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { file: { name: string; url: string; type: string } };
    return data.file;
  };

  const setBrandGuideline = (id: string, patch: Partial<BrandGuidelineItem>) => {
    setWorkspace((current) => current ? ({
      ...current,
      brandIdentity: {
        ...current.brandIdentity,
        guidelines: current.brandIdentity.guidelines.map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    }) : current);
  };

  const setBrandSampleLink = (id: string, patch: Partial<BrandSampleLink>) => {
    setWorkspace((current) => current ? ({
      ...current,
      brandIdentity: {
        ...current.brandIdentity,
        sampleLinks: current.brandIdentity.sampleLinks.map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    }) : current);
  };

  const uploadBrandGuidelineImage = async (id: string, file?: File) => {
    setUploadingBrandId(id);
    setMessage("");
    const uploaded = await uploadProjectFile(file);
    setUploadingBrandId(null);
    if (!uploaded) {
      setMessage("Brand guideline image upload failed.");
      return;
    }
    setBrandGuideline(id, { imageUrl: uploaded.url });
  };

  const uploadBrandAsset = async (fileType: BrandAssetFile["fileType"], file?: File) => {
    setUploadingBrandId(fileType);
    setMessage("");
    const uploaded = await uploadProjectFile(file);
    setUploadingBrandId(null);
    if (!uploaded) {
      setMessage("Brand file upload failed.");
      return;
    }
    const entry: BrandAssetFile = {
      id: `brand-file-${uploaded.url.replace(/[^a-z0-9]+/gi, "-").slice(-48)}`,
      label: uploaded.name,
      url: uploaded.url,
      fileName: uploaded.name,
      fileType,
    };
    setWorkspace((current) => current ? ({
      ...current,
      brandIdentity: {
        ...current.brandIdentity,
        files: [...current.brandIdentity.files, entry],
      },
    }) : current);
  };

  const updateContentBrief = (patch: Partial<ClientProjectWorkspace["contentBrief"]>) => {
    if (!workspace) return;
    setWorkspace({ ...workspace, contentBrief: { ...workspace.contentBrief, ...patch } });
  };

  const updateContentBriefAudience = (patch: Partial<ClientProjectWorkspace["contentBrief"]["audience"]>) => {
    if (!workspace) return;
    updateContentBrief({ audience: { ...workspace.contentBrief.audience, ...patch } });
  };

  const toggleContentBriefAudienceChoice = (field: "genders" | "lifestyleStatus" | "socialStatus", value: string) => {
    if (!workspace) return;
    const current = workspace.contentBrief.audience[field] ?? [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateContentBriefAudience({ [field]: next });
  };

  const setContentBriefProduct = (productId: string, patch: Partial<ContentBriefProduct>) => {
    if (!workspace) return;
    updateContentBrief({
      products: workspace.contentBrief.products.map((product) => product.id === productId ? { ...product, ...patch } : product),
    });
  };

  const setContentBriefProductImage = (productId: string, imageId: string, patch: { url?: string; sizeNotes?: string }) => {
    if (!workspace) return;
    updateContentBrief({
      products: workspace.contentBrief.products.map((product) => product.id === productId ? {
        ...product,
        images: product.images.map((image) => image.id === imageId ? { ...image, ...patch } : image),
      } : product),
    });
  };

  const uploadContentBriefProductImages = async (productId: string, files?: FileList | File[]) => {
    if (!workspace) return;
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;
    setUploadingContentBriefId(productId);
    setMessage("");
    const uploaded: string[] = [];
    for (const file of selectedFiles) {
      const result = await uploadProjectFile(file);
      if (!result) {
        setUploadingContentBriefId(null);
        setMessage("Product image upload failed.");
        return;
      }
      uploaded.push(result.url);
    }
    const nextWorkspace: ClientProjectWorkspace = {
      ...workspace,
      contentBrief: {
        ...workspace.contentBrief,
        products: workspace.contentBrief.products.map((product) => product.id === productId ? {
          ...product,
          images: [
            ...product.images,
            ...uploaded.map((url, index) => newContentBriefProductImage(product.images.length + index, url)),
          ],
        } : product),
      },
    };
    setUploadingContentBriefId(null);
    setWorkspace(nextWorkspace);
    await saveWorkspace(nextWorkspace);
  };

  const setContentBriefVideo = (videoId: string, patch: Partial<ContentBriefVideo>) => {
    if (!workspace) return;
    updateContentBrief({
      videos: workspace.contentBrief.videos.map((video) => video.id === videoId ? { ...video, ...patch } : video),
    });
  };

  const setContentBriefSampleImage = (imageId: string, patch: Partial<ContentBriefSampleImage>) => {
    if (!workspace) return;
    updateContentBrief({
      sampleImages: workspace.contentBrief.sampleImages.map((image) => image.id === imageId ? { ...image, ...patch } : image),
    });
  };

  const uploadContentBriefSampleImages = async (files?: FileList | File[]) => {
    if (!workspace) return;
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;
    setUploadingContentBriefId("sample-images");
    setMessage("");
    const uploaded: string[] = [];
    for (const file of selectedFiles) {
      const result = await uploadProjectFile(file);
      if (!result) {
        setUploadingContentBriefId(null);
        setMessage("Sample image upload failed.");
        return;
      }
      uploaded.push(result.url);
    }
    const nextWorkspace: ClientProjectWorkspace = {
      ...workspace,
      contentBrief: {
        ...workspace.contentBrief,
        sampleImages: [
          ...workspace.contentBrief.sampleImages,
          ...uploaded.map((url, index) => newContentBriefSampleImage(workspace.contentBrief.sampleImages.length + index, url)),
        ],
      },
    };
    setUploadingContentBriefId(null);
    setWorkspace(nextWorkspace);
    await saveWorkspace(nextWorkspace);
  };

  const renderContentBriefAdminSection = () => {
    if (!workspace) return null;
    const brief = workspace.contentBrief;

    return (
      <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Team preparation</p>
            <h2 className="mt-2 text-3xl font-black text-white">Content Brief</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">Use this before preparing content so the team understands product details, audience, story, and references.</p>
          </div>
          <button
            type="button"
            onClick={() => updateContentBrief({ products: [...brief.products, newContentBriefProduct(brief.products.length)] })}
            className="w-fit rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10"
          >
            Add product
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">A. Product details</p>
              <h3 className="mt-2 text-2xl font-black text-white">Products and sizes</h3>
            </div>
            {brief.products.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No products added yet.</p>
            ) : (
              <div className="space-y-4">
                {brief.products.map((product, productIndex) => (
                  <article key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <label className="w-full md:max-w-md">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Product name</span>
                        <input className={inputClass} value={product.name} onChange={(event) => setContentBriefProduct(product.id, { name: event.target.value })} placeholder={`Product ${productIndex + 1}`} />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#01F17C] hover:bg-[#01F17C]/10">
                          {uploadingContentBriefId === product.id ? "Uploading..." : "Upload angles"}
                          <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadContentBriefProductImages(product.id, event.target.files ?? undefined)} />
                        </label>
                        <button type="button" onClick={() => updateContentBrief({ products: brief.products.filter((entry) => entry.id !== product.id) })} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white/35 hover:text-red-300">Remove</button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {product.images.map((image, imageIndex) => (
                        <div key={image.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                          {image.url ? <img src={image.url} alt="" className="h-44 w-full rounded-xl object-cover" /> : <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/25">No image</div>}
                          <input className={`${inputClass} mt-3`} value={image.url} onChange={(event) => setContentBriefProductImage(product.id, image.id, { url: event.target.value })} placeholder={`Product angle ${imageIndex + 1} URL`} />
                          <textarea className={`${compactTextClass} mt-3`} value={image.sizeNotes} onChange={(event) => setContentBriefProductImage(product.id, image.id, { sizeNotes: event.target.value })} placeholder="Write product size / dimensions / packaging size" />
                          <button
                            type="button"
                            onClick={() => setContentBriefProduct(product.id, { images: product.images.filter((entry) => entry.id !== image.id) })}
                            className="mt-2 text-xs font-bold text-white/35 hover:text-red-300"
                          >
                            Remove image
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setContentBriefProduct(product.id, { images: [...product.images, newContentBriefProductImage(product.images.length)] })}
                      className="mt-3 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white/45 hover:text-white"
                    >
                      Add image URL manually
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">B. Business</p>
              <h3 className="mt-2 text-2xl font-black text-white">Brand and audience clarity</h3>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Competitive advantage</span>
                <textarea className={textClass} value={brief.competitiveAdvantage} onChange={(event) => updateContentBrief({ competitiveAdvantage: event.target.value })} placeholder="Why will people buy from this brand instead of competitors?" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Target audience in simple language</span>
                <textarea className={textClass} value={brief.targetAudienceSimple} onChange={(event) => updateContentBrief({ targetAudienceSimple: event.target.value })} placeholder="Who will buy from this brand?" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Male / Female</p>
                {["Male", "Female"].map((choice) => (
                  <label key={choice} className="mb-2 flex items-center gap-3 text-sm font-bold text-white/70">
                    <input type="checkbox" checked={brief.audience.genders.includes(choice)} onChange={() => toggleContentBriefAudienceChoice("genders", choice)} />
                    {choice}
                  </label>
                ))}
              </div>
              <label className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Age</span>
                <input className={inputClass} value={brief.audience.age} onChange={(event) => updateContentBriefAudience({ age: event.target.value })} placeholder="Example: 18-35" />
              </label>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Lifestyle status</p>
                {["Luxury", "Average"].map((choice) => (
                  <label key={choice} className="mb-2 flex items-center gap-3 text-sm font-bold text-white/70">
                    <input type="checkbox" checked={brief.audience.lifestyleStatus.includes(choice)} onChange={() => toggleContentBriefAudienceChoice("lifestyleStatus", choice)} />
                    {choice}
                  </label>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Social status</p>
                {["Family", "Single"].map((choice) => (
                  <label key={choice} className="mb-2 flex items-center gap-3 text-sm font-bold text-white/70">
                    <input type="checkbox" checked={brief.audience.socialStatus.includes(choice)} onChange={() => toggleContentBriefAudienceChoice("socialStatus", choice)} />
                    {choice}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">C. Customer journey</p>
              <h3 className="mt-2 text-2xl font-black text-white">Purchase and usage story</h3>
            </div>
            <textarea
              className={`${textClass} min-h-56`}
              value={brief.customerJourney}
              onChange={(event) => updateContentBrief({ customerJourney: event.target.value })}
              placeholder="Example: Noor, 23 years old Kuwaiti girl, is going to her friend's house for a gathering..."
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">D. Content plan</p>
                <h3 className="mt-2 text-2xl font-black text-white">Videos</h3>
              </div>
              <button type="button" onClick={() => updateContentBrief({ videos: [...brief.videos, newContentBriefVideo(brief.videos.length)] })} className="w-fit rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10">Add video</button>
            </div>
            <div className="space-y-3">
              {brief.videos.map((video, index) => (
                <article key={video.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">{video.title || `Video ${index + 1}`}</p>
                    <button type="button" onClick={() => updateContentBrief({ videos: brief.videos.filter((entry) => entry.id !== video.id) })} className="text-xs font-bold text-white/35 hover:text-red-300">Remove</button>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    <input className={inputClass} value={video.title} onChange={(event) => setContentBriefVideo(video.id, { title: event.target.value })} placeholder={`Video ${index + 1}`} />
                    <input className={inputClass} value={video.sampleLink} onChange={(event) => setContentBriefVideo(video.id, { sampleLink: event.target.value })} placeholder="Sample link" />
                    <input className={inputClass} value={video.products} onChange={(event) => setContentBriefVideo(video.id, { products: event.target.value })} placeholder="Products" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">D. Content plan</p>
                <h3 className="mt-2 text-2xl font-black text-white">Sample images</h3>
              </div>
              <label className="w-fit cursor-pointer rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10">
                {uploadingContentBriefId === "sample-images" ? "Uploading..." : "Upload sample images"}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadContentBriefSampleImages(event.target.files ?? undefined)} />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {brief.sampleImages.map((image) => (
                <article key={image.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  {image.url ? <img src={image.url} alt="" className="h-44 w-full rounded-xl object-cover" /> : <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/25">No image</div>}
                  <input className={`${inputClass} mt-3`} value={image.url} onChange={(event) => setContentBriefSampleImage(image.id, { url: event.target.value })} placeholder="Image URL" />
                  <input className={`${inputClass} mt-3`} value={image.products} onChange={(event) => setContentBriefSampleImage(image.id, { products: event.target.value })} placeholder="Products shown" />
                  <button type="button" onClick={() => updateContentBrief({ sampleImages: brief.sampleImages.filter((entry) => entry.id !== image.id) })} className="mt-2 text-xs font-bold text-white/35 hover:text-red-300">Remove image</button>
                </article>
              ))}
            </div>
            <button type="button" onClick={() => updateContentBrief({ sampleImages: [...brief.sampleImages, newContentBriefSampleImage(brief.sampleImages.length)] })} className="mt-3 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white/45 hover:text-white">Add image URL manually</button>
          </div>
        </div>
      </section>
    );
  };

  const renderBrandIdentityAdminSection = () => {
    if (!workspace) return null;
    const brand = workspace.brandIdentity;
    const updateBrand = (patch: Partial<ClientProjectWorkspace["brandIdentity"]>) =>
      setWorkspace({ ...workspace, brandIdentity: { ...brand, ...patch } });

    return (
      <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Client rules</p>
          <h2 className="mt-2 text-3xl font-black text-white">Brand Identity</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">Keep client taste, brand files, examples, and production rules in one place.</p>
        </div>
        <div className="grid gap-4">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Section title</span>
            <input className={inputClass} value={brand.title} onChange={(event) => updateBrand({ title: event.target.value })} />
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Client brand notes</span>
            <textarea className={compactTextClass} value={brand.summary} onChange={(event) => updateBrand({ summary: event.target.value })} placeholder='Example: Only use ice cream product next to pool/beach, and chocolate bites in house/gathering scenes.' />
          </label>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {(["do", "dont"] as const).map((type) => (
            <div key={type} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-black text-white">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${type === "do" ? "border-[#01F17C]/35 bg-[#01F17C]/10 text-[#01F17C]" : "border-red-400/35 bg-red-500/10 text-red-300"}`}>
                    {type === "do" ? "✓" : "×"}
                  </span>
                  {type === "do" ? "Do" : "Don't"}
                </h3>
                <button
                  type="button"
                  onClick={() => updateBrand({ guidelines: [...brand.guidelines, newBrandGuideline(type, brand.guidelines.length)] })}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/55 hover:text-white"
                >
                  Add rule
                </button>
              </div>
              <div className="space-y-2">
                {brand.guidelines.filter((item) => item.type === type).map((item, index) => (
                  <article key={item.id} className={`rounded-lg border bg-white/[0.03] p-2.5 ${type === "do" ? "border-[#01F17C]/20" : "border-red-400/20"}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/45">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${type === "do" ? "bg-[#01F17C]/12 text-[#01F17C]" : "bg-red-500/12 text-red-300"}`}>
                          {type === "do" ? "✓" : "×"}
                        </span>
                        #{index + 1}
                      </span>
                      <button type="button" onClick={() => updateBrand({ guidelines: brand.guidelines.filter((entry) => entry.id !== item.id) })} className="text-xs font-bold text-white/35 hover:text-red-300">Remove</button>
                    </div>
                    <div className={item.imageUrl ? "grid gap-2 sm:grid-cols-[84px_1fr]" : "grid gap-2"}>
                      {item.imageUrl && <div className="flex flex-col gap-2">
                        <img src={item.imageUrl} alt="" className="h-16 w-full rounded-lg object-cover" />
                        <label className="inline-flex cursor-pointer justify-center rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/55 hover:text-white">
                          {uploadingBrandId === item.id ? "..." : "Image"}
                          <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadBrandGuidelineImage(item.id, event.target.files?.[0])} />
                        </label>
                      </div>}
                      <div className="grid gap-2">
                        <textarea className={compactTextClass} value={item.text} onChange={(event) => setBrandGuideline(item.id, { text: event.target.value })} placeholder={type === "do" ? "What should we do?" : "What should we avoid?"} />
                        {!item.imageUrl && (
                          <label className="inline-flex w-fit cursor-pointer justify-center rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/55 hover:text-white">
                            {uploadingBrandId === item.id ? "Uploading..." : "Attach image"}
                            <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadBrandGuidelineImage(item.id, event.target.files?.[0])} />
                          </label>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-black text-white">Sample links the client likes</h3>
              <p className="mt-1 text-sm text-white/45">Add reels, videos, Drive links, Pinterest boards, or references.</p>
            </div>
            <button type="button" onClick={() => updateBrand({ sampleLinks: [...brand.sampleLinks, newBrandSampleLink(brand.sampleLinks.length)] })} className="w-fit rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10">Add link</button>
          </div>
          <div className="space-y-3">
            {brand.sampleLinks.map((link, index) => (
              <article key={link.id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-2">
                <input className={inputClass} value={link.title} onChange={(event) => setBrandSampleLink(link.id, { title: event.target.value })} placeholder={`Sample ${index + 1}`} />
                <input className={inputClass} value={link.url} onChange={(event) => setBrandSampleLink(link.id, { url: event.target.value })} placeholder="https://..." />
                <textarea className={`${compactTextClass} md:col-span-2`} value={link.notes} onChange={(event) => setBrandSampleLink(link.id, { notes: event.target.value })} placeholder="Why the client likes it" />
                <button type="button" onClick={() => updateBrand({ sampleLinks: brand.sampleLinks.filter((entry) => entry.id !== link.id) })} className="w-fit text-xs font-bold text-white/35 hover:text-red-300">Remove link</button>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-xl font-black text-white">Logo, brand identity, and font files</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["logo", "brand_identity", "font", "other"] as const).map((type) => (
              <label key={type} className="cursor-pointer rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#01F17C] hover:bg-[#01F17C]/10">
                {uploadingBrandId === type ? "Uploading..." : `Upload ${type.replace("_", " ")}`}
                <input type="file" className="sr-only" onChange={(event) => uploadBrandAsset(type, event.target.files?.[0])} />
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {brand.files.map((file) => (
              <div key={file.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#01F17C]">{file.fileType.replace("_", " ")}</p>
                <a href={file.url} target="_blank" className="mt-1 block truncate text-sm font-bold text-white hover:text-[#01F17C]">{file.label || file.fileName || file.url}</a>
                <button type="button" onClick={() => updateBrand({ files: brand.files.filter((entry) => entry.id !== file.id) })} className="mt-2 text-xs font-bold text-white/35 hover:text-red-300">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderQuestionnaireSection = () => {
    const record = relatedData.questionnaire;
    const q = record?.parsed?.questionnaire;
    const isExplainer = Boolean(q && "feature" in q && "message" in q && "video" in q);
    const isBrand = Boolean(q && "competition" in q && "proof" in q && "production" in q);
    const brandCaseStudies = ((q as Partial<BrandQuestionnairePayload>)?.proof?.caseStudies ?? [])
      .map((study, i) => `${i + 1}. ${study.company || "Untitled"} — ${study.problem || ""}${study.result ? ` → ${study.result}` : ""}`.trim())
      .filter(Boolean)
      .join("\n");
    const rows = isExplainer
      ? [
          ["Business", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).identity?.businessName],
          ["Contact", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).identity?.contactName],
          ["Product / feature", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).feature?.productFeatureName],
          ["Feature explanation", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).feature?.explanation],
          ["Unique selling point", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).feature?.uniqueSellingPoint],
          ["Points to highlight", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).message?.highlights],
          ["Mode", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).video?.mode],
          ["Language", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).video?.language],
          ["Drive link", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).assets?.driveLink],
          ["Asset notes", (q as Partial<ExplanatoryAnimationQuestionnairePayload>).assets?.notes],
        ]
      : isBrand
        ? [
          ["Business", (q as Partial<BrandQuestionnairePayload>)?.identity?.businessName],
          ["Contact", (q as Partial<BrandQuestionnairePayload>)?.identity?.contactName],
          ["Email", (q as Partial<BrandQuestionnairePayload>)?.identity?.email],
          ["Phone", (q as Partial<BrandQuestionnairePayload>)?.identity?.phone],
          ["Website", (q as Partial<BrandQuestionnairePayload>)?.identity?.website],
          ["Industry", (q as Partial<BrandQuestionnairePayload>)?.identity?.industry],
          ["Location", (q as Partial<BrandQuestionnairePayload>)?.identity?.location],
          ["Years operating", (q as Partial<BrandQuestionnairePayload>)?.identity?.yearsOperating],
          ["Team size", (q as Partial<BrandQuestionnairePayload>)?.identity?.teamSize],
          ["Primary goal", (q as Partial<BrandQuestionnairePayload>)?.goals?.primaryGoal],
          ["Key message", (q as Partial<BrandQuestionnairePayload>)?.goals?.keyMessage],
          ["Tone", (q as Partial<BrandQuestionnairePayload>)?.goals?.tone],
          ["Language", (q as Partial<BrandQuestionnairePayload>)?.goals?.language],
          ["Avoid", (q as Partial<BrandQuestionnairePayload>)?.goals?.avoid],
          ["Competitors", (q as Partial<BrandQuestionnairePayload>)?.competition?.competitors],
          ["Competitive advantage", (q as Partial<BrandQuestionnairePayload>)?.competition?.advantage],
          ["Ideal customer", (q as Partial<BrandQuestionnairePayload>)?.proof?.idealCustomer],
          ["Customer problem", (q as Partial<BrandQuestionnairePayload>)?.proof?.customerProblem],
          ["Case studies", brandCaseStudies],
          ["Workshop access", (q as Partial<BrandQuestionnairePayload>)?.production?.workshopAccess],
          ["Drive link", (q as Partial<BrandQuestionnairePayload>)?.assets?.driveLink],
          ["Asset notes", (q as Partial<BrandQuestionnairePayload>)?.assets?.notes],
        ]
        : [
          ["Business", (q as Partial<QuestionnairePayload>)?.identity?.businessName],
          ["Contact", (q as Partial<QuestionnairePayload>)?.identity?.contactName],
          ["Primary goal", (q as Partial<QuestionnairePayload>)?.strategy?.primaryGoal],
          ["Audience", (q as Partial<QuestionnairePayload>)?.strategy?.audience],
          ["Why choose them over competitors", (q as Partial<QuestionnairePayload>)?.strategy?.competitiveReason],
          ["Current challenge", (q as Partial<QuestionnairePayload>)?.strategy?.currentChallenge],
          ["Visual world", (q as Partial<QuestionnairePayload>)?.taste?.world],
          ["Avoid", (q as Partial<QuestionnairePayload>)?.taste?.avoid],
          ["Content notes", (q as Partial<QuestionnairePayload>)?.content?.notes],
          ["Drive link", (q as Partial<QuestionnairePayload>)?.assets?.driveLink],
          ["Asset notes", (q as Partial<QuestionnairePayload>)?.assets?.notes],
        ];
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Client input</p>
          <h2 className="mt-2 text-3xl font-black text-white">Questionnaire Response</h2>
        </div>
        {!record || !q ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No questionnaire response found for this client yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map(([title, value]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">{title}</p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/70">{String(value || "-")}</p>
              </div>
            ))}
            <p className="md:col-span-2 text-xs text-white/35">Submitted: {new Date(record.createdAt).toLocaleString()}</p>
          </div>
        )}
      </section>
    );
  };

  const renderMonthlySection = () => (
    <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Client input</p>
        <h2 className="mt-2 text-3xl font-black text-white">Monthly Intake</h2>
      </div>
      {relatedData.monthlyIntakes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No monthly intake found for this client yet.</p>
      ) : (
        <div className="space-y-4">
          {relatedData.monthlyIntakes.map((record) => {
            const plan = record.parsed?.monthlyPlan;
            return (
              <article key={record.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-xl font-black text-white">{plan?.month || "Monthly Plan"}</h3>
                  <span className="text-xs text-white/35">{new Date(record.createdAt).toLocaleString()}</span>
                </div>
                {plan?.products?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.products.map((product: MonthlyProductFocus, index: number) => (
                      <div key={`${record.id}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-sm font-black text-white">{product.name || `Item ${index + 1}`}</p>
                        <p className="mt-2 text-xs text-white/45">{product.type} · {product.priority}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/65">{product.details || product.objective || "-"}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {plan?.notes && <p className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/65">{plan.notes}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderCalendarSection = () => (
    <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Production plan</p>
          <h2 className="mt-2 text-3xl font-black text-white">Content Calendar</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">This opens the existing Astro Magic content calendar builder with post generation, captions, media, and calendar slots.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/content-calendar" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white/55 hover:text-white">All calendars</Link>
          <button type="button" onClick={createContentCalendarForClient} className="rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#01F17C] hover:bg-[#01F17C]/10">Create / open</button>
        </div>
      </div>
      {relatedData.calendars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-5">
          <p className="text-sm text-white/45">No matching calendar was found for this client name yet.</p>
          <p className="mt-2 text-xs leading-5 text-white/30">Use Create / open to make this client calendar, or All calendars to open the previous Astro Magic content calendar list.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {relatedData.calendars.map((calendar) => (
            <a key={calendar.slug} href={`/admin/content-calendar/${calendar.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-[#01F17C]/40 hover:bg-[#01F17C]/[0.06]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">{calendar.clientName}</p>
              <h3 className="mt-2 text-xl font-black text-white">{calendar.campaignTitle || "Content Calendar"}</h3>
              <p className="mt-3 text-sm text-white/45">{calendar.filledPosts}/{calendar.totalPosts} slots filled</p>
              <p className="mt-2 text-xs text-white/35">Updated: {calendar.updatedAt ? new Date(calendar.updatedAt).toLocaleString() : "-"}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
  const renderVisualApprovalAdminSection = (
    section: "outfitSelection" | "locationSelection",
    label: "Outfit" | "Location",
    helper: string
  ) => {
    if (!workspace) return null;
    const data = workspace[section];
    const kind = section === "outfitSelection" ? "outfit" : "location";

    return (
      <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Client approval</p>
            <h2 className="mt-2 text-3xl font-black text-white">{label}s</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">{helper}</p>
          </div>
          <button
            onClick={() => setWorkspace((current) => current ? ({
              ...current,
              [section]: {
                ...current[section],
                items: [...current[section].items, newVisualApprovalItem(kind, current[section].items.length)],
              },
            }) : current)}
            className="w-fit rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10"
          >
            Add {label.toLowerCase()}
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Tab title</span>
            <input className={inputClass} value={data.title} onChange={(event) => setWorkspace({ ...workspace, [section]: { ...data, title: event.target.value } })} />
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Intro note</span>
            <input className={inputClass} value={data.intro} onChange={(event) => setWorkspace({ ...workspace, [section]: { ...data, intro: event.target.value } })} placeholder={`Example: Please approve one ${label.toLowerCase()} direction`} />
          </label>
        </div>

        {data.items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No {label.toLowerCase()} options yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.items.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">{label} {index + 1}</p>
                  <button
                    onClick={() => setWorkspace({ ...workspace, [section]: { ...data, items: data.items.filter((entry) => entry.id !== item.id) } })}
                    className="text-xs font-bold text-white/35 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                {(item.images ?? []).length ? (
                  <div className="mb-3 grid gap-3 sm:grid-cols-2">
                    {(item.images ?? []).map((image, imageIndex) => (
                      <div key={image.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                        <img src={image.url} alt="" className="h-44 w-full rounded-lg object-cover" />
                        <input
                          className={`${inputClass} mt-2`}
                          value={image.caption}
                          onChange={(event) => setVisualApprovalImageCaption(section, item.id, image.id, event.target.value)}
                          placeholder={`Option image ${imageIndex + 1} caption`}
                        />
                        <button
                          onClick={() => removeVisualApprovalImage(section, item.id, image.id)}
                          className="mt-2 text-xs font-bold text-white/35 hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </div>
                    ))}
                  </div>
                ) : item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="mb-3 h-40 w-full rounded-xl object-cover" />
                ) : null}
                <div className="grid gap-3">
                  <input className={inputClass} value={item.title} onChange={(event) => setVisualApprovalItem(section, item.id, { title: event.target.value })} placeholder={`${label} title`} />
                  <textarea className={compactTextClass} value={item.description} onChange={(event) => setVisualApprovalItem(section, item.id, { description: event.target.value })} placeholder={`${label} description shown to client`} />
                  <input className={inputClass} value={item.imageUrl} onChange={(event) => setVisualApprovalItem(section, item.id, { imageUrl: event.target.value })} placeholder="Paste image URL or upload below" />
                  <select className={inputClass} value={item.status} onChange={(event) => setVisualApprovalItem(section, item.id, { status: event.target.value as VisualApprovalItem["status"] })}>
                    <option value="draft">Draft</option>
                    <option value="shared">Shared</option>
                    <option value="approved">Approved</option>
                    <option value="revision">Needs revision</option>
                  </select>
                  <textarea className={compactTextClass} value={item.notes} onChange={(event) => setVisualApprovalItem(section, item.id, { notes: event.target.value })} placeholder="Internal notes" />
                  <label className="w-fit cursor-pointer rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#01F17C] hover:bg-[#01F17C]/10">
                    {uploadingSelectionId === item.id ? "Uploading..." : "Upload images"}
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadVisualApprovalImage(section, item.id, event.target.files ?? undefined)} />
                  </label>
                </div>
                {(item.clientDecision !== "pending" || item.clientComment || (item.feedbackThread ?? []).length > 0) && (
                  <div className="mt-4 rounded-xl border border-[#01F17C]/20 bg-[#01F17C]/[0.06] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">Client response</p>
                    <p className="mt-2 text-sm font-black text-white">{item.clientDecision === "approved" ? "Approved" : item.clientDecision === "revision" ? "Needs changes" : "Pending"}</p>
                    {(item.feedbackThread ?? []).length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {(item.feedbackThread ?? []).map((entry) => (
                          <div key={entry.id} className={`rounded-xl border p-3 ${entry.author === "astroshot" ? "border-white/10 bg-black/25" : "border-[#01F17C]/15 bg-[#01F17C]/[0.04]"}`}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                              {entry.author === "astroshot" ? "Astroshot" : "Client"} · {new Date(entry.createdAt).toLocaleString()}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{entry.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : item.clientComment ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{item.clientComment}</p>
                    ) : null}
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                      <textarea
                        className={textClass}
                        value={replyDrafts[`${section}:${item.id}`] ?? ""}
                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [`${section}:${item.id}`]: event.target.value }))}
                        placeholder="Reply to the client comment"
                      />
                      <button
                        onClick={() => saveAdminReply({ type: "visual", section, id: item.id })}
                        className="mt-3 rounded-xl bg-[#01F17C] px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black hover:bg-white"
                      >
                        Send reply
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Client Projects"
        actions={
          <button onClick={() => saveWorkspace()} disabled={!workspace || saving} className="rounded-xl bg-[#01F17C] px-5 py-2.5 text-sm font-black text-black transition-colors hover:bg-white disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        }
      />

      <div className="mb-6 rounded-2xl border border-white/10 bg-[#111] p-5">
        <label className="block max-w-md">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/35">Client</span>
          <select
            className={inputClass}
            value={selectedClient}
            onChange={(event) => {
              setSelectedClient(event.target.value);
              loadWorkspace(undefined, event.target.value);
            }}
          >
            {clients.map((client) => <option key={client.username} value={client.username}>{client.clientName}</option>)}
          </select>
        </label>
        {message && <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">{message}</p>}
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[#111]" />
      ) : !workspace ? (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-10 text-center text-sm text-white/45">No active client portal accounts found.</div>
      ) : (
        <div className="space-y-6">
          <div className="sticky top-4 z-20 rounded-2xl border border-white/10 bg-[#080808]/95 p-3 backdrop-blur">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-11">
              {adminProjectTabs.map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveAdminTab(tab as AdminProjectTab)}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-black uppercase tracking-[0.08em] transition-colors ${
                    activeAdminTab === tab
                      ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeAdminTab === "ideas" && (
          <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">{selectedClientName}</p>
                <h2 className="mt-2 text-3xl font-black text-white">Idea Proposal</h2>
              </div>
              <button
                onClick={() => setWorkspace((current) => current ? ({
                  ...current,
                  ideaProposal: { ...current.ideaProposal, items: [...current.ideaProposal.items, newIdea(current.ideaProposal.items.length)] },
                }) : current)}
                className="rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10"
              >
                Add post idea
              </button>
            </div>

            <div className="mb-5 grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Proposal title</span>
                <input className={inputClass} value={workspace.ideaProposal.title} onChange={(e) => setWorkspace({ ...workspace, ideaProposal: { ...workspace.ideaProposal, title: e.target.value } })} />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Intro note</span>
                <input className={inputClass} value={workspace.ideaProposal.intro} onChange={(e) => setWorkspace({ ...workspace, ideaProposal: { ...workspace.ideaProposal, intro: e.target.value } })} placeholder="Example: First batch of 10 video ideas" />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {workspace.ideaProposal.items.map((idea, index) => (
                <article key={idea.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">Post {index + 1}</p>
                    <button
                      onClick={() => setWorkspace({ ...workspace, ideaProposal: { ...workspace.ideaProposal, items: workspace.ideaProposal.items.filter((item) => item.id !== idea.id) } })}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white/40 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Title</span><input className={inputClass} value={idea.title} onChange={(e) => setIdea(idea.id, { title: e.target.value })} /></label>
                    <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Status</span><select className={inputClass} value={idea.status} onChange={(e) => setIdea(idea.id, { status: e.target.value as IdeaProposalItem["status"] })}><option value="draft">Draft</option><option value="shared">Shared</option><option value="approved">Approved</option><option value="revision">Needs revision</option></select></label>
                    <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Idea text</span><textarea className={compactTextClass} value={idea.description} onChange={(e) => setIdea(idea.id, { description: e.target.value })} placeholder="Write the video idea, hook, scene, or caption direction." /></label>
                    <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Reference video link</span><input className={inputClass} value={idea.referenceUrl} onChange={(e) => setIdea(idea.id, { referenceUrl: e.target.value })} placeholder="Instagram / TikTok / Drive link" /></label>
                    <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Image URL</span><input className={inputClass} value={idea.visualUrl} onChange={(e) => setIdea(idea.id, { visualUrl: e.target.value })} placeholder="Paste image URL or upload below" /></label>
                    <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Internal / client notes</span><textarea className={compactTextClass} value={idea.notes} onChange={(e) => setIdea(idea.id, { notes: e.target.value })} /></label>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 md:flex-row md:items-center">
                    {idea.visualUrl && <img src={idea.visualUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />}
                    <label className="w-fit cursor-pointer rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#01F17C] hover:bg-[#01F17C]/10">
                      {uploadingIdeaId === idea.id ? "Uploading..." : "Upload image"}
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadIdeaImage(idea.id, event.target.files?.[0])} />
                    </label>
                  </div>
                  {(idea.clientDecision !== "pending" || idea.clientComment || (idea.feedbackThread ?? []).length > 0) && (
                    <div className="mt-4 rounded-xl border border-[#01F17C]/20 bg-[#01F17C]/[0.06] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">Client response</p>
                      <p className="mt-2 text-sm font-black text-white">
                        {idea.clientDecision === "approved" ? "Approved" : idea.clientDecision === "revision" ? "Needs changes" : "Pending"}
                      </p>
                      {(idea.feedbackThread ?? []).length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {(idea.feedbackThread ?? []).map((entry) => (
                            <div key={entry.id} className={`rounded-xl border p-3 ${entry.author === "astroshot" ? "border-white/10 bg-black/25" : "border-[#01F17C]/15 bg-[#01F17C]/[0.04]"}`}>
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                                {entry.author === "astroshot" ? "Astroshot" : "Client"} · {new Date(entry.createdAt).toLocaleString()}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{entry.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : idea.clientComment ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{idea.clientComment}</p>
                      ) : null}
                      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                        <textarea
                          className={textClass}
                          value={replyDrafts[`idea:${idea.id}`] ?? ""}
                          onChange={(event) => setReplyDrafts((current) => ({ ...current, [`idea:${idea.id}`]: event.target.value }))}
                          placeholder="Reply to the client comment"
                        />
                        <button
                          onClick={() => saveAdminReply({ type: "idea", id: idea.id })}
                          className="mt-3 rounded-xl bg-[#01F17C] px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black hover:bg-white"
                        >
                          Send reply
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
          )}

          {activeAdminTab === "moodboard" && (
            <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">{selectedClientName}</p>
                  <h2 className="mt-2 text-3xl font-black text-white">Moodboard</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">Upload or paste visual direction images for the client project.</p>
                </div>
                <button
                  onClick={() => setWorkspace((current) => current ? ({
                    ...current,
                    ideaProposal: {
                      ...current.ideaProposal,
                      moodboard: [...(current.ideaProposal.moodboard ?? []), newMoodboardImage(current.ideaProposal.moodboard?.length ?? 0)],
                    },
                  }) : current)}
                  className="w-fit rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10"
                >
                  Add moodboard image
                </button>
              </div>
              {(workspace.ideaProposal.moodboard ?? []).length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No moodboard images yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {(workspace.ideaProposal.moodboard ?? []).map((image) => (
                    <article key={image.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      {image.url ? <img src={image.url} alt="" className="h-56 w-full rounded-xl object-cover" /> : <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/25">No image</div>}
                      <div className="mt-3 space-y-2">
                        <input className={inputClass} value={image.url} onChange={(event) => setMoodboardImage(image.id, { url: event.target.value })} placeholder="Paste image URL" />
                        <input className={inputClass} value={image.caption} onChange={(event) => setMoodboardImage(image.id, { caption: event.target.value })} placeholder="Optional caption" />
                        <div className="flex flex-wrap gap-2">
                          <label className="w-fit cursor-pointer rounded-xl border border-[#01F17C]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#01F17C] hover:bg-[#01F17C]/10">
                            {uploadingMoodboardId === image.id ? "Uploading..." : "Upload"}
                            <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadMoodboardImage(image.id, event.target.files?.[0])} />
                          </label>
                          <button
                            onClick={() => setWorkspace({ ...workspace, ideaProposal: { ...workspace.ideaProposal, moodboard: (workspace.ideaProposal.moodboard ?? []).filter((item) => item.id !== image.id) } })}
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/40 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeAdminTab === "brand" && renderBrandIdentityAdminSection()}
          {activeAdminTab === "contentBrief" && renderContentBriefAdminSection()}
          {activeAdminTab === "questionnaire" && renderQuestionnaireSection()}
          {activeAdminTab === "monthly" && renderMonthlySection()}
          {activeAdminTab === "calendar" && renderCalendarSection()}
          {activeAdminTab === "outfits" && renderVisualApprovalAdminSection("outfitSelection", "Outfit", "Upload outfit references or model outfit images for client approval.")}
          {activeAdminTab === "locations" && renderVisualApprovalAdminSection("locationSelection", "Location", "Upload location references for client approval before production.")}

          {activeAdminTab === "models" && (
          <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Client selection</p>
              <h2 className="mt-2 text-3xl font-black text-white">Models</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Shows what the client selected from the AstroMagic model library.
              </p>
            </div>

            {selectedModels.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No models selected yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {selectedModels.map((model) => (
                  <div key={model.id} className="rounded-2xl border border-[#01F17C]/25 bg-[#01F17C]/[0.06] p-4 text-center">
                    <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-[#01F17C]/50 bg-white">
                      <img src={model.previewUrl || model.url} alt="" className="h-full w-full object-cover object-top" />
                    </div>
                    <p className="mt-3 text-sm font-black text-white">{model.name || "Model"}</p>
                  </div>
                ))}
              </div>
            )}

            {workspace.modelSelection.notes && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Client notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{workspace.modelSelection.notes}</p>
              </div>
            )}

            {workspace.modelSelection.submittedAt && <p className="mt-4 text-xs text-white/35">{new Date(workspace.modelSelection.submittedAt).toLocaleString()}</p>}
          </section>
          )}

          {activeAdminTab === "timeline" && (
          <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Client visible</p>
                <h2 className="mt-2 text-3xl font-black text-white">Timeline</h2>
              </div>
              <button
                onClick={() => setWorkspace((current) => current ? ({
                  ...current,
                  timeline: { ...current.timeline, items: [...current.timeline.items, newTimeline(current.timeline.items.length)] },
                }) : current)}
                className="rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-sm font-black text-[#01F17C] hover:bg-[#01F17C]/10"
              >
                Add milestone
              </button>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Timeline title</span>
              <input className={inputClass} value={workspace.timeline.title} onChange={(e) => setWorkspace({ ...workspace, timeline: { ...workspace.timeline, title: e.target.value } })} />
            </label>

            <div className="space-y-4">
              {workspace.timeline.items.map((item, index) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">Milestone {index + 1}</p>
                    <button onClick={() => setWorkspace({ ...workspace, timeline: { ...workspace.timeline, items: workspace.timeline.items.filter((entry) => entry.id !== item.id) } })} className="text-xs font-bold text-white/35 hover:text-red-300">Remove</button>
                  </div>
                  <div className="grid gap-3">
                    <input className={inputClass} value={item.date} onChange={(e) => setTimeline(item.id, { date: e.target.value })} placeholder="Date, e.g. 7 July" />
                    <input className={inputClass} value={item.title} onChange={(e) => setTimeline(item.id, { title: e.target.value })} placeholder="Milestone title" />
                    <select className={inputClass} value={item.status} onChange={(e) => setTimeline(item.id, { status: e.target.value as TimelineItem["status"] })}>
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In progress</option>
                      <option value="waiting">Waiting approval</option>
                      <option value="done">Done</option>
                    </select>
                    <textarea className={textClass} value={item.description} onChange={(e) => setTimeline(item.id, { description: e.target.value })} placeholder="What happens at this stage?" />
                  </div>
                </article>
              ))}
            </div>
          </section>
          )}
        </div>
      )}
    </div>
  );
}
