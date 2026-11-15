"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  emptyMonthlyProductFocus,
  emptyQuestionnairePayload,
  formatOptions,
  goalOptions,
  monthlyObjectiveOptions,
  monthlyPriorityOptions,
  monthlyProductTypes,
  type MonthlyProductFocus,
  questionnaireSections,
  type QuestionnairePayload,
  type UploadedBrandAsset,
  type QuestionnaireType,
} from "@/lib/client-questionnaire";
import { calendarDaysForMonth, clientMonthOptions, isoDate, occasionsForMonth } from "@/lib/kuwait-occasions";
import type { ClientProjectWorkspace, VisualApprovalItem, VisualApprovalSection } from "@/lib/client-project-work";
import type { AiFactory, CalendarAiAsset } from "@/lib/content-calendar";
import BrandQuestionnaire from "./brand-questionnaire";
import ExplanatoryAnimationQuestionnaire from "./explanatory-animation-questionnaire";
import MediaBuyingClinicQuestionnaire from "./media-buying-clinic-questionnaire";

type LoginState = "checking" | "signed-out" | "signed-in";
type PortalView = "dashboard" | "questionnaire";
type DashboardTab = "monthly" | "ideas" | "brand" | "models" | "outfits" | "locations" | "timeline" | "questionnaire";
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

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function getStringValue(source: QuestionnairePayload, path: string) {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return "";
    return (acc as Record<string, unknown>)[key];
  }, source);

  return typeof value === "string" ? value : "";
}

