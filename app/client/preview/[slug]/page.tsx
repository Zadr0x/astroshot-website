"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  arrangePostsForInstagramGrid,
  restorePostsFromInstagramGrid,
  type CalendarHighlight,
  type CalendarCarouselItem,
  type CalendarPost,
  type ContentCalendar,
} from "@/lib/content-calendar";

const statusCopy: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  approved: "Approved",
  needs_edits: "Needs edits",
  posted: "Posted",
};

function statusClass(status: string) {
  if (status === "approved") return "bg-[#01F17C]/15 text-[#01F17C]";
  if (status === "posted") return "bg-[#0A84FF]/20 text-[#4da3ff]";
  if (status === "needs_edits") return "bg-red-500/15 text-red-300";
  if (status === "ready") return "bg-blue-500/15 text-blue-300";
  return "bg-white/10 text-white/50";
}

function relabelPosts(posts: CalendarPost[]) {
  return posts.map((post, index) => ({ ...post, label: `Content ${index + 1}` }));
}

function movePost(posts: CalendarPost[], fromId: string, toId: string) {
  const fromIndex = posts.findIndex((post) => post.id === fromId);
  const toIndex = posts.findIndex((post) => post.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return posts;

  const next = [...posts];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return relabelPosts(next);
}

function filenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "content";
}

