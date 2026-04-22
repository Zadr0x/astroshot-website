"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SiteContent } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";

const SECTIONS = ["hero", "about", "cta", "footer"];

export default function AdminContentPage() {
  const router = useRouter();
  const [items, setItems] = useState<SiteContent[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadContent();
    });
  }, [router]);

  const loadContent = async () => {
    const { data } = await supabase.from("site_content").select("*").order("section").order("key");
    setItems((data as SiteContent[]) ?? []);
    setLoading(false);
  };

  const handleSave = async (item: SiteContent) => {
    setSaving((s) => ({ ...s, [item.id]: true }));
    await supabase.from("site_content").update({
      value: item.value,
      updated_at: new Date().toISOString(),
    }).eq("id", item.id);
    setSaving((s) => ({ ...s, [item.id]: false }));
    setSaved((s) => ({ ...s, [item.id]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [item.id]: false })), 2000);
  };

  const updateValue = (id: string, value: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, value } : item));
  };

  const grouped = SECTIONS.reduce<Record<string, SiteContent[]>>((acc, section) => {
    acc[section] = items.filter((i) => i.section === section);
    return acc;
  }, {});

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#01F17C] transition-colors";

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Site Content" />
      <p className="text-sm text-[#555] mb-8 -mt-4">
        Edit the text that appears on your public website. Changes take effect immediately.
      </p>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-[#111] animate-pulse" />)}</div>
      ) : (
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            const sectionItems = grouped[section];
            if (!sectionItems?.length) return null;
            return (
              <div key={section}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#01F17C] mb-4 pl-1">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h2>
                <div className="rounded-2xl bg-[#111] border border-white/10 divide-y divide-white/5 overflow-hidden">
                  {sectionItems.map((item) => (
                    <div key={item.id} className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.label ?? item.key}</p>
                          <p className="text-xs text-[#444] font-mono">{item.key}</p>
                        </div>
                        <p className="text-xs text-[#444]">
                          Updated {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {item.value.length > 100 ? (
                        <textarea
                          value={item.value}
                          onChange={(e) => updateValue(item.id, e.target.value)}
                          rows={4}
                          className={`${inputCls} resize-none`}
                        />
                      ) : (
                        <input
                          value={item.value}
                          onChange={(e) => updateValue(item.id, e.target.value)}
                          className={inputCls}
                        />
                      )}
                      <button
                        onClick={() => handleSave(item)}
                        disabled={saving[item.id]}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          saved[item.id]
                            ? "bg-[#01F17C]/20 text-[#01F17C]"
                            : "bg-[#01F17C] text-[#050505] hover:bg-[#00d96e]"
                        } disabled:opacity-50`}
                      >
                        {saved[item.id] ? "✓ Saved" : saving[item.id] ? "Saving..." : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {items.filter((i) => !SECTIONS.includes(i.section ?? "")).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#666] mb-4 pl-1">Other</h2>
              <div className="rounded-2xl bg-[#111] border border-white/10 divide-y divide-white/5 overflow-hidden">
                {items.filter((i) => !SECTIONS.includes(i.section ?? "")).map((item) => (
                  <div key={item.id} className="p-5 space-y-3">
                    <p className="text-sm font-semibold text-white">{item.label ?? item.key}</p>
                    <input value={item.value} onChange={(e) => updateValue(item.id, e.target.value)} className={inputCls} />
                    <button onClick={() => handleSave(item)} disabled={saving[item.id]} className="px-4 py-2 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-semibold hover:bg-[#00d96e] disabled:opacity-50 transition-colors">
                      {saved[item.id] ? "✓ Saved" : "Save"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
