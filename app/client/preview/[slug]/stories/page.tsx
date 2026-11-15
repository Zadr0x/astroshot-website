"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { CalendarStory, ContentCalendar } from "@/lib/content-calendar";

const statusCopy: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  approved: "Approved",
  needs_edits: "Needs edits",
};

function statusClass(status: string) {
  if (status === "approved") return "bg-[#01F17C]/15 text-[#01F17C]";
  if (status === "needs_edits") return "bg-red-500/15 text-red-300";
  if (status === "ready") return "bg-blue-500/15 text-blue-300";
  return "bg-white/10 text-white/50";
}

export default function ClientStoriesPreviewPage() {
  const params = useParams();
  const slug = String(params.slug ?? "lil-orbit");
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [selected, setSelected] = useState<CalendarStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("client-preview-surface");
    document.body.classList.add("client-preview-surface");
    return () => {
      document.documentElement.classList.remove("client-preview-surface");
      document.body.classList.remove("client-preview-surface");
    };
  }, []);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    fetch(`/api/client-preview/${slug}`, {
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    })
      .then((res) => {
        if (res.status === 401) {
          setNeedsLogin(true);
          setLoading(false);
          return null;
        }
        if (res.status === 403) {
          setError("This login does not have access to this client preview.");
          setLoading(false);
          return null;
        }
        if (!res.ok) {
          setError("Could not load stories preview.");
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data: { calendar: ContentCalendar } | null) => {
        if (!data) return;
        setNeedsLogin(false);
        setCalendar(data.calendar);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load stories preview.");
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPreview();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPreview]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");

    const res = await fetch("/api/client-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setLoginError("Invalid username or password.");
      return;
    }

    setPassword("");
    loadPreview();
  };

  const visibleStories = useMemo(() => calendar?.stories ?? [], [calendar]);
  const filledStories = useMemo(() => visibleStories.filter((story) => story.mediaUrl).length, [visibleStories]);

  if (loading) {
    return <main className="min-h-screen bg-[#121212]" />;
  }

  if (needsLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] px-5 text-white">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/40">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-[#01F17C]">Astroshot Preview</p>
          <h1 className="text-3xl font-black text-white">Stories access</h1>
          <p className="mt-2 text-sm leading-6 text-white/45">Enter the client portal username and password to view story uploads.</p>

          <div className="mt-6 space-y-3">
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]" placeholder="Username" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]" placeholder="Password" />
          </div>

          {loginError && <p className="mt-3 text-sm font-semibold text-red-300">{loginError}</p>}

          <button className="mt-5 w-full rounded-xl bg-[#01F17C] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e]">
            View stories
          </button>
        </form>
      </main>
    );
  }

  if (!calendar) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] px-6 text-center text-white">
        <p className="text-sm text-white/50">{error || "Stories preview not found."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/80 sm:items-center sm:justify-center" onClick={() => setSelected(null)}>
          <section className="w-full overflow-hidden rounded-t-3xl border border-white/10 bg-[#171717] shadow-2xl sm:max-w-[430px] sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Story Preview</p>
                <h2 className="mt-1 text-xl font-black text-white">{selected.label}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full border border-white/10 px-3 py-1 text-lg text-white/60 hover:text-white">x</button>
            </div>
            <div className="bg-black">
              {selected.mediaUrl ? (
                selected.mediaType === "video" ? (
                  <video src={selected.mediaUrl} poster={selected.thumbnailUrl || undefined} controls playsInline className="max-h-[78vh] w-full bg-black object-contain" />
                ) : (
                  <img src={selected.mediaUrl} alt="" className="max-h-[78vh] w-full bg-black object-contain" />
                )
              ) : (
                <div className="flex aspect-[9/16] items-center justify-center text-sm text-white/30">Story pending</div>
              )}
            </div>
            {(selected.publishDate || selected.clientNote) && (
              <div className="space-y-2 p-4 text-sm text-white/55">
                {selected.publishDate && <p className="font-semibold text-white/75">{selected.publishDate}</p>}
                {selected.clientNote && <p className="leading-6">{selected.clientNote}</p>}
              </div>
            )}
          </section>
        </div>
      )}

      <div className="mx-auto min-h-screen max-w-[480px] bg-[#1a1a1a] shadow-2xl shadow-black/30">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-white/10 bg-[#1a1a1a]/95 px-4 backdrop-blur">
          <div className="absolute left-4 text-lg font-black tracking-tight text-white/20">ASTROSHOT</div>
          <p className="text-base font-black text-white">Stories</p>
        </header>

        <section className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#01F17C]">Story Preview</p>
          <h1 className="mt-3 text-2xl font-black text-white">{calendar.clientName}</h1>
          <p className="mt-1 text-sm leading-6 text-white/50">{calendar.campaignTitle}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black text-white">{filledStories}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Uploaded</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black text-white">{visibleStories.length}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Slots</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 p-3">
          {visibleStories.map((story, index) => (
            <button key={`${story.id}-${index}`} onClick={() => setSelected(story)} className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#242424] text-left">
              {story.mediaUrl ? (
                story.mediaType === "video" ? (
                  <>
                    {story.thumbnailUrl ? (
                      <img src={story.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <video src={`${story.mediaUrl}#t=0.2`} className="h-full w-full object-cover" muted playsInline preload="auto" />
                    )}
                    <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">Video</span>
                  </>
                ) : (
                  <img src={story.mediaUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/20">
                  {story.label}
                </div>
              )}
              <span className={`absolute bottom-2 left-2 rounded-md px-1.5 py-1 text-[9px] font-black ${statusClass(story.status)}`}>
                {statusCopy[story.status]}
              </span>
            </button>
          ))}
        </section>

        <footer className="flex h-24 items-center justify-center gap-2 text-sm text-white/25">
          <span className="font-black tracking-tight text-white/20">ASTROSHOT</span>
          <span>Stories presented by Astroshot</span>
        </footer>
      </div>
    </main>
  );
}
