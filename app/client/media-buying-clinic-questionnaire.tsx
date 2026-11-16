"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  emptyCompetitorLink,
  emptyMediaBuyingClinicQuestionnairePayload,
  emptyMediaBuyingDoctor,
  emptyMediaBuyingPreviousAdLink,
  mediaBuyingChannelOptions,
  mediaBuyingClinicMonthlySections,
  mediaBuyingClinicQuestionnaireSections,
  mediaBuyingComplianceNotice,
  mediaBuyingHasRunAdsOptions,
  mediaBuyingLeadChannelOptions,
  mediaBuyingMohApprovalOptions,
  mediaBuyingPreviousGoalOptions,
  mediaBuyingPrimaryGoalOptions,
  type MediaBuyingClinicQuestionnairePayload,
  type MediaBuyingDoctor,
  type QuestionnaireSection,
  type UploadedBrandAsset,
} from "@/lib/client-questionnaire";

import type { ReactNode } from "react";

type Props = {
  clientName: string;
  onSubmitted: () => void;
  phase?: "setup" | "monthly";
  isClinic?: boolean;
};

type AutoSaveState = "idle" | "saving" | "saved" | "error";

type FileTarget = "reports" | "brandFiles" | "monthlyFiles";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]";
const textAreaClass = `${fieldClass} min-h-28 resize-y leading-relaxed`;
const errorClass = "mt-1.5 block text-xs font-bold text-red-400";

// Required fields per step id. Enforced by Continue, by the sidebar jump and by submit.
const REQUIRED_BY_STEP: Record<string, string[]> = {
  identity: ["identity.clinicName", "identity.contactName", "identity.email", "identity.specialties", "identity.mohApproval"],
  previousAds: ["previousAds.hasRunAds", "previousAds.unhappyAbout"],
  competitors: ["competitors.instagramLinks"],
  leadsAccess: [
    "leadsAccess.leadOwner",
    "leadsAccess.leadChannel",
    "leadsAccess.workingHours",
    "leadsAccess.accessAdAccount",
    "leadsAccess.accessPageIg",
    "leadsAccess.accessPixel",
    "leadsAccess.accessInbox",
  ],
  monthPlan: [
    "monthPlan.promoting",
    "monthPlan.primaryGoal",
    "monthPlan.adBudgetExact",
    "monthPlan.monthlyBookingTarget",
    "monthPlan.servicePrice",
  ],
};

// Steps that can never be "required-invalid" but are listed for completeness.
const ACCESS_STEP_PREFIX = "leadsAccess.access";

const accessChecklist: Array<{ key: string; label: string }> = [
  { key: "leadsAccess.accessAdAccount", label: "Partner access to our Meta ad account given (how-to video)" },
  { key: "leadsAccess.accessPageIg", label: "Facebook Page and Instagram access given" },
  { key: "leadsAccess.accessPixel", label: "Pixel access given" },
  { key: "leadsAccess.accessInbox", label: "WhatsApp / inbox access given" },
];

function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, source);
}

function isPathFilled(source: unknown, path: string): boolean {
  const value = readPath(source, path);
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.some((entry) => {
      if (typeof entry === "string") return entry.trim().length > 0;
      if (entry && typeof entry === "object") {
        return Object.values(entry as Record<string, unknown>).some(
          (inner) => typeof inner === "string" && inner.trim().length > 0
        );
      }
      return false;
    });
  }
  return typeof value === "string" && value.trim().length > 0;
}

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

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">
      {children}
      {required && <span className="text-[#01F17C]"> *</span>}
    </span>
  );
}

function RequiredError({ show }: { show?: boolean }) {
  if (!show) return null;
  return <span className={errorClass}>This is required.</span>;
}