function clientPreviewSlug(name: string) {
  return name.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function hasMonthlyPlanContent(plan: QuestionnairePayload["monthlyPlan"]) {
  const hasProductContent = (plan.products ?? []).some((product) =>
    [
      product.name,
      product.objective,
      product.details,
      product.offer,
      product.keyDate,
      product.assetNotes,
    ].some((value) => value.trim()) || (product.files ?? []).length > 0
  );

  return hasProductContent || (plan.calendarNotes ?? []).some((item) => item.note.trim()) || Boolean(plan.notes.trim());
}

export default function ClientPortalPage() {
  const [loginState, setLoginState] = useState<LoginState>("checking");
  const [clientName, setClientName] = useState("");
  const [newContentCount, setNewContentCount] = useState(0);
  const [questionnaireType, setQuestionnaireType] = useState<QuestionnaireType>("standard");
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [clientTheme, setClientTheme] = useState<"dark" | "light">("dark");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [portalView, setPortalView] = useState<PortalView>("dashboard");
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("monthly");
  const [activeStep, setActiveStep] = useState(0);
  const [payload, setPayload] = useState<QuestionnairePayload>(() => emptyQuestionnairePayload());
  const [monthlyPlan, setMonthlyPlan] = useState(() => emptyQuestionnairePayload().monthlyPlan);
  const [monthlySubmittedAt, setMonthlySubmittedAt] = useState("");
  const [monthlySubmitting, setMonthlySubmitting] = useState(false);
  const [monthlySaved, setMonthlySaved] = useState(false);
  const [monthlyAutoSaveState, setMonthlyAutoSaveState] = useState<AutoSaveState>("idle");
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState("");
  const [monthlyUploadingIndex, setMonthlyUploadingIndex] = useState<number | null>(null);
  const monthlyLastSavedRef = useRef("");
  const [projectWorkspace, setProjectWorkspace] = useState<ClientProjectWorkspace | null>(null);
  const [projectWorkspaceLoading, setProjectWorkspaceLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<CalendarAiAsset[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelSelectionDraft, setModelSelectionDraft] = useState<string[]>([]);
  const [modelSelectionNotes, setModelSelectionNotes] = useState("");
  const [modelSelectionSaving, setModelSelectionSaving] = useState(false);
  const [modelSelectionMessage, setModelSelectionMessage] = useState("");
  const [ideaFeedbackDrafts, setIdeaFeedbackDrafts] = useState<Record<string, string>>({});
  const [ideaFeedbackSavingId, setIdeaFeedbackSavingId] = useState<string | null>(null);
  const [ideaFeedbackMessage, setIdeaFeedbackMessage] = useState("");
  const [visualFeedbackDrafts, setVisualFeedbackDrafts] = useState<Record<string, string>>({});
  const [visualFeedbackSavingId, setVisualFeedbackSavingId] = useState<string | null>(null);
  const [visualFeedbackMessage, setVisualFeedbackMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [questionnaireAutoSaveState, setQuestionnaireAutoSaveState] = useState<AutoSaveState>("idle");
  const [uploadingAssets, setUploadingAssets] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const questionnaireLastSavedRef = useRef("");

  const lightMode = clientTheme === "light";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("astroshot-client-theme") === "light" ? "light" : "dark";
    setClientTheme(savedTheme);
  }, []);

  const changeClientTheme = (nextTheme: "dark" | "light") => {
    setClientTheme(nextTheme);
    window.localStorage.setItem("astroshot-client-theme", nextTheme);
  };

  const renderClientThemeToggle = () => (
    <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.04] p-0.5 text-[10px] font-black uppercase tracking-widest text-white/45">
      {(["dark", "light"] as const).map((theme) => (
        <button
          key={theme}
          type="button"
          onClick={() => changeClientTheme(theme)}
          aria-pressed={clientTheme === theme}
          className={`rounded-md px-2.5 py-1.5 transition-colors ${
            clientTheme === theme ? "bg-white text-black" : "hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          {theme === "light" ? "Bright" : "Dark"}
        </button>
      ))}
    </div>
  );

  useEffect(() => {
    fetch("/api/client-questionnaire")
      .then((res) => res.json())
      .then((data: { authenticated: boolean; clientName?: string | null; questionnaireSubmitted?: boolean; questionnaireType?: QuestionnaireType }) => {
        const typedData = data as typeof data & {
          questionnaireDraft?: QuestionnairePayload | null;
          questionnaireDraftType?: QuestionnaireType | null;
        };
        setClientName(data.clientName ?? "");
        setQuestionnaireType(data.questionnaireType ?? "standard");
        setQuestionnaireSubmitted(Boolean(data.questionnaireSubmitted));
        setPortalView(data.questionnaireSubmitted ? "dashboard" : "questionnaire");
        if (typedData.questionnaireDraftType === "standard" && typedData.questionnaireDraft) {
          setPayload(typedData.questionnaireDraft);
          questionnaireLastSavedRef.current = JSON.stringify(typedData.questionnaireDraft);
          setQuestionnaireAutoSaveState("saved");
        }
        setLoginState(data.authenticated ? "signed-in" : "signed-out");
      })
      .catch(() => setLoginState("signed-out"));
  }, []);

  useEffect(() => {
    if (loginState !== "signed-in" || !clientName) {
      setNewContentCount(0);
      return;
    }

    let cancelled = false;
    const previewSlug = clientPreviewSlug(clientName);
    if (!previewSlug) {
      setNewContentCount(0);
      return;
    }

    fetch(`/api/client-preview/${previewSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { calendar?: { posts?: Array<{ isNew?: boolean }> } } | null) => {
        if (cancelled) return;
        const count = (data?.calendar?.posts ?? []).filter((post) => post.isNew).length;
        setNewContentCount(count);
      })
      .catch(() => {
        if (!cancelled) setNewContentCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [loginState, clientName]);

  useEffect(() => {
    if (loginState !== "signed-in") return;

    let cancelled = false;
    setMonthlyLoading(true);
    fetch(`/api/client-monthly-plan?month=${encodeURIComponent(monthlyPlan.month)}`)
      .then((res) => res.json())
      .then((data: { monthlyPlan?: QuestionnairePayload["monthlyPlan"] | null; submittedAt?: string }) => {
        if (cancelled) return;
        const loadedPlan = data.monthlyPlan ?? {
          month: monthlyPlan.month,
          products: [emptyMonthlyProductFocus()],
          calendarNotes: [],
          notes: "",
        };
        monthlyLastSavedRef.current = hasMonthlyPlanContent(loadedPlan) ? JSON.stringify(loadedPlan) : "";
        setMonthlyPlan(loadedPlan);
        setMonthlySubmittedAt(data.submittedAt ?? "");
        setMonthlySaved(false);
        setMonthlyAutoSaveState("idle");
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setMonthlyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loginState, monthlyPlan.month]);

  useEffect(() => {
    if (loginState !== "signed-in") return;
    let cancelled = false;
    setProjectWorkspaceLoading(true);
    fetch("/api/client-project-work")
      .then((res) => res.json())
      .then((data: { workspace?: ClientProjectWorkspace }) => {
        if (!cancelled) {
          setProjectWorkspace(data.workspace ?? null);
          setModelSelectionDraft(data.workspace?.modelSelection.selectedModelIds ?? []);
          setModelSelectionNotes(data.workspace?.modelSelection.notes ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) setProjectWorkspace(null);
      })
      .finally(() => {
        if (!cancelled) setProjectWorkspaceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loginState]);

  useEffect(() => {
    if (loginState !== "signed-in") return;
    let cancelled = false;
    setModelsLoading(true);
    fetch("/api/astro-magic/factory")
      .then((res) => res.json())
      .then((data: { factory?: AiFactory }) => {
        if (!cancelled) setAvailableModels(data.factory?.aiAssets.models ?? []);
      })
      .catch(() => {
        if (!cancelled) setAvailableModels([]);
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loginState]);

  const progress = useMemo(() => ((activeStep + 1) / questionnaireSections.length) * 100, [activeStep]);

  useEffect(() => {
    if (!clientName) return;

    setPayload((current) => {
      if (current.identity.businessName.trim()) return current;
      return {
        ...current,
        identity: {
          ...current.identity,
          businessName: clientName,
        },
      };
    });
  }, [clientName]);

  useEffect(() => {
    if (loginState !== "signed-in" || questionnaireType !== "standard" || portalView !== "questionnaire") return;
    if (submitting || uploadingAssets) return;

    const serialized = JSON.stringify(payload);
    if (serialized === questionnaireLastSavedRef.current) return;

    const timer = window.setTimeout(async () => {
      setQuestionnaireAutoSaveState("saving");
      const res = await fetch("/api/client-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaireType: "standard", questionnaire: payload, autosave: true }),
      });

      if (!res.ok) {
        setQuestionnaireAutoSaveState("error");
        return;
      }

      questionnaireLastSavedRef.current = JSON.stringify(payload);
      setQuestionnaireAutoSaveState("saved");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [loginState, questionnaireType, portalView, payload, submitting, uploadingAssets]);

  const setField = (path: string, value: unknown) => {
    setPayload((current) => updatePath(current, path.split("."), value));
    setQuestionnaireAutoSaveState("idle");
  };

  const setReference = (group: "nicheAccounts" | "staticDesigns" | "reels", index: number, value: string) => {
    setPayload((current) => {
      const next = [...current.taste.references[group]];
      next[index] = value;
      return {
        ...current,
        taste: {
          ...current.taste,
          references: {
            ...current.taste.references,
            [group]: next,
          },
        },
      };
    });
    setQuestionnaireAutoSaveState("idle");
  };

  const addBrandFiles = (files: UploadedBrandAsset[]) => {
    setPayload((current) => ({
      ...current,
      assets: {
        ...current.assets,
        brandFiles: [...current.assets.brandFiles, ...files],
      },
    }));
    setQuestionnaireAutoSaveState("idle");
  };

  const removeBrandFile = (url: string) => {
    setPayload((current) => ({
      ...current,
      assets: {
        ...current.assets,
        brandFiles: current.assets.brandFiles.filter((file) => file.url !== url),
      },
    }));
    setQuestionnaireAutoSaveState("idle");
  };

  const setMonthlyProductField = (index: number, field: keyof MonthlyProductFocus, value: string) => {
    setMonthlyPlan((current) => ({
      ...current,
      products: current.products.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
    }));
  };

  const addMonthlyProduct = () => {
    setMonthlyPlan((current) => ({
      ...current,
      products: [...current.products, emptyMonthlyProductFocus()],
    }));
  };

  const removeMonthlyProduct = (index: number) => {
    setMonthlyPlan((current) => ({
      ...current,
      products: current.products.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addMonthlyProductFiles = (index: number, files: UploadedBrandAsset[]) => {
    setMonthlyPlan((current) => ({
      ...current,
      products: current.products.map((item, itemIndex) =>
        itemIndex === index ? { ...item, files: [...(item.files ?? []), ...files] } : item
      ),
    }));
  };

  const removeMonthlyProductFile = (productIndex: number, url: string) => {
    setMonthlyPlan((current) => ({
      ...current,
      products: current.products.map((item, itemIndex) =>
        itemIndex === productIndex ? { ...item, files: (item.files ?? []).filter((file) => file.url !== url) } : item
      ),
    }));
  };

  const handleAssetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingAssets(true);
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

      addBrandFiles(uploaded);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingAssets(false);
      event.target.value = "";
    }
  };

  const handleMonthlyProductUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setMonthlyUploadingIndex(index);
    setMonthlyError("");

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

      addMonthlyProductFiles(index, uploaded);
    } catch (error) {
      setMonthlyError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setMonthlyUploadingIndex(null);
      event.target.value = "";
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");

    const res = await fetch("/api/client-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setLoginError(data.error ?? "Login failed");
      return;
    }

    const data = (await res.json()) as { clientName?: string | null };
    setClientName(data.clientName ?? username);
    const statusRes = await fetch("/api/client-questionnaire");
    const status = (await statusRes.json().catch(() => ({}))) as {
      questionnaireSubmitted?: boolean;
      questionnaireType?: QuestionnaireType;
      questionnaireDraft?: QuestionnairePayload | null;
      questionnaireDraftType?: QuestionnaireType | null;
    };
    setQuestionnaireType(status.questionnaireType ?? "standard");
    setQuestionnaireSubmitted(Boolean(status.questionnaireSubmitted));
    if (status.questionnaireDraftType === "standard" && status.questionnaireDraft) {
      setPayload(status.questionnaireDraft);
      questionnaireLastSavedRef.current = JSON.stringify(status.questionnaireDraft);
      setQuestionnaireAutoSaveState("saved");
    }
    setPortalView(status.questionnaireSubmitted ? "dashboard" : "questionnaire");
    setLoginState("signed-in");
  };

  const handleLogout = async () => {
    await fetch("/api/client-logout", { method: "POST" });
    setPayload(emptyQuestionnairePayload());
    setMonthlyPlan(emptyQuestionnairePayload().monthlyPlan);
    setMonthlySubmittedAt("");
    setMonthlySaved(false);
    setProjectWorkspace(null);
    setIdeaFeedbackDrafts({});
    setIdeaFeedbackMessage("");
    setSubmitted(false);
    setActiveStep(0);
    setPortalView("dashboard");
    setClientName("");
    setQuestionnaireSubmitted(false);
    setUsername("");
    setPassword("");
    setLoginState("signed-out");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch("/api/client-questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionnaire: payload }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setSubmitError(data.error ?? "Submission failed");
      return;
    }

    questionnaireLastSavedRef.current = JSON.stringify(payload);
    setQuestionnaireAutoSaveState("saved");
    setSubmitted(true);
    setQuestionnaireSubmitted(true);
  };

  const setMonthlyMonth = (month: string) => {
    setMonthlyPlan((current) => ({
      ...current,
      month,
    }));
    setMonthlyError("");
    setMonthlySaved(false);
    setMonthlyAutoSaveState("idle");
    setMonthlyLoading(true);
  };

  const setCalendarNote = (date: string, note: string) => {
    setMonthlyPlan((current) => {
      const existing = current.calendarNotes ?? [];
      const withoutDate = existing.filter((item) => item.date !== date);
      return {
        ...current,
        calendarNotes: note.trim() ? [...withoutDate, { date, note }] : withoutDate,
      };
    });
  };

  const getCalendarNote = (date: string) => {
    return (monthlyPlan.calendarNotes ?? []).find((item) => item.date === date)?.note ?? "";
  };

  const saveMonthlyPlan = async (plan: QuestionnairePayload["monthlyPlan"], options?: { autosave?: boolean }) => {
    if (!hasMonthlyPlanContent(plan)) return null;

    if (options?.autosave) {
      setMonthlyAutoSaveState("saving");
    } else {
      setMonthlySubmitting(true);
      setMonthlySaved(false);
    }
    setMonthlyError("");

    const res = await fetch("/api/client-monthly-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...plan, autosave: Boolean(options?.autosave) }),
    });

    if (!options?.autosave) setMonthlySubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (options?.autosave) {
        setMonthlyAutoSaveState("error");
      } else {
        setMonthlyError(data.error ?? "Monthly plan submission failed");
      }
      return null;
    }

    const data = (await res.json()) as { monthlyPlan?: QuestionnairePayload["monthlyPlan"] };
    const savedPlan = data.monthlyPlan ?? plan;
    monthlyLastSavedRef.current = JSON.stringify(savedPlan);
    if (data.monthlyPlan && !options?.autosave) setMonthlyPlan(data.monthlyPlan);
    setMonthlySubmittedAt(new Date().toISOString());
    if (options?.autosave) {
      setMonthlyAutoSaveState("saved");
    } else {
      setMonthlySaved(true);
      setMonthlyAutoSaveState("saved");
    }
    return savedPlan;
  };

  const handleMonthlySubmit = async () => {
    const savedPlan = await saveMonthlyPlan(monthlyPlan);
    if (!savedPlan && !hasMonthlyPlanContent(monthlyPlan)) {
      setMonthlyError("Add at least one product, service, or calendar note");
    }
  };

  const saveIdeaFeedback = async (ideaId: string, decision: "approved" | "revision") => {
    setIdeaFeedbackSavingId(ideaId);
    setIdeaFeedbackMessage("");

    const res = await fetch("/api/client-project-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ideaId,
        decision,
        comment: ideaFeedbackDrafts[ideaId] ?? "",
      }),
    });

    setIdeaFeedbackSavingId(null);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setIdeaFeedbackMessage(data.error ?? "Could not save your response.");
      return;
    }

    const data = (await res.json()) as { workspace?: ClientProjectWorkspace };
    if (data.workspace) setProjectWorkspace(data.workspace);
    setIdeaFeedbackMessage(decision === "approved" ? "Approved. Thank you." : "Comment sent to Astroshot.");
  };

  const saveVisualApprovalFeedback = async (section: "outfits" | "locations", itemId: string, decision: "approved" | "revision") => {
    setVisualFeedbackSavingId(itemId);
    setVisualFeedbackMessage("");

    const res = await fetch("/api/client-project-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "visual-approval",
        section,
        itemId,
        decision,
        comment: visualFeedbackDrafts[itemId] ?? "",
      }),
    });

    setVisualFeedbackSavingId(null);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setVisualFeedbackMessage(data.error ?? "Could not save your response.");
      return;
    }

    const data = (await res.json()) as { workspace?: ClientProjectWorkspace };
    if (data.workspace) setProjectWorkspace(data.workspace);
    setVisualFeedbackMessage(decision === "approved" ? "Approved. Thank you." : "Comment sent to Astroshot.");
  };

  const toggleModelSelection = (modelId: string) => {
    setModelSelectionDraft((current) => current.includes(modelId) ? current.filter((id) => id !== modelId) : [...current, modelId]);
    setModelSelectionMessage("");
  };

  const saveModelSelection = async () => {
    setModelSelectionSaving(true);
    setModelSelectionMessage("");

    const res = await fetch("/api/client-project-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "model-selection",
        selectedModelIds: modelSelectionDraft,
        notes: modelSelectionNotes,
      }),
    });

    setModelSelectionSaving(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setModelSelectionMessage(data.error ?? "Could not save model selection.");
      return;
    }

    const data = (await res.json()) as { workspace?: ClientProjectWorkspace };
    if (data.workspace) setProjectWorkspace(data.workspace);
    setModelSelectionMessage("Model selection saved.");
  };

  useEffect(() => {
    if (loginState !== "signed-in" || portalView !== "dashboard") return;
    if (monthlyLoading) return;
    if (monthlyUploadingIndex !== null) return;
    if (!hasMonthlyPlanContent(monthlyPlan)) {
      setMonthlyAutoSaveState("idle");
      return;
    }

    const serialized = JSON.stringify(monthlyPlan);
    if (serialized === monthlyLastSavedRef.current) return;

    const timer = window.setTimeout(() => {
      saveMonthlyPlan(monthlyPlan, { autosave: true }).catch(() => {
        setMonthlyAutoSaveState("error");
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [loginState, portalView, monthlyPlan, monthlyUploadingIndex, monthlyLoading]);

  if (loginState === "checking") {
    return <div className="min-h-screen bg-[#050505] text-white" />;
  }

  const ideaProposalItems = projectWorkspace?.ideaProposal.items.filter((idea) => [idea.description, idea.visualUrl, idea.referenceUrl].some((value) => value.trim())) ?? [];
  const moodboardImages = (projectWorkspace?.ideaProposal.moodboard ?? []).filter((image) => image.url.trim());

  if (loginState === "signed-out") {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl items-center">
          <section className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#01F17C]">Astroshot Client Portal</p>
              <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Your monthly content dashboard.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
                A private workspace for monthly priorities, content previews, production notes, and brand details.
              </p>
            </div>

            <form onSubmit={handleLogin} className="rounded-2xl border border-white/10 bg-[#101010] p-6 shadow-2xl shadow-black/30">
              <div className="mb-6">
                <span className="text-xl font-black tracking-tight">
                  ASTRO<span className="text-[#01F17C]">SHOT</span>
                </span>
                <p className="mt-2 text-sm text-white/45">Sign in with the username and password shared by our team.</p>
              </div>

              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/35">Username</label>
              <input className={fieldClass} value={username} onChange={(e) => setUsername(e.target.value)} required />

              <label className="mb-2 mt-4 block text-xs font-bold uppercase tracking-[0.22em] text-white/35">Password</label>
              <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {loginError && <p className="mt-4 text-sm text-red-400">{loginError}</p>}

              <button className="mt-6 w-full rounded-xl bg-[#01F17C] px-5 py-3.5 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                Enter Portal
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className={`client-dashboard min-h-screen bg-[#050505] px-5 py-10 text-white ${lightMode ? "client-light" : ""}`}>
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl items-center justify-center text-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#01F17C]">Brief Received</p>
            <h1 className="text-5xl font-black tracking-tight md:text-6xl">We have the raw material.</h1>
            <p className="mt-6 text-base leading-8 text-white/60">
              The Astroshot team can now turn your answers into visual direction, content pillars, and production ideas.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setPortalView("dashboard");
              }}
              className="mt-8 rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (portalView === "dashboard") {
    const previewSlug = clientPreviewSlug(clientName);
    const selectedMonthOccasions = occasionsForMonth(monthlyPlan.month);
    const selectedMonthCalendarDays = calendarDaysForMonth(monthlyPlan.month);
    const visualApprovalItems = [
      ...(projectWorkspace?.outfitSelection.items ?? []),
      ...(projectWorkspace?.locationSelection.items ?? []),
    ].filter((item) => [item.description, item.imageUrl, ...(item.images ?? []).map((image) => image.url)].some((value) => value.trim()));
    const pendingApprovalCount = [
      ...ideaProposalItems,
      ...visualApprovalItems,
    ].filter((item) => item.clientDecision === "pending").length;
    const activeTimelineCount = (projectWorkspace?.timeline.items ?? []).filter((item) => item.status !== "done").length;
    const dashboardStats = [
      { label: "Monthly items", value: monthlyPlan.products.filter((product) => product.name.trim() || product.details.trim()).length },
      { label: "Pending approvals", value: pendingApprovalCount },
      { label: "Models selected", value: modelSelectionDraft.length },
      { label: "Open timeline steps", value: activeTimelineCount },
    ];
    const nextDashboardAction = !questionnaireSubmitted
      ? "Complete the brand brief so Astroshot has the right context."
      : pendingApprovalCount > 0
        ? "Review pending ideas, outfits, or locations and approve/comment."
        : hasMonthlyPlanContent(monthlyPlan)
          ? "Monthly plan is captured. Add notes only if priorities change."
          : "Add this month's priority products, services, or offers.";
    const renderVisualApprovalClientSection = (
      sectionKey: "outfits" | "locations",
      section: VisualApprovalSection | undefined,
      fallbackTitle: string,
      fallbackIntro: string
    ) => {
      const visibleItems = (section?.items ?? []).filter((item) => [item.description, item.imageUrl, ...(item.images ?? []).map((image) => image.url)].some((value) => value.trim()));
      const isOutfitSection = sectionKey === "outfits";

      return (
        <div>
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">{fallbackTitle}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{section?.title || fallbackTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{section?.intro || fallbackIntro}</p>
            </div>
          </div>

          {projectWorkspaceLoading ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-xl bg-white/[0.04]" />)}</div>
          ) : visibleItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
              No {fallbackTitle.toLowerCase()} options have been shared yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {visibleItems.map((item: VisualApprovalItem, index) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                  {(item.images ?? []).length > 1 ? (
                    <div className="grid gap-2 bg-black/30 p-2 sm:grid-cols-2">
                      {(item.images ?? []).map((image) => (
                        <a key={image.id} href={image.url} target="_blank" className="block overflow-hidden rounded-xl bg-black/30">
                          <span className={isOutfitSection ? "block aspect-[3/4] max-h-64" : "block h-40"}>
                            <img src={image.url} alt="" className={isOutfitSection ? "h-full w-full object-contain" : "h-full w-full object-cover"} />
                          </span>
                          {image.caption && <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/40">{image.caption}</p>}
                        </a>
                      ))}
                    </div>
                  ) : item.imageUrl ? (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      className={isOutfitSection ? "mx-auto block aspect-[3/4] max-h-72 w-full max-w-[220px] bg-black/30" : "block h-48 bg-black/30"}
                    >
                      <img src={item.imageUrl} alt="" className={isOutfitSection ? "h-full w-full object-contain" : "h-full w-full object-cover"} />
                    </a>
                  ) : null}
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">Option {index + 1}</p>
                      {item.clientDecision !== "pending" && (
                        <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                          item.clientDecision === "approved"
                            ? "border-[#01F17C]/30 bg-[#01F17C]/10 text-[#01F17C]"
                            : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                        }`}>
                          {item.clientDecision === "approved" ? "Approved" : "Comment sent"}
                        </span>
                      )}
                    </div>
                    {item.title && <h3 className="text-lg font-black text-white">{item.title}</h3>}
                    {item.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{item.description}</p>}
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Comment</span>
                        <textarea
                          className="min-h-20 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]"
                          placeholder="Write your comment or requested changes..."
                          value={visualFeedbackDrafts[item.id] ?? item.clientComment ?? ""}
                          onChange={(event) => setVisualFeedbackDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                        />
                      </label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={visualFeedbackSavingId === item.id}
                          onClick={() => saveVisualApprovalFeedback(sectionKey, item.id, "approved")}
                          className="rounded-xl bg-[#01F17C] px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={visualFeedbackSavingId === item.id}
                          onClick={() => saveVisualApprovalFeedback(sectionKey, item.id, "revision")}
                          className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white/65 transition-colors hover:border-amber-300/40 hover:text-amber-200 disabled:opacity-50"
                        >
                          Send Comment
                        </button>
                      </div>
                      {item.clientRespondedAt && <p className="mt-3 text-xs text-white/35">Last response: {new Date(item.clientRespondedAt).toLocaleString()}</p>}
                      {(item.feedbackThread ?? []).length > 0 && (
                        <div className="mt-4 space-y-2">
                          {(item.feedbackThread ?? []).map((entry) => (
                            <div key={entry.id} className={`rounded-xl border p-3 ${entry.author === "astroshot" ? "border-[#01F17C]/20 bg-[#01F17C]/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                                {entry.author === "astroshot" ? "Astroshot" : "You"} · {new Date(entry.createdAt).toLocaleString()}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{entry.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {visualFeedbackMessage && <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">{visualFeedbackMessage}</p>}
        </div>
      );
    };

    return (
      <main className={`client-dashboard min-h-screen bg-[#050505] text-white ${lightMode ? "client-light" : ""}`}>
        <div className="border-b border-white/10 bg-[#050505]/90 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-lg font-black tracking-tight">
              ASTRO<span className="text-[#01F17C]">SHOT</span>
            </span>
            <div className="flex items-center gap-3">
              {clientName && (
                <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-white/35 sm:inline">
                  {clientName}
                </span>
              )}
              {renderClientThemeToggle()}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-8">
          <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-white/10 bg-[#101010] p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Client Dashboard</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{clientName || "Client"}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                Monthly planning, content priorities, and shared production details for the active service cycle.
              </p>
            </div>

            <div className="grid gap-3">
              <a
                href={`/client/preview/${previewSlug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#01F17C]/45 hover:bg-[#01F17C]/10"
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Content Preview</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-white">Review calendar</p>
                  {newContentCount > 0 && (
                    <span className="rounded-full bg-[#01F17C] px-2.5 py-0.5 text-[11px] font-black text-black">
                      {newContentCount} new
                    </span>
                  )}
                </div>
              </a>
              <button
                type="button"
                onClick={() => setDashboardTab("questionnaire")}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition-colors hover:border-white/25 hover:bg-white/[0.07]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Questionnaire</p>
                <p className="mt-2 text-lg font-black text-white">
                  {questionnaireSubmitted ? "Update brief" : "Complete brief"}
                </p>
              </button>
            </div>
          </section>

          <section className="mb-8 grid gap-3 md:grid-cols-4">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{stat.label}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-[#01F17C]/25 bg-[#01F17C]/[0.06] p-4 md:col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01F17C]">Next best action</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/70">{nextDashboardAction}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101010] p-5 md:p-8">
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {[
                ["monthly", "Monthly"],
                ["ideas", "Ideas"],
                ["brand", "Brand"],
                ["models", "Models"],
                ["outfits", "Outfits"],
                ["locations", "Locations"],
                ["timeline", "Timeline"],
                ["questionnaire", "Questionnaire"],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDashboardTab(tab as DashboardTab)}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-black uppercase tracking-[0.08em] transition-colors ${
                    dashboardTab === tab
                      ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {dashboardTab === "brand" && (
              <div>
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Brand Identity</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                      {projectWorkspace?.brandIdentity.title || "Brand guidelines"}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                      Brand files, sample links, and production rules for what Astroshot should and should not do.
                    </p>
                  </div>
                </div>

                {projectWorkspaceLoading ? (
                  <div className="mt-6 h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
                ) : !projectWorkspace?.brandIdentity ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
                    No brand identity notes have been shared yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {projectWorkspace.brandIdentity.summary && (
                      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Client notes</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/65">{projectWorkspace.brandIdentity.summary}</p>
                      </section>
                    )}

                    <div className="grid gap-4 lg:grid-cols-2">
                      {(["do", "dont"] as const).map((type) => {
                        const items = projectWorkspace.brandIdentity.guidelines.filter((item) => item.type === type);
                        return (
                          <section key={type} className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <h3 className="flex items-center gap-2 text-xl font-black text-white">
                              <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-base ${type === "do" ? "border-[#01F17C]/35 bg-[#01F17C]/10 text-[#01F17C]" : "border-red-400/35 bg-red-500/10 text-red-300"}`}>
                                {type === "do" ? "✓" : "×"}
                              </span>
                              {type === "do" ? "Do" : "Don't"}
                            </h3>
                            {items.length === 0 ? (
                              <p className="mt-4 text-sm text-white/35">No rules shared yet.</p>
                            ) : (
                              <div className="mt-4 space-y-3">
                                {items.map((item, index) => (
                                  <article key={item.id} className={`grid gap-3 rounded-xl border bg-white/[0.03] p-3 sm:grid-cols-[88px_1fr] ${type === "do" ? "border-[#01F17C]/20" : "border-red-400/20"}`}>
                                    {item.imageUrl && (
                                      <a href={item.imageUrl} target="_blank" className="block overflow-hidden rounded-lg">
                                        <img src={item.imageUrl} alt="" className="h-20 w-full object-cover sm:h-full" />
                                      </a>
                                    )}
                                    <div className={item.imageUrl ? "" : "sm:col-span-2"}>
                                      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${type === "do" ? "bg-[#01F17C]/12 text-[#01F17C]" : "bg-red-500/12 text-red-300"}`}>
                                          {type === "do" ? "✓" : "×"}
                                        </span>
                                        #{index + 1}
                                      </p>
                                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/70">{item.text}</p>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>

                    {projectWorkspace.brandIdentity.sampleLinks.length > 0 && (
                      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <h3 className="text-xl font-black text-white">Sample links the client likes</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {projectWorkspace.brandIdentity.sampleLinks.map((link) => (
                            <a key={link.id} href={link.url || "#"} target="_blank" className="rounded-xl border border-white/10 bg-black/20 p-3 hover:border-[#01F17C]/35">
                              <p className="text-sm font-black text-white">{link.title}</p>
                              {link.notes && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">{link.notes}</p>}
                              {link.url && <p className="mt-3 truncate text-xs font-bold text-[#01F17C]">{link.url}</p>}
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    {projectWorkspace.brandIdentity.files.length > 0 && (
                      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <h3 className="text-xl font-black text-white">Logo, brand identity, and font files</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {projectWorkspace.brandIdentity.files.map((file) => (
                            <a key={file.id} href={file.url} target="_blank" className="rounded-xl border border-white/10 bg-black/20 p-3 hover:border-[#01F17C]/35">
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#01F17C]">{file.fileType.replace("_", " ")}</p>
                              <p className="mt-1 truncate text-sm font-bold text-white">{file.label || file.fileName || "Brand file"}</p>
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            )}

            {dashboardTab === "ideas" && (
              <div>
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Idea Proposal</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                      {projectWorkspace?.ideaProposal.title || "Content ideas"}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                      {projectWorkspace?.ideaProposal.intro || "Video and post ideas prepared by the Astroshot team will appear here."}
                    </p>
                  </div>
                </div>

                {projectWorkspaceLoading ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" />)}</div>
                ) : !projectWorkspace || (!ideaProposalItems.length && !moodboardImages.length) ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
                    No idea proposal has been shared yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {moodboardImages.length > 0 && (
                      <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mb-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Moodboard</p>
                            <h3 className="mt-2 text-2xl font-black text-white">Visual direction</h3>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {moodboardImages.map((image) => (
                            <a key={image.id} href={image.url} target="_blank" className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                              <img src={image.url} alt="" className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                              {image.caption && <p className="px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/45">{image.caption}</p>}
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {ideaProposalItems.map((idea, index) => (
                      <article key={idea.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                        {idea.visualUrl ? (
                          <a href={idea.visualUrl} target="_blank" className="block h-44 bg-black/30 md:h-48">
                            <img src={idea.visualUrl} alt="" className="h-full w-full object-cover" />
                          </a>
                        ) : null}
                        <div className="p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">Post {index + 1}</p>
                            {idea.clientDecision !== "pending" && (
                              <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                                idea.clientDecision === "approved"
                                  ? "border-[#01F17C]/30 bg-[#01F17C]/10 text-[#01F17C]"
                                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                              }`}>
                                {idea.clientDecision === "approved" ? "Approved" : "Comment sent"}
                              </span>
                            )}
                          </div>
                          {idea.title && <h3 className="text-lg font-black text-white">{idea.title}</h3>}
                          {idea.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{idea.description}</p>}
                          {idea.referenceUrl && (
                            <a href={idea.referenceUrl} target="_blank" className="mt-3 inline-flex rounded-lg border border-[#01F17C]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#01F17C] hover:bg-[#01F17C]/10">
                              View reference
                            </a>
                          )}
                          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                            <label className="block">
                              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Comment</span>
                              <textarea
                                className="min-h-20 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]"
                                placeholder="Write your comment or requested changes..."
                                value={ideaFeedbackDrafts[idea.id] ?? idea.clientComment ?? ""}
                                onChange={(event) => setIdeaFeedbackDrafts((current) => ({ ...current, [idea.id]: event.target.value }))}
                              />
                            </label>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={ideaFeedbackSavingId === idea.id}
                                onClick={() => saveIdeaFeedback(idea.id, "approved")}
                                className="rounded-xl bg-[#01F17C] px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-white disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={ideaFeedbackSavingId === idea.id}
                                onClick={() => saveIdeaFeedback(idea.id, "revision")}
                                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white/65 transition-colors hover:border-amber-300/40 hover:text-amber-200 disabled:opacity-50"
                              >
                                Send Comment
                              </button>
                            </div>
                            {idea.clientRespondedAt && (
                              <p className="mt-3 text-xs text-white/35">Last response: {new Date(idea.clientRespondedAt).toLocaleString()}</p>
                            )}
                            {(idea.feedbackThread ?? []).length > 0 && (
                              <div className="mt-4 space-y-2">
                                {(idea.feedbackThread ?? []).map((entry) => (
                                  <div key={entry.id} className={`rounded-xl border p-3 ${entry.author === "astroshot" ? "border-[#01F17C]/20 bg-[#01F17C]/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                                      {entry.author === "astroshot" ? "Astroshot" : "You"} · {new Date(entry.createdAt).toLocaleString()}
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{entry.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                    </div>
                  </div>
                )}
                {ideaFeedbackMessage && <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">{ideaFeedbackMessage}</p>}
              </div>
            )}

            {dashboardTab === "models" && (
              <div>
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Model Selection</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Choose your models</h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                      Select the AI models you want Astroshot to use for your upcoming content direction.
                    </p>
                  </div>
                  {projectWorkspace?.modelSelection.submittedAt && (
                    <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                      Last saved {new Date(projectWorkspace.modelSelection.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {modelsLoading ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-xl bg-white/[0.04]" />)}</div>
                ) : availableModels.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
                    No models are available yet.
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {availableModels.map((model) => {
                        const selected = modelSelectionDraft.includes(model.id);
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => toggleModelSelection(model.id)}
                            className={`group flex items-center gap-4 rounded-xl border p-3 text-left transition-colors ${
                              selected
                                ? "border-[#01F17C]/70 bg-[#01F17C]/10"
                                : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white ${selected ? "border-[#01F17C] shadow-[0_0_20px_rgba(1,241,124,0.18)]" : "border-white/15"}`}>
                              <img src={model.previewUrl || model.url} alt="" className="h-full w-full object-cover object-top" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-black ${selected ? "text-[#01F17C]" : "text-white"}`}>{model.name || "Model"}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">{selected ? "Selected" : "Tap to select"}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Optional notes</span>
                        <textarea
                          className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]"
                          placeholder="Example: Prefer Model C for lifestyle videos, avoid formal looks..."
                          value={modelSelectionNotes}
                          onChange={(event) => {
                            setModelSelectionNotes(event.target.value);
                            setModelSelectionMessage("");
                          }}
                        />
                      </label>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-white/45">{modelSelectionDraft.length} model{modelSelectionDraft.length === 1 ? "" : "s"} selected</p>
                        <button
                          type="button"
                          onClick={saveModelSelection}
                          disabled={modelSelectionSaving}
                          className="rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition-colors hover:bg-white disabled:opacity-50"
                        >
                          {modelSelectionSaving ? "Saving..." : "Save Selection"}
                        </button>
                      </div>
                      {modelSelectionMessage && <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">{modelSelectionMessage}</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {dashboardTab === "outfits" && renderVisualApprovalClientSection(
              "outfits",
              projectWorkspace?.outfitSelection,
              "Outfit Selection",
              "Review the outfit options prepared by the Astroshot team, then approve or send a comment."
            )}

            {dashboardTab === "locations" && renderVisualApprovalClientSection(
              "locations",
              projectWorkspace?.locationSelection,
              "Location Selection",
              "Review the location options prepared by the Astroshot team, then approve or send a comment."
            )}

            {dashboardTab === "timeline" && (
              <div>
                <div className="border-b border-white/10 pb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Project Timeline</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                    {projectWorkspace?.timeline.title || "Production timeline"}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                    Track what is being prepared, what is waiting for approval, and what comes next.
                  </p>
                </div>

                {projectWorkspaceLoading ? (
                  <div className="mt-6 space-y-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />)}</div>
                ) : !projectWorkspace?.timeline.items.length ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
                    No timeline has been shared yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {projectWorkspace.timeline.items.map((item, index) => (
                      <article key={item.id} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[120px_1fr_auto] md:items-start">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">Step {index + 1}</p>
                          <p className="mt-2 text-sm font-black text-white">{item.date || "Date TBC"}</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white">{item.title}</h3>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/60">{item.description || "-"}</p>
                        </div>
                        <span className="w-fit rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{item.status.replace("_", " ")}</span>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {dashboardTab === "questionnaire" && (
              <div>
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Questionnaire</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                      {questionnaireSubmitted ? "Update your brand brief" : "Complete your brand brief"}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                      Use this when priorities, products, references, brand files, or approval details change. Your answers auto-save while you edit.
                    </p>
                  </div>
                  <span className={`w-fit rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] ${
                    questionnaireSubmitted
                      ? "border-[#01F17C]/20 bg-[#01F17C]/10 text-[#01F17C]"
                      : "border-amber-400/25 bg-amber-400/10 text-amber-200"
                  }`}>
                    {questionnaireSubmitted ? "Brief submitted" : "Brief pending"}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-2xl font-black tracking-tight">What clients can update</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        "Business and contact details",
                        "Goals and target audience",
                        "Visual taste and references",
                        "Content preferences",
                        "Brand files and asset links",
                        "Notes for the Astroshot team",
                      ].map((item) => (
                        <div key={item} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/65">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#01F17C]/20 bg-[#01F17C]/[0.06] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">Client action</p>
                    <p className="mt-3 text-sm leading-7 text-white/65">
                      Open the questionnaire, adjust the answers, then submit the updated brief.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setPortalView("questionnaire");
                      }}
                      className="mt-5 w-full rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white"
                    >
                      {questionnaireSubmitted ? "Update Questionnaire" : "Start Questionnaire"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {dashboardTab === "monthly" && (
            <>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {clientMonthOptions.map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setMonthlyMonth(month)}
                  className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-black transition-colors ${
                    monthlyPlan.month === month
                      ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">{monthlyPlan.month} Focus</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Products / services to work on</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                  Add the exact products, services, offers, or launches Astroshot should prioritize this month.
                </p>
              </div>
              {monthlySubmittedAt && (
                <p className="rounded-xl border border-[#01F17C]/20 bg-[#01F17C]/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#01F17C]">
                  Saved before
                </p>
              )}
              {monthlyAutoSaveState !== "idle" && (
                <p className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] ${
                  monthlyAutoSaveState === "error"
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-white/10 bg-white/[0.04] text-white/45"
                }`}>
                  {monthlyAutoSaveState === "saving" ? "Auto-saving..." : monthlyAutoSaveState === "saved" ? "Auto-saved" : "Auto-save failed"}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-[#01F17C]/20 bg-[#01F17C]/[0.06] p-5">
                <label className="block max-w-xs">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Planning month</span>
                  <input
                    className={fieldClass}
                    value={monthlyPlan.month}
                    onChange={(e) => setMonthlyMonth(e.target.value)}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#01F17C]">Kuwait Calendar</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight">Occasions and notes</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">
                      Highlighted dates are Kuwait public moments and key planning dates. Add notes to tell Astroshot what to prepare for a specific day.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen((current) => !current)}
                    className="w-fit rounded-xl border border-[#01F17C]/40 px-5 py-3 text-sm font-black text-[#01F17C] transition-colors hover:border-[#01F17C] hover:bg-[#01F17C]/10"
                  >
                    {calendarOpen ? "Close Calendar" : "Open Calendar"}
                  </button>
                </div>

                {!calendarOpen && selectedMonthOccasions.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedMonthOccasions.map((occasion) => (
                      <span key={occasion.date} className="rounded-lg border border-[#01F17C]/20 bg-[#01F17C]/10 px-3 py-1.5 text-xs font-bold text-[#01F17C]">
                        {occasion.title}
                      </span>
                    ))}
                  </div>
                )}

                {calendarOpen && (
                  <div className="mt-5">
                    {selectedMonthOccasions.length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {selectedMonthOccasions.map((occasion) => (
                          <span key={occasion.date} className="rounded-lg border border-[#01F17C]/20 bg-[#01F17C]/10 px-3 py-1.5 text-xs font-bold text-[#01F17C]">
                            {occasion.title}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-3 md:hidden">
                      {selectedMonthCalendarDays.flatMap((day) => day ? [day] : []).map((day) => {
                        const date = isoDate(day);
                        const occasion = selectedMonthOccasions.find((item) => item.date === date);
                        return (
                          <div key={date} className={`rounded-xl border p-4 ${occasion ? "border-[#01F17C]/35 bg-[#01F17C]/10" : "border-white/10 bg-black/20"}`}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                                  {day.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
                                </p>
                                <p className="mt-1 text-2xl font-black text-white">{day.getUTCDate()}</p>
                              </div>
                              {occasion && <span className="max-w-[58%] rounded-lg border border-[#01F17C]/20 bg-[#01F17C]/10 px-3 py-1.5 text-right text-xs font-bold leading-5 text-[#01F17C]">{occasion.title}</span>}
                            </div>
                            <textarea
                              className="h-24 w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-[#01F17C]"
                              placeholder="Add note"
                              value={getCalendarNote(date)}
                              onChange={(e) => setCalendarNote(date, e.target.value)}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden md:block">
                      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {selectedMonthCalendarDays.map((day, index) => {
                          if (!day) return <div key={`blank-${index}`} className="min-h-24 rounded-xl border border-transparent" />;
                          const date = isoDate(day);
                          const occasion = selectedMonthOccasions.find((item) => item.date === date);
                          return (
                            <div key={date} className={`min-h-32 rounded-xl border p-2 ${occasion ? "border-[#01F17C]/35 bg-[#01F17C]/10" : "border-white/10 bg-black/20"}`}>
                              <div className="mb-2 flex min-h-8 items-start justify-between gap-2">
                                <span className="text-sm font-black text-white">{day.getUTCDate()}</span>
                                {occasion && <span className="text-[10px] font-bold leading-4 text-[#01F17C]">{occasion.title}</span>}
                              </div>
                              <textarea
                                className="h-20 w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-white outline-none placeholder:text-white/20 focus:border-[#01F17C]"
                                placeholder="Note"
                                value={getCalendarNote(date)}
                                onChange={(e) => setCalendarNote(date, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {monthlyPlan.products.map((product, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">Item {index + 1}</p>
                        <h3 className="mt-1 text-xl font-black tracking-tight">Product / service focus</h3>
                      </div>
                      {monthlyPlan.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMonthlyProduct(index)}
                          className="w-fit rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45 transition-colors hover:border-red-400/40 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Name</span>
                        <input
                          className={fieldClass}
                          placeholder="Example: August abaya collection"
                          value={product.name}
                          onChange={(e) => setMonthlyProductField(index, "name", e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Type</span>
                        <select className={fieldClass} value={product.type} onChange={(e) => setMonthlyProductField(index, "type", e.target.value)}>
                          {monthlyProductTypes.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Priority</span>
                        <select className={fieldClass} value={product.priority} onChange={(e) => setMonthlyProductField(index, "priority", e.target.value)}>
                          {monthlyPriorityOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Main objective</span>
                        <select className={fieldClass} value={product.objective} onChange={(e) => setMonthlyProductField(index, "objective", e.target.value)}>
                          <option value="">Choose one</option>
                          {monthlyObjectiveOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Details we should know</span>
                        <textarea
                          className={textAreaClass}
                          placeholder="Key features, colors, sizes, audience, what makes it different..."
                          value={product.details}
                          onChange={(e) => setMonthlyProductField(index, "details", e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Offer / price / CTA</span>
                        <textarea
                          className={textAreaClass}
                          placeholder="Discount, bundle, starting price, WhatsApp CTA, shop link..."
                          value={product.offer}
                          onChange={(e) => setMonthlyProductField(index, "offer", e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Important date</span>
                        <input
                          className={fieldClass}
                          placeholder="Launch date, shoot deadline, event date..."
                          value={product.keyDate}
                          onChange={(e) => setMonthlyProductField(index, "keyDate", e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Assets / references</span>
                        <input
                          className={fieldClass}
                          placeholder="Drive folder, product photos, moodboard, reference link..."
                          value={product.assetNotes}
                          onChange={(e) => setMonthlyProductField(index, "assetNotes", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Files for this item</span>
                          <p className="text-xs leading-5 text-white/40">Upload product photos, videos, PDFs, catalogs, or reference files.</p>
                        </div>
                        <label className="inline-flex w-fit cursor-pointer items-center justify-center rounded-xl border border-[#01F17C]/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#01F17C] transition-colors hover:bg-[#01F17C]/10">
                          {monthlyUploadingIndex === index ? "Uploading..." : "Upload"}
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.zip,.ai,.eps,.mp4,.mov"
                            onChange={(event) => handleMonthlyProductUpload(index, event)}
                            disabled={monthlyUploadingIndex !== null}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div className="mt-4 space-y-2">
                        {(product.files ?? []).length === 0 ? (
                          <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No files uploaded for this item yet.</p>
                        ) : (
                          (product.files ?? []).map((file) => (
                            <div key={file.url} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-white">{file.name}</p>
                                <p className="text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                              </div>
                              <div className="flex gap-2">
                                <a href={file.url} target="_blank" className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-[#01F17C] hover:bg-white/10">
                                  View
                                </a>
                                <button
                                  type="button"
                                  onClick={() => removeMonthlyProductFile(index, file.url)}
                                  className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMonthlyProduct}
                className="rounded-xl border border-[#01F17C]/40 px-5 py-3 text-sm font-black text-[#01F17C] transition-colors hover:border-[#01F17C] hover:bg-[#01F17C]/10"
              >
                Add another product or service
              </button>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Monthly planning notes</span>
                <textarea
                  className={textAreaClass}
                  placeholder="What should Astroshot avoid, push harder, or keep in mind for this month?"
                  value={monthlyPlan.notes}
                  onChange={(e) => setMonthlyPlan((current) => ({ ...current, notes: e.target.value }))}
                />
              </label>

              {monthlyError && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{monthlyError}</p>}
              {monthlySaved && <p className="rounded-xl border border-[#01F17C]/20 bg-[#01F17C]/10 px-4 py-3 text-sm font-bold text-[#01F17C]">{monthlyPlan.month} focus saved.</p>}

              <div className="border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handleMonthlySubmit}
                  disabled={monthlySubmitting}
                  className="rounded-xl bg-[#01F17C] px-6 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white disabled:opacity-50"
                >
                  {monthlySubmitting ? "Saving..." : `Save ${monthlyPlan.month} Focus`}
                </button>
              </div>
            </div>
            </>
            )}
          </section>
        </div>
      </main>
    );
  }

  if (questionnaireType === "brand") {
    return (
      <BrandQuestionnaire
        clientName={clientName}
        onSubmitted={() => {
          setSubmitted(true);
          setQuestionnaireSubmitted(true);
        }}
      />
    );
  }

  if (questionnaireType === "explanatory_animation") {
    return (
      <ExplanatoryAnimationQuestionnaire
        clientName={clientName}
        onSubmitted={() => {
          setSubmitted(true);
          setQuestionnaireSubmitted(true);
        }}
      />
    );
  }

  if (questionnaireType === "media_buying_clinic") {
    return (
      <MediaBuyingClinicQuestionnaire
        clientName={clientName}
        onSubmitted={() => {
          setSubmitted(true);
          setQuestionnaireSubmitted(true);
        }}
      />
    );
  }

  const section = questionnaireSections[activeStep];

  return (
    <main className={`client-dashboard min-h-screen bg-[#050505] text-white ${lightMode ? "client-light" : ""}`}>
      <div className="border-b border-white/10 bg-[#050505]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-black tracking-tight">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </span>
          <div className="flex items-center gap-3">
            {clientName && (
              <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-white/35 sm:inline">
                {clientName}
              </span>
            )}
            {questionnaireAutoSaveState !== "idle" && (
              <span className={`hidden rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] sm:inline ${
                questionnaireAutoSaveState === "error"
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-white/10 bg-white/[0.04] text-white/40"
              }`}>
                {questionnaireAutoSaveState === "saving"
                  ? "Auto-saving"
                  : questionnaireAutoSaveState === "saved"
                    ? "Auto-saved"
                : "Auto-save failed"}
              </span>
            )}
            {renderClientThemeToggle()}
            <button
              type="button"
              onClick={() => setPortalView("dashboard")}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#01F17C] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2">
            {questionnaireSections.map((item, index) => (
              <button
                key={item.id}
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
                {[
                  ["Business name", "identity.businessName", "Kuwait Coffee Co."],
                  ["Contact name", "identity.contactName", "Full name"],
                  ["Email", "identity.email", "name@company.com"],
                  ["Phone", "identity.phone", "+965"],
                  ["Website", "identity.website", "https://"],
                  ["Instagram", "identity.instagram", "@brand"],
                  ["Industry", "identity.industry", "F&B, clinic, automotive..."],
                  ["Location", "identity.location", "Kuwait / GCC"],
                ].map(([label, path, placeholder]) => (
                  <label key={path} className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
                    <input
                      className={fieldClass}
                      placeholder={placeholder}
                      value={getStringValue(payload, path)}
                      onChange={(e) => setField(path, e.target.value)}
                      required={["identity.businessName", "identity.contactName", "identity.email"].includes(path)}
                    />
                  </label>
                ))}
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Primary goal</span>
                  <select className={fieldClass} value={payload.strategy.primaryGoal} onChange={(e) => setField("strategy.primaryGoal", e.target.value)} required>
                    <option value="">Choose the main business outcome</option>
                    {goalOptions.map((goal) => <option key={goal}>{goal}</option>)}
                  </select>
                </label>

                <div>
                  <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Secondary goals</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setField("strategy.secondaryGoals", toggleValue(payload.strategy.secondaryGoals, goal))}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                          payload.strategy.secondaryGoals.includes(goal)
                            ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                            : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Ideal customer</span><textarea className={textAreaClass} value={payload.strategy.audience} onChange={(e) => setField("strategy.audience", e.target.value)} /></label>
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Problem you solve</span><textarea className={textAreaClass} value={payload.strategy.customerProblem} onChange={(e) => setField("strategy.customerProblem", e.target.value)} /></label>
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Why should customers choose you instead of a competitor?</span><textarea className={textAreaClass} value={payload.strategy.competitiveReason} onChange={(e) => setField("strategy.competitiveReason", e.target.value)} /></label>
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Best sellers or key services</span><textarea className={textAreaClass} value={payload.strategy.bestSellers} onChange={(e) => setField("strategy.bestSellers", e.target.value)} /></label>
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Current content challenge</span><textarea className={textAreaClass} value={payload.strategy.currentChallenge} onChange={(e) => setField("strategy.currentChallenge", e.target.value)} /></label>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["If your brand lived somewhere, where is it?", "taste.world", ["A quiet island", "A sharp city", "A luxury resort", "A creative studio"]],
                    ["Which visual style feels closest to your brand?", "taste.room", ["Clean Modern", "Bold & Colorful", "Prestige Luxury", "Nostalgic Vintage"]],
                    ["What energy should people feel?", "taste.energy", ["Calm premium", "Bold and loud", "Warm and human", "Fast and viral"]],
                  ].map(([label, path, options]) => (
                    <div key={path as string}>
                      <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label as string}</span>
                      <div className="space-y-2">
                        {(options as string[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setField(path as string, option)}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                              getStringValue(payload, path as string) === option
                                ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                                : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">What should we avoid visually or tonally?</span>
                  <textarea className={textAreaClass} value={payload.taste.avoid} onChange={(e) => setField("taste.avoid", e.target.value)} />
                </label>

                <div className="grid gap-5 md:grid-cols-3">
                  {[
                    ["Favorite accounts in your niche", "nicheAccounts", "@account or profile link"],
                    ["Static post/design reference links", "staticDesigns", "Post/design link"],
                    ["Reel/video reference links", "reels", "Reel/video link"],
                  ].map(([label, group, placeholder]) => (
                    <div key={group}>
                      <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
                      <div className="space-y-2">
                        {[0, 1, 2].map((index) => (
                          <input
                            key={index}
                            className={fieldClass}
                            placeholder={index === 0 ? placeholder : "Optional link"}
                            value={payload.taste.references[group as "nicheAccounts" | "staticDesigns" | "reels"][index]}
                            onChange={(e) => setReference(group as "nicheAccounts" | "staticDesigns" | "reels", index, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Content directions you want</span>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {formatOptions.map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setField("content.formats", toggleValue(payload.content.formats, format))}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                          payload.content.formats.includes(format)
                            ? "border-[#01F17C]/60 bg-[#01F17C]/10 text-[#01F17C]"
                            : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Comfort showing faces", "content.faceComfort", ["Yes, show people", "Sometimes", "Prefer product/location", "Not sure yet"]],
                    ["Shooting access", "content.shootingAccess", ["Anytime", "Monthly shoot days", "Limited access", "Need remote content"]],
                    ["Approval style", "content.approvalStyle", ["Fast approvals", "Need internal review", "Multiple stakeholders", "Hands-off, trust Astroshot"]],
                  ].map(([label, path, options]) => (
                    <label key={path as string} className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label as string}</span>
                      <select className={fieldClass} value={getStringValue(payload, path as string)} onChange={(e) => setField(path as string, e.target.value)}>
                        <option value="">Choose one</option>
                        {(options as string[]).map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Upcoming offers, launches, or events</span><textarea className={textAreaClass} value={payload.content.offers} onChange={(e) => setField("content.offers", e.target.value)} /></label>
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Anything else the team should know?</span><textarea className={textAreaClass} value={payload.content.notes} onChange={(e) => setField("content.notes", e.target.value)} /></label>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Branding files</span>
                      <p className="text-sm leading-7 text-white/55">
                        Upload logos, brand guidelines, PDF brand books, SVG/PNG marks, or zipped brand folders.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-[#050505] transition-colors hover:bg-white">
                      {uploadingAssets ? "Uploading..." : "Upload Files"}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.zip,.ai,.eps"
                        onChange={handleAssetUpload}
                        disabled={uploadingAssets}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {uploadError && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{uploadError}</p>}

                  <div className="mt-5 space-y-2">
                    {payload.assets.brandFiles.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/35">
                        No brand files uploaded yet.
                      </p>
                    ) : (
                      payload.assets.brandFiles.map((file) => (
                        <div key={file.url} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">{file.name}</p>
                            <p className="text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                          </div>
                          <div className="flex gap-2">
                            <a href={file.url} target="_blank" className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-[#01F17C] hover:bg-white/10">
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => removeBrandFile(file.url)}
                              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Drive link for asset library</span>
                  <input
                    className={fieldClass}
                    placeholder="Google Drive / Dropbox / WeTransfer folder link"
                    value={payload.assets.driveLink}
                    onChange={(e) => setField("assets.driveLink", e.target.value)}
                  />
                  <p className="mt-2 text-xs leading-6 text-white/35">
                    Use this for previous photography, existing videos, raw content, product shots, menus, catalogs, or campaign material.
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">Asset notes</span>
                  <textarea
                    className={textAreaClass}
                    placeholder="Example: use the new logo only, avoid old Ramadan photos, product photos are inside folder 03..."
                    value={payload.assets.notes}
                    onChange={(e) => setField("assets.notes", e.target.value)}
                  />
                </label>
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
            {activeStep < questionnaireSections.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(Math.min(questionnaireSections.length - 1, activeStep + 1))}
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
                {submitting ? "Submitting..." : "Submit Brief"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
