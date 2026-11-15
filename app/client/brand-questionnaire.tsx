"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  brandLanguageOptions,
  brandPrimaryGoalOptions,
  brandQuestionnaireSections,
  brandStyleOptions,
  brandToneOptions,
  emptyBrandCaseStudy,
  emptyBrandQuestionnairePayload,
  type BrandCaseStudy,
  type BrandQuestionnairePayload,
  type UploadedBrandAsset,
} from "@/lib/client-questionnaire";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]";

const textAreaClass = `${fieldClass} min-h-28 resize-y leading-relaxed`;

type AutoSaveState = "idle" | "saving" | "saved" | "error";
type QuestionnaireFieldContextValue = {
  payload: BrandQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
};

const QuestionnaireFieldContext = createContext<QuestionnaireFieldContextValue | null>(null);

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

function getStringValue(source: BrandQuestionnairePayload, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return "";
    return (acc as Record<string, unknown>)[key];
  }, source);
  return typeof value === "string" ? value : "";
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{children}</span>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <FieldLabel>{children}</FieldLabel>;
}

function TextField({
  label,
  path,
  placeholder,
  required,
}: {
  label: string;
  path: string;
  placeholder?: string;
  required?: boolean;
}) {
  const context = useContext(QuestionnaireFieldContext);
  if (!context) return null;

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClass}
        placeholder={placeholder}
        value={getStringValue(context.payload, path)}
        onChange={(event) => context.setField(path, event.target.value)}
        required={required}
      />
    </label>
  );
}

