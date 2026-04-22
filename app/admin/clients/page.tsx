"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadFileAdmin as uploadFile } from "@/lib/supabase-admin";
import type { Client } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";

const emptyForm = { name: "", website_url: "" };

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadClients();
    });
  }, [router]);

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("sort_order");
    setClients((data as Client[]) ?? []);
    setLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let logoUrl: string | null = null;
    if (logoFile) logoUrl = await uploadFile(logoFile, "client-logos");
    await supabase.from("clients").insert({
      name: form.name,
      website_url: form.website_url || null,
      logo_url: logoUrl,
      sort_order: clients.length,
    });
    setForm(emptyForm);
    setLogoFile(null);
    setLogoPreview(null);
    setSaving(false);
    loadClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    await supabase.from("clients").delete().eq("id", id);
    loadClients();
  };

  const toggleActive = async (c: Client) => {
    await supabase.from("clients").update({ active: !c.active }).eq("id", c.id);
    loadClients();
  };

  const moveOrder = async (c: Client, dir: -1 | 1) => {
    const idx = clients.findIndex((x) => x.id === c.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= clients.length) return;
    const swap = clients[swapIdx];
    await Promise.all([
      supabase.from("clients").update({ sort_order: swap.sort_order }).eq("id", c.id),
      supabase.from("clients").update({ sort_order: c.sort_order }).eq("id", swap.id),
    ]);
    loadClients();
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#01F17C] transition-colors";
  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-[#666] mb-2";

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Client Logos" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-[#111] animate-pulse" />)}</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16 text-[#555] text-sm">No clients yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {clients.map((c, idx) => (
                <div key={c.id} className={`rounded-2xl bg-[#111] border ${c.active ? "border-white/10" : "border-white/5 opacity-50"} p-4 flex flex-col gap-3`}>
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="h-16 object-contain mx-auto" />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-[#555] text-xs">{c.name}</div>
                  )}
                  <p className="text-xs text-center text-white font-semibold truncate">{c.name}</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button onClick={() => moveOrder(c, -1)} disabled={idx === 0} className="text-[#444] hover:text-white disabled:opacity-30 text-xs">↑</button>
                    <button onClick={() => moveOrder(c, 1)} disabled={idx === clients.length - 1} className="text-[#444] hover:text-white disabled:opacity-30 text-xs">↓</button>
                    <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${c.active ? "text-[#01F17C] bg-[#01F17C]/10" : "text-[#555] bg-white/5"}`}>
                      {c.active ? "On" : "Off"}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs px-2 py-1 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors font-semibold">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add form */}
        <div>
          <form onSubmit={handleAdd} className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Add Client</h2>
            <div>
              <label className={labelCls}>Client Name *</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Gulf Bank" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Website URL</label>
              <input value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Logo</label>
              {logoPreview && <img src={logoPreview} alt="preview" className="h-16 object-contain mb-2" />}
              <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm text-[#666] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#01F17C]/10 file:text-[#01F17C] cursor-pointer" />
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] disabled:opacity-50 transition-colors">
              {saving ? "Adding..." : "Add Client"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
