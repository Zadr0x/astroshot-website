"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AiAppBottomNav from "@/components/admin/AiAppBottomNav";
import { supabase } from "@/lib/supabase";

type GenerateMode = "image" | "video" | "voice";

const modes: Array<{
  id: GenerateMode;
  title: string;
  eyebrow: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    id: "image",
    eyebrow: "Astro Magic Image",
    title: "Create a campaign image",
    description: "Use products, models, and style references from the calendar generator.",
  },
  {
    id: "video",
    eyebrow: "Astro Magic Video",
    title: "Create a motion concept",
    description: "Open the video generator with Seedance, Kling, and reference controls.",
  },
  {
    id: "voice",
    eyebrow: "Voice Over",
    title: "Generate voice copy",
    description: "Coming next: Kuwaiti VO scripts, voice previews, and exports.",
    disabled: true,
  },
];

export default function AiGeneratePage() {
  const router = useRouter();
  const [mode, setMode] = useState<GenerateMode>("image");
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selected = modes.find((item) => item.id === mode) ?? modes[0];

  const openAstroMagic = async () => {
    if (selected.disabled) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    setCreating(true);
    setError("");

    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
    const res = await fetch("/api/admin/content-calendar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName: "AI Generation",
        campaignTitle: selected.eyebrow,
        slug: `ai-${mode}-${stamp}`,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not open Astro Magic.");
      return;
    }

    const data = (await res.json()) as { calendar: { slug: string } };
    const params = new URLSearchParams({ magic: mode });
    if (prompt.trim()) params.set("idea", prompt.trim());
    router.push(`/admin/content-calendar/${data.calendar.slug}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black pb-24 text-white">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-8">
        <header className="relative mb-6 flex items-center justify-center pt-1">
          <Link href="/admin/ai-menu" className="absolute left-0 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
            <img src="/astroshot-icon-green.png" alt="" className="h-6 w-6 object-contain" />
          </Link>
          <Link href="/admin/ai-menu" className="text-xl font-black tracking-[-0.04em] text-white">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </Link>
          <div className="absolute right-0 flex items-center gap-1.5 rounded-full border border-[#01F17C]/35 bg-[#01F17C]/10 px-2.5 py-1.5 text-xs font-black text-[#01F17C]">
            <span>✦</span>
            <span>118</span>
          </div>
        </header>

        <section className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#01F17C]">Generate</p>
          <h1 className="mt-2 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white">Astro Magic</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">Choose image or video, write the rough idea, and we open the correct Astro Magic workspace. No dead buttons, no fake controls.</p>
        </section>

        <div className="mb-5 grid gap-3">
          {modes.map((item) => {
            const active = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => setMode(item.id)}
                className={`rounded-[22px] border p-4 text-left transition-colors ${
                  active
                    ? "border-[#01F17C]/45 bg-[#01F17C]/12"
                    : item.disabled
                      ? "border-white/8 bg-white/[0.025] opacity-45"
                      : "border-white/10 bg-white/[0.045] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#01F17C]">{item.eyebrow}</p>
                    <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-white">{item.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-white/43">{item.description}</p>
                  </div>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${active ? "border-[#01F17C]/45 bg-[#01F17C] text-black" : "border-white/10 bg-white/[0.04] text-white/40"}`}>
                    {active ? "✓" : "→"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">{selected.eyebrow}</p>
              <p className="mt-1 text-sm font-medium text-white/45">Write the idea. Astro Magic handles the detailed controls inside the workspace.</p>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={mode === "video" ? "Example: show the product floating through a cinematic store aisle..." : "Example: premium studio campaign image for a new product launch..."}
            className="min-h-[190px] w-full resize-none rounded-[22px] border border-white/10 bg-black/25 p-4 text-lg font-medium leading-7 text-white outline-none placeholder:text-white/30 focus:border-[#01F17C]/45"
          />

          <button
            type="button"
            onClick={openAstroMagic}
            disabled={creating || selected.disabled}
            className="mt-4 flex h-13 w-full items-center justify-center rounded-[20px] bg-[#01F17C] px-5 py-4 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:opacity-35"
          >
            {creating ? "Opening..." : mode === "video" ? "Open Astro Magic Video" : mode === "image" ? "Open Astro Magic Image" : "Coming Soon"}
          </button>
        </section>

        {error && <p className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</p>}
      </div>

      <AiAppBottomNav />
    </main>
  );
}
