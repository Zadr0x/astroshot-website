"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Service } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";

const emptyForm = { title: "", description: "", icon: "⚡" };

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadServices();
    });
  }, [router]);

  const loadServices = async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices((data as Service[]) ?? []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await supabase.from("services").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editingId);
    } else {
      await supabase.from("services").insert({ ...form, sort_order: services.length });
    }
    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    loadServices();
  };

  const handleEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({ title: s.title, description: s.description ?? "", icon: s.icon ?? "⚡" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    loadServices();
  };

  const toggleActive = async (s: Service) => {
    await supabase.from("services").update({ active: !s.active }).eq("id", s.id);
    loadServices();
  };

  const moveOrder = async (s: Service, dir: -1 | 1) => {
    const idx = services.findIndex((x) => x.id === s.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= services.length) return;
    const swap = services[swapIdx];
    await Promise.all([
      supabase.from("services").update({ sort_order: swap.sort_order }).eq("id", s.id),
      supabase.from("services").update({ sort_order: s.sort_order }).eq("id", swap.id),
    ]);
    loadServices();
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#01F17C] transition-colors";
  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-[#666] mb-2";

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Services" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse" />)}</div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-[#555] text-sm">No services yet. Add one →</div>
          ) : (
            <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden divide-y divide-white/5">
              {services.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                  <span className="text-2xl w-10 text-center shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    {s.description && <p className="text-xs text-[#555] mt-0.5 truncate">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => moveOrder(s, -1)} disabled={idx === 0} className="text-[#444] hover:text-white disabled:opacity-30 transition-colors text-sm px-1">↑</button>
                    <button onClick={() => moveOrder(s, 1)} disabled={idx === services.length - 1} className="text-[#444] hover:text-white disabled:opacity-30 transition-colors text-sm px-1">↓</button>
                    <button
                      onClick={() => toggleActive(s)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${s.active ? "bg-[#01F17C]/10 text-[#01F17C]" : "bg-white/5 text-[#555]"}`}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => handleEdit(s)} className="text-xs text-[#666] hover:text-white transition-colors">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-[#666] hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleSave} className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">
              {editingId ? "Edit Service" : "Add Service"}
            </h2>
            <div>
              <label className={labelCls}>Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="⚡" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Title *</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. VFX & CGI" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Short description..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : editingId ? "Save" : "Add Service"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
