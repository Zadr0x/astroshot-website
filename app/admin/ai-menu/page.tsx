"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AiAppBottomNav from "@/components/admin/AiAppBottomNav";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_STYLE_CATEGORY,
  STYLE_CATEGORIES,
  type AiFactory,
  type CalendarAiAsset,
  type StyleCategoryId,
} from "@/lib/content-calendar";

type AiMode = "video" | "image" | "voice";

const modeOptions: Array<{ id: AiMode; label: string }> = [
  { id: "video", label: "Video" },
  { id: "image", label: "Image" },
  { id: "voice", label: "Voice Over" },
];

const fallbackVisuals = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
];

function categoryName(id: StyleCategoryId) {
  if (id === "trend") return "Trendy";
  return STYLE_CATEGORIES.find((category) => category.id === id)?.name ?? "Studio";
}

function styleImage(asset: CalendarAiAsset, index: number) {
  return asset.previewUrl || asset.url || fallbackVisuals[index % fallbackVisuals.length];
}

function safeStyles(factory: AiFactory | null) {
  const assets = factory?.aiAssets.references ?? [];
  return assets.length > 0 ? assets : [];
}

export default function AiMenuPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AiMode>("video");
  const [factory, setFactory] = useState<AiFactory | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCalendar, setCreatingCalendar] = useState(false);
  const [error, setError] = useState("");

  const styles = useMemo(() => safeStyles(factory), [factory]);
  const groupedStyles = useMemo(() => {
    return STYLE_CATEGORIES.map((category) => ({
      ...category,
      displayName: categoryName(category.id),
      assets: styles.filter((asset) => (asset.styleCategory ?? DEFAULT_STYLE_CATEGORY) === category.id),
    }));
  }, [styles]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/ai-factory", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setError("Could not load AI Menu styles.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { factory: AiFactory };
      setFactory(data.factory);
      setLoading(false);
    }

    load();
  }, [router]);

  const openGenerator = (asset: CalendarAiAsset) => {
    const params = new URLSearchParams({
      magic: mode === "video" ? "video" : "image",
      ref: asset.id,
    });
    router.push(`/admin/content-calendar/lil-orbit?${params.toString()}`);
  };

  const createContentCalendar = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    setCreatingCalendar(true);
    setError("");

    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
    const res = await fetch("/api/admin/content-calendar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName: "New Client",
        campaignTitle: "New Content Calendar",
        slug: `new-content-calendar-${stamp}`,
      }),
    });

    setCreatingCalendar(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not create a new content calendar.");
      return;
    }

    const data = (await res.json()) as { calendar: { slug: string } };
    router.push(`/admin/content-calendar/${data.calendar.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-8">
        <div className="mx-auto h-[80dvh] max-w-7xl animate-pulse rounded-[32px] bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black pb-24 text-white lg:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8 lg:px-10">
        <header className="relative mb-4 flex items-center justify-center pt-1 sm:mb-7">
          <Link href="/admin" className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] sm:h-11 sm:w-11">
            <img src="/astroshot-icon-green.png" alt="" className="h-6 w-6 object-contain" />
          </Link>
          <Link href="/admin/ai-menu" className="text-center">
            <div className="text-xl font-black tracking-[-0.04em] text-white sm:text-3xl">
              ASTRO<span className="text-[#01F17C]">SHOT</span>
            </div>
          </Link>
          <div className="absolute right-0 flex items-center gap-1.5 rounded-full border border-[#01F17C]/35 bg-[#01F17C]/10 px-2.5 py-1.5 text-xs font-black text-[#01F17C] shadow-[0_0_28px_rgba(1,241,124,0.16)] sm:px-3 sm:text-sm">
            <span>✦</span>
            <span>118</span>
          </div>
        </header>

        <nav className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:flex sm:justify-center sm:gap-3">
          {modeOptions.map((option) => {
            const active = mode === option.id;
            const disabled = option.id === "voice";
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => !disabled && setMode(option.id)}
                disabled={disabled}
                className={`h-10 rounded-full border px-3 text-sm font-semibold transition-colors sm:h-12 sm:min-w-36 sm:text-lg ${
                  active
                    ? "border-[#01F17C]/50 bg-[#01F17C] text-black"
                    : disabled
                      ? "border-white/10 bg-white/[0.04] text-white/25"
                      : "border-white/10 bg-white/[0.07] text-white/86 hover:border-[#01F17C]/35 hover:bg-[#01F17C]/10"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </nav>

        <section id="content-calendar" className="mb-7 overflow-hidden rounded-[22px] border border-white/10 bg-[#050505] shadow-[0_18px_60px_rgba(0,0,0,0.45)] lg:rounded-[30px]">
          <button type="button" onClick={createContentCalendar} disabled={creatingCalendar} className="group relative block min-h-[164px] w-full overflow-hidden text-left disabled:opacity-70 sm:min-h-[230px] lg:min-h-[280px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(1,241,124,0.22),transparent_30%),linear-gradient(135deg,#101010,#050505_42%,#022314)]" />
            <div className="absolute -right-10 top-6 h-52 w-52 rounded-full bg-[#01F17C]/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 hidden h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-45 mix-blend-screen sm:block" />
            <div className="relative flex min-h-[164px] flex-col justify-end p-5 sm:min-h-[230px] sm:p-7 lg:min-h-[280px] lg:p-9">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#01F17C]">Content Calendar</p>
              <h1 className="max-w-2xl text-3xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Start a new project
              </h1>
              <p className="mt-3 max-w-md text-sm font-medium text-white/45">Create a fresh content calendar for any client, then generate images, videos, captions, and previews.</p>
              <div className="mt-5 flex h-10 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-2xl text-white backdrop-blur transition-transform group-hover:translate-x-1">
                {creatingCalendar ? "..." : "→"}
              </div>
            </div>
          </button>
        </section>

        <section className="mb-7 overflow-hidden rounded-[22px] border border-[#01F17C]/20 bg-[#07120c] shadow-[0_18px_60px_rgba(0,0,0,0.45)] lg:rounded-[30px]">
          <Link href="/admin/ai-film" className="group relative block min-h-[154px] overflow-hidden text-left sm:min-h-[220px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(1,241,124,0.22),transparent_32%),linear-gradient(135deg,#050505,#07120c_48%,#101010)]" />
            <div className="absolute right-6 top-6 grid h-24 w-32 grid-cols-3 gap-1 opacity-35 sm:h-36 sm:w-52">
              {Array.from({ length: 9 }).map((_, index) => <span key={index} className="rounded-md border border-[#01F17C]/35 bg-[#01F17C]/10" />)}
            </div>
            <div className="relative flex min-h-[154px] flex-col justify-end p-5 sm:min-h-[220px] sm:p-7">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#01F17C]">AI Film Studio</p>
              <h1 className="max-w-2xl text-3xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl">
                Brief to film workflow
              </h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/45">Location sheets, character sheets, product sheets, hero frames, angle continuity, and video model routing.</p>
              <div className="mt-5 flex h-10 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-2xl text-white backdrop-blur transition-transform group-hover:translate-x-1">
                →
              </div>
            </div>
          </Link>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            {error}
          </div>
        )}

        {mode === "voice" ? (
          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-white/35">Coming Soon</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">Voice Over</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">This tab is parked for now. We can connect it later to Kuwaiti VO, scripts, and voice-note generation.</p>
          </section>
        ) : (
          <div className="space-y-7 lg:space-y-10">
            {groupedStyles.map((category) => {
              const assets = category.assets;
              if (assets.length === 0) return null;
              return (
                <section key={category.id}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-white/55 sm:text-3xl">
                      {category.displayName}
                    </h2>
                    <Link href="/admin/ai-factory" className="flex items-center gap-1.5 text-xs font-bold tracking-[0.1em] text-white/35 transition-colors hover:text-[#01F17C]">
                      See All
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#01F17C] text-xs text-black">›</span>
                    </Link>
                  </div>
                  <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 xl:grid-cols-5">
                    {assets.map((asset, index) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => openGenerator(asset)}
                        className="group relative h-[238px] w-[62vw] max-w-[260px] flex-none snap-start overflow-hidden rounded-[20px] bg-white/[0.04] text-left shadow-[0_14px_46px_rgba(0,0,0,0.42)] sm:w-[230px] lg:h-[300px] lg:w-auto"
                      >
                        <img src={styleImage(asset, index)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/8 to-black/10" />
                        {mode === "video" && (
                          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/20 text-base text-white backdrop-blur">
                            ▶
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-3.5">
                          <p className="line-clamp-2 text-base font-black tracking-[-0.02em] text-white">{asset.name || category.displayName}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-white/55">{asset.notes || (mode === "video" ? "Open Astro Magic Video" : "Open Astro Magic")}</p>
                          <span className="mx-auto mt-3 flex h-9 w-20 items-center justify-center rounded-full bg-white/25 text-sm font-semibold text-white backdrop-blur">
                            Try
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <AiAppBottomNav />
    </main>
  );
}
