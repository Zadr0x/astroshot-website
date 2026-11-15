"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase, type ContactSubmission } from "@/lib/supabase";
import type { MonthlyProductFocus } from "@/lib/client-questionnaire";
import type { TeamAccount } from "@/lib/access-control";

type MonthlyPlan = {
  month: string;
  products: MonthlyProductFocus[];
  calendarNotes: { date: string; note: string }[];
  notes: string;
};

type MonthlyIntakeRecord = ContactSubmission & {
  parsed?: {
    type: string;
    submittedBy?: string;
    clientName?: string;
    submittedAt?: string;
    monthlyPlan?: MonthlyPlan;
  };
};

const SERVICE_NAME = "Monthly Content Intake";

function parseSubmission(submission: ContactSubmission): MonthlyIntakeRecord {
  try {
    return { ...submission, parsed: JSON.parse(submission.message) };
  } catch {
    return submission;
  }
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

export default function AdminMonthlyIntakePage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<MonthlyIntakeRecord[]>([]);
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
        if (!data.account.permissions.canViewMonthlyIntake) {
          router.push("/admin");
          return;
        }
        setCanDelete(Boolean(data.account.permissions.canManageAccess));
      }

      loadIntake();
    });
  }, [router]);

  const loadIntake = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("service", SERVICE_NAME)
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
    const confirmed = window.confirm("Delete this monthly intake permanently?");
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
      ["Client", "Month", "Item", "Type", "Priority", "Objective", "Details", "Offer", "Important Date", "Asset Notes", "Files", "Submitted"],
      ...submissions.flatMap((submission) => {
        const plan = submission.parsed?.monthlyPlan;
        const products = plan?.products?.length ? plan.products : [];
        return products.map((product) => [
          submission.company ?? submission.name,
          plan?.month ?? "",
          product.name ?? "",
          product.type ?? "",
          product.priority ?? "",
          product.objective ?? "",
          product.details ?? "",
          product.offer ?? "",
          product.keyDate ?? "",
          product.assetNotes ?? "",
          (product.files ?? []).map((file) => file.url).join(" | "),
          new Date(submission.created_at).toLocaleString(),
        ]);
      }),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-intake-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => ({
    total: submissions.length,
    new: submissions.filter((item) => item.status === "new").length,
    items: submissions.reduce((sum, item) => sum + (item.parsed?.monthlyPlan?.products?.length ?? 0), 0),
  }), [submissions]);

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Monthly Intake"
        actions={
          <button onClick={exportCSV} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
            Export CSV
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-white">{counts.total}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Submissions</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-[#01F17C]">{counts.items}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Products / services</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-red-400">{counts.new}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">New</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-[#111]" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-12 text-center text-sm text-[#555]">No monthly intake responses yet.</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const plan = submission.parsed?.monthlyPlan;
            const products = plan?.products ?? [];
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
                    <p className="mt-1 text-sm text-white/45">
                      {plan?.month ?? "Monthly intake"} / {products.length} item{products.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={submission.status} />
                    <span className="text-xs text-white/35">{new Date(submission.created_at).toLocaleDateString()}</span>
                  </div>
                </button>

                {expanded === submission.id && (
                  <div className="border-t border-white/10 bg-[#0b0b0b] p-5">
                    {!plan ? (
                      <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-xs text-white/60">{submission.message}</pre>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <DetailBlock title="Month" value={plan.month} />
                          <DetailBlock title="Planning notes" value={plan.notes} />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Calendar notes</p>
                          {(plan.calendarNotes ?? []).length === 0 ? (
                            <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No calendar notes added.</p>
                          ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                              {(plan.calendarNotes ?? []).map((item) => (
                                <div key={`${item.date}-${item.note}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
                                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#01F17C]">{item.date}</p>
                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/75">{item.note}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {products.map((product, index) => (
                            <div key={`${product.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#01F17C]">Item {index + 1}</p>
                                  <h2 className="mt-1 text-xl font-black text-white">{product.name || "Untitled item"}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {[product.type, product.priority, product.objective].filter(Boolean).map((label) => (
                                    <span key={label} className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-white/65">
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <DetailBlock title="Details" value={product.details} />
                                <DetailBlock title="Offer / CTA" value={product.offer} />
                                <DetailBlock title="Important date" value={product.keyDate} />
                                <DetailBlock title="Asset notes" value={product.assetNotes} />
                              </div>

                              <div className="mt-5">
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/35">Uploaded files</p>
                                {(product.files ?? []).length === 0 ? (
                                  <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/35">No files uploaded for this item.</p>
                                ) : (
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {(product.files ?? []).map((file) => (
                                      <a
                                        key={file.url}
                                        href={file.url}
                                        target="_blank"
                                        className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-[#01F17C]/40"
                                      >
                                        <p className="truncate text-sm font-bold text-white">{file.name}</p>
                                        <p className="mt-1 text-xs text-white/35">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {canDelete && (
                          <button onClick={() => deleteSubmission(submission.id)} className="rounded-xl border border-red-500/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-300 transition-colors hover:bg-red-500/10">
                            Delete intake
                          </button>
                        )}
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