function AreaField({
  label,
  path,
  placeholder,
}: {
  label: string;
  path: string;
  placeholder?: string;
}) {
  const context = useContext(QuestionnaireFieldContext);
  if (!context) return null;

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        className={textAreaClass}
        placeholder={placeholder}
        value={getStringValue(context.payload, path)}
        onChange={(event) => context.setField(path, event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  path,
  options,
}: {
  label: string;
  path: string;
  options: string[];
}) {
  const context = useContext(QuestionnaireFieldContext);
  if (!context) return null;

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select className={fieldClass} value={getStringValue(context.payload, path)} onChange={(event) => context.setField(path, event.target.value)}>
        <option value="">Choose one</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Section({ id }: { id: string; index?: number }) {
  const section = brandQuestionnaireSections.find((item) => item.id === id)!;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">{section.eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">{section.title}</h2>
      <p className="mt-2 mb-6 text-sm leading-7 text-white/55">{section.description}</p>
    </div>
  );
}

function Divider() {
  return <div className="my-12 border-t border-white/10" />;
}

type Props = {
  clientName: string;
  onSubmitted: () => void;
};

export default function BrandQuestionnaire({ clientName, onSubmitted }: Props) {
  const [payload, setPayload] = useState<BrandQuestionnairePayload>(() => {
    const initial = emptyBrandQuestionnairePayload();
    if (clientName) initial.identity.businessName = clientName;
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("idle");
  const [loadedDraft, setLoadedDraft] = useState(false);
  const lastSavedRef = useRef("");

  const setField = (path: string, value: unknown) => {
    setPayload((current) => updatePath(current, path.split("."), value));
    setAutoSaveState("idle");
  };

  const setCaseStudy = (index: number, field: keyof BrandCaseStudy, value: string) => {
    setPayload((current) => ({
      ...current,
      proof: {
        ...current.proof,
        caseStudies: current.proof.caseStudies.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      },
    }));
    setAutoSaveState("idle");
  };

  const addCaseStudy = () => {
    setPayload((current) => ({
      ...current,
      proof: {
        ...current.proof,
        caseStudies: [...current.proof.caseStudies, emptyBrandCaseStudy()],
      },
    }));
    setAutoSaveState("idle");
  };

  const removeCaseStudy = (index: number) => {
    setPayload((current) => ({
      ...current,
      proof: {
        ...current.proof,
        caseStudies: current.proof.caseStudies.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
    setAutoSaveState("idle");
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/client-questionnaire")
      .then((res) => res.json())
      .then((data: { questionnaireDraft?: BrandQuestionnairePayload | null; questionnaireDraftType?: string | null }) => {
        if (cancelled) return;
        if (data.questionnaireDraftType === "brand" && data.questionnaireDraft) {
          const draft = data.questionnaireDraft;
          setPayload((current) => ({
            ...draft,
            identity: {
              ...draft.identity,
              businessName: draft.identity.businessName || current.identity.businessName || clientName,
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
        body: JSON.stringify({ questionnaireType: "brand", questionnaire: payload, autosave: true }),
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

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

        if (error) {
          throw new Error(error.message || `Upload failed for ${file.name}`);
        }

        uploaded.push(data.file);
      }

      setPayload((current) => ({
        ...current,
        assets: {
          ...current.assets,
          brandFiles: [...current.assets.brandFiles, ...uploaded],
        },
      }));
      setAutoSaveState("idle");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeFile = (url: string) => {
    setPayload((current) => ({
      ...current,
      assets: {
        ...current.assets,
        brandFiles: current.assets.brandFiles.filter((file) => file.url !== url),
      },
    }));
    setAutoSaveState("idle");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch("/api/client-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaireType: "brand", questionnaire: payload }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setSubmitError(data.error ?? "Submission failed");
      return;
    }

    lastSavedRef.current = JSON.stringify(payload);
    onSubmitted();
  };

  return (
    <QuestionnaireFieldContext.Provider value={{ payload, setField }}>
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="border-b border-white/10 bg-[#050505]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-lg font-black tracking-tight">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </span>
          {clientName && (
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-white/35 sm:inline">
              {clientName}
            </span>
          )}
          {autoSaveState !== "idle" && (
            <span className={`ml-3 hidden rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:inline ${
              autoSaveState === "error"
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-white/10 bg-white/[0.04] text-white/40"
            }`}>
              {autoSaveState === "saving" ? "Auto-saving" : autoSaveState === "saved" ? "Auto-saved" : "Auto-save failed"}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Brand Transformation Brief</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Let&apos;s understand the business first.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            This is a deeper intake than our standard questionnaire because the goal is repositioning the whole brand
            and building real authority online. Answer as much as you can — bullets are fine, &ldquo;N/A&rdquo; is fine.
            Our team reads every answer before the first shoot.
          </p>
        </div>

        {/* 01 Identity */}
        <Section id="identity" index={0} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Business name *" path="identity.businessName" placeholder="Kuwait Gulf Hydraulic" required />
          <TextField label="Contact name *" path="identity.contactName" placeholder="Full name" required />
          <TextField label="Email *" path="identity.email" placeholder="name@company.com" required />
          <TextField label="Phone" path="identity.phone" placeholder="+965" />
          <TextField label="Website" path="identity.website" placeholder="https://" />
          <TextField label="Industry" path="identity.industry" placeholder="Hydraulic repair / industrial" />
          <TextField label="Location" path="identity.location" placeholder="Kuwait / GCC" />
          <TextField label="Years operating" path="identity.yearsOperating" placeholder="e.g. 12 years" />
          <TextField label="Team size" path="identity.teamSize" placeholder="e.g. 25 — 5 engineers, 14 technicians" />
        </div>
        <div className="mt-4">
          <AreaField label="Full list of services" path="identity.services" placeholder="Hydraulic pump repair, cylinder rebuild, hose assembly, on-site service, spare parts…" />
        </div>

        <Divider />

        {/* 02 Competition */}
        <Section id="competition" index={1} />
        <div className="grid gap-4 md:grid-cols-2">
          <AreaField label="Main competitors (Kuwait + GCC + international)" path="competition.competitors" />
          <AreaField label="What do your top competitors do well online?" path="competition.competitorStrengths" />
          <AreaField label="What do they do poorly — the gaps you can win?" path="competition.competitorGaps" />
          <AreaField label="Your single biggest competitive advantage" path="competition.advantage" />
          <AreaField label="Top 3 differentiators" path="competition.differentiators" placeholder="Price, speed, quality, stock, warranty, on-site service…" />
          <AreaField label="The #1 reason a client chooses you over a competitor" path="competition.whyChosen" />
          <AreaField label="Where do you rank in the market?" path="competition.marketPosition" placeholder="Leader / specialist / challenger / new entrant" />
          <AreaField label="Your honest weakness — what you most want to improve" path="competition.weakness" />
        </div>

        <Divider />

        {/* 03 Proof */}
        <Section id="proof" index={2} />
        <div className="grid gap-4 md:grid-cols-2">
          <AreaField label="Ideal customer" path="proof.idealCustomer" placeholder="Fleet manager, maintenance engineer, procurement officer…" />
          <AreaField label="What problem does a typical customer bring you?" path="proof.customerProblem" />
          <AreaField label="What happens if they don't fix it?" path="proof.problemCost" placeholder="Downtime cost, safety risk, production loss…" />
          <AreaField label="Testimonials or references we can quote" path="proof.testimonials" />
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black">Top case studies</h3>
            <button
              type="button"
              onClick={addCaseStudy}
              className="rounded-lg bg-[#01F17C] px-3 py-2 text-xs font-black text-[#050505] transition-colors hover:bg-white"
            >
              + Add case study
            </button>
          </div>
          {payload.proof.caseStudies.map((item, index) => (
            <div key={index} className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Case study #{index + 1}</span>
                {payload.proof.caseStudies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCaseStudy(index)}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input className={fieldClass} placeholder="Client company (or 'confidential')" value={item.company} onChange={(e) => setCaseStudy(index, "company", e.target.value)} />
                <input className={fieldClass} placeholder="Industry" value={item.industry} onChange={(e) => setCaseStudy(index, "industry", e.target.value)} />
                <textarea className={textAreaClass} placeholder="The problem they had" value={item.problem} onChange={(e) => setCaseStudy(index, "problem", e.target.value)} />
                <textarea className={textAreaClass} placeholder="The solution you provided" value={item.solution} onChange={(e) => setCaseStudy(index, "solution", e.target.value)} />
                <input className={fieldClass} placeholder="How long it took" value={item.timeframe} onChange={(e) => setCaseStudy(index, "timeframe", e.target.value)} />
                <input className={fieldClass} placeholder="The result / impact" value={item.result} onChange={(e) => setCaseStudy(index, "result", e.target.value)} />
                <input className={fieldClass} placeholder="Approx. job value (optional)" value={item.value} onChange={(e) => setCaseStudy(index, "value", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Total repairs / jobs completed to date" path="proof.totalRepairs" placeholder="e.g. 5,000+" />
          <TextField label="Total machines / components serviced" path="proof.totalServiced" />
          <TextField label="Combined years of technician experience" path="proof.combinedExperience" />
          <TextField label="Largest / most complex job done" path="proof.largestJob" />
          <TextField label="Fastest turnaround delivered" path="proof.fastestTurnaround" />
          <TextField label="Repeat-customer rate" path="proof.repeatRate" />
        </div>
        <div className="mt-4">
          <AreaField label="Before/after photos or videos available?" path="proof.beforeAfter" placeholder="Yes — we have X photos / No, but we can arrange" />
        </div>

        <Divider />

        {/* 04 Goals */}
        <Section id="goals" index={3} />
        <SelectField label="Primary goal *" path="goals.primaryGoal" options={brandPrimaryGoalOptions} />
        <div className="mt-6">
          <Label>Secondary goals</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {brandPrimaryGoalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setField("goals.secondaryGoals", toggleValue(payload.goals.secondaryGoals, goal))}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  payload.goals.secondaryGoals.includes(goal)
                    ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AreaField label="The one message you want the market to associate with KGH" path="goals.keyMessage" />
          <AreaField label="What makes you credible?" path="goals.credibility" placeholder="Certifications, equipment, OEM, years, scale…" />
          <AreaField label="Quantity vs premium quality — which matters more now?" path="goals.quantityOrQuality" />
          <AreaField label="LinkedIn vs Instagram audience — same or different?" path="goals.audienceSplit" />
          <SelectField label="Tone" path="goals.tone" options={brandToneOptions} />
          <SelectField label="Language" path="goals.language" options={brandLanguageOptions} />
          <AreaField label="What should we NEVER say or show?" path="goals.avoid" />
          <AreaField label="What content exists today, and why isn't it working?" path="goals.currentContent" />
        </div>
        <div className="mt-4">
          <AreaField label="Upcoming offers, promotions, or seasonal campaigns" path="goals.offers" />
        </div>

        <Divider />

        {/* 05 Visual */}
        <Section id="visual" index={4} />
        <div className="grid gap-4 md:grid-cols-2">
          <AreaField label="What should people feel when they see KGH online?" path="visual.feeling" placeholder="Trust, scale, precision, high-tech, reliability…" />
          <AreaField label="3–5 accounts or brands you admire visually" path="visual.admiredAccounts" />
          <AreaField label="2–3 competitor accounts you want to beat visually" path="visual.competitorAccounts" />
          <SelectField label="Preferred visual style" path="visual.style" options={brandStyleOptions} />
          <AreaField label="Show faces/team, or keep it facility-and-machinery focused?" path="visual.faces" />
          <AreaField label="Anyone comfortable appearing on camera / being interviewed?" path="visual.onCamera" />
        </div>

        <Divider />

        {/* 06 Production */}
        <Section id="production" index={5} />
        <div className="grid gap-4 md:grid-cols-2">
          <AreaField label="Can we film inside the workshop? Any restrictions?" path="production.workshopAccess" />
          <AreaField label="Can we film live repair work? Quiet/busy times?" path="production.liveRepair" />
          <AreaField label="Natural light, or should we plan lighting?" path="production.lighting" />
          <AreaField label="Areas we cannot enter or shoot?" path="production.restricted" />
          <AreaField label="PPE or safety rules our crew must follow" path="production.ppe" />
          <AreaField label="How much notice for a shoot day?" path="production.notice" />
          <AreaField label="On-site contact for filming access" path="production.onsiteContact" />
        </div>

        <Divider />

        {/* 07 Assets */}
        <Section id="assets" index={6} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Branding files</span>
              <p className="text-sm leading-7 text-white/55">Upload logos, brand guidelines, brochures, existing photos/videos.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
              {uploading ? "Uploading..." : "Upload Files"}
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.zip,.ai,.eps,.mp4,.mov" onChange={handleUpload} disabled={uploading} className="sr-only" />
            </label>
          </div>

          {uploadError && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadError}</p>}

          <div className="mt-5 space-y-2">
            {payload.assets.brandFiles.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/35">No brand files uploaded yet.</p>
            ) : (
              payload.assets.brandFiles.map((file) => (
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Drive/Dropbox link for assets" path="assets.driveLink" placeholder="Case studies, price lists, catalogs…" />
          <TextField label="Approval workflow" path="assets.approvalWorkflow" placeholder="How should we submit content for approval?" />
          <TextField label="Approval turnaround" path="assets.turnaround" placeholder="Same day / 24h / weekly" />
          <TextField label="Posting cadence" path="assets.cadence" placeholder="e.g. 3x Instagram + 2x LinkedIn per week" />
          <TextField label="Primary contact for scheduling & approvals" path="assets.primaryContact" placeholder="Name + WhatsApp" />
        </div>
        <div className="mt-4">
          <AreaField label="Anything else the team should know?" path="assets.notes" />
        </div>

        {submitError && <p className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</p>}

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-[#01F17C] px-8 py-4 text-sm font-black text-[#050505] transition-colors hover:bg-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Brand Brief"}
          </button>
        </div>
      </div>
    </main>
    </QuestionnaireFieldContext.Provider>
  );
}