function TextField({ label, path, payload, setField, placeholder, required, invalid, type = "text", hint, inputMode }: {
  label: string;
  path: string;
  payload: MediaBuyingClinicQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  type?: string;
  hint?: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel" | "url" | "email";
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        className={fieldClass}
        type={type}
        value={getStringValue(payload, path)}
        onChange={(event) => setField(path, event.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        aria-required={required ? true : undefined}
        aria-invalid={invalid ? true : undefined}
      />
      <RequiredError show={invalid} />
      {hint && <span className="mt-1.5 block text-xs leading-5 text-white/30">{hint}</span>}
    </label>
  );
}

function AreaField({ label, path, payload, setField, placeholder, required, invalid, hint, big }: {
  label: string;
  path: string;
  payload: MediaBuyingClinicQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  hint?: string;
  big?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        className={big ? `${textAreaClass} min-h-40` : textAreaClass}
        value={getStringValue(payload, path)}
        onChange={(event) => setField(path, event.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required ? true : undefined}
        aria-invalid={invalid ? true : undefined}
      />
      <RequiredError show={invalid} />
      {hint && <span className="mt-1.5 block text-xs leading-5 text-white/30">{hint}</span>}
    </label>
  );
}

function SelectField({ label, path, payload, setField, options, placeholder = "Choose one", required, invalid, other, onChange }: {
  label: string;
  path: string;
  payload: MediaBuyingClinicQuestionnairePayload;
  setField: (path: string, value: unknown) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  other?: boolean;
  onChange?: (value: string) => void;
}) {
  const value = getStringValue(payload, path);
  const isCustom = Boolean(value) && !options.includes(value);

  return (
    <div>
      <label className="block">
        <FieldLabel required={required}>{label}</FieldLabel>
        <select
          className={fieldClass}
          value={isCustom ? "__other" : value}
          onChange={(event) => {
            if (event.target.value === "__other") {
              setField(path, " ");
              onChange?.(" ");
              return;
            }
            setField(path, event.target.value);
            onChange?.(event.target.value);
          }}
          required={required}
          aria-required={required ? true : undefined}
          aria-invalid={invalid ? true : undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
          {other && <option value="__other">Other / not listed</option>}
        </select>
      </label>
      <RequiredError show={invalid} />
      {isCustom && (
        <input
          className={`${fieldClass} mt-2`}
          value={value.trim()}
          onChange={(event) => {
            setField(path, event.target.value);
            onChange?.(event.target.value);
          }}
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

export default function MediaBuyingClinicQuestionnaire({
  clientName,
  onSubmitted,
  phase = "setup",
  isClinic = true,
}: Props) {
  const [payload, setPayload] = useState<MediaBuyingClinicQuestionnairePayload>(() => {
    const initial = emptyMediaBuyingClinicQuestionnairePayload();
    if (clientName) initial.identity.clinicName = clientName;
    return initial;
  });
  const [activeStep, setActiveStep] = useState(0);
  const [touchedSteps, setTouchedSteps] = useState<Record<number, true>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("idle");
  const [loadedDraft, setLoadedDraft] = useState(false);
  const lastSavedRef = useRef("");
  const saveTimerRef = useRef<number | null>(null);
  const submittingRef = useRef(false);

  // ----- active section array (phase + conditional steps) ----------------

  const visibleSections: QuestionnaireSection[] = (phase === "monthly"
    ? mediaBuyingClinicMonthlySections
    : mediaBuyingClinicQuestionnaireSections
  ).filter((item) => {
    if (!isClinic && item.id === "doctors") return false;
    if (!isClinic && item.id === "leadsAccess") return false;
    // Section 02 stays visible when the answer is "No" — the select that sets
    // hasRunAds lives inside it, so removing it would trap the client on "No".
    return true;
  });

  const safeStep = Math.min(activeStep, visibleSections.length - 1);
  const section = visibleSections[safeStep] ?? mediaBuyingClinicQuestionnaireSections[0];
  const progress = ((safeStep + 1) / visibleSections.length) * 100;
  const isLastStep = safeStep === visibleSections.length - 1;

  const activeRequired = (stepId: string): string[] => {
    if (stepId === "identity" && !isClinic) {
      return REQUIRED_BY_STEP.identity.filter(
        (path) => path !== "identity.mohApproval" && path !== "identity.mohOwner"
      );
    }
    const base = REQUIRED_BY_STEP[stepId] ?? [];
    // MoH owner is only required when the clinic says they already have approval.
    if (stepId === "identity" && payload.identity.mohApproval === "Yes" && !base.includes("identity.mohOwner")) {
      return [...base, "identity.mohOwner"];
    }
    return base;
  };

  const invalidPathsFor = (stepId: string): string[] =>
    activeRequired(stepId).filter((path) => !isPathFilled(payload, path));

  const isStepValid = (index: number): boolean => {
    const target = visibleSections[index];
    if (!target) return true;
    return invalidPathsFor(target.id).length === 0;
  };

  const firstInvalidIndex = (): number => visibleSections.findIndex((_, index) => !isStepValid(index));

  const showErrorFor = (path: string): boolean =>
    Boolean(touchedSteps[safeStep]) && !isPathFilled(payload, path);

  const markStepTouched = (index: number) => setTouchedSteps((current) => ({ ...current, [index]: true }));

  const setField = (path: string, value: unknown) => {
    setPayload((current) => updatePath(current, path.split("."), value));
    setAutoSaveState("idle");
  };

  // ----- hiding section 02 clears its answers (only on explicit change) --

  const clearPreviousAdsAnswers = (current: MediaBuyingClinicQuestionnairePayload): MediaBuyingClinicQuestionnairePayload => ({
    ...current,
    previousAds: {
      ...current.previousAds,
      hasRunAds: current.previousAds.hasRunAds,
      channels: "",
      otherChannels: "",
      timeframe: "",
      duration: "",
      goal: "",
      results: "",
      unhappyAbout: "",
      spendBand: "",
      creativeObservations: "",
      reports: [],
      adLinks: [emptyMediaBuyingPreviousAdLink()],
    },
  });

  const handleHasRunAdsChange = (value: string) => {
    if (value !== "No") return;
    setPayload((current) => clearPreviousAdsAnswers(current));
    setAutoSaveState("idle");
  };

  const handleMohApprovalChange = (value: string) => {
    if (value === "Yes") return;
    setPayload((current) => ({
      ...current,
      identity: { ...current.identity, mohOwner: "" },
    }));
    setAutoSaveState("idle");
  };

  // ----- navigation -----------------------------------------------------

  const goNext = () => {
    markStepTouched(safeStep);
    if (isStepValid(safeStep)) {
      setActiveStep(Math.min(visibleSections.length - 1, safeStep + 1));
      setSubmitError("");
    }
  };

  const jumpToStep = (index: number) => {
    if (index === safeStep) return;
    // Leaving a step only locks it in if it was actually attempted.
    if (!isStepValid(safeStep)) {
      markStepTouched(safeStep);
      return;
    }
    setActiveStep(index);
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/client-questionnaire")
      .then((res) => res.json())
      .then((data: { questionnaireDraft?: MediaBuyingClinicQuestionnairePayload | null; questionnaireDraftType?: string | null }) => {
        if (cancelled) return;
        if (data.questionnaireDraftType === "media_buying_clinic" && data.questionnaireDraft) {
          const draft = data.questionnaireDraft;
          // Merge the draft OVER the empty payload — never the reverse. Old drafts
          // (no competitors/leadsAccess/etc.) must not throw anywhere downstream.
          const base = emptyMediaBuyingClinicQuestionnairePayload();
          const merged: MediaBuyingClinicQuestionnairePayload = {
            ...base,
            ...draft,
            identity: { ...base.identity, ...(draft.identity ?? {}) },
            previousAds: { ...base.previousAds, ...(draft.previousAds ?? {}) },
            monthPlan: { ...base.monthPlan, ...(draft.monthPlan ?? {}) },
            competitors: { ...base.competitors, ...(draft.competitors ?? {}) },
            leadsAccess: { ...base.leadsAccess, ...(draft.leadsAccess ?? {}) },
            monthlyExtras: { ...base.monthlyExtras, ...(draft.monthlyExtras ?? {}) },
            assets: { ...base.assets, ...(draft.assets ?? {}) },
          };
          merged.identity.clinicName =
            merged.identity.clinicName || clientName;
          merged.previousAds.reports = merged.previousAds.reports ?? [];
          // A pre-v2 draft stored a band label in spendBand; a number input cannot hold it.
          merged.previousAds.spendBand = /^\d*\.?\d*$/.test(merged.previousAds.spendBand ?? "")
            ? merged.previousAds.spendBand ?? ""
            : "";
          merged.previousAds.adLinks = merged.previousAds.adLinks?.length
            ? merged.previousAds.adLinks
            : [emptyMediaBuyingPreviousAdLink()];
          merged.competitors.instagramLinks = merged.competitors.instagramLinks?.length
            ? merged.competitors.instagramLinks
            : [emptyCompetitorLink()];
          merged.monthlyExtras.monthlyFiles = merged.monthlyExtras.monthlyFiles ?? [];
          merged.assets.brandFiles = merged.assets.brandFiles ?? [];
          merged.doctors = merged.doctors?.length ? merged.doctors : [emptyMediaBuyingDoctor()];

          setPayload(merged);
          lastSavedRef.current = JSON.stringify(merged);
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
      // The final submit may have started after this timer was scheduled.
      if (submittingRef.current) return;
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
    saveTimerRef.current = timer;

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

  // ----- competitor rows (min 1, max 3) ---------------------------------

  const setCompetitorLink = (index: number, url: string) => {
    setPayload((current) => ({
      ...current,
      competitors: {
        ...current.competitors,
        instagramLinks: current.competitors.instagramLinks.map((link, i) => (i === index ? { url } : link)),
      },
    }));
    setAutoSaveState("idle");
  };

  const addCompetitorLink = () => {
    setPayload((current) => ({
      ...current,
      competitors: {
        ...current.competitors,
        instagramLinks:
          current.competitors.instagramLinks.length >= 3
            ? current.competitors.instagramLinks
            : [...current.competitors.instagramLinks, emptyCompetitorLink()],
      },
    }));
    setAutoSaveState("idle");
  };

  const removeCompetitorLink = (index: number) => {
    setPayload((current) => ({
      ...current,
      competitors: {
        ...current.competitors,
        instagramLinks:
          current.competitors.instagramLinks.length <= 1
            ? [emptyCompetitorLink()]
            : current.competitors.instagramLinks.filter((_, i) => i !== index),
      },
    }));
    setAutoSaveState("idle");
  };

  // ----- uploads ---------------------------------------------------------

  const uploadFiles = async (files: FileList, target: FileTarget) => {
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

      setPayload((current) => {
        if (target === "reports") {
          return {
            ...current,
            previousAds: {
              ...current.previousAds,
              reports: [...current.previousAds.reports, ...uploaded],
            },
          };
        }
        if (target === "monthlyFiles") {
          return {
            ...current,
            monthlyExtras: {
              ...current.monthlyExtras,
              monthlyFiles: [...current.monthlyExtras.monthlyFiles, ...uploaded],
            },
          };
        }
        return {
          ...current,
          assets: { ...current.assets, brandFiles: [...current.assets.brandFiles, ...uploaded] },
        };
      });
      setAutoSaveState("idle");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: FileTarget) => {
    const files = event.target.files;
    if (!files?.length) return;
    await uploadFiles(files, target);
    event.target.value = "";
  };

  const removeFile = (target: FileTarget, url: string) => {
    setPayload((current) => {
      if (target === "reports") {
        return {
          ...current,
          previousAds: {
            ...current.previousAds,
            reports: current.previousAds.reports.filter((file) => file.url !== url),
          },
        };
      }
      if (target === "monthlyFiles") {
        return {
          ...current,
          monthlyExtras: {
            ...current.monthlyExtras,
            monthlyFiles: current.monthlyExtras.monthlyFiles.filter((file) => file.url !== url),
          },
        };
      }
      return {
        ...current,
        assets: {
          ...current.assets,
          brandFiles: current.assets.brandFiles.filter((file) => file.url !== url),
        },
      };
    });
    setAutoSaveState("idle");
  };

  const handleSubmit = async () => {
    // Re-check every visible step before posting anything.
    const invalidIndex = firstInvalidIndex();
    if (invalidIndex !== -1) {
      setTouchedSteps((current) => {
        const next: Record<number, true> = { ...current };
        visibleSections.forEach((_, index) => {
          if (!isStepValid(index)) next[index] = true;
        });
        return next;
      });
      setActiveStep(invalidIndex);
      setSubmitError("Some required fields are still empty. Check the highlighted answers below.");
      return;
    }

    setSubmitting(true);
    submittingRef.current = true;
    setSubmitError("");
    // Cancel any pending autosave so it cannot fire on top of the final submit.
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const res = await fetch("/api/client-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaireType: "media_buying_clinic", questionnaire: payload }),
    });

    setSubmitting(false);
    submittingRef.current = false;

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setSubmitError(data.error ?? "Submission failed");
      return;
    }

    lastSavedRef.current = JSON.stringify(payload);
    setAutoSaveState("saved");
    onSubmitted();
  };

  const fileList = (files: UploadedBrandAsset[], target: FileTarget, emptyLabel: string) => (
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
            {visibleSections.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpToStep(index)}
                aria-current={safeStep === index ? "step" : undefined}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  safeStep === index
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
            {safeStep === 0 && phase === "setup" && (
              <p className="mb-6 text-xs font-bold text-white/35">Fields marked * are required.</p>
            )}

            {/* 01 — Client identity */}
            {section.id === "identity" && (
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label={isClinic ? "Clinic name" : "Business name"}
                  path="identity.clinicName"
                  payload={payload}
                  setField={setField}
                  placeholder="Arms Center"
                  required
                  invalid={showErrorFor("identity.clinicName")}
                />
                <TextField label="Instagram handle" path="identity.instagram" payload={payload} setField={setField} placeholder="@armscenter" />
                <TextField label="Website" path="identity.website" payload={payload} setField={setField} placeholder="https://" />
                <TextField
                  label="Contact name"
                  path="identity.contactName"
                  payload={payload}
                  setField={setField}
                  placeholder="Full name"
                  required
                  invalid={showErrorFor("identity.contactName")}
                />
                <TextField
                  label="Email"
                  path="identity.email"
                  payload={payload}
                  setField={setField}
                  placeholder="name@clinic.com"
                  type="email"
                  required
                  invalid={showErrorFor("identity.email")}
                />
                <TextField label="Phone" path="identity.phone" payload={payload} setField={setField} placeholder="+965" inputMode="tel" />
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
                    label={isClinic ? "Specialties the clinic covers overall" : "Services you offer overall"}
                    path="identity.specialties"
                    payload={payload}
                    setField={setField}
                    placeholder={
                      isClinic
                        ? "Dermatology, plastic surgery, dentistry, laser, hair transplant…"
                        : "e.g. what you sell or do"
                    }
                    required
                    invalid={showErrorFor("identity.specialties")}
                  />
                </div>
                {isClinic && (
                  <>
                    <SelectField
                      label="Ministry of Health approval needed?"
                      path="identity.mohApproval"
                      payload={payload}
                      setField={setField}
                      options={mediaBuyingMohApprovalOptions}
                      required
                      invalid={showErrorFor("identity.mohApproval")}
                      onChange={handleMohApprovalChange}
                    />
                    {payload.identity.mohApproval === "Yes" && (
                      <TextField
                        label="Who handles MoH approval?"
                        path="identity.mohOwner"
                        payload={payload}
                        setField={setField}
                        placeholder="Name / agency / internal team"
                        required
                        invalid={showErrorFor("identity.mohOwner")}
                      />
                    )}
                    {payload.identity.mohApproval === "Yes" && payload.identity.mohOwner.trim() === "" && showErrorFor("identity.mohOwner") && (
                      <p className={errorClass}>Tell us who handles MoH approval when you select &ldquo;Yes&rdquo;.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 02 — Previous advertising */}
            {section.id === "previousAds" && (
              <div className="space-y-6">
                {payload.previousAds.hasRunAds === "No" ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="Have you run paid ads before?"
                        path="previousAds.hasRunAds"
                        payload={payload}
                        setField={setField}
                        options={mediaBuyingHasRunAdsOptions}
                        required
                        invalid={showErrorFor("previousAds.hasRunAds")}
                        onChange={handleHasRunAdsChange}
                      />
                    </div>
                    <p className="text-sm leading-7 text-white/60">
                      No problem — we will start from scratch. Change this to &ldquo;Yes&rdquo; if you have run ads
                      before.
                    </p>
                  </>
                ) : (
                  <>
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
                    invalid={showErrorFor("previousAds.hasRunAds")}
                    onChange={handleHasRunAdsChange}
                  />
                  {payload.previousAds.hasRunAds !== "No" && (
                    <>
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
                      <TextField
                        label="Approximate monthly spend on ads, in KWD"
                        path="previousAds.spendBand"
                        payload={payload}
                        setField={setField}
                        placeholder="e.g. 800"
                        hint="Ad spend paid to the platform only. Do not include agency or management fees."
                        inputMode="decimal"
                      />
                    </>
                  )}
                </div>

                {payload.previousAds.hasRunAds === "No" ? null : (
                  <>
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
                    aria-required={true}
                    aria-invalid={showErrorFor("previousAds.unhappyAbout") || undefined}
                  />
                  <RequiredError show={showErrorFor("previousAds.unhappyAbout")} />
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
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* This month's plan (monthly phase, step 01) */}
            {section.id === "monthPlan" && (
              <div className="space-y-6">
                <AreaField
                  label="What do you want to promote this month?"
                  path="monthPlan.promoting"
                  payload={payload}
                  setField={setField}
                  placeholder="A service, an offer, a doctor, the clinic as a whole…"
                  required
                  invalid={showErrorFor("monthPlan.promoting")}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Primary goal for this month"
                    path="monthPlan.primaryGoal"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingPrimaryGoalOptions}
                    required
                    invalid={showErrorFor("monthPlan.primaryGoal")}
                  />
                  <TextField
                    label="Monthly ad budget paid to Meta, in KWD"
                    path="monthPlan.adBudgetExact"
                    payload={payload}
                    setField={setField}
                    placeholder="e.g. 800"
                    hint="This is the ad budget paid to Meta. It does not include Astroshot's fee."
                    inputMode="numeric"
                    required
                    invalid={showErrorFor("monthPlan.adBudgetExact")}
                  />
                  <TextField
                    label="How many bookings a month would make you happy?"
                    path="monthPlan.monthlyBookingTarget"
                    payload={payload}
                    setField={setField}
                    placeholder="e.g. 40 bookings, or 3 new patients per doctor"
                    required
                    invalid={showErrorFor("monthPlan.monthlyBookingTarget")}
                  />
                  <TextField
                    label="Price of the service we're promoting (KWD)"
                    path="monthPlan.servicePrice"
                    payload={payload}
                    setField={setField}
                    placeholder="e.g. 250 per session"
                    inputMode="numeric"
                    required
                    invalid={showErrorFor("monthPlan.servicePrice")}
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

            {/* Doctors (repeatable) — monthly phase, clinics only */}
            {section.id === "doctors" && (
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

            {/* Assets & approvals (setup, step 03) */}
            {section.id === "assets" && (
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
              </div>
            )}

            {/* Competitors (setup, step 04) */}
            {section.id === "competitors" && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <FieldLabel required>Top 3 competitor clinics</FieldLabel>
                      <p className="text-xs leading-6 text-white/35">
                        Paste their Instagram profiles. At least one, up to three.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCompetitorLink}
                      disabled={payload.competitors.instagramLinks.length >= 3}
                      className="shrink-0 rounded-lg bg-[#01F17C] px-3 py-2 text-xs font-black text-[#050505] transition-colors hover:bg-white disabled:opacity-30"
                    >
                      + Add competitor
                    </button>
                  </div>
                  <div className="space-y-3">
                    {payload.competitors.instagramLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className={fieldClass}
                          value={link.url}
                          onChange={(event) => setCompetitorLink(index, event.target.value)}
                          placeholder="https://instagram.com/…"
                          inputMode="url"
                          aria-required={true}
                          aria-invalid={showErrorFor("competitors.instagramLinks") || undefined}
                        />
                        <button
                          type="button"
                          onClick={() => removeCompetitorLink(index)}
                          disabled={payload.competitors.instagramLinks.length <= 1}
                          className="shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white disabled:opacity-30"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <RequiredError show={showErrorFor("competitors.instagramLinks")} />
                </div>

                <AreaField
                  label="What they do better than you"
                  path="competitors.theirStrengths"
                  payload={payload}
                  setField={setField}
                  placeholder="Be honest — faster answers, better offers, stronger brand, more doctors…"
                />
                <AreaField
                  label="What you do better than them"
                  path="competitors.ourStrengths"
                  payload={payload}
                  setField={setField}
                  placeholder="Better doctors, newer equipment, faster appointments, results, pricing clarity…"
                />
              </div>
            )}

            {/* Leads & access (setup, step 05) */}
            {section.id === "leadsAccess" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Who will answer the leads?"
                    path="leadsAccess.leadOwner"
                    payload={payload}
                    setField={setField}
                    placeholder="Name and phone number"
                    required
                    invalid={showErrorFor("leadsAccess.leadOwner")}
                  />
                  <SelectField
                    label="Where do leads arrive today?"
                    path="leadsAccess.leadChannel"
                    payload={payload}
                    setField={setField}
                    options={mediaBuyingLeadChannelOptions}
                    required
                    invalid={showErrorFor("leadsAccess.leadChannel")}
                  />
                  <TextField
                    label="Their working hours"
                    path="leadsAccess.workingHours"
                    payload={payload}
                    setField={setField}
                    placeholder="e.g. Sat–Thu 10am–10pm"
                    required
                    invalid={showErrorFor("leadsAccess.workingHours")}
                  />
                </div>

                <div>
                  <FieldLabel required>Access checklist</FieldLabel>
                  <div className="grid gap-2">
                    {accessChecklist.map((item) => {
                      const checked = Boolean(readPath(payload, item.key));
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-required={true}
                          aria-invalid={showErrorFor(item.key) || undefined}
                          onClick={() => setField(item.key, !checked)}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                            checked
                              ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                              : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked ? "border-[#01F17C]/60 text-[#01F17C]" : "border-white/20 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <RequiredError show={showErrorFor("leadsAccess.accessAdAccount")} />
                  {Boolean(touchedSteps[safeStep]) &&
                    accessChecklist.some((item) => !readPath(payload, item.key)) && (
                      <p className={errorClass}>
                        All four access items must be ticked before we can start. If you are stuck on any of them, write
                        &ldquo;need help&rdquo; in the working hours field and we will walk you through it.
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* This month's extras (monthly, step 03) */}
            {section.id === "monthlyExtras" && (
              <div className="space-y-6">
                <AreaField
                  label="New material available this month"
                  path="monthlyExtras.monthlyMaterial"
                  payload={payload}
                  setField={setField}
                  placeholder="New footage, new doctor, new offer, new clinic photos…"
                />
                <AreaField
                  label="Anything else about this month"
                  path="monthlyExtras.monthlyNotes"
                  payload={payload}
                  setField={setField}
                  placeholder="Sensitivities, dates to avoid, competitor clinics never to reference…"
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <FieldLabel>Uploads for this month</FieldLabel>
                      <p className="text-sm leading-7 text-white/55">Footage, photos, or anything the creative team should work from this month.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                      {uploading ? "Uploading..." : "Upload Files"}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.zip,.ai,.eps,.mp4,.mov"
                        onChange={(event) => handleUpload(event, "monthlyFiles")}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {uploadError && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadError}</p>}
                  {fileList(payload.monthlyExtras.monthlyFiles, "monthlyFiles", "No files uploaded for this month yet.")}
                </div>
              </div>
            )}
          </div>

          {submitError && <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</p>}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(Math.max(0, safeStep - 1))}
              disabled={safeStep === 0}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/65 transition-colors hover:text-white disabled:opacity-30"
            >
              Back
            </button>
            {!isLastStep ? (
              <button
                type="button"
                onClick={goNext}
                aria-disabled={!isStepValid(safeStep)}
                className={`rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white ${
                  isStepValid(safeStep) ? "" : "opacity-50 cursor-not-allowed"
                }`}
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
                {submitting
                  ? "Submitting..."
                  : phase === "monthly"
                    ? "Submit Monthly Brief"
                    : "Submit Media Buying Brief"}
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
