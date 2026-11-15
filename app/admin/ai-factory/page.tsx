"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_STYLE_CATEGORY,
  REFERENCE_BEHAVIOR_OPTIONS,
  STYLE_CATEGORIES,
  emptyAiFactory,
  type AiCaptionSettings,
  type AiFactory,
  type AiImageSettings,
  type CalendarAiAsset,
  type CalendarAiAssetType,
  type CalendarAiStyle,
  type ReferenceBehavior,
  type StyleCategoryId,
  type StyleUsage,
} from "@/lib/content-calendar";

type UploadResponse = {
  bucket: string;
  path: string;
  token: string;
  file: {
    url: string;
    type: string;
  };
};

const fieldClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]";
const areaClass = `${fieldClass} min-h-28 resize-y leading-relaxed`;
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35";
type FactoryTab = "image" | "captions" | "future";
type ImageSection = "prompts" | "models" | "references" | "styles";
type StyleFolderFilter = "all" | StyleCategoryId;

const styleUsageOptions: Array<{ id: StyleUsage; name: string }> = [
  { id: "both", name: "Images + Videos" },
  { id: "image", name: "Images only" },
  { id: "video", name: "Videos only" },
];

function assetKey(type: CalendarAiAssetType) {
  return type === "model" ? "models" : "references";
}

