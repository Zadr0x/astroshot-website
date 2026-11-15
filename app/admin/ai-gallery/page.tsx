"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AiAppBottomNav from "@/components/admin/AiAppBottomNav";
import { supabase } from "@/lib/supabase";

type GalleryItem = {
  id: string;
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediaType: "image" | "video";
  prompt: string;
  source: string;
  createdAt: string;
  projectSlug: string;
  projectName: string;
  postLabel: string;
};

type Filter = "all" | "image" | "video";

export default function AiGalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const visibleItems = useMemo(() => items.filter((item) => filter === "all" || item.mediaType === filter), [filter, items]);

  useEffect(() => {
    async function loadGallery() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/ai-gallery", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setError("Could not load gallery.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { items: GalleryItem[] };
      setItems(data.items);
      setLoading(false);
    }

    loadGallery();
  }, [router]);

  return (
    <main className="min-h-screen overflow-hidden bg-black pb-24 text-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8 lg:px-10">
        <header className="relative mb-6 flex items-center justify-center pt-1">
          <Link href="/admin/ai-menu" className="absolute left-0 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
            <img src="/astroshot-icon-green.png" alt="" className="h-6 w-6 object-contain" />
          </Link>
          <Link href="/admin/ai-menu" className="text-xl font-black tracking-[-0.04em] text-white">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </Link>
        </header>

        <section className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#01F17C]">Gallery</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">Generated Media</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">All generated images and videos available to this user, gathered into one gallery instead of one project view.</p>
        </section>

        <nav className="mb-5 grid max-w-md grid-cols-3 gap-2">
          {(["all", "image", "video"] as Filter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`h-10 rounded-full border px-3 text-sm font-semibold capitalize transition-colors ${
                filter === item ? "border-[#01F17C]/50 bg-[#01F17C] text-black" : "border-white/10 bg-white/[0.06] text-white/70"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {error && <p className="mb-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-[22px] bg-white/[0.05]" />)}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.035] p-10 text-center">
            <p className="text-sm font-semibold text-white/45">No generated media yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visibleItems.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.045]">
                <a href={item.originalUrl || item.url} target="_blank" rel="noreferrer" className="relative block aspect-[4/5] bg-black">
                  {item.mediaType === "video" ? (
                    <video src={item.url} poster={item.thumbnailUrl} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                    {item.mediaType}
                  </span>
                </a>
                <div className="p-3">
                  <p className="truncate text-sm font-bold text-white">{item.projectName}</p>
                  <p className="mt-1 truncate text-xs text-white/35">{item.postLabel} · {item.source}</p>
                  {item.prompt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45">{item.prompt}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <AiAppBottomNav />
    </main>
  );
}
