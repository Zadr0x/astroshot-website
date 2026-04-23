"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadFileAdmin as uploadFile } from "@/lib/supabase-admin";
import type { SiteContent } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";

const SECTIONS = ["hero", "about", "cta", "footer"];

export default function AdminContentPage() {
  const router = useRouter();
  const [items, setItems] = useState<SiteContent[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Hero video state — desktop
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [heroVideoId, setHeroVideoId] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoRemoving, setVideoRemoving] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Hero video state — mobile
  const [heroMobileVideoUrl, setHeroMobileVideoUrl] = useState<string | null>(null);
  const [heroMobileVideoId, setHeroMobileVideoId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_heroMobileVideoId] = [heroMobileVideoId];
  const [mobileVideoUploading, setMobileVideoUploading] = useState(false);
  const mobileVideoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadContent();
    });
  }, [router]);

  const loadContent = async () => {
    const { data } = await supabase.from("site_content").select("*").order("section").order("key");
    const all = (data as SiteContent[]) ?? [];
    const videoEntry = all.find((i) => i.key === "hero_video_url");
    if (videoEntry) { setHeroVideoUrl(videoEntry.value || null); setHeroVideoId(videoEntry.id); }
    const mobileEntry = all.find((i) => i.key === "hero_video_mobile_url");
    if (mobileEntry) { setHeroMobileVideoUrl(mobileEntry.value || null); setHeroMobileVideoId(mobileEntry.id); }
    setItems(all.filter((i) => i.key !== "hero_video_url" && i.key !== "hero_video_mobile_url"));
    setLoading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    const url = await uploadFile(file, "hero-video");
    if (url) {
      if (heroVideoId) {
        await supabase.from("site_content").update({ value: url, updated_at: new Date().toISOString() }).eq("id", heroVideoId);
      } else {
        const { data } = await supabase.from("site_content").insert({
          key: "hero_video_url",
          value: url,
          label: "Hero Video URL",
          section: "hero",
        }).select().single();
        if (data) setHeroVideoId(data.id);
      }
      setHeroVideoUrl(url);
    }
    setVideoUploading(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleRemoveVideo = async () => {
    if (!heroVideoId) return;
    setVideoRemoving(true);
    await supabase.from("site_content").update({ value: "", updated_at: new Date().toISOString() }).eq("id", heroVideoId);
    setHeroVideoUrl(null);
    setVideoRemoving(false);
  };

  const handleMobileVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMobileVideoUploading(true);
    const url = await uploadFile(file, "hero-video");
    if (url) {
      if (heroMobileVideoId) {
        await supabase.from("site_content").update({ value: url, updated_at: new Date().toISOString() }).eq("id", heroMobileVideoId);
      } else {
        const { data } = await supabase.from("site_content").insert({ key: "hero_video_mobile_url", value: url, label: "Hero Video Mobile URL", section: "hero" }).select().single();
        if (data) setHeroMobileVideoId(data.id);
      }
      setHeroMobileVideoUrl(url);
    }
    setMobileVideoUploading(false);
    if (mobileVideoInputRef.current) mobileVideoInputRef.current.value = "";
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

      {/* Hero Video Section */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#01F17C] mb-4 pl-1">
          Hero Video
        </h2>
        <div className="rounded-2xl bg-[#111] border border-white/10 p-5 space-y-6">
          {/* Desktop video */}
          <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Desktop Video <span className="text-[#555] font-normal text-xs">(landscape / 16:9)</span></p>
          <p className="text-xs text-white/40">Plays on desktop and tablet. Recommended: 16:9 landscape, MP4, under 50MB.</p>

          {heroVideoUrl && (
            <video
              src={heroVideoUrl}
              controls
              muted
              playsInline
              className="w-full max-w-md rounded-xl border border-white/10 bg-black"
            />
          )}

          {heroVideoUrl && (
            <p className="text-xs text-[#444] font-mono break-all">{heroVideoUrl}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <input ref={videoInputRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={handleVideoUpload} />
            <button onClick={() => videoInputRef.current?.click()} disabled={videoUploading} className="px-4 py-2 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-semibold hover:bg-[#00d96e] disabled:opacity-50 transition-colors">
              {videoUploading ? "Uploading..." : heroVideoUrl ? "Replace Desktop Video" : "Upload Desktop Video"}
            </button>
            {heroVideoUrl && <button onClick={handleRemoveVideo} disabled={videoRemoving} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 disabled:opacity-50 transition-colors">{videoRemoving ? "Removing..." : "Remove"}</button>}
          </div>
          </div>

          {/* Mobile video */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <p className="text-sm font-semibold text-white">Mobile Video <span className="text-[#555] font-normal text-xs">(portrait / 9:16)</span></p>
            <p className="text-xs text-white/40">Plays on phones. Recommended: 9:16 vertical, MP4, under 30MB.</p>
            {heroMobileVideoUrl && (
              <video src={heroMobileVideoUrl} controls muted playsInline className="w-40 rounded-xl border border-white/10 bg-black" />
            )}
            <div className="flex flex-wrap gap-3">
              <input ref={mobileVideoInputRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={handleMobileVideoUpload} />
              <button onClick={() => mobileVideoInputRef.current?.click()} disabled={mobileVideoUploading} className="px-4 py-2 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-semibold hover:bg-[#00d96e] disabled:opacity-50 transition-colors">
                {mobileVideoUploading ? "Uploading..." : heroMobileVideoUrl ? "Replace Mobile Video" : "Upload Mobile Video"}
              </button>
            </div>
          </div>
        </div>
      </div>

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