export default function AiFactoryPage() {
  const router = useRouter();
  const [factory, setFactory] = useState<AiFactory>(() => emptyAiFactory());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [activeTab, setActiveTab] = useState<FactoryTab>("image");
  const [activeStyleCategory, setActiveStyleCategory] = useState<StyleFolderFilter>("all");
  const [openSections, setOpenSections] = useState<Record<ImageSection, boolean>>({
    prompts: true,
    models: false,
    references: false,
    styles: false,
  });
  const loaded = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFactory = useRef(factory);
  const lastSavedFactoryJson = useRef("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/ai-factory", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setError("Could not load AI Factory.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { factory: AiFactory };
      setFactory(data.factory);
      latestFactory.current = data.factory;
      lastSavedFactoryJson.current = JSON.stringify(data.factory);
      loaded.current = true;
      setLoading(false);
    }

    load();
  }, [router]);

  useEffect(() => {
    latestFactory.current = factory;
  }, [factory]);

  const persistFactory = useCallback(async (factoryToSave: AiFactory, silent = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return false;
    }

    if (!silent) {
      setSaving(true);
      setSaveState("");
      setError("");
    } else {
      setSaveState("Autosaving...");
    }

    const savedFactoryJson = JSON.stringify(factoryToSave);
    const res = await fetch("/api/admin/ai-factory", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ factory: factoryToSave }),
    });

    if (!silent) setSaving(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save AI Factory.");
      return false;
    }

    const data = (await res.json()) as { factory: AiFactory };
    const hasNewerLocalChanges = JSON.stringify(latestFactory.current) !== savedFactoryJson;
    if (!hasNewerLocalChanges) {
      setFactory(data.factory);
      latestFactory.current = data.factory;
      lastSavedFactoryJson.current = JSON.stringify(data.factory);
      setSaveState(silent ? "Autosaved." : "Saved.");
    } else {
      lastSavedFactoryJson.current = savedFactoryJson;
      setSaveState("Saved. New edits are still pending autosave.");
    }
    return true;
  }, [router]);

  useEffect(() => {
    if (!loaded.current || saving) return;
    if (JSON.stringify(factory) === lastSavedFactoryJson.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persistFactory(latestFactory.current, true);
    }, 900);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [factory, persistFactory, saving]);

  const uploadSignedFile = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      throw new Error("Not signed in");
    }

    const res = await fetch("/api/admin/content-calendar/presign", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: "ai-factory",
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Could not prepare upload");
    }

    const data = (await res.json()) as UploadResponse;
    const { error: uploadError } = await supabase.storage
      .from(data.bucket)
      .uploadToSignedUrl(data.path, data.token, file, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) throw new Error(uploadError.message);
    return data;
  };

  const addAsset = async (event: React.ChangeEvent<HTMLInputElement>, type: "model" | "reference") => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      setError("AI Factory assets must be images.");
      if (imageFiles.length === 0) return;
    }

    setUploading(type);
    setUploadProgress(imageFiles.length > 1 ? `Uploading 1/${imageFiles.length}...` : "");
    setError("");
    setSaveState("");

    try {
      const category = activeStyleCategory === "all" ? DEFAULT_STYLE_CATEGORY : activeStyleCategory;
      const uploadedAssets: CalendarAiAsset[] = [];

      for (const [index, file] of imageFiles.entries()) {
        if (imageFiles.length > 1) {
          setUploadProgress(`Uploading ${index + 1}/${imageFiles.length}...`);
        }

        const data = await uploadSignedFile(file);
        uploadedAssets.push({
          id: `${type}-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          type,
          name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          url: data.file.url,
          previewUrl: "",
          notes: "",
          createdAt: new Date().toISOString(),
          ...(type === "reference" ? { styleCategory: category, referenceBehavior: "location-dna" as ReferenceBehavior, styleUsage: "both" as StyleUsage } : {}),
        });
      }

      const key = assetKey(type);
      setFactory((current) => ({
        ...current,
        aiAssets: {
          ...current.aiAssets,
          [key]: [...current.aiAssets[key], ...uploadedAssets],
        },
      }));
      const label = type === "reference" ? "style" : "model";
      setSaveState(`${uploadedAssets.length} ${label}${uploadedAssets.length === 1 ? "" : "s"} uploaded. Autosaving...`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading("");
      setUploadProgress("");
    }
  };

  const updateAsset = (type: "model" | "reference", id: string, patch: Partial<CalendarAiAsset>) => {
    const key = assetKey(type);
    setFactory((current) => ({
      ...current,
      aiAssets: {
        ...current.aiAssets,
        [key]: current.aiAssets[key].map((asset) => asset.id === id ? { ...asset, ...patch } : asset),
      },
    }));
  };

  const addModelPreview = async (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Model preview must be an image.");
      return;
    }

    setUploading(`preview-${id}`);
    setError("");
    setSaveState("");

    try {
      const data = await uploadSignedFile(file);
      updateAsset("model", id, { previewUrl: data.file.url });
      setSaveState("Model preview uploaded. Autosaving...");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Preview upload failed");
    } finally {
      setUploading("");
    }
  };

  const removeAsset = (type: "model" | "reference", id: string) => {
    const key = assetKey(type);
    setFactory((current) => ({
      ...current,
      aiAssets: {
        ...current.aiAssets,
        [key]: current.aiAssets[key].filter((asset) => asset.id !== id),
      },
    }));
  };

  const addStyle = () => {
    const style: CalendarAiStyle = {
      id: `style-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: "New Style",
      prompt: "Describe the visual language, camera, lighting, mood, and composition this style should create.",
    };
    setFactory((current) => ({ ...current, aiStyles: [...current.aiStyles, style] }));
  };

  const updateStyle = (id: string, patch: Partial<CalendarAiStyle>) => {
    setFactory((current) => ({
      ...current,
      aiStyles: current.aiStyles.map((style) => style.id === id ? { ...style, ...patch } : style),
    }));
  };

  const removeStyle = (id: string) => {
    setFactory((current) => ({
      ...current,
      aiStyles: current.aiStyles.filter((style) => style.id !== id),
    }));
  };

  const updateCaptionSettings = (patch: Partial<AiCaptionSettings>) => {
    setFactory((current) => ({
      ...current,
      captionSettings: {
        ...current.captionSettings,
        ...patch,
      },
    }));
  };

  const updateImageSettings = (patch: Partial<AiImageSettings>) => {
    setFactory((current) => ({
      ...current,
      imageSettings: {
        ...current.imageSettings,
        ...patch,
      },
    }));
  };

  const toggleSection = (section: ImageSection) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  if (loading) {
    return <div className="p-6 lg:p-10"><div className="h-96 rounded-2xl bg-[#111] animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(1,241,124,0.12),transparent_28%),radial-gradient(circle_at_86%_10%,rgba(255,128,64,0.15),transparent_30%),#070707] p-6 lg:p-10">
      <AdminHeader
        title="AI Factory"
        actions={
          <button
            type="button"
            onClick={() => persistFactory(factory)}
            disabled={saving}
            className="rounded-xl bg-[#01F17C] px-4 py-2 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Factory"}
          </button>
        }
      />

      {(error || saveState) && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-[#01F17C]/20 bg-[#01F17C]/10 text-[#01F17C]"}`}>
          {error || saveState}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: "image" as const, label: "Image" },
          { id: "captions" as const, label: "Captions" },
          { id: "future" as const, label: "Future Tools" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-black transition-colors ${activeTab === tab.id ? "bg-[linear-gradient(135deg,#01F17C,#ffd166)] text-black shadow-[0_14px_36px_rgba(1,241,124,0.14)]" : "border border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "image" && (
        <div className="space-y-4">
          <FactorySection
            title="Image Prompt Brain"
            eyebrow="Astro Magic Mother Prompt"
            description="These prompts control how Astro Magic reads products, models, and selected style images."
            open={openSections.prompts}
            onToggle={() => toggleSection("prompts")}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <PromptBox label="Mother prompt" value={factory.imageSettings.motherPrompt} onChange={(value) => updateImageSettings({ motherPrompt: value })} tall />
              <PromptBox label="Quality enhance prompt" value={factory.imageSettings.qualityEnhancePrompt} onChange={(value) => updateImageSettings({ qualityEnhancePrompt: value })} />
              <PromptBox label="Trend Match" value={factory.imageSettings.trendMatchPrompt} onChange={(value) => updateImageSettings({ trendMatchPrompt: value })} tall />
              <PromptBox label="Location DNA" value={factory.imageSettings.locationDnaPrompt} onChange={(value) => updateImageSettings({ locationDnaPrompt: value })} tall />
              <PromptBox label="Visual Vibe" value={factory.imageSettings.visualVibePrompt} onChange={(value) => updateImageSettings({ visualVibePrompt: value })} />
              <PromptBox label="Product Setup" value={factory.imageSettings.productSetupPrompt} onChange={(value) => updateImageSettings({ productSetupPrompt: value })} />
              <PromptBox label="Pose / Outfit" value={factory.imageSettings.poseOutfitPrompt} onChange={(value) => updateImageSettings({ poseOutfitPrompt: value })} />
            </div>
          </FactorySection>

          <FactorySection
            title="Models"
            eyebrow="Shared Characters"
            description={`${factory.aiAssets.models.length} model sheets available to every content calendar.`}
            open={openSections.models}
            onToggle={() => toggleSection("models")}
            action={(
              <label className="cursor-pointer rounded-xl border border-[#01F17C]/25 bg-[#01F17C]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20">
                {uploading === "model" ? "Uploading..." : "Add Model"}
                <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => addAsset(event, "model")} />
              </label>
            )}
          >
            <AssetGrid assets={factory.aiAssets.models} type="model" updateAsset={updateAsset} removeAsset={removeAsset} addModelPreview={addModelPreview} uploading={uploading} />
          </FactorySection>

          <FactorySection
            title="Styles"
            eyebrow="Shared Style Folders"
            description={`${factory.aiAssets.references.length} style image${factory.aiAssets.references.length === 1 ? "" : "s"} organized for every content calendar.`}
            open={openSections.references}
            onToggle={() => toggleSection("references")}
            action={(
              <label className="cursor-pointer rounded-xl border border-[#01F17C]/25 bg-[#01F17C]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20">
                {uploading === "reference" ? uploadProgress || "Uploading..." : "Add Styles"}
                <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => addAsset(event, "reference")} />
              </label>
            )}
          >
            <StyleFolderBoard
              assets={factory.aiAssets.references}
              activeCategory={activeStyleCategory}
              setActiveCategory={setActiveStyleCategory}
              updateAsset={updateAsset}
              removeAsset={removeAsset}
            />
          </FactorySection>

          <FactorySection
            title="Image Styles"
            eyebrow="Shared Styles"
            description={`${factory.aiStyles.length} style prompts appear in every Astro Magic popup.`}
            open={openSections.styles}
            onToggle={() => toggleSection("styles")}
            action={(
              <button type="button" onClick={addStyle} className="rounded-xl border border-[#01F17C]/25 bg-[#01F17C]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#01F17C] hover:bg-[#01F17C]/20">
                Add Style
              </button>
            )}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {factory.aiStyles.map((style) => (
                <div key={style.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <label>
                    <span className={labelClass}>Style name</span>
                    <input className={fieldClass} value={style.name} onChange={(event) => updateStyle(style.id, { name: event.target.value })} />
                  </label>
                  <label className="mt-3 block">
                    <span className={labelClass}>Prompt behavior</span>
                    <textarea className={areaClass} value={style.prompt} onChange={(event) => updateStyle(style.id, { prompt: event.target.value })} />
                  </label>
                  <button type="button" onClick={() => removeStyle(style.id)} className="mt-3 text-xs font-bold uppercase tracking-widest text-red-300/80 hover:text-red-200">
                    Delete Style
                  </button>
                </div>
              ))}
            </div>
          </FactorySection>
        </div>
      )}

      {activeTab === "captions" && (
        <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">Caption Brain</p>
            <h2 className="mt-2 text-lg font-black text-white">Kuwaiti caption mother prompt</h2>
            <p className="mt-1 text-sm text-white/45">These rules control the AI Caption button across content calendars.</p>
          </div>
          <div className="grid gap-4">
            <label>
              <span className={labelClass}>Mother prompt</span>
              <textarea className={`${areaClass} min-h-56`} value={factory.captionSettings.motherPrompt} onChange={(event) => updateCaptionSettings({ motherPrompt: event.target.value })} />
            </label>
            <label>
              <span className={labelClass}>Quality rules</span>
              <textarea className={areaClass} value={factory.captionSettings.qualityRules} onChange={(event) => updateCaptionSettings({ qualityRules: event.target.value })} />
            </label>
            <label>
              <span className={labelClass}>Avoid / negative rules</span>
              <textarea className={areaClass} value={factory.captionSettings.negativeRules} onChange={(event) => updateCaptionSettings({ negativeRules: event.target.value })} />
            </label>
          </div>
        </section>
      )}

      {activeTab === "future" && (
        <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm leading-7 text-white/45">
          Future AI controls can sit here as new generators are added: video prompts, voice-over, storyboards, hooks, offers, and brand-specific approval rules.
        </section>
      )}
    </div>
  );
}

