"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase, type ContactSubmission } from "@/lib/supabase";
import type { BrandQuestionnairePayload, ExplanatoryAnimationQuestionnairePayload, QuestionnairePayload } from "@/lib/client-questionnaire";
import type { TeamAccount } from "@/lib/access-control";

type AnyQuestionnaire = QuestionnairePayload | BrandQuestionnairePayload | ExplanatoryAnimationQuestionnairePayload | undefined;

type QuestionnaireRecord = ContactSubmission & {
  parsed?: {
    type: string;
    submittedBy?: string;
    submittedAt?: string;
    summary?: string;
    questionnaire?: QuestionnairePayload | BrandQuestionnairePayload | ExplanatoryAnimationQuestionnairePayload;
  };
};

function parseSubmission(submission: ContactSubmission): QuestionnaireRecord {
  try {
    return { ...submission, parsed: JSON.parse(submission.message) };
  } catch {
    return submission;
  }
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/35">{title}</p>
      {clean.length === 0 ? (
        <p className="text-sm text-white/35">-</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {clean.map((item) => (
            <span key={item} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailBlock({ title, value }: { title: string; value?: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/35">{title}</p>
      <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75">
        {value?.trim() || "-"}
      </p>
    </div>
  );
}

function isExplainerQuestionnaire(q: AnyQuestionnaire): q is ExplanatoryAnimationQuestionnairePayload {
  return Boolean(q && "feature" in q && "message" in q && "video" in q);
}

function isBrandQuestionnaire(q: AnyQuestionnaire): q is BrandQuestionnairePayload {
  return Boolean(q && "competition" in q && "proof" in q && "production" in q);
}

function questionnaireLabel(submission: QuestionnaireRecord) {
  const q = submission.parsed?.questionnaire;
  if (isExplainerQuestionnaire(q)) return q.feature.productFeatureName || "Explainer Animation";
  if (isBrandQuestionnaire(q)) return q.goals?.primaryGoal || q.identity?.businessName || "Brand Questionnaire";
  return q?.strategy?.primaryGoal ?? "Questionnaire";
}

export default function AdminQuestionnairesPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<QuestionnaireRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }
      const me = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (me.ok) {
        const data = (await me.json()) as { account: TeamAccount };
        setCanDelete(Boolean(data.account.permissions.canManageAccess));
      }
      loadQuestionnaires();
    });
  }, [router]);

  const loadQuestionnaires = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("service", "Client Questionnaire")
      .order("created_at", { ascending: false });

    setSubmissions(((data as ContactSubmission[]) ?? []).map(parseSubmission));
    setLoading(false);
  };

  const updateStatus = async (id: string, status: ContactSubmission["status"]) => {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    setSubmissions((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const deleteSubmission = async (id: string) => {
    if (!canDelete) return;
    const confirmed = window.confirm("Delete this questionnaire permanently?");
    if (!confirmed) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;
    setSubmissions((prev) => prev.filter((submission) => submission.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const exportCSV = () => {
    const rows = [
      ["Business", "Contact", "Email", "Primary Goal", "Why Choose You", "Visual World", "Formats", "Asset Drive", "Brand Files", "Submitted"],
      ...submissions.map((submission) => {
        const q = submission.parsed?.questionnaire;
        const isExplainer = isExplainerQuestionnaire(q);
        const isBrand = isBrandQuestionnaire(q);
        return [
          submission.company ?? "",
          submission.name,
          submission.email ?? "",
          isExplainer ? q.feature.productFeatureName : isBrand ? q.goals.primaryGoal : q?.strategy?.primaryGoal ?? "",
          isExplainer ? q.feature.uniqueSellingPoint : isBrand ? q.competition.advantage : q?.strategy?.competitiveReason ?? "",
          isExplainer ? q.video.mode : isBrand ? q.goals.tone : q?.taste?.world ?? "",
          isExplainer ? q.video.language : isBrand ? q.goals.language : q?.content?.formats.join(", ") ?? "",
          q?.assets?.driveLink ?? "",
          isExplainer ? q.assets?.featureScreenshots.map((file) => file.url).join(" | ") : isBrand ? q.assets?.brandFiles.map((file) => file.url).join(" | ") : q?.assets?.brandFiles.map((file) => file.url).join(" | ") ?? "",
          new Date(submission.created_at).toLocaleString(),
        ];
      }),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `client-questionnaires-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => ({
    total: submissions.length,
    new: submissions.filter((item) => item.status === "new").length,
  }), [submissions]);

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Client Questionnaires"
        actions={
          <button onClick={exportCSV} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
            Export CSV
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-white">{counts.total}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Total briefs</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-[#01F17C]">{counts.new}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">New briefs</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-white">/client</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Client portal path</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 rounded-2xl bg-[#111] animate-pulse" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-12 text-center text-sm text-[#555]">No client questionnaires yet.</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const q = submission.parsed?.questionnaire;
            return (
              <article key={submission.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <button
                  onClick={() => {
                    setExpanded(expanded === submission.id ? null : submission.id);
                    if (submission.status === "new") updateStatus(submission.id, "read");
                  }}
                  className="flex w-full flex-col gap-4 p-5 text-left transition-colors hover:bg-white/[0.03] md:flex-row md:items-center"
                >
                  <div className="flex-1">
                    <p className="text-lg font-black text-white">{submission.company ?? submission.name}</p>
                    <p className="mt-1 text-sm text-white/45">{submission.name} / {submission.email ?? "No email"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-lg border border-[#01F17C]/20 bg-[#01F17C]/10 px-3 py-1.5 text-xs font-bold text-[#01F17C]">
                      {questionnaireLabel(submission)}
                    </span>
                    <StatusBadge status={submission.status} />
                    <span className="text-xs text-white/35">{new Date(submission.created_at).toLocaleDateString()}</span>
                  </div>
                </button>

                {expanded === submission.id && (
                  <div className="border-t border-white/10 bg-[#0b0b0b] p-5">
                    {!q ? (
                      <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-xs text-white/60">{submission.message}</pre>
                    ) : isExplainerQuestionnaire(q) ? (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <DetailBlock title="Industry" value={q.identity.industry} />
                          <DetailBlock title="Website" value={q.identity.website} />
                          <DetailBlock title="Phone" value={q.identity.phone} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Product / feature" value={q.feature.productFeatureName} />
                          <DetailBlock title="Unique selling point" value={q.feature.uniqueSellingPoint} />
                          <DetailBlock title="Feature explanation" value={q.feature.explanation} />
                          <DetailBlock title="Target audience" value={q.feature.targetAudience} />
                          <DetailBlock title="Desired action" value={q.feature.desiredAction} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Points to highlight" value={q.message.highlights} />
                          <DetailBlock title="Customer pain / confusion" value={q.message.customerPain} />
                          <DetailBlock title="Proof points" value={q.message.proofPoints} />
                          <DetailBlock title="Must include" value={q.message.mustInclude} />
                          <DetailBlock title="Must avoid" value={q.message.mustAvoid} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <DetailBlock title="Mode" value={q.video.mode} />
                          <DetailBlock title="Language" value={q.video.language} />
                          <DetailBlock title="Tone" value={q.video.tone} />
                          <DetailBlock title="Duration" value={q.video.duration} />
                        </div>
                        <DetailBlock title="References" value={q.video.references} />

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Screenshots & assets</p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailBlock title="Drive link" value={q.assets?.driveLink} />
                            <DetailBlock title="Asset notes" value={q.assets?.notes} />
                          </div>

                          <div className="mt-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Uploaded screenshots</p>
                            {!q.assets?.featureScreenshots?.length ? (
                              <p className="text-sm text-white/35">-</p>
                            ) : (
                              <div className="grid gap-2 md:grid-cols-2">
                                {q.assets.featureScreenshots.map((file) => (
                                  <a key={file.url} href={file.url} target="_blank" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-[#01F17C] hover:bg-white/[0.04]">
                                    <span className="block truncate">{file.name}</span>
                                    <span className="mt-1 block text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(submission.id, "read")} className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20">Mark Read</button>
                          <button onClick={() => updateStatus(submission.id, "replied")} className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/20">Mark Replied</button>
                          {canDelete && (
                            <button onClick={() => deleteSubmission(submission.id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20">Delete</button>
                          )}
                        </div>
                      </div>
                    ) : isBrandQuestionnaire(q) ? (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                          <DetailBlock title="Industry" value={q.identity.industry} />
                          <DetailBlock title="Website" value={q.identity.website} />
                          <DetailBlock title="Location" value={q.identity.location} />
                          <DetailBlock title="Phone" value={q.identity.phone} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <DetailBlock title="Years operating" value={q.identity.yearsOperating} />
                          <DetailBlock title="Team size" value={q.identity.teamSize} />
                          <DetailBlock title="Primary goal" value={q.goals.primaryGoal} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Services" value={q.identity.services} />
                          <DetailBlock title="Key message" value={q.goals.keyMessage} />
                          <DetailBlock title="Why they get chosen" value={q.competition.whyChosen} />
                          <DetailBlock title="Competitive advantage" value={q.competition.advantage} />
                          <DetailBlock title="Differentiators" value={q.competition.differentiators} />
                          <DetailBlock title="Market position" value={q.competition.marketPosition} />
                          <DetailBlock title="Competitors" value={q.competition.competitors} />
                          <DetailBlock title="Competitor strengths" value={q.competition.competitorStrengths} />
                          <DetailBlock title="Competitor gaps" value={q.competition.competitorGaps} />
                          <DetailBlock title="Weakness to improve" value={q.competition.weakness} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Ideal customer" value={q.proof.idealCustomer} />
                          <DetailBlock title="Customer problem" value={q.proof.customerProblem} />
                          <DetailBlock title="Cost of the problem" value={q.proof.problemCost} />
                          <DetailBlock title="Testimonials" value={q.proof.testimonials} />
                          <DetailBlock title="Before / after" value={q.proof.beforeAfter} />
                          <DetailBlock title="Repeat rate" value={q.proof.repeatRate} />
                        </div>

                        {q.proof.caseStudies?.length ? (
                          <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Case studies</p>
                            {q.proof.caseStudies.map((study, index) => (
                              <div key={index} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75">
                                <p className="font-bold text-white">{study.company || `Case study ${index + 1}`}</p>
                                <p className="mt-1 text-white/60">{study.industry} | {study.timeframe}</p>
                                <p className="mt-2 whitespace-pre-wrap">Problem: {study.problem}</p>
                                <p className="whitespace-pre-wrap">Solution: {study.solution}</p>
                                <p className="whitespace-pre-wrap">Result: {study.result}</p>
                                <p className="whitespace-pre-wrap">Value: {study.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-4">
                          <DetailBlock title="Total repairs" value={q.proof.totalRepairs} />
                          <DetailBlock title="Total serviced" value={q.proof.totalServiced} />
                          <DetailBlock title="Combined experience" value={q.proof.combinedExperience} />
                          <DetailBlock title="Largest job" value={q.proof.largestJob} />
                          <DetailBlock title="Fastest turnaround" value={q.proof.fastestTurnaround} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <ListBlock title="Secondary goals" items={q.goals.secondaryGoals} />
                          <DetailBlock title="Credibility proof" value={q.goals.credibility} />
                          <DetailBlock title="Quantity vs quality" value={q.goals.quantityOrQuality} />
                          <DetailBlock title="Audience split" value={q.goals.audienceSplit} />
                          <DetailBlock title="Tone" value={q.goals.tone} />
                          <DetailBlock title="Language" value={q.goals.language} />
                          <DetailBlock title="Avoid" value={q.goals.avoid} />
                          <DetailBlock title="Current content" value={q.goals.currentContent} />
                          <DetailBlock title="Offers / launches" value={q.goals.offers} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <DetailBlock title="Visual feeling" value={q.visual.feeling} />
                          <DetailBlock title="Admired accounts" value={q.visual.admiredAccounts} />
                          <DetailBlock title="Competitor accounts" value={q.visual.competitorAccounts} />
                          <DetailBlock title="Style" value={q.visual.style} />
                          <DetailBlock title="Faces in content" value={q.visual.faces} />
                          <DetailBlock title="On camera" value={q.visual.onCamera} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <DetailBlock title="Workshop access" value={q.production.workshopAccess} />
                          <DetailBlock title="Live repair access" value={q.production.liveRepair} />
                          <DetailBlock title="Lighting" value={q.production.lighting} />
                          <DetailBlock title="Restricted areas" value={q.production.restricted} />
                          <DetailBlock title="PPE requirements" value={q.production.ppe} />
                          <DetailBlock title="Notice needed" value={q.production.notice} />
                          <DetailBlock title="On-site contact" value={q.production.onsiteContact} />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Brand & asset library</p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailBlock title="Drive link" value={q.assets?.driveLink} />
                            <DetailBlock title="Approval workflow" value={q.assets?.approvalWorkflow} />
                            <DetailBlock title="Turnaround" value={q.assets?.turnaround} />
                            <DetailBlock title="Cadence" value={q.assets?.cadence} />
                            <DetailBlock title="Primary contact" value={q.assets?.primaryContact} />
                            <DetailBlock title="Asset notes" value={q.assets?.notes} />
                          </div>

                          <div className="mt-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Uploaded brand files</p>
                            {!q.assets?.brandFiles?.length ? (
                              <p className="text-sm text-white/35">-</p>
                            ) : (
                              <div className="grid gap-2 md:grid-cols-2">
                                {q.assets.brandFiles.map((file) => (
                                  <a key={file.url} href={file.url} target="_blank" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-[#01F17C] hover:bg-white/[0.04]">
                                    <span className="block truncate">{file.name}</span>
                                    <span className="mt-1 block text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(submission.id, "read")} className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20">Mark Read</button>
                          <button onClick={() => updateStatus(submission.id, "replied")} className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/20">Mark Replied</button>
                          {canDelete && (
                            <button onClick={() => deleteSubmission(submission.id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20">Delete</button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                          <DetailBlock title="Instagram" value={q.identity.instagram} />
                          <DetailBlock title="Industry" value={q.identity.industry} />
                          <DetailBlock title="Location" value={q.identity.location} />
                          <DetailBlock title="Website" value={q.identity.website} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Ideal customer" value={q.strategy.audience} />
                          <DetailBlock title="Customer problem" value={q.strategy.customerProblem} />
                          <DetailBlock title="Why choose them over competitors" value={q.strategy.competitiveReason} />
                          <DetailBlock title="Best sellers / services" value={q.strategy.bestSellers} />
                          <DetailBlock title="Current challenge" value={q.strategy.currentChallenge} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <DetailBlock title="Visual world" value={q.taste.world} />
                          <DetailBlock title="Visual style" value={q.taste.room} />
                          <DetailBlock title="Energy" value={q.taste.energy} />
                          <DetailBlock title="Avoid" value={q.taste.avoid} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <ListBlock title="Niche accounts" items={q.taste.references.nicheAccounts} />
                          <ListBlock title="Static references" items={q.taste.references.staticDesigns} />
                          <ListBlock title="Reel references" items={q.taste.references.reels} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <ListBlock title="Secondary goals" items={q.strategy.secondaryGoals} />
                          <ListBlock title="Formats" items={q.content.formats} />
                          <ListBlock title="Production signals" items={[q.content.faceComfort, q.content.shootingAccess, q.content.approvalStyle]} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Offers / launches" value={q.content.offers} />
                          <DetailBlock title="Notes" value={q.content.notes} />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Brand & asset library</p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailBlock title="Drive link" value={q.assets?.driveLink} />
                            <DetailBlock title="Asset notes" value={q.assets?.notes} />
                          </div>

                          <div className="mt-5">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Uploaded brand files</p>
                            {!q.assets?.brandFiles?.length ? (
                              <p className="text-sm text-white/35">-</p>
                            ) : (
                              <div className="grid gap-2 md:grid-cols-2">
                                {q.assets.brandFiles.map((file) => (
                                  <a
                                    key={file.url}
                                    href={file.url}
                                    target="_blank"
                                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-[#01F17C] hover:bg-white/[0.04]"
                                  >
                                    <span className="block truncate">{file.name}</span>
                                    <span className="mt-1 block text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(submission.id, "read")} className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20">Mark Read</button>
                          <button onClick={() => updateStatus(submission.id, "replied")} className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/20">Mark Replied</button>
                          {canDelete && (
                            <button onClick={() => deleteSubmission(submission.id)} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20">Delete</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
