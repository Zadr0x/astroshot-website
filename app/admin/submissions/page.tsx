"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ContactSubmission } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";

type FilterStatus = "all" | "new" | "read" | "replied";

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadSubmissions();
    });
  }, [router]);

  const loadSubmissions = async () => {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    setSubmissions((data as ContactSubmission[]) ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: ContactSubmission["status"]) => {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  };

  const handleRowClick = async (sub: ContactSubmission) => {
    setExpanded(expanded === sub.id ? null : sub.id);
    if (sub.status === "new") await updateStatus(sub.id, "read");
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Company", "Email", "Phone", "Service", "Message", "Status", "Date"],
      ...filtered.map((s) => [
        s.name, s.company ?? "", s.email ?? "", s.phone ?? "",
        s.service ?? "", s.message.replace(/\n/g, " "), s.status,
        new Date(s.created_at).toLocaleString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  const counts = {
    all: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    read: submissions.filter((s) => s.status === "read").length,
    replied: submissions.filter((s) => s.status === "replied").length,
  };

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Form Submissions"
        actions={
          <button onClick={exportCSV} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
            Export CSV
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "new", "read", "replied"] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === f ? "bg-[#01F17C] text-[#050505]" : "bg-[#111] border border-white/10 text-[#666] hover:text-white"
            }`}
          >
            {f} {counts[f] > 0 && <span>({counts[f]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#555] text-sm">No submissions found.</div>
      ) : (
        <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden divide-y divide-white/5">
          {filtered.map((sub) => (
            <div key={sub.id}>
              <div
                onClick={() => handleRowClick(sub)}
                className={`flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors ${sub.status === "new" ? "bg-white/[0.02]" : ""}`}
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${sub.status === "new" ? "text-white" : "text-white/80"}`}>{sub.name}</p>
                    {sub.company && <p className="text-xs text-[#555]">{sub.company}</p>}
                  </div>
                  <p className="text-xs text-[#666] self-center hidden sm:block">{sub.service ?? "—"}</p>
                  <p className="text-xs text-[#555] self-center hidden sm:block truncate">{sub.message.slice(0, 60)}...</p>
                  <p className="text-xs text-[#444] self-center hidden sm:block">{new Date(sub.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={sub.status} />
                <span className="text-[#444] text-xs shrink-0">{expanded === sub.id ? "▲" : "▼"}</span>
              </div>

              {expanded === sub.id && (
                <div className="px-4 pb-5 pt-2 bg-[#0d0d0d] border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Email", value: sub.email },
                      { label: "Phone", value: sub.phone },
                      { label: "Service", value: sub.service },
                      { label: "Date", value: new Date(sub.created_at).toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-[#444] uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-sm text-white">{value ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-[#444] uppercase tracking-widest mb-2">Message</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                      {sub.message}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => updateStatus(sub.id, "read")}
                      disabled={sub.status === "read"}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 disabled:opacity-40 transition-colors"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, "replied")}
                      disabled={sub.status === "replied"}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-semibold hover:bg-purple-500/20 disabled:opacity-40 transition-colors"
                    >
                      Mark Replied
                    </button>
                    {sub.email && (
                      <a
                        href={`mailto:${sub.email}?subject=Re: Your inquiry to Astroshot`}
                        className="px-3 py-1.5 rounded-lg bg-[#01F17C]/10 text-[#01F17C] text-xs font-semibold hover:bg-[#01F17C]/20 transition-colors"
                      >
                        Reply via Email →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
