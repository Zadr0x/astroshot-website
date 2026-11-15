"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  emptyExplanatoryAnimationQuestionnairePayload,
  explainerDurationOptions,
  explainerToneOptions,
  explanatoryAnimationQuestionnaireSections,
  type ExplanatoryAnimationQuestionnairePayload,
  type UploadedBrandAsset,
} from "@/lib/client-questionnaire";

type Props = {
  clientName: string;
  onSubmitted: () => void;
};

type AutoSaveState = "idle" | "saving" | "saved" | "error";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]";
const textAreaClass = `${fieldClass} min-h-28 resize-y leading-relaxed`;

function updatePath<T extends object>(source: T, path: string[], value: unknown): T {
  const [head, ...rest] = path;
  if (!head) return source;

  return {
    ...source,
    [head]: rest.length
      ? updatePath((source as Record<string, unknown>)[head] as object, rest, value)
      : value,
  };
}

function getStringValue(source: ExplanatoryAnimationQuestionnairePayload, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return "";
    return (acc as Record<string, unknown>)[key];
  }, source);

  return typeof value === "string" ? value : "";
}

function TextField({ label, path, payload, setField, placeholder, required }: {
  label: string;
  path: string;
  payload: ExplanatoryAnimationQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <input className={fieldClass} value={getStringValue(payload, path)} onChange={(event) => setField(path, event.target.value)} placeholder={placeholder} required={required} />
    </label>
  );
}

function AreaField({ label, path, payload, setField, placeholder, required }: {
  label: string;
  path: string;
  payload: ExplanatoryAnimationQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <textarea className={textAreaClass} value={getStringValue(payload, path)} onChange={(event) => setField(path, event.target.value)} placeholder={placeholder} required={required} />
    </label>
  );
}