function FactorySection({
  title,
  eyebrow,
  description,
  open,
  onToggle,
  action,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-glass-panel rounded-2xl border border-white/10 p-5">
      <div className={`${open ? "mb-5" : ""} flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
        <button type="button" onClick={onToggle} className="text-left">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">{eyebrow}</p>
          <h2 className="mt-2 text-lg font-black text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/45">{description}</p>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {open && action}
          <button type="button" onClick={onToggle} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            {open ? "Close" : "Open"}
          </button>
        </div>
      </div>
      {open && children}
    </section>
  );
}

function PromptBox({ label, value, onChange, tall = false }: { label: string; value: string; onChange: (value: string) => void; tall?: boolean }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea
        className={`${areaClass} ${tall ? "min-h-44" : "min-h-28"}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StyleFolderBoard({
  assets,
  activeCategory,
  setActiveCategory,
  updateAsset,
  removeAsset,
}: {
  assets: CalendarAiAsset[];
  activeCategory: StyleFolderFilter;
  setActiveCategory: (category: StyleFolderFilter) => void;
  updateAsset: (type: "model" | "reference", id: string, patch: Partial<CalendarAiAsset>) => void;
  removeAsset: (type: "model" | "reference", id: string) => void;
}) {
  const folderFilters = [{ id: "all" as const, name: "All" }, ...STYLE_CATEGORIES];
  const activeAssets = activeCategory === "all"
    ? assets
    : assets.filter((asset) => (asset.styleCategory ?? DEFAULT_STYLE_CATEGORY) === activeCategory);
  const activeCategoryName = activeCategory === "all" ? "All" : STYLE_CATEGORIES.find((category) => category.id === activeCategory)?.name ?? "Studio";

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-9">
        {folderFilters.map((category) => {
          const count = category.id === "all" ? assets.length : assets.filter((asset) => (asset.styleCategory ?? DEFAULT_STYLE_CATEGORY) === category.id).length;
          const active = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`style-folder-pill group flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-all ${active ? "border-[#01F17C]/60 bg-[#01F17C]/15 text-white shadow-[0_16px_44px_rgba(1,241,124,0.12)]" : "border-white/10 bg-white/[0.045] text-white/55 hover:border-white/25 hover:bg-white/[0.075] hover:text-white"}`}
            >
              <span>
                <span className="block text-sm font-black">{category.name}</span>
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${active ? "bg-white text-black" : "bg-white/10 text-white/55 group-hover:text-white"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="style-folder-dropzone min-h-80 rounded-3xl border border-white/10 p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">{activeCategoryName}</p>
            <h3 className="mt-1 text-lg font-black text-white">Style folder</h3>
          </div>
          <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/45">Change folder from each image card</p>
        </div>

        {activeAssets.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-white/12 bg-black/20 p-8 text-center text-sm font-semibold text-white/35">
            No styles in this folder yet. Add a style or choose another folder from a style card.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeAssets.map((asset) => (
              <div
                key={asset.id}
                className="group rounded-2xl border border-white/10 bg-black/25 p-3 transition-all hover:-translate-y-0.5 hover:border-[#01F17C]/45 hover:bg-white/[0.045]"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white/[0.04]">
                  <img src={asset.url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
                </div>
                <input
                  className={`${fieldClass} mt-3 py-2`}
                  value={asset.name}
                  onChange={(event) => updateAsset("reference", asset.id, { name: event.target.value })}
                  placeholder="Style name"
                />
                <label className="mt-2 block">
                  <span className={labelClass}>Folder</span>
                  <select
                    className={`${fieldClass} py-2`}
                    value={asset.styleCategory ?? DEFAULT_STYLE_CATEGORY}
                    onChange={(event) => {
                      const category = event.target.value as StyleCategoryId;
                      updateAsset("reference", asset.id, { styleCategory: category });
                    }}
                  >
                    {STYLE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-2 block">
                  <span className={labelClass}>Prompt behavior</span>
                  <select
                    className={`${fieldClass} py-2`}
                    value={asset.referenceBehavior ?? "location-dna"}
                    onChange={(event) => {
                      updateAsset("reference", asset.id, { referenceBehavior: event.target.value as ReferenceBehavior });
                    }}
                  >
                    {REFERENCE_BEHAVIOR_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs font-medium text-white/35">
                    {REFERENCE_BEHAVIOR_OPTIONS.find((option) => option.id === (asset.referenceBehavior ?? "location-dna"))?.description}
                  </p>
                </label>
                <label className="mt-2 block">
                  <span className={labelClass}>Use for</span>
                  <select
                    className={`${fieldClass} py-2`}
                    value={asset.styleUsage ?? "both"}
                    onChange={(event) => updateAsset("reference", asset.id, { styleUsage: event.target.value as StyleUsage })}
                  >
                    {styleUsageOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-2 block">
                  <span className={labelClass}>Style direction</span>
                  <textarea
                    className={`${areaClass} min-h-20 py-2`}
                    value={asset.notes}
                    onChange={(event) => updateAsset("reference", asset.id, { notes: event.target.value })}
                    placeholder="Mood, lighting, composition, color, camera, and what this style should guide..."
                  />
                </label>
                <button type="button" onClick={() => removeAsset("reference", asset.id)} className="mt-2 text-xs font-bold uppercase tracking-widest text-red-300/80 hover:text-red-200">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetGrid({
  assets,
  type,
  updateAsset,
  removeAsset,
  addModelPreview,
  uploading,
}: {
  assets: CalendarAiAsset[];
  type: "model" | "reference";
  updateAsset: (type: "model" | "reference", id: string, patch: Partial<CalendarAiAsset>) => void;
  removeAsset: (type: "model" | "reference", id: string) => void;
  addModelPreview: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  uploading: string;
}) {
  if (assets.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm font-semibold text-white/30">No assets yet.</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-white/[0.04]">
            <img src={asset.url} alt="" className="h-full w-full object-cover" />
          </div>
          {type === "model" && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-white">
                  {asset.previewUrl ? (
                    <img src={asset.previewUrl} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-medium leading-tight text-black/35">
                      Preview needed
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/70">Model selector preview</p>
                  <p className="mt-0.5 text-xs text-white/35">{asset.previewUrl ? "Custom preview uploaded" : "Upload the single-image preview used in Astro Magic"}</p>
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white">
                {uploading === `preview-${asset.id}` ? "Uploading..." : asset.previewUrl ? "Change preview" : "Upload preview"}
                <input className="hidden" type="file" accept="image/*" onChange={(event) => addModelPreview(event, asset.id)} />
              </label>
            </div>
          )}
          <input
            className={`${fieldClass} mt-3 py-2`}
            value={asset.name}
            onChange={(event) => updateAsset(type, asset.id, { name: event.target.value })}
            placeholder="Asset name"
          />
          <label className="mt-2 block">
            <span className={labelClass}>{type === "model" ? "Model prompt" : "Style direction"}</span>
            <textarea
              className={`${areaClass} min-h-20 py-2`}
              value={asset.notes}
              onChange={(event) => updateAsset(type, asset.id, { notes: event.target.value })}
              placeholder={type === "model" ? "Identity, styling, proportions, face consistency, what to preserve..." : "Mood, lighting, composition, color, camera, and what this style should guide..."}
            />
          </label>
          <button type="button" onClick={() => removeAsset(type, asset.id)} className="mt-2 text-xs font-bold uppercase tracking-widest text-red-300/80 hover:text-red-200">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
