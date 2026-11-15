"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  emptyMediaBuyingClinicQuestionnairePayload,
  emptyMediaBuyingDoctor,
  emptyMediaBuyingPreviousAdLink,
  mediaBuyingBudgetBandOptions,
  mediaBuyingChannelOptions,
  mediaBuyingClinicQuestionnaireSections,
  mediaBuyingComplianceNotice,
  mediaBuyingHasRunAdsOptions,
  mediaBuyingPreviousGoalOptions,
  mediaBuyingPrimaryGoalOptions,
  mediaBuyingSpendBandOptions,
  type MediaBuyingClinicQuestionnairePayload,
  type MediaBuyingDoctor,
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

function getStringValue(source: MediaBuyingClinicQuestionnairePayload, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return "";
    return (acc as Record<string, unknown>)[key];
  }, source);

  return typeof value === "string" ? value : "";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{children}</span>;
}

function TextField({ label, path, payload, setField, placeholder, required, type = "text", hint }: {
  label: string;
  path: string;
  payload: MediaBuyingClinicQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClass}
        type={type}
        value={getStringValue(payload, path)}
        onChange={(event) => setField(path, event.target.value)}
        placeholder={placeholder}
        required={required}
      />
      {hint && <span className="mt-1.5 block text-xs leading-5 text-white/30">{hint}</span>}
    </label>
  );
}

function AreaField({ label, path, payload, setField, placeholder, required, hint, big }: {
  label: string;
  path: string;
  payload: MediaBuyingClinicQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  big?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        className={big ? `${textAreaClass} min-h-40` : textAreaClass}
        value={getStringValue(payload, path)}
        onChange={(event) => setField(path, event.target.value)}
        placeholder={placeholder}
        required={required}
      />
      {hint && <span className="mt-1.5 block text-xs leading-5 text-white/30">{hint}</span>}
    </label>
  );
}

function SelectField({ label, path, payload, setField, options, placeholder = "Choose one", required, other }: {
  label: string;
  path: string;
  payload: MediaBuyingClinicQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  other?: boolean;
}) {
  const value = getStringValue(payload, path);
  const isCustom = Boolean(value) && !options.includes(value);

  return (
    <div>
      <label className="block">
        <FieldLabel>{label}</FieldLabel>
        <select
          className={fieldClass}
          value={isCustom ? "__other" : value}
          onChange={(event) => {
            if (event.target.value === "__other") {
              setField(path, " ");
              return;
            }
            setField(path, event.target.value);
          }}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
          {other && <option value="__other">Other / not listed</option>}
        </select>
      </label>
      {isCustom && (
        <input
          className={`${fieldClass} mt-2`}
          value={value.trim()}
          onChange={(event) => setField(path, event.target.value)}
          placeholder="Type the channel or answer"
        />
      )}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300/80">Compliance notice</p>
      <p className="mt-2 text-sm leading-7 text-amber-100/80">{children}</p>
    </div>
  );
}