function SelectField({ label, path, payload, setField, options, placeholder = "Choose one", required }: {
  label: string;
  path: string;
  payload: ExplanatoryAnimationQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <select className={fieldClass} value={getStringValue(payload, path)} onChange={(event) => setField(path, event.target.value)} required={required}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default function ExplanatoryAnimationQuestionnaire({ clientName, onSubmitted }: Props) {
  const [payload, setPayload] = useState<ExplanatoryAnimationQuestionnairePayload>(() => {
    const initial = emptyExplanatoryAnimationQuestionnairePayload();
    initial.identity.businessName = clientName;
    return initial;
  });
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("idle");
  const lastSavedRef = useRef("");

  const section = explanatoryAnimationQuestionnaireSections[activeStep];
  const progress = ((activeStep + 1) / explanatoryAnimationQuestionnaireSections.length) * 100;

  useEffect(() => {
    fetch("/api/client-questionnaire")
      .then((res) => res.json())
      .then((data: { questionnaireDraft?: ExplanatoryAnimationQuestionnairePayload | null; questionnaireDraftType?: string | null }) => {
        if (data.questionnaireDraftType === "explanatory_animation" && data.questionnaireDraft) {
          setPayload(data.questionnaireDraft);
          lastSavedRef.current = JSON.stringify(data.questionnaireDraft);
          setAutoSaveState("saved");
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!clientName) return;
    setPayload((current) => {
      if (current.identity.businessName.trim()) return current;
      return { ...current, identity: { ...current.identity, businessName: clientName } };
    });
  }, [clientName]);

  useEffect(() => {
    if (submitting || uploading) return;

    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) return;

    const timer = window.setTimeout(async () => {
      setAutoSaveState("saving");
      const res = await fetch("/api/client-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaireType: "explanatory_animation", questionnaire: payload, autosave: true }),
      });

      if (!res.ok) {
        setAutoSaveState("error");
        return;
      }

      lastSavedRef.current = JSON.stringify(payload);
      setAutoSaveState("saved");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [payload, submitting, uploading]);

  const setField = (path: string, value: unknown) => {
    setPayload((current) => updatePath(current, path.split("."), value));
    setAutoSaveState("idle");
  };

  const addFiles = (files: UploadedBrandAsset[]) => {
    setPayload((current) => ({
      ...current,
      assets: {
        ...current.assets,
        featureScreenshots: [...current.assets.featureScreenshots, ...files],
      },
    }));
    setAutoSaveState("idle");
  };

  const removeFile = (url: string) => {
    setPayload((current) => ({
      ...current,
      assets: {
        ...current.assets,
        featureScreenshots: current.assets.featureScreenshots.filter((file) => file.url !== url),
      },
    }));
    setAutoSaveState("idle");
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    setUploadError("");

    try {
      const uploaded: UploadedBrandAsset[] = [];

      for (const file of Array.from(files)) {
        const presignRes = await fetch("/api/client-assets/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
          }),
        });

        if (!presignRes.ok) {
          const data = (await presignRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Could not prepare ${file.name}`);
        }

        const data = (await presignRes.json()) as {
          bucket: string;
          path: string;
          token: string;
          file: UploadedBrandAsset;
        };
        const { error } = await supabase.storage
          .from(data.bucket)
          .uploadToSignedUrl(data.path, data.token, file, {
            contentType: file.type || "application/octet-stream",
          });

        if (error) throw new Error(error.message || `Upload failed for ${file.name}`);
        uploaded.push(data.file);
      }

      addFiles(uploaded);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch("/api/client-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaireType: "explanatory_animation", questionnaire: payload }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setSubmitError(data.error ?? "Submission failed");
      return;
    }

    lastSavedRef.current = JSON.stringify(payload);
    setAutoSaveState("saved");
    onSubmitted();
  };

  return (
    <main className="client-dashboard min-h-screen bg-[#050505] text-white">
      <div className="border-b border-white/10 bg-[#050505]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-black tracking-tight">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </span>
          <div className="flex items-center gap-3">
            {clientName && <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-white/35 sm:inline">{clientName}</span>}
            {autoSaveState !== "idle" && (
              <span className={`hidden rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] sm:inline ${
                autoSaveState === "error" ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-white/10 bg-white/[0.04] text-white/40"
              }`}>
                {autoSaveState === "saving" ? "Auto-saving" : autoSaveState === "saved" ? "Auto-saved" : "Auto-save failed"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#01F17C] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2">
            {explanatoryAnimationQuestionnaireSections.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  activeStep === index
                    ? "border-[#01F17C]/50 bg-[#01F17C]/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]">{item.eyebrow}</p>
                <p className="mt-1 text-sm font-bold">{item.title}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-[#101010] p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">{section.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{section.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{section.description}</p>

          <div className="mt-8">
            {activeStep === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Business name" path="identity.businessName" payload={payload} setField={setField} required />
                <TextField label="Contact name" path="identity.contactName" payload={payload} setField={setField} placeholder="Full name" required />
                <TextField label="Email" path="identity.email" payload={payload} setField={setField} placeholder="name@company.com" required />
                <TextField label="Phone" path="identity.phone" payload={payload} setField={setField} placeholder="+965" />
                <TextField label="Website" path="identity.website" payload={payload} setField={setField} placeholder="https://" />
                <TextField label="Industry" path="identity.industry" payload={payload} setField={setField} placeholder="FinTech, banking, SaaS..." />
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Product / feature name" path="feature.productFeatureName" payload={payload} setField={setField} placeholder="Example: Smart savings, wallet transfer, robo advisor..." required />
                <AreaField label="Explain the product or feature" path="feature.explanation" payload={payload} setField={setField} placeholder="Describe exactly what this feature does and how it works." required />
                <AreaField label="What is the unique selling point?" path="feature.uniqueSellingPoint" payload={payload} setField={setField} placeholder="What makes this feature exciting or different?" required />
                <AreaField label="Who is this feature for?" path="feature.targetAudience" payload={payload} setField={setField} placeholder="New users, existing users, investors, merchants..." />
                <AreaField label="What action should viewers take after watching?" path="feature.desiredAction" payload={payload} setField={setField} placeholder="Open the app, activate feature, update app, sign up..." />
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <AreaField label="What points must we highlight in the video?" path="message.highlights" payload={payload} setField={setField} placeholder="List the most important points in order." required />
                <AreaField label="What customer pain or confusion does it solve?" path="message.customerPain" payload={payload} setField={setField} />
                <AreaField label="Any proof points, numbers, or trust signals?" path="message.proofPoints" payload={payload} setField={setField} placeholder="Security, speed, fees, approvals, regulatory points..." />
                <AreaField label="Must include" path="message.mustInclude" payload={payload} setField={setField} placeholder="Specific screens, wording, icons, legal lines, app-store CTA..." />
                <AreaField label="Must avoid" path="message.mustAvoid" payload={payload} setField={setField} placeholder="Claims we cannot make, words to avoid, UI we cannot show..." />
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Video mode" path="video.mode" payload={payload} setField={setField} options={["Light mode", "Dark mode"]} required />
                <SelectField label="Language" path="video.language" payload={payload} setField={setField} options={["Arabic", "English"]} required />
                <SelectField label="Tone" path="video.tone" payload={payload} setField={setField} options={explainerToneOptions} />
                <SelectField label="Preferred duration" path="video.duration" payload={payload} setField={setField} options={explainerDurationOptions} />
                <AreaField label="Reference videos or style notes" path="video.references" payload={payload} setField={setField} placeholder="Links to explainers, app animations, or visual styles you like." />
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Feature screenshots</span>
                      <p className="text-sm leading-7 text-white/55">Upload app screenshots, screen flows, UI exports, or zipped screen assets.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                      {uploading ? "Uploading..." : "Upload Screenshots"}
                      <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.mp4,.mov" onChange={handleUpload} disabled={uploading} className="sr-only" />
                    </label>
                  </div>

                  {uploadError && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadError}</p>}

                  <div className="mt-5 space-y-2">
                    {payload.assets.featureScreenshots.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/35">No screenshots uploaded yet.</p>
                    ) : (
                      payload.assets.featureScreenshots.map((file) => (
                        <div key={file.url} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">{file.name}</p>
                            <p className="text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                          </div>
                          <div className="flex gap-2">
                            <a href={file.url} target="_blank" className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-[#01F17C] hover:bg-white/10">View</a>
                            <button type="button" onClick={() => removeFile(file.url)} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white">Remove</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <TextField label="Drive link for feature assets" path="assets.driveLink" payload={payload} setField={setField} placeholder="Google Drive / Dropbox / Figma / Zeplin link" />
                <AreaField label="Asset notes" path="assets.notes" payload={payload} setField={setField} placeholder="Which screenshots are final, which screens are confidential, any UI details to preserve..." />
              </div>
            )}
          </div>

          {submitError && <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</p>}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/65 transition-colors hover:text-white disabled:opacity-30">
              Back
            </button>
            {activeStep < explanatoryAnimationQuestionnaireSections.length - 1 ? (
              <button type="button" onClick={() => setActiveStep(Math.min(explanatoryAnimationQuestionnaireSections.length - 1, activeStep + 1))} className="rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Explainer Brief"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