function isVideoUrl(url?: string) {
  if (!url) return false;
  try {
    return /\.(mp4|mov)(?:$|[?#])/i.test(new URL(url, window.location.href).pathname);
  } catch {
    return /\.(mp4|mov)(?:$|[?#])/i.test(url);
  }
}

function downloadMediaUrl(post: CalendarPost) {
  if (post.mediaType === "video") {
    if (isVideoUrl(post.originalMediaUrl)) return post.originalMediaUrl;
    if (isVideoUrl(post.mediaUrl)) return post.mediaUrl;
  }
  return post.originalMediaUrl || post.mediaUrl;
}

function carouselFallbackItems(post: CalendarPost): CalendarCarouselItem[] {
  if (post.carouselItems.length > 0) return post.carouselItems;
  if (!post.mediaUrl) return [];
  return [{
    id: post.id,
    url: post.mediaUrl,
    originalUrl: post.originalMediaUrl || post.mediaUrl,
    thumbnailUrl: post.thumbnailUrl,
    mediaType: post.previousMediaType === "video" || isVideoUrl(post.mediaUrl) ? "video" : "image",
    createdAt: post.publishDate,
  }];
}

function carouselPreviewUrl(item: CalendarCarouselItem | undefined) {
  if (!item) return "";
  return item.mediaType === "video" ? item.thumbnailUrl || item.url : item.url;
}

function postThumbUrl(post: CalendarPost) {
  if (post.mediaType === "carousel") {
    const first = carouselFallbackItems(post)[0];
    if (!first) return "";
    return first.mediaType === "video" ? first.thumbnailUrl || first.url : first.url;
  }
  if (post.mediaType === "video") return post.thumbnailUrl || "";
  return post.mediaUrl;
}

export default function ClientContentPreviewPage() {
  const params = useParams();
  const slug = String(params.slug ?? "lil-orbit");
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CalendarPost | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [draggingPostId, setDraggingPostId] = useState<string | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [captionGenerating, setCaptionGenerating] = useState(false);
  const [captionMessage, setCaptionMessage] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dragMovedRef = useRef(false);
  const saveOrderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("client-preview-surface");
    document.body.classList.add("client-preview-surface");
    return () => {
      document.documentElement.classList.remove("client-preview-surface");
      document.body.classList.remove("client-preview-surface");
    };
  }, []);

  const loadPreview = async () => {
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
          setError("Could not load preview.");
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
        setError("Could not load preview.");
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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

  const visiblePosts = useMemo(() => calendar?.posts ?? [], [calendar]);
  const gridPosts = useMemo(() => arrangePostsForInstagramGrid(visiblePosts), [visiblePosts]);
  const filledPosts = useMemo(() => visiblePosts.filter((post) => post.mediaUrl).length, [visiblePosts]);
  const newPosts = useMemo(() => visiblePosts.filter((post) => post.isNew), [visiblePosts]);
  const selectedDownloadUrl = selected
    ? selected.mediaType === "carousel"
      ? ""
      : downloadMediaUrl(selected)
    : "";
  const selectedDownloadName = selected
    ? `${filenamePart(calendar?.clientName || calendar?.slug || slug)}-${filenamePart(selected.label)}`
    : "";
  const selectedDownloadRoute = selected
    ? `/api/client-preview/${slug}/download?postId=${encodeURIComponent(selected.id)}`
    : "";
  const selectedThumbnailDownloadRoute = selected?.mediaType === "video" && selected.thumbnailUrl
    ? `/api/client-preview/${slug}/download?postId=${encodeURIComponent(selected.id)}&asset=thumbnail`
    : "";

  const selectPost = (post: CalendarPost) => {
    setSelected(post);
    setSelectedSlideIndex(0);
    setNote(post.clientNote ?? "");
    setError("");
    setDownloadMessage("");
    setGeneratedCaption("");
    setCaptionMessage("");
    if (post.isNew) markPostSeen(post.id);
  };

  const submitFeedback = async (status: "approved" | "needs_edits" | "posted") => {
    if (!selected || !calendar) return;
    setSaving(true);
    setError("");
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`/api/client-preview/${calendar.slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ postId: selected.id, status, note }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Could not save feedback.");
      return;
    }

    const data = (await res.json()) as { calendar: ContentCalendar };
    setCalendar(data.calendar);
    const updated = data.calendar.posts.find((post) => post.id === selected.id) ?? null;
    setSelected(updated);
  };

  const markPostSeen = async (postId: string) => {
    if (!calendar) return;
    setCalendar((current) =>
      current
        ? { ...current, posts: current.posts.map((post) => (post.id === postId && post.isNew ? { ...post, isNew: false } : post)) }
        : current
    );
    setSelected((current) => (current && current.id === postId ? { ...current, isNew: false } : current));

    const { data: { session } } = await supabase.auth.getSession();
    fetch(`/api/client-preview/${calendar.slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ action: "mark_seen", postId }),
    }).catch(() => undefined);
  };

  const markAllSeen = async () => {
    if (!calendar) return;
    const ids = calendar.posts.filter((post) => post.isNew).map((post) => post.id);
    if (ids.length === 0) return;

    setCalendar((current) =>
      current
        ? { ...current, posts: current.posts.map((post) => (post.isNew ? { ...post, isNew: false } : post)) }
        : current
    );

    const { data: { session } } = await supabase.auth.getSession();
    fetch(`/api/client-preview/${calendar.slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ action: "mark_seen", postIds: ids }),
    }).catch(() => undefined);
  };

  const savePostOrder = async (posts: CalendarPost[]) => {
    if (!calendar) return;
    if (saveOrderTimerRef.current) clearTimeout(saveOrderTimerRef.current);
    setOrderSaving(true);
    setOrderMessage("");
    const postIds = posts.map((post) => post.id);

    saveOrderTimerRef.current = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/client-preview/${calendar.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ action: "reorder", postIds }),
      });

      setOrderSaving(false);

      if (!res.ok) {
        setOrderMessage("Could not save grid order.");
        return;
      }

      const data = (await res.json()) as { calendar: ContentCalendar };
      setCalendar(data.calendar);
      setOrderMessage("Grid order saved.");
    }, 350);
  };

  const reorderToPost = (targetPostId: string, sourcePostId = draggingPostId) => {
    if (!calendar || !sourcePostId || sourcePostId === targetPostId) return;
    dragMovedRef.current = true;
    setCalendar((current) => {
      if (!current) return current;
      const gridOrder = movePost(arrangePostsForInstagramGrid(current.posts), sourcePostId, targetPostId);
      const posts = restorePostsFromInstagramGrid(gridOrder);
      savePostOrder(posts);
      return { ...current, posts };
    });
  };

  const finishDrag = () => {
    window.setTimeout(() => {
      setDraggingPostId(null);
      dragMovedRef.current = false;
    }, 0);
  };

  const downloadUrl = async (url: string, name?: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    if (name) anchor.download = name;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const downloadSelectedVideoThumbnail = async () => {
    if (!selected || !selectedThumbnailDownloadRoute) return;
    setDownloading(true);
    setDownloadMessage("");
    try {
      await downloadUrl(selectedThumbnailDownloadRoute, `${selectedDownloadName}-thumbnail`);
      setDownloadMessage("Thumbnail download started.");
    } catch {
      setDownloadMessage("Could not start thumbnail download.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadSelectedMedia = async () => {
    if (!selected) return;
    setDownloadMessage("");

    if (selected.mediaType !== "carousel") {
      setDownloading(true);
      try {
        await downloadUrl(selectedDownloadRoute, selectedDownloadName);
        setDownloadMessage("Download started.");
      } catch {
        setDownloadMessage("Could not start download.");
      } finally {
        setDownloading(false);
      }
      return;
    }

    const slides = carouselFallbackItems(selected);

    if (slides.length === 0) return;

    setDownloading(true);
    const baseName = `${filenamePart(calendar?.clientName || calendar?.slug || slug)}-${filenamePart(selected.label)}`;

    try {
      await downloadUrl(selectedDownloadRoute, `${baseName}-carousel`);
      setDownloadMessage("Downloading all slides as a ZIP file.");
    } catch {
      setDownloadMessage("Could not start carousel download.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadHighlight = async (highlight: CalendarHighlight) => {
    if (!highlight.iconUrl) return;
    setDownloadMessage("");
    try {
      await downloadUrl(
        `/api/client-preview/${slug}/download?highlightId=${encodeURIComponent(highlight.id)}`,
        `${filenamePart(calendar?.clientName || calendar?.slug || slug)}-highlight-${filenamePart(highlight.label || "highlight")}`
      );
      setDownloadMessage("Download started.");
    } catch {
      setDownloadMessage("Could not start download.");
    }
  };

  const generateClientCaption = async () => {
    if (!selected || !calendar) return;
    setCaptionGenerating(true);
    setCaptionMessage("");
    setGeneratedCaption("");

    const res = await fetch(`/api/client-preview/${calendar.slug}/caption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: selected.id, slideIndex: selectedSlideIndex }),
    });

    setCaptionGenerating(false);

    const data = (await res.json().catch(() => null)) as { caption?: string; error?: string } | null;
    if (!res.ok || !data?.caption) {
      setCaptionMessage(data?.error || "Could not generate caption.");
      return;
    }

    setGeneratedCaption(data.caption);
    setCaptionMessage("Caption generated.");
  };

  const copyGeneratedCaption = async () => {
    if (!generatedCaption) return;
    try {
      await navigator.clipboard.writeText(generatedCaption);
      setCaptionMessage("Caption copied.");
    } catch {
      setCaptionMessage("Select and copy the caption manually.");
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-[#121212]" />;
  }

  if (needsLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] px-5 text-white">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/40">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-[#01F17C]">Astroshot Preview</p>
          <h1 className="text-3xl font-black text-white">Client access</h1>
          <p className="mt-2 text-sm leading-6 text-white/45">Enter the client portal username and password to view this content calendar.</p>

          <div className="mt-6 space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]"
              placeholder="Username"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#01F17C]"
              placeholder="Password"
            />
          </div>

          {loginError && <p className="mt-3 text-sm font-semibold text-red-300">{loginError}</p>}

          <button className="mt-5 w-full rounded-xl bg-[#01F17C] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e]">
            View preview
          </button>
        </form>
      </main>
    );
  }

  if (!calendar) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] px-6 text-center text-white">
        <p className="text-sm text-white/50">{error || "Preview not found."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 sm:items-center sm:justify-center" onClick={() => setSelected(null)}>
          <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#1b1b1b] p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Content Preview</p>
                <h2 className="mt-1 text-2xl font-black text-white">{selected.label}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full border border-white/10 px-3 py-1 text-lg text-white/60 hover:text-white">×</button>
            </div>

            <div className="grid gap-5 md:grid-cols-[minmax(0,0.85fr)_1fr]">
              <div className="overflow-hidden rounded-2xl bg-black">
                {selected.mediaUrl ? (
                  selected.mediaType === "video" ? (
                    <video src={selected.mediaUrl} poster={selected.thumbnailUrl || undefined} controls playsInline className="max-h-[72vh] w-full bg-black object-contain" />
                  ) : selected.mediaType === "carousel" ? (
                    <div className="relative bg-black">
                      {(() => {
                        const carouselItems = carouselFallbackItems(selected);
                        const activeItem = carouselItems[selectedSlideIndex] ?? carouselItems[0];
                        return activeItem?.mediaType === "video" ? (
                          <video src={activeItem.originalUrl || activeItem.url} poster={activeItem.thumbnailUrl || undefined} controls playsInline className="max-h-[72vh] w-full bg-black object-contain" />
                        ) : (
                          <img src={activeItem?.url || selected.mediaUrl} alt="" className="max-h-[72vh] w-full bg-black object-contain" />
                        );
                      })()}
                      {(carouselFallbackItems(selected).length ?? 0) > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedSlideIndex((index) => Math.max(0, index - 1))}
                            disabled={selectedSlideIndex === 0}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl font-black text-white disabled:opacity-25"
                            aria-label="Previous carousel slide"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSlideIndex((index) => Math.min(carouselFallbackItems(selected).length - 1, index + 1))}
                            disabled={selectedSlideIndex >= carouselFallbackItems(selected).length - 1}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl font-black text-white disabled:opacity-25"
                            aria-label="Next carousel slide"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/55 px-2 py-1">
                            {carouselFallbackItems(selected).map((item, index) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedSlideIndex(index)}
                                className={`h-1.5 w-1.5 rounded-full ${index === selectedSlideIndex ? "bg-white" : "bg-white/35"}`}
                                aria-label={`Show carousel slide ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <img src={selected.mediaUrl} alt="" className="max-h-[72vh] w-full bg-black object-contain" />
                  )
                ) : (
                  <div className="flex aspect-square items-center justify-center text-sm text-white/30">Media pending</div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Caption</p>
                    <button
                      type="button"
                      onClick={generateClientCaption}
                      disabled={captionGenerating || !selected.mediaUrl}
                      className="rounded-full border border-[#01F17C]/30 bg-[#01F17C]/10 px-3 py-1.5 text-[11px] font-black text-[#01F17C] transition-colors hover:bg-[#01F17C]/15 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {captionGenerating ? "Generating" : generatedCaption ? "Regenerate" : "Generate caption"}
                    </button>
                  </div>
                  <p className="min-h-32 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75">
                    {generatedCaption || selected.caption || "Caption pending."}
                  </p>
                  {(generatedCaption || captionMessage) && (
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className={`text-xs font-semibold ${captionMessage === "Caption generated." || captionMessage === "Caption copied." ? "text-[#01F17C]/75" : "text-white/45"}`}>
                        {captionMessage}
                      </p>
                      {generatedCaption && (
                        <button
                          type="button"
                          onClick={copyGeneratedCaption}
                          className="shrink-0 text-xs font-black text-white/55 underline underline-offset-4 hover:text-white"
                        >
                          Copy caption
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/35">Change request</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white outline-none focus:border-[#01F17C]"
                    placeholder="Write what needs to change."
                  />
                </label>

                {error && <p className="text-sm font-semibold text-red-300">{error}</p>}

                {(selectedDownloadUrl || selected.mediaType === "carousel") && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={downloadSelectedMedia}
                      disabled={downloading}
                      className={`${selectedThumbnailDownloadRoute ? "" : "sm:col-span-2"} block rounded-2xl border border-[#01F17C]/35 bg-[#01F17C]/10 px-4 py-3 text-center text-sm font-black text-[#01F17C] transition-colors hover:bg-[#01F17C]/15 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {downloading ? (selected.mediaType === "carousel" ? "Preparing slides" : "Preparing download") : selected.mediaType === "carousel" ? "Download all slides" : selected.mediaType === "video" ? "Download video" : "Download media"}
                    </button>
                    {selectedThumbnailDownloadRoute && (
                      <button
                        type="button"
                        onClick={downloadSelectedVideoThumbnail}
                        disabled={downloading}
                        className="block rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center text-sm font-black text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {downloading ? "Preparing thumbnail" : "Download thumbnail"}
                      </button>
                    )}
                  </div>
                )}

                {downloadMessage && <p className="text-xs font-semibold text-white/45">{downloadMessage}</p>}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => submitFeedback("needs_edits")}
                    disabled={saving}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    Request changes
                  </button>
                  <button
                    onClick={() => submitFeedback("approved")}
                    disabled={saving}
                    className="rounded-2xl bg-[#01F17C] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>

                <button
                  onClick={() => submitFeedback("posted")}
                  disabled={saving}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-black transition-colors disabled:opacity-50 ${
                    selected.status === "posted"
                      ? "border-[#0A84FF]/50 bg-[#0A84FF]/15 text-[#4da3ff]"
                      : "border-[#0A84FF]/35 bg-[#0A84FF]/10 text-[#4da3ff] hover:bg-[#0A84FF]/20"
                  }`}
                >
                  {selected.status === "posted" ? "Posted ✓" : "Mark as posted"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="mx-auto min-h-screen max-w-[480px] bg-[#1a1a1a] shadow-2xl shadow-black/30">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-white/10 bg-[#1a1a1a]/95 px-4 backdrop-blur">
          <div className="absolute left-4 text-lg font-black tracking-tight text-white/20">ASTROSHOT</div>
          <p className="text-base font-black text-white">{calendar.slug}</p>
          <div className="absolute right-4">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-colors hover:bg-white/10"
              aria-label="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {newPosts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#01F17C] px-1 text-[10px] font-black text-black">
                  {newPosts.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-[#222222] p-3 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Notifications</p>
                  {newPosts.length > 0 && (
                    <button type="button" onClick={markAllSeen} className="text-[11px] font-black text-[#01F17C] hover:text-white">
                      Mark all seen
                    </button>
                  )}
                </div>

                {newPosts.length === 0 ? (
                  <p className="mt-3 text-sm text-white/40">No new content.</p>
                ) : (
                  <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                    {newPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          selectPost(post);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-left transition-colors hover:bg-white/[0.07]"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-black/40">
                          {postThumbUrl(post) ? (
                            <img src={postThumbUrl(post)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/25">NEW</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{post.label}</p>
                          <p className="text-[11px] font-semibold text-[#01F17C]">New content uploaded</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <section className="border-b border-white/10 px-5 py-6">
          <div className="grid grid-cols-[96px_1fr] items-center gap-5">
            <div className="aspect-square overflow-hidden rounded-full border border-white/10 bg-black/40">
              {calendar.logoUrl ? (
                <img src={calendar.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-black text-white/30">LOGO</div>
              )}
            </div>

            <div className="grid grid-cols-3 text-center">
              <div>
                <p className="text-2xl font-black text-white">{filledPosts}</p>
                <p className="text-sm text-white/75">posts</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{calendar.followers || "-"}</p>
                <p className="text-sm text-white/75">followers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{calendar.following || "-"}</p>
                <p className="text-sm text-white/75">following</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h1 className="text-xl font-black text-white">{calendar.clientName}</h1>
            <p className="mt-1 text-base text-white/55">{calendar.bio || calendar.campaignTitle}</p>
          </div>

          {calendar.highlights.some((highlight) => highlight.iconUrl || highlight.label) && (
            <div className="relative mt-5">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 pr-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {calendar.highlights.map((highlight) => (
                  <div key={highlight.id} className="w-16 shrink-0 snap-start text-center">
                    <button
                      type="button"
                      onClick={() => downloadHighlight(highlight)}
                      disabled={!highlight.iconUrl}
                      className="mx-auto flex aspect-square w-14 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30 disabled:cursor-default"
                      aria-label={highlight.iconUrl ? `Download ${highlight.label || "highlight"}` : undefined}
                    >
                      {highlight.iconUrl ? (
                        <img src={highlight.iconUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-white/25">+</span>
                      )}
                    </button>
                    <p className="mt-1 truncate text-[11px] font-semibold text-white/55">{highlight.label}</p>
                  </div>
                ))}
              </div>
              {calendar.highlights.length > 5 && <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#1a1a1a] to-transparent" />}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="rounded-lg bg-[#0A84FF] py-2.5 text-sm font-black text-white">Follow</button>
            <button className="rounded-lg bg-white/15 py-2.5 text-sm font-black text-white">Message</button>
          </div>
        </section>

        <div className="flex h-10 items-center justify-center border-b border-white/10">
          <div className="flex items-center justify-center gap-2">
            <span className="grid w-max grid-cols-3 gap-0.5" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-1 w-1 rounded-[1.5px] bg-white/45" />)}
            </span>
            <p className="text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-white/35">
              {orderSaving ? "Saving grid" : orderMessage || "Drag posts to reorder"}
            </p>
          </div>
        </div>

        <section className="grid grid-cols-3 gap-px bg-black">
          {gridPosts.map((post, index) => (
            <button
              key={`${post.id}-${index}`}
              type="button"
              data-post-id={post.id}
              draggable
              onClick={() => {
                if (dragMovedRef.current) return;
                selectPost(post);
              }}
              onDragStart={(event) => {
                setDraggingPostId(post.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", post.id);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const sourcePostId = event.dataTransfer.getData("text/plain");
                setDraggingPostId(sourcePostId);
                reorderToPost(post.id, sourcePostId);
                finishDrag();
              }}
              onDragEnd={finishDrag}
              onPointerDown={(event) => {
                const handle = (event.target as HTMLElement).closest("[data-drag-handle]");
                if (!handle) return;
                setDraggingPostId(post.id);
                dragMovedRef.current = false;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!draggingPostId) return;
                const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
                const target = element?.closest("[data-post-id]") as HTMLElement | null;
                const targetPostId = target?.dataset.postId;
                if (targetPostId) reorderToPost(targetPostId);
              }}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              className={`group relative aspect-[4/5] overflow-hidden bg-[#242424] text-left transition-transform ${draggingPostId === post.id ? "z-10 scale-95 opacity-70" : ""}`}
            >
              {post.mediaUrl ? (
                post.mediaType === "video" ? (
                  <>
                    {post.thumbnailUrl ? (
                      <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <video src={`${post.mediaUrl}#t=0.2`} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    )}
                    <span className="absolute right-2 top-2 text-xl text-white drop-shadow">▣</span>
                  </>
                ) : post.mediaType === "carousel" ? (
                  <>
                    {carouselFallbackItems(post)[0]?.mediaType === "video" ? (
                      carouselFallbackItems(post)[0]?.thumbnailUrl ? (
                        <img src={carouselFallbackItems(post)[0].thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <video src={`${carouselFallbackItems(post)[0]?.url || post.mediaUrl}#t=0.2`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" muted playsInline preload="metadata" />
                      )
                    ) : (
                      <img src={carouselPreviewUrl(carouselFallbackItems(post)[0]) || post.mediaUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-1 text-[9px] font-black text-white">{post.carouselItems?.length || 1}</span>
                  </>
                ) : (
                  <img src={post.mediaUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/20">
                  {post.label}
                </div>
              )}
              {post.isNew && (
                <span className="absolute left-2 top-2 z-10 rounded-md bg-[#01F17C] px-1.5 py-1 text-[9px] font-black uppercase tracking-wide text-black shadow">
                  New
                </span>
              )}
              <span className={`absolute bottom-1.5 left-1.5 rounded-md px-1.5 py-1 text-[9px] font-black ${statusClass(post.status)}`}>
                {statusCopy[post.status]}
              </span>
              <span
                data-drag-handle
                className="absolute bottom-1.5 right-1.5 flex h-7 w-7 touch-none cursor-grab items-center justify-center rounded-full bg-black/60 text-xs font-black text-white/80 shadow-lg active:cursor-grabbing"
                aria-hidden="true"
              >
                ⋮⋮
              </span>
            </button>
          ))}
        </section>

        <footer className="flex h-28 items-center justify-center gap-2 text-sm text-white/25">
          <span className="font-black tracking-tight text-white/20">ASTROSHOT</span>
          <span>Presented by Astroshot</span>
        </footer>
      </div>
    </main>
  );
}