export default function MediaBuyingClinicQuestionnaire({ clientName, onSubmitted }: Props) {
  const [payload, setPayload] = useState<MediaBuyingClinicQuestionnairePayload>(() => {
    const initial = emptyMediaBuyingClinicQuestionnairePayload();
    if (clientName) initial.identity.clinicName = clientName;
    return initial;
  });
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("idle");
  const [loadedDraft, setLoadedDraft] = useState(false);
  const lastSavedRef = useRef("");

  const section = mediaBuyingClinicQuestionnaireSections[activeStep];
  const progress = ((activeStep + 1) / mediaBuyingClinicQuestionnaireSections.length) * 100;

  const setField = (path: string, value: unknown) => {
    setPayload((current) => updatePath(current, path.split("."), value));
    setAutoSaveState("idle");
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/client-questionnaire")
      .then((res) => res.json())
      .then((data: { questionnaireDraft?: MediaBuyingClinicQuestionnairePayload | null; questionnaireDraftType?: string | null }) => {
        if (cancelled) return;
        if (data.questionnaireDraftType === "media_buying_clinic" && data.questionnaireDraft) {
          const draft = data.questionnaireDraft;
          setPayload((current) => ({
            ...draft,
            identity: {
              ...draft.identity,
              clinicName: draft.identity?.clinicName || current.identity.clinicName || clientName,
            },
            previousAds: {
              ...draft.previousAds,
              reports: draft.previousAds?.reports ?? [],
              adLinks: draft.previousAds?.adLinks?.length ? draft.previousAds.adLinks : [emptyMediaBuyingPreviousAdLink()],
            },
            doctors: draft.doctors?.length ? draft.doctors : [emptyMediaBuyingDoctor()],
            assets: {
              ...draft.assets,
              brandFiles: draft.assets?.brandFiles ?? [],
            },
          }));
          lastSavedRef.current = JSON.stringify(draft);
          setAutoSaveState("saved");
        }
        setLoadedDraft(true);
      })
      .catch(() => setLoadedDraft(true));

    return () => {
      cancelled = true;
    };
  }, [clientName]);

  useEffect(() => {
    if (!loadedDraft || submitting || uploading) return;

    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) return;

    const timer = window.setTimeout(async () => {
      setAutoSaveState("saving");
      const res = await fetch("/api/client-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaireType: "media_buying_clinic", questionnaire: payload, autosave: true }),
      });

      if (!res.ok) {
        setAutoSaveState("error");
        return;
      }

      lastSavedRef.current = JSON.stringify(payload);
      setAutoSaveState("saved");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [loadedDraft, payload, submitting, uploading]);

  // ----- repeatable rows -------------------------------------------------

  const setDoctor = (index: number, field: keyof MediaBuyingDoctor, value: string) => {
    setPayload((current) => ({
      ...current,
      doctors: current.doctors.map((doctor, i) => (i === index ? { ...doctor, [field]: value } : doctor)),
    }));
    setAutoSaveState("idle");
  };

  const addDoctor = () => {
    setPayload((current) => ({ ...current, doctors: [...current.doctors, emptyMediaBuyingDoctor()] }));
    setAutoSaveState("idle");
  };

  const removeDoctor = (index: number) => {
    setPayload((current) => ({
      ...current,
      doctors: current.doctors.length <= 1 ? current.doctors : current.doctors.filter((_, i) => i !== index),
    }));
    setAutoSaveState("idle");
  };

  const setAdLink = (index: number, field: "url" | "note", value: string) => {
    setPayload((current) => ({
      ...current,
      previousAds: {
        ...current.previousAds,
        adLinks: current.previousAds.adLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
      },
    }));
    setAutoSaveState("idle");
  };

  const addAdLink = () => {
    setPayload((current) => ({
      ...current,
      previousAds: {
        ...current.previousAds,
        adLinks: [...current.previousAds.adLinks, emptyMediaBuyingPreviousAdLink()],
      },
    }));
    setAutoSaveState("idle");
  };

  const removeAdLink = (index: number) => {
    setPayload((current) => ({
      ...current,
      previousAds: {
        ...current.previousAds,
        adLinks:
          current.previousAds.adLinks.length <= 1
            ? [emptyMediaBuyingPreviousAdLink()]
            : current.previousAds.adLinks.filter((_, i) => i !== index),
      },
    }));
    setAutoSaveState("idle");
  };

  // ----- uploads ---------------------------------------------------------

  const uploadFiles = async (files: FileList, target: "reports" | "brandFiles") => {
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

      setPayload((current) =>
        target === "reports"
          ? {
              ...current,
              previousAds: {
                ...current.previousAds,
                reports: [...current.previousAds.reports, ...uploaded],
              },
            }
          : {
              ...current,
              assets: { ...current.assets, brandFiles: [...current.assets.brandFiles, ...uploaded] },
            }
      );
      setAutoSaveState("idle");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: "reports" | "brandFiles") => {
    const files = event.target.files;
    if (!files?.length) return;
    await uploadFiles(files, target);
    event.target.value = "";
  };

  const removeFile = (target: "reports" | "brandFiles", url: string) => {
    setPayload((current) =>
      target === "reports"
        ? {
            ...current,
            previousAds: {
              ...current.previousAds,
              reports: current.previousAds.reports.filter((file) => file.url !== url),
            },
          }
        : {
            ...current,
            assets: {
              ...current.assets,
              brandFiles: current.assets.brandFiles.filter((file) => file.url !== url),
            },
          }
    );
    setAutoSaveState("idle");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch("/api/client-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaireType: "media_buying_clinic", questionnaire: payload }),
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

  const fileList = (files: UploadedBrandAsset[], target: "reports" | "brandFiles", emptyLabel: string) => (
    <div className="mt-5 space-y-2">
      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/35">{emptyLabel}</p>
      ) : (
        files.map((file) => (
          <div key={file.url} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{file.name}</p>
              <p className="text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</p>
            </div>
            <div className="flex gap-2">
              <a href={file.url} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-[#01F17C] hover:bg-white/10">View</a>
              <button type="button" onClick={() => removeFile(target, file.url)} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white">Remove</button>
            </div>
          </div>
        ))
      )}
    </div>
  );

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
            {mediaBuyingClinicQuestionnaireSections.map((item, index) => (
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
          <p className="mt-5 hidden rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-6 text-white/30 lg:block">
            Your answers save automatically as you type. You can close this page and come back later.
          </p>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-[#101010] p-5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">{section.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{section.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{section.description}</p>

          <div className="mt-8">
            {/* 01 — Client identity */}
            {activeStep === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Clinic name" path="identity.clinicName" payload={payload} setField={setField} placeholder="Arms Center" required />
                <TextField label="Instagram handle" path="identity.instagram" payload={payload} setField={setField} placeholder="@armscenter" />
                <TextField label="Website" path="identity.website" payload={payload} setField={setField} placeholder="https://" />
                <TextField label="Contact name" path="identity.contactName" payload={payload} setField={setField} placeholder="Full name" required />
                <TextField label="Email" path="identity.email" payload={payload} setField={setField} placeholder="name@clinic.com" type="email" required />
                <TextField label="Phone" path="identity.phone" payload={payload} setField={setField} placeholder="+965" />
                <div className="md:col-span-2">
                  <AreaField
                    label="Location / branches"
                    path="identity.location"
                    payload={payload}
                    setField={setField}
                    placeholder="List each branch — area, street, or landmark. Note which branch is busiest if relevant."
                  />
                </div>
                <div className="md:col-span-2">
                  <AreaField
                    label="Specialties the clinic covers overall"
                    path="identity.specialties"
                    payload={payload}
                    setField={setField}
                    placeholder="Dermatology, plastic surgery, dentistry, laser, hair transplant…"
                    required
                  />
                </div>
              </div>
            )}

            {/* 02 — Previous advertising */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#01F17C]/25 bg-[#01F17C]/[0.05] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">Start here</p>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    If you ran ads before and were not happy with the result, this section is why it matters. Tell us plainly
                    what happened. Nothing here gets held against you — it is how we avoid repeating it.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Have you run paid ads before?"
                    path="previousAds.hasRunAds"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingHasRunAdsOptions}
                    required
                  />
                  <SelectField
                    label="Main channel(s) used"
                    path="previousAds.channels"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingChannelOptions}
                    placeholder="Pick the main one — list the rest below"
                    other
                  />
                  <TextField label="Roughly when" path="previousAds.timeframe" payload={payload} setField={setField} placeholder="e.g. last Ramadan, mid-2025" />
                  <TextField label="For how long" path="previousAds.duration" payload={payload} setField={setField} placeholder="e.g. 3 months, on and off for a year" />
                  <SelectField
                    label="What was the goal of those ads?"
                    path="previousAds.goal"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingPreviousGoalOptions}
                  />
                  <SelectField
                    label="Approximate spend level"
                    path="previousAds.spendBand"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingSpendBandOptions}
                    placeholder="Choose a band"
                  />
                </div>

                <div className="grid gap-4">
                  <AreaField
                    label="Any other channels, in your own words"
                    path="previousAds.otherChannels"
                    payload={payload}
                    setField={setField}
                    placeholder="e.g. Instagram plus some Snapchat boosts, run by a freelancer"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <FieldLabel>What results did you get?</FieldLabel>
                  <p className="mb-3 text-xs leading-6 text-white/35">Numbers if you have them, or just what it felt like. Both are useful.</p>
                  <textarea
                    className={`${textAreaClass} min-h-32`}
                    value={payload.previousAds.results}
                    onChange={(event) => setField("previousAds.results", event.target.value)}
                    placeholder="e.g. Reach was high but almost nobody booked. We got maybe 5 messages a week and two of them were price questions."
                  />
                </div>

                <div className="rounded-2xl border-2 border-[#01F17C]/40 bg-[#01F17C]/[0.06] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">The most important question</p>
                  <h3 className="mt-2 text-xl font-black tracking-tight md:text-2xl">What were you unhappy about?</h3>
                  <p className="mt-2 mb-4 text-sm leading-7 text-white/60">
                    Be specific and be blunt. The cost, the wrong audience, the ads themselves, the agency, the reporting,
                    the leads not answering, the phone not ringing — whatever it was. This answer decides the whole strategy.
                  </p>
                  <textarea
                    className={`${textAreaClass} min-h-44`}
                    value={payload.previousAds.unhappyAbout}
                    onChange={(event) => setField("previousAds.unhappyAbout", event.target.value)}
                    placeholder="Tell us everything you were unhappy about."
                    required
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <FieldLabel>Previous ad reports</FieldLabel>
                      <p className="text-sm leading-7 text-white/55">
                        Upload whatever you have — platform exports, agency decks, screenshots of results. Multiple files are fine.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                      {uploading ? "Uploading..." : "Upload Reports"}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.zip"
                        onChange={(event) => handleUpload(event, "reports")}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {uploadError && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadError}</p>}
                  {fileList(payload.previousAds.reports, "reports", "No reports uploaded yet — that is fine if you do not have them.")}
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <FieldLabel>Links to previous ads</FieldLabel>
                      <p className="text-xs leading-6 text-white/35">Paste links to the videos or creatives you ran, so we can see the style. Add as many as you like.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addAdLink}
                      className="shrink-0 rounded-lg bg-[#01F17C] px-3 py-2 text-xs font-black text-[#050505] transition-colors hover:bg-white"
                    >
                      + Add link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {payload.previousAds.adLinks.map((link, index) => (
                      <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Ad link #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeAdLink(index)}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            className={fieldClass}
                            value={link.url}
                            onChange={(event) => setAdLink(index, "url", event.target.value)}
                            placeholder="https://instagram.com/reel/…"
                            inputMode="url"
                          />
                          <input
                            className={fieldClass}
                            value={link.note}
                            onChange={(event) => setAdLink(index, "note", event.target.value)}
                            placeholder="Optional note — what this ad was for"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AreaField
                  label="Creative observations — what worked, what fell flat"
                  path="previousAds.creativeObservations"
                  payload={payload}
                  setField={setField}
                  placeholder="e.g. Doctor talking to camera performed better than stock footage. Offer posts got clicks but bad bookings."
                />
              </div>
            )}

            {/* 03 — This month's plan */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <AreaField
                  label="What do you want to promote this month?"
                  path="monthPlan.promoting"
                  payload={payload}
                  setField={setField}
                  placeholder="A service, an offer, a doctor, the clinic as a whole…"
                  required
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Primary goal for this month"
                    path="monthPlan.primaryGoal"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingPrimaryGoalOptions}
                    required
                  />
                  <SelectField
                    label="Budget band for this month"
                    path="monthPlan.budgetBand"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingBudgetBandOptions}
                    placeholder="Choose a band"
                  />
                </div>

                <div>
                  <FieldLabel>Target audience</FieldLabel>
                  <div className="grid gap-4 md:grid-cols-3">
                    <input className={fieldClass} value={payload.monthPlan.audienceAge} onChange={(event) => setField("monthPlan.audienceAge", event.target.value)} placeholder="Age — e.g. 25–45" />
                    <input className={fieldClass} value={payload.monthPlan.audienceGender} onChange={(event) => setField("monthPlan.audienceGender", event.target.value)} placeholder="Gender — e.g. mostly women" />
                    <input className={fieldClass} value={payload.monthPlan.audienceArea} onChange={(event) => setField("monthPlan.audienceArea", event.target.value)} placeholder="Area — e.g. Salmiya, Hawally" />
                  </div>
                </div>

                <AreaField
                  label="Anything else about the audience"
                  path="monthPlan.audienceNotes"
                  payload={payload}
                  setField={setField}
                  placeholder="Income level, expat vs local, language preference, interests…"
                />
                <AreaField
                  label="Key dates or seasonal moments"
                  path="monthPlan.keyDates"
                  payload={payload}
                  setField={setField}
                  placeholder="Ramadan, National Day, a launch, an offer window, a doctor's return from leave…"
                />
              </div>
            )}

            {/* 04 — Doctors (repeatable) */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <Notice>{mediaBuyingComplianceNotice}</Notice>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Doctors to focus on this month</p>
                    <p className="mt-1 text-xs leading-6 text-white/40">
                      Add as many doctors as you need — {payload.doctors.length} added so far.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addDoctor}
                    className="rounded-lg bg-[#01F17C] px-4 py-2.5 text-xs font-black text-[#050505] transition-colors hover:bg-white"
                  >
                    + Add doctor
                  </button>
                </div>

                {payload.doctors.map((doctor, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                        Doctor #{index + 1}
                        {doctor.name.trim() ? ` — ${doctor.name.trim()}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDoctor(index)}
                        disabled={payload.doctors.length <= 1}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <FieldLabel>Doctor name</FieldLabel>
                        <input
                          className={fieldClass}
                          value={doctor.name}
                          onChange={(event) => setDoctor(index, "name", event.target.value)}
                          placeholder="Dr. Full Name"
                        />
                      </label>
                      <label className="block">
                        <FieldLabel>Specialty</FieldLabel>
                        <input
                          className={fieldClass}
                          value={doctor.specialty}
                          onChange={(event) => setDoctor(index, "specialty", event.target.value)}
                          placeholder="Dermatology, plastic surgery, dentistry…"
                        />
                      </label>
                    </div>

                    <div className="mt-4">
                      <AreaField2
                        label="Service(s) we are advertising for this doctor this month"
                        value={doctor.services}
                        onChange={(value) => setDoctor(index, "services", value)}
                        placeholder="e.g. laser hair removal, hydrafacial, rhinoplasty consultation"
                      />
                    </div>
                    <div className="mt-4">
                      <AreaField2
                        label="What makes this doctor unique"
                        value={doctor.uniqueAdvantage}
                        onChange={(value) => setDoctor(index, "uniqueAdvantage", value)}
                        placeholder="Credentials, years of experience, board certifications, technique, results, reputation — the reason someone chooses them over the clinic next door."
                      />
                    </div>
                    <div className="mt-4">
                      <AreaField2
                        label="Any proof we can use"
                        value={doctor.proof}
                        onChange={(value) => setDoctor(index, "proof", value)}
                        placeholder="Before/after permitted? Certificates, awards, reviews, publications, press. Say if before/after is not allowed."
                      />
                    </div>
                    <div className="mt-4">
                      <AreaField2
                        label="Anything NOT allowed in this doctor's advertising"
                        value={doctor.restrictedClaims}
                        onChange={(value) => setDoctor(index, "restrictedClaims", value)}
                        placeholder="Claims they will not make, services they do not offer, topics to avoid, before/after restrictions, anything the clinic's legal or medical team has flagged."
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDoctor}
                  className="w-full rounded-xl border border-dashed border-white/15 px-4 py-4 text-sm font-bold text-white/45 transition-colors hover:border-[#01F17C]/40 hover:text-white"
                >
                  + Add another doctor
                </button>
              </div>
            )}

            {/* 05 — Assets & approvals */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectableGroup
                    label="Brand assets available"
                    value={payload.assets.brandAssetsAvailable}
                    onChange={(value) => setField("assets.brandAssetsAvailable", value)}
                  />
                  <AreaField
                    label="Existing video / photo material we can use"
                    path="assets.existingMaterial"
                    payload={payload}
                    setField={setField}
                    placeholder="Clinic walkthroughs, doctor interviews, patient testimonials (with consent), stock we already own, old campaigns…"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <FieldLabel>Brand files</FieldLabel>
                      <p className="text-sm leading-7 text-white/55">Upload the logo, fonts, brand guide, or anything else the creative team should work from.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                      {uploading ? "Uploading..." : "Upload Files"}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.zip,.ai,.eps,.mp4,.mov"
                        onChange={(event) => handleUpload(event, "brandFiles")}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {uploadError && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadError}</p>}
                  {fileList(payload.assets.brandFiles, "brandFiles", "No brand files uploaded yet.")}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Who approves creative on your side?" path="assets.approver" payload={payload} setField={setField} placeholder="Name + role" />
                  <TextField label="How fast can they approve?" path="assets.approvalSpeed" payload={payload} setField={setField} placeholder="Same day / 24h / weekly / depends" />
                  <div className="md:col-span-2">
                    <TextField label="Drive link for anything too large to upload" path="assets.driveLink" payload={payload} setField={setField} placeholder="Google Drive / Dropbox link" />
                  </div>
                </div>

                <AreaField
                  label="Anything else we should know?"
                  path="assets.notes"
                  payload={payload}
                  setField={setField}
                  placeholder="Sensitivities, past agencies to avoid mentioning, competitor clinics we should never reference, internal politics, anything at all."
                />
              </div>
            )}
          </div>

          {submitError && <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</p>}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/65 transition-colors hover:text-white disabled:opacity-30"
            >
              Back
            </button>
            {activeStep < mediaBuyingClinicQuestionnaireSections.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(Math.min(mediaBuyingClinicQuestionnaireSections.length - 1, activeStep + 1))}
                className="rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Media Buying Brief"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AreaField2({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea className={textAreaClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

const brandAssetChoices = ["Logo", "Fonts", "Brand guide", "Photos", "Video", "None yet"];

function SelectableGroup({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = value ? value.split(" | ").filter(Boolean) : [];
  const toggle = (choice: string) => {
    const next = selected.includes(choice) ? selected.filter((item) => item !== choice) : [...selected, choice];
    onChange(next.join(" | "));
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid gap-2 sm:grid-cols-2">
        {brandAssetChoices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => toggle(choice)}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              selected.includes(choice)
                ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
