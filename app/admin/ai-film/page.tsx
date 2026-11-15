"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AiAppBottomNav from "@/components/admin/AiAppBottomNav";
import { supabase } from "@/lib/supabase";

type StepId = "brief" | "product" | "location" | "character" | "hero" | "angles" | "video";
type ImageEngine = "nano-banana-2" | "nano-banana-pro" | "gpt-image-2";
type VideoModel = "seedance-2-fast" | "seedance-2-pro" | "kling-3" | "veo-3-1" | "kling-omni" | "flow" | "gemini-omni";

type UploadedAsset = {
  name: string;
  url: string;
  type: string;
  size?: number;
};

type HeroVersion = {
  id: string;
  url: string;
  note: string;
  prompt: string;
  createdAt: string;
};

type AngleFrame = {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  approved: boolean;
};

type BusyKey =
  | ""
  | "upload-product"
  | "upload-location"
  | "upload-character"
  | "product-sheet"
  | "location-brief"
  | "character-sheet"
  | "hero"
  | "angle"
  | "video";

const steps: Array<{ id: StepId; label: string; title: string; line: string }> = [
  { id: "brief", label: "Brief", title: "Start with the client brief", line: "Only the basics: client, product, duration, and the idea." },
  { id: "product", label: "Product", title: "Upload the product and generate its sheet", line: "This creates the locked product reference for every image and video step." },
  { id: "location", label: "Location", title: "Lock the location direction", line: "Describe a place or upload a location image. AI turns it into a usable brief." },
  { id: "character", label: "Character", title: "Add the character only if needed", line: "Use an uploaded person/model reference or skip for product-only films." },
  { id: "hero", label: "Hero", title: "Generate the hero image", line: "Every edit is a fresh regeneration from approved assets, so quality does not collapse." },
  { id: "angles", label: "Angles", title: "Create alternate angles", line: "Generate the 6 scene frames from the same approved product, location, and character logic." },
  { id: "video", label: "Video", title: "Send an approved frame to video", line: "Choose the video model and submit the first motion test." },
];

const imageEngines: Array<{ id: ImageEngine; label: string; connected: boolean }> = [
  { id: "nano-banana-2", label: "Nano Banana 2", connected: true },
  { id: "nano-banana-pro", label: "Nano Banana Pro", connected: true },
  { id: "gpt-image-2", label: "GPT Image 2", connected: false },
];

const videoModels: Array<{ id: VideoModel; label: string; connected: boolean }> = [
  { id: "seedance-2-fast", label: "Seedance 2 Fast", connected: true },
  { id: "seedance-2-pro", label: "Seedance 2 Pro", connected: true },
  { id: "kling-3", label: "Kling 3", connected: true },
  { id: "veo-3-1", label: "Veo 3.1", connected: true },
  { id: "kling-omni", label: "Kling Omni", connected: false },
  { id: "flow", label: "Flow", connected: false },
  { id: "gemini-omni", label: "Gemini Omni", connected: false },
];

const starterAngles: AngleFrame[] = [
  { id: "angle-1", title: "Hero 3/4 product", prompt: "Low 3/4 commercial hero frame of the product, premium lensing, warm highlights, clean negative space.", imageUrl: "", approved: false },
  { id: "angle-2", title: "Texture macro", prompt: "Extreme macro detail of the product texture, appetizing material, shallow depth, no extra packaging invented.", imageUrl: "", approved: false },
  { id: "angle-3", title: "Character reaction", prompt: "Medium shot with the approved character reacting naturally, product visible as the emotional trigger.", imageUrl: "", approved: false },
  { id: "angle-4", title: "Location wide", prompt: "Wide establishing frame that shows the approved location DNA and keeps the product story premium.", imageUrl: "", approved: false },
  { id: "angle-5", title: "Handoff moment", prompt: "Close commercial handoff/action moment with product focus, believable hands, clean brand-safe composition.", imageUrl: "", approved: false },
  { id: "angle-6", title: "Final beauty frame", prompt: "Final packshot-style beauty frame with product as hero, elegant ending composition, space for logo or CTA.", imageUrl: "", approved: false },
];

function cleanSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ai-film";
}

function assetForApi(asset: UploadedAsset | null, name: string, type: "product" | "model" | "reference") {
  if (!asset?.url) return null;
  return {
    id: cleanSlug(`${type}-${name}`),
    type,
    name,
    url: asset.url,
    previewUrl: asset.url,
    notes: "",
    createdAt: new Date().toISOString(),
    referenceBehavior: type === "reference" ? "location-dna" : undefined,
    styleCategory: type === "reference" ? "location" : undefined,
    styleUsage: type === "reference" ? "image" : undefined,
  };
}

export default function AiFilmPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [clientName, setClientName] = useState("Khashna");
  const [productName, setProductName] = useState("Kunafa");
  const [duration, setDuration] = useState("30 seconds");
  const [idea, setIdea] = useState("A premium AI film where a late-night dessert craving turns into a cinematic kunafa reveal.");
  const [projectSlug] = useState(() => `ai-film-${Date.now()}`);

  const [productRefs, setProductRefs] = useState<UploadedAsset[]>([]);
  const [productSheet, setProductSheet] = useState<UploadedAsset | null>(null);
  const [locationImage, setLocationImage] = useState<UploadedAsset | null>(null);
  const [locationText, setLocationText] = useState("Warm premium Kuwaiti dessert shop at night, brass details, glass display, soft practical lights.");
  const [locationBrief, setLocationBrief] = useState("");
  const [characterRef, setCharacterRef] = useState<UploadedAsset | null>(null);
  const [characterSheet, setCharacterSheet] = useState<UploadedAsset | null>(null);

  const [imageEngine, setImageEngine] = useState<ImageEngine>("nano-banana-pro");
  const [heroNote, setHeroNote] = useState("Golden kunafa hero frame, premium Kuwaiti dessert mood, controlled cinematic lighting.");
  const [heroVersions, setHeroVersions] = useState<HeroVersion[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState("");

  const [angles, setAngles] = useState<AngleFrame[]>(starterAngles);
  const [selectedVideoModel, setSelectedVideoModel] = useState<VideoModel>("seedance-2-fast");
  const [videoPrompt, setVideoPrompt] = useState("Slow cinematic push-in with subtle steam, premium dessert commercial pacing, no text, no logo distortion.");
  const [videoJob, setVideoJob] = useState("");
  const [busy, setBusy] = useState<BusyKey>("");
  const [error, setError] = useState("");

  const currentStep = steps[stepIndex];
  const selectedHero = heroVersions.find((version) => version.id === selectedHeroId) ?? heroVersions[0] ?? null;
  const approvedAngles = angles.filter((angle) => angle.approved);
  const firstVideoFrame = approvedAngles[0]?.imageUrl || selectedHero?.url || "";

  const stepDone = useMemo(() => {
    switch (currentStep.id) {
      case "brief":
        return Boolean(clientName.trim() && productName.trim() && duration.trim() && idea.trim());
      case "product":
        return Boolean(productSheet);
      case "location":
        return Boolean(locationBrief.trim());
      case "character":
        return true;
      case "hero":
        return Boolean(selectedHero);
      case "angles":
        return approvedAngles.length > 0;
      case "video":
        return true;
      default:
        return false;
    }
  }, [approvedAngles.length, clientName, currentStep.id, duration, idea, locationBrief, productName, productSheet, selectedHero]);

  async function authHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  }

  async function uploadFiles(files: FileList | null, key: BusyKey) {
    if (!files?.length) return [];
    setBusy(key);
    setError("");
    try {
      const headers = await authHeaders();
      const uploaded: UploadedAsset[] = [];
      for (const file of Array.from(files)) {
        const presign = await fetch("/api/admin/content-calendar/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            slug: projectSlug,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
          }),
        });
        const data = await presign.json();
        if (!presign.ok) throw new Error(data.error || "Could not prepare upload");

        const { error: uploadError } = await supabase.storage
          .from(data.bucket)
          .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type || "application/octet-stream" });
        if (uploadError) throw new Error(uploadError.message);
        uploaded.push(data.file);
      }
      return uploaded;
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      return [];
    } finally {
      setBusy("");
    }
  }

  async function generateProductSheet() {
    if (!productRefs.length) {
      setError("Upload at least one product image first.");
      return;
    }
    setBusy("product-sheet");
    setError("");
    try {
      const headers = await authHeaders();
      const response = await fetch("/api/admin/content-calendar/ai-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          slug: projectSlug,
          kind: "product",
          name: productName,
          sourceUrls: productRefs.map((asset) => asset.url),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate product sheet");
      setProductSheet({ name: `${productName} Product Sheet`, url: data.imageUrl, type: "image/png" });
    } catch (sheetError) {
      setError(sheetError instanceof Error ? sheetError.message : "Product sheet failed");
    } finally {
      setBusy("");
    }
  }

  async function generateLocationBrief() {
    setBusy("location-brief");
    setError("");
    try {
      const headers = await authHeaders();
      const response = await fetch("/api/admin/ai-film/location-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          clientName,
          product: productName,
          idea,
          description: locationText,
          imageUrl: locationImage?.url,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate location brief");
      setLocationBrief(data.brief);
    } catch (briefError) {
      setError(briefError instanceof Error ? briefError.message : "Location brief failed");
    } finally {
      setBusy("");
    }
  }

  async function generateCharacterSheet() {
    if (!characterRef) {
      setError("Upload a character image first, or skip this step.");
      return;
    }
    setBusy("character-sheet");
    setError("");
    try {
      const headers = await authHeaders();
      const response = await fetch("/api/admin/content-calendar/ai-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          slug: projectSlug,
          kind: "character",
          name: `${clientName} Character`,
          sourceUrls: [characterRef.url],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate character sheet");
      setCharacterSheet({ name: `${clientName} Character Sheet`, url: data.imageUrl, type: "image/png" });
    } catch (sheetError) {
      setError(sheetError instanceof Error ? sheetError.message : "Character sheet failed");
    } finally {
      setBusy("");
    }
  }

  async function generateImage(kind: "hero" | "angle", angle?: AngleFrame) {
    if (!productSheet) {
      setError("Generate the product sheet first.");
      return;
    }
    setBusy(kind);
    setError("");
    try {
      const headers = await authHeaders();
      const productAsset = assetForApi(productSheet, productName, "product");
      const characterAsset = assetForApi(characterSheet, `${clientName} Character`, "model");
      const locationAsset = assetForApi(locationImage, `${clientName} Location`, "reference");
      const response = await fetch("/api/admin/content-calendar/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          slug: projectSlug,
          clientName,
          campaignTitle: `${productName} AI Film`,
          postLabel: kind === "hero" ? "Hero Image" : angle?.title,
          product: productAsset,
          models: characterAsset ? [characterAsset] : [],
          reference: locationAsset,
          styleName: imageEngine,
          stylePrompt: imageEngine.includes("nano")
            ? "Use the connected Gemini/Nano image pipeline for premium commercial realism."
            : "Route through the selected image engine when connected.",
          extraPrompt: [
            idea,
            locationBrief ? `Approved location brief:\n${locationBrief}` : "",
            kind === "hero" ? `Hero direction: ${heroNote}` : `Angle direction: ${angle?.prompt}`,
            selectedHero && kind === "angle" ? "Maintain visual continuity with the approved hero image direction." : "",
          ].filter(Boolean).join("\n\n"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate image");

      if (kind === "hero") {
        const version: HeroVersion = {
          id: `hero-${Date.now()}`,
          url: data.imageUrl,
          note: heroNote,
          prompt: data.prompt,
          createdAt: new Date().toISOString(),
        };
        setHeroVersions((current) => [version, ...current]);
        setSelectedHeroId(version.id);
        return;
      }

      if (angle) {
        setAngles((current) => current.map((item) => item.id === angle.id ? { ...item, imageUrl: data.imageUrl } : item));
      }
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Image generation failed");
    } finally {
      setBusy("");
    }
  }

  async function submitVideo() {
    const selected = videoModels.find((model) => model.id === selectedVideoModel);
    if (!selected?.connected) {
      setError(`${selected?.label || "This model"} is visible, but its connector is not wired yet.`);
      return;
    }
    if (!firstVideoFrame) {
      setError("Approve at least one angle or generate a hero image first.");
      return;
    }
    setBusy("video");
    setError("");
    try {
      const headers = await authHeaders();
      const response = await fetch("/api/admin/content-calendar/ai-video", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          slug: projectSlug,
          postIndex: 0,
          postLabel: `${productName} AI Film`,
          clientName,
          campaignTitle: `${productName} AI Film`,
          modelKey: selectedVideoModel,
          prompt: videoPrompt,
          videoPrompt,
          startImageUrl: firstVideoFrame,
          imageUrls: approvedAngles.map((angle) => angle.imageUrl).filter(Boolean),
          thumbnailUrl: firstVideoFrame,
          duration: "5",
          aspectRatio: "9:16",
          resolution: "720p",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit video");
      setVideoJob(`Request ${data.requestId}`);
    } catch (videoError) {
      setError(videoError instanceof Error ? videoError.message : "Video submit failed");
    } finally {
      setBusy("");
    }
  }

  const next = () => setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  const back = () => setStepIndex((value) => Math.max(value - 1, 0));

  return (
    <main className="min-h-screen bg-[#050505] pb-24 text-white lg:pb-10">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5 sm:px-8 lg:px-10">
        <header className="mb-5 flex items-center justify-between gap-4">
          <Link href="/admin/ai-menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <img src="/astroshot-icon-green.png" alt="" className="h-6 w-6 object-contain" />
          </Link>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#01F17C]">AI Film Studio</p>
            <p className="text-xs font-semibold text-white/40">Step {stepIndex + 1} of {steps.length}</p>
          </div>
        </header>

        <div className="mb-6 flex gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => index <= stepIndex && setStepIndex(index)}
              className={`h-2 flex-1 rounded-full transition-colors ${index <= stepIndex ? "bg-[#01F17C]" : "bg-white/10"}`}
              aria-label={step.label}
            />
          ))}
        </div>

        <section className="flex flex-1 items-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:p-7 lg:p-8">
            <div className="mb-6">
              <span className="rounded-full border border-[#01F17C]/25 bg-[#01F17C]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#01F17C]">
                {currentStep.label}
              </span>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{currentStep.title}</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/48">{currentStep.line}</p>
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
                {error}
              </div>
            ) : null}

            {currentStep.id === "brief" ? (
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Client" value={clientName} onChange={setClientName} />
                  <Field label="Product" value={productName} onChange={setProductName} />
                  <Field label="Duration" value={duration} onChange={setDuration} />
                </div>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Idea</span>
                  <textarea
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    className="mt-2 min-h-40 w-full resize-y rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-7 text-white outline-none focus:border-[#01F17C]/45"
                  />
                </label>
              </div>
            ) : null}

            {currentStep.id === "product" ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                <UploadBox
                  title="Product images"
                  note="One image is enough. More angles help."
                  multiple
                  busy={busy === "upload-product"}
                  onFiles={async (files) => {
                    const uploaded = await uploadFiles(files, "upload-product");
                    if (uploaded.length) setProductRefs((current) => [...current, ...uploaded]);
                  }}
                />
                <ResultBox asset={productSheet} title="Generated product sheet" actionLabel="Generate product sheet" busy={busy === "product-sheet"} disabled={!productRefs.length} onAction={generateProductSheet} />
                <AssetStrip assets={productRefs} empty="No product image uploaded yet." />
              </div>
            ) : null}

            {currentStep.id === "location" ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                <div className="grid gap-4">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Location direction</span>
                    <textarea
                      value={locationText}
                      onChange={(event) => setLocationText(event.target.value)}
                      className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-7 text-white outline-none focus:border-[#01F17C]/45"
                    />
                  </label>
                  <UploadBox
                    title="Optional location image"
                    note={locationImage ? locationImage.name : "Upload if the client already has a place/reference."}
                    busy={busy === "upload-location"}
                    onFiles={async (files) => {
                      const uploaded = await uploadFiles(files, "upload-location");
                      if (uploaded[0]) setLocationImage(uploaded[0]);
                    }}
                  />
                </div>
                <BriefBox title="AI location brief" value={locationBrief} busy={busy === "location-brief"} onAction={generateLocationBrief} />
              </div>
            ) : null}

            {currentStep.id === "character" ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                <UploadBox
                  title="Character reference"
                  note={characterRef ? characterRef.name : "Optional. Skip this step for product-only film."}
                  busy={busy === "upload-character"}
                  onFiles={async (files) => {
                    const uploaded = await uploadFiles(files, "upload-character");
                    if (uploaded[0]) setCharacterRef(uploaded[0]);
                  }}
                />
                <ResultBox asset={characterSheet} title="Generated character sheet" actionLabel="Generate character sheet" busy={busy === "character-sheet"} disabled={!characterRef} onAction={generateCharacterSheet} />
              </div>
            ) : null}

            {currentStep.id === "hero" ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                <div className="grid gap-4">
                  <OptionGroup
                    title="Image engine"
                    options={imageEngines}
                    value={imageEngine}
                    onChange={(value) => setImageEngine(value as ImageEngine)}
                  />
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Hero notes</span>
                    <textarea
                      value={heroNote}
                      onChange={(event) => setHeroNote(event.target.value)}
                      className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-7 text-white outline-none focus:border-[#01F17C]/45"
                    />
                  </label>
                  <button type="button" disabled={!productSheet || busy === "hero"} onClick={() => generateImage("hero")} className="h-12 rounded-full bg-[#01F17C] px-5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-35">
                    {busy === "hero" ? "Generating..." : heroVersions.length ? "Regenerate clean version" : "Generate hero image"}
                  </button>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  {selectedHero ? (
                    <img src={selectedHero.url} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm font-semibold text-white/35">
                      Hero image appears here
                    </div>
                  )}
                  <div className="mt-3 grid gap-2">
                    {heroVersions.slice(0, 3).map((version) => (
                      <button key={version.id} type="button" onClick={() => setSelectedHeroId(version.id)} className={`rounded-2xl border px-3 py-2 text-left text-xs font-semibold ${selectedHeroId === version.id ? "border-[#01F17C]/40 bg-[#01F17C]/10 text-[#01F17C]" : "border-white/10 bg-white/[0.03] text-white/45"}`}>
                        {version.note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep.id === "angles" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {angles.map((angle) => (
                  <div key={angle.id} className="rounded-3xl border border-white/10 bg-black/30 p-3">
                    {angle.imageUrl ? (
                      <img src={angle.imageUrl} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs font-semibold text-white/35">
                        {angle.title}
                      </div>
                    )}
                    <p className="mt-3 text-sm font-black text-white">{angle.title}</p>
                    <p className="mt-1 min-h-10 text-xs leading-5 text-white/40">{angle.prompt}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" disabled={!selectedHero || busy === "angle"} onClick={() => generateImage("angle", angle)} className="h-10 rounded-full border border-white/10 bg-white/[0.06] text-xs font-black text-white disabled:opacity-30">
                        {busy === "angle" ? "Wait" : "Generate"}
                      </button>
                      <button type="button" disabled={!angle.imageUrl} onClick={() => setAngles((current) => current.map((item) => item.id === angle.id ? { ...item, approved: !item.approved } : item))} className={`h-10 rounded-full text-xs font-black disabled:opacity-30 ${angle.approved ? "bg-[#01F17C] text-black" : "border border-white/10 bg-white/[0.06] text-white"}`}>
                        {angle.approved ? "Approved" : "Approve"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {currentStep.id === "video" ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                <div className="grid gap-4">
                  <OptionGroup
                    title="Video model"
                    options={videoModels}
                    value={selectedVideoModel}
                    onChange={(value) => setSelectedVideoModel(value as VideoModel)}
                  />
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Motion prompt</span>
                    <textarea
                      value={videoPrompt}
                      onChange={(event) => setVideoPrompt(event.target.value)}
                      className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-7 text-white outline-none focus:border-[#01F17C]/45"
                    />
                  </label>
                  <button type="button" disabled={!firstVideoFrame || busy === "video"} onClick={submitVideo} className="h-12 rounded-full bg-[#01F17C] px-5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-35">
                    {busy === "video" ? "Submitting..." : "Submit video test"}
                  </button>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  {firstVideoFrame ? (
                    <img src={firstVideoFrame} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm font-semibold text-white/35">
                      Approve an angle first
                    </div>
                  )}
                  <p className="mt-4 text-sm font-black text-white">{videoJob || "No video job submitted yet"}</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">Connected now: Seedance, Kling 3, and Veo 3.1 through the existing fal.ai video API. Kling Omni, Flow, and Gemini Omni are shown but disabled until their connectors are added.</p>
                </div>
              </div>
            ) : null}

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
              <button type="button" onClick={back} disabled={stepIndex === 0} className="h-11 rounded-full border border-white/10 px-5 text-sm font-black text-white disabled:opacity-30">
                Back
              </button>
              <button type="button" onClick={next} disabled={!stepDone || stepIndex === steps.length - 1} className="h-11 rounded-full bg-white px-5 text-sm font-black text-black disabled:opacity-30">
                {stepIndex === steps.length - 1 ? "Done" : "Next step"}
              </button>
            </div>
          </div>
        </section>
      </div>
      <AiAppBottomNav />
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/30 p-4">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full bg-transparent text-xl font-black text-white outline-none" />
    </label>
  );
}

function UploadBox({ title, note, multiple, busy, onFiles }: { title: string; note: string; multiple?: boolean; busy: boolean; onFiles: (files: FileList | null) => void }) {
  return (
    <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/30 p-6 text-center hover:border-[#01F17C]/45">
      <input type="file" accept="image/*,video/*" multiple={multiple} className="hidden" onChange={(event) => onFiles(event.target.files)} />
      <span className="text-lg font-black text-white">{busy ? "Uploading..." : title}</span>
      <span className="mt-2 max-w-xs text-sm leading-6 text-white/42">{note}</span>
      <span className="mt-5 rounded-full bg-[#01F17C] px-5 py-2 text-xs font-black text-black">Upload</span>
    </label>
  );
}

function AssetStrip({ assets, empty }: { assets: UploadedAsset[]; empty: string }) {
  if (!assets.length) {
    return <p className="text-sm font-semibold text-white/35">{empty}</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:col-span-2">
      {assets.map((asset) => (
        <img key={asset.url} src={asset.url} alt="" className="h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover" />
      ))}
    </div>
  );
}

function ResultBox({ asset, title, actionLabel, busy, disabled, onAction }: { asset: UploadedAsset | null; title: string; actionLabel: string; busy: boolean; disabled: boolean; onAction: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
      {asset ? (
        <img src={asset.url} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm font-semibold text-white/35">
          {title}
        </div>
      )}
      <button type="button" disabled={disabled || busy} onClick={onAction} className="mt-4 h-11 w-full rounded-full bg-[#01F17C] text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-35">
        {busy ? "Generating..." : actionLabel}
      </button>
    </div>
  );
}

function BriefBox({ title, value, busy, onAction }: { title: string; value: string; busy: boolean; onAction: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
      <div className="min-h-80 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">{title}</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-white/62">{value || "Generated brief appears here."}</pre>
      </div>
      <button type="button" disabled={busy} onClick={onAction} className="mt-4 h-11 w-full rounded-full bg-[#01F17C] text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-35">
        {busy ? "Generating..." : "Generate location brief"}
      </button>
    </div>
  );
}

function OptionGroup({ title, options, value, onChange }: { title: string; options: Array<{ id: string; label: string; connected: boolean }>; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-white/35">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => option.connected && onChange(option.id)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-black ${value === option.id ? "border-[#01F17C]/45 bg-[#01F17C]/10 text-[#01F17C]" : "border-white/10 bg-black/25 text-white/60"} ${option.connected ? "" : "cursor-not-allowed opacity-35"}`}
          >
            {option.label}
            <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
              {option.connected ? "Connected" : "Connector needed"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
