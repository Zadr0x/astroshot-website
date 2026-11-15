"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_STYLE_CATEGORY,
  STYLE_CATEGORIES,
  type AiFactory,
  type StyleCategoryId,
} from "@/lib/content-calendar";
import type { FalVideoModelKey } from "@/lib/fal-video";

type MagicPage = "home" | "factory" | "generate" | "calendar" | "voice" | "gallery" | "chat" | "profile";
type GenerateMode = "image" | "video" | "voice";

type MagicStyle = {
  id: string;
  name: string;
  type: "image" | "video" | "both";
  prompt: string;
  image: string;
  category: StyleCategoryId;
  sourceUrl?: string;
};

type MagicCharacter = {
  id: string;
  name: string;
  voice: string;
  image: string;
  prompt: string;
  sourceUrl?: string;
};

type MagicProject = {
  id: string;
  name: string;
  createdAt: string;
  posts: Array<{ id: string; title: string; type: "image" | "video"; caption: string; status: "draft" | "ready" }>;
};

type MagicGalleryItem = {
  id: string;
  type: "image" | "video" | "voice" | "caption";
  title: string;
  createdAt: string;
  preview: string;
};

type MagicWorkspace = {
  styles: MagicStyle[];
  characters: MagicCharacter[];
  projects: MagicProject[];
  gallery: MagicGalleryItem[];
  credits: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "astro-magic-product-workspace-v1";
const CHAT_KEY = "astro-magic-product-chat-v1";

const styleImages = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
];

const characterImages = [
  "https://api.dicebear.com/9.x/notionists/svg?seed=Maya&backgroundColor=111827",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Lina&backgroundColor=1e1b4b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Omar&backgroundColor=0f172a",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Reem&backgroundColor=312e81",
];

const voiceOptions = [
  { id: "Kore", label: "Kore", tone: "Firm" },
  { id: "Puck", label: "Puck", tone: "Upbeat" },
  { id: "Zephyr", label: "Zephyr", tone: "Bright" },
  { id: "Aoede", label: "Aoede", tone: "Breezy" },
  { id: "Sulafat", label: "Sulafat", tone: "Warm" },
  { id: "Achird", label: "Achird", tone: "Friendly" },
];

const toneOptions = ["Formal", "Friendly", "Luxury", "Cinematic", "Funny", "Promotional"];

const videoModelOptions: Array<{ key: FalVideoModelKey; label: string }> = [
  { key: "seedance-2-fast", label: "Seedance 2 Fast" },
  { key: "seedance-2-pro", label: "Seedance 2 Pro" },
  { key: "kling-2-6", label: "Kling 2.6" },
  { key: "kling-3", label: "Kling 3" },
  { key: "kling-motion", label: "Kling Motion" },
  { key: "veo-3", label: "Veo 3" },
  { key: "veo-3-1", label: "Veo 3.1" },
];

const durationOptions = ["4", "5", "6", "8", "10"];
const aspectRatioOptions = ["9:16", "4:5", "1:1", "16:9", "auto"];

const categoryLabel: Record<StyleCategoryId, string> = {
  trend: "Trend",
  travel: "Travel",
  product: "Product",
  kuwait: "Kuwait",
  studio: "Studio",
  house: "House",
  outdoor: "Outdoor",
  portrait: "Portrait",
};

function videoResolutionChoices(modelKey: FalVideoModelKey) {
  if (modelKey.startsWith("seedance")) return ["480p", "720p", "1080p"];
  if (modelKey === "kling-3") return ["720p", "1080p", "4k"];
  if (modelKey === "kling-2-6") return ["1080p"];
  if (modelKey === "kling-motion") return ["720p", "1080p"];
  if (modelKey === "veo-3" || modelKey === "veo-3-1") return ["720p", "1080p"];
  return ["720p"];
}

function mapFactoryToWorkspace(factory: AiFactory, current: MagicWorkspace): MagicWorkspace {
  const mappedCharacters = factory.aiAssets.models.map((asset) => ({
    id: asset.id,
    name: asset.name || "Astro Character",
    voice: "Kore",
    image: asset.previewUrl || asset.url,
    sourceUrl: asset.url,
    prompt: asset.notes || "Astroshot AI character sheet from AI Factory.",
  }));

  const mappedStyles = factory.aiAssets.references.map((asset) => ({
    id: asset.id,
    name: asset.name || "Astro Style",
    type: asset.styleUsage ?? "both",
    prompt: asset.notes || "Astroshot style reference from AI Factory.",
    image: asset.previewUrl || asset.url,
    category: asset.styleCategory ?? DEFAULT_STYLE_CATEGORY,
    sourceUrl: asset.url,
  }));

  return {
    ...current,
    styles: mappedStyles.length ? mappedStyles : current.styles,
    characters: mappedCharacters.length ? mappedCharacters : current.characters,
  };
}

function starterWorkspace(): MagicWorkspace {
  return {
    credits: 118,
    styles: [
      { id: "editorial-luxe", name: "Editorial Luxe", type: "both", prompt: "Premium editorial lighting, sculpted shadows, luxury campaign framing, refined styling.", image: styleImages[0], category: "portrait" },
      { id: "street-campaign", name: "Street Campaign", type: "image", prompt: "Authentic street-style capture, natural texture, handheld energy, high-end social ad.", image: styleImages[1], category: "trend" },
      { id: "product-orbit", name: "Product Orbit", type: "video", prompt: "Product rotates through a cinematic scene with controlled camera movement and clean motion.", image: styleImages[4], category: "product" },
      { id: "kuwait-night", name: "Kuwait Night", type: "both", prompt: "Night city glow, premium GCC lifestyle energy, clean highlights, believable atmosphere.", image: styleImages[2], category: "kuwait" },
      { id: "studio-minimal", name: "Studio Minimal", type: "image", prompt: "Quiet premium studio setup, strong product clarity, restrained styling, soft gradients.", image: styleImages[3], category: "studio" },
    ],
    characters: [
      { id: "maya", name: "Maya", voice: "Kore", image: characterImages[0], prompt: "Synthetic AI commercial character, confident luxury presenter, clean fashion styling." },
      { id: "lina", name: "Lina", voice: "Aoede", image: characterImages[1], prompt: "Synthetic AI commercial character, warm social host, natural smile, lifestyle energy." },
      { id: "omar", name: "Omar", voice: "Puck", image: characterImages[2], prompt: "Synthetic AI commercial character, upbeat brand narrator, polished casual wardrobe." },
      { id: "reem", name: "Reem", voice: "Sulafat", image: characterImages[3], prompt: "Synthetic AI creative director character, premium delivery, stylish and direct." },
    ],
    projects: [],
    gallery: [],
  };
}

function readWorkspace(): MagicWorkspace {
  if (typeof window === "undefined") return starterWorkspace();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as MagicWorkspace | null;
    if (!parsed || !Array.isArray(parsed.styles) || !Array.isArray(parsed.characters)) return starterWorkspace();
    return {
      ...starterWorkspace(),
      ...parsed,
      styles: parsed.styles.map((style) => ({ ...style, category: style.category ?? DEFAULT_STYLE_CATEGORY })),
      characters: parsed.characters,
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
    };
  } catch {
    return starterWorkspace();
  }
}

function saveWorkspace(workspace: MagicWorkspace) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `project-${Date.now()}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function Icon({ name }: { name: "home" | "plus" | "gallery" | "chat" | "profile" | "factory" | "mic" | "calendar" | "image" | "video" }) {
  const common = "h-5 w-5";
  if (name === "home") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11.5 12 4l9 7.5" /><path d="M6.5 10.5V20h11v-9.5" /></svg>;
  if (name === "plus") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "gallery") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m7 16 3.5-4 3 3 2-2.5L19 16" /></svg>;
  if (name === "chat") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 6.5h14v9.5H9l-4 3Z" /><path d="M9 10h6M9 13h3" /></svg>;
  if (name === "profile") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.5-3.2 3.8-4.8 7-4.8s5.5 1.6 7 4.8" /></svg>;
  if (name === "factory") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V9l5 3V8l5 4V7l6 4v9Z" /><path d="M8 16h2M14 16h2" /></svg>;
  if (name === "mic") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>;
  if (name === "calendar") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
  if (name === "image") return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="m7 17 4-5 3 3 2-2 2 4" /></svg>;
  return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="14" rx="3" /><path d="m10 9 6 3-6 3Z" /></svg>;
}

function Shell({ page, children, credits }: { page: MagicPage; children: React.ReactNode; credits: number }) {
  const router = useRouter();
  const nav = [
    { page: "home" as MagicPage, label: "Home", icon: "home" as const, href: "/astro-magic" },
    { page: "generate" as MagicPage, label: "Generate", icon: "plus" as const, href: "/astro-magic/generate" },
    { page: "chat" as MagicPage, label: "Chat", icon: "chat" as const, href: "/astro-magic/chat" },
    { page: "gallery" as MagicPage, label: "Gallery", icon: "gallery" as const, href: "/astro-magic/gallery" },
    { page: "profile" as MagicPage, label: "Profile", icon: "profile" as const, href: "/astro-magic/profile" },
  ];
  const activeIndex = Math.max(0, nav.findIndex((item) => item.page === page));
  const [glassIndex, setGlassIndex] = useState(activeIndex);
  const [draggingNav, setDraggingNav] = useState(false);

  useEffect(() => {
    if (!draggingNav) setGlassIndex(activeIndex);
  }, [activeIndex, draggingNav]);

  const updateGlassFromPointer = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const index = Math.min(nav.length - 1, Math.max(0, Math.floor(x / (rect.width / nav.length))));
    setGlassIndex(index);
    return index;
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] pb-24 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(1,241,124,0.13),transparent_30%),radial-gradient(circle_at_85%_4%,rgba(255,143,183,0.16),transparent_24%),linear-gradient(140deg,#050507,#090812_42%,#02140b)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-4 sm:px-8 lg:px-10">
        <header className="mb-5 flex items-center justify-between">
          <Link href="/astro-magic" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#01F17C]/35 bg-[#01F17C]/12 text-lg font-black text-[#01F17C] shadow-[0_0_35px_rgba(1,241,124,0.18)]">✦</span>
            <span className="text-xl font-black tracking-[-0.04em]">ASTRO <span className="text-[#01F17C]">MAGIC</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/astro-magic/profile" className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/70 sm:flex">
              <Icon name="profile" /> Team
            </Link>
            <div className="flex h-10 items-center gap-2 rounded-full border border-[#01F17C]/25 bg-[#01F17C]/10 px-3 text-sm font-black text-[#01F17C]">
              <span>✦</span> {credits}
            </div>
          </div>
        </header>
        {children}
      </div>
      <nav
        onPointerDown={(event) => {
          setDraggingNav(true);
          updateGlassFromPointer(event);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (draggingNav) updateGlassFromPointer(event);
        }}
        onPointerUp={(event) => {
          const nextIndex = updateGlassFromPointer(event);
          setDraggingNav(false);
          router.push(nav[nextIndex]?.href ?? "/astro-magic");
        }}
        onPointerCancel={() => {
          setDraggingNav(false);
          setGlassIndex(activeIndex);
        }}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto h-[74px] max-w-[560px] touch-none overflow-hidden rounded-[30px] border border-white/18 bg-white/[0.11] px-2 shadow-[0_18px_70px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl"
      >
        <div
          className="pointer-events-none absolute top-2 h-[58px] rounded-[28px] border border-white/18 bg-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_34px_rgba(1,241,124,0.14)] backdrop-blur-3xl transition-[left,transform,width] duration-200"
          style={{
            width: draggingNav ? "118px" : "74px",
            left: `calc(${(glassIndex + 0.5) * 20}% - ${draggingNav ? "59px" : "37px"})`,
            transform: draggingNav ? "scale(1.08)" : "scale(1)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_50%,rgba(255,255,255,0.22),transparent_22%)] opacity-50" />
        <div className="relative grid h-full grid-cols-5">
        {nav.map((item) => {
          const active = page === item.page || nav[glassIndex]?.page === item.page;
          return (
            <Link key={item.label} href={item.href} onClick={(event) => event.preventDefault()} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] text-[10px] font-semibold transition-colors ${active ? "text-[#01F17C]" : "text-white/78"}`}>
              <Icon name={item.icon} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </nav>
    </main>
  );
}

function ProjectDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          setName("");
        }}
        className="w-full max-w-md rounded-[30px] border border-white/12 bg-[#101018] p-5 shadow-[0_25px_90px_rgba(0,0,0,0.7)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.03em]">Project name</h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60">×</button>
        </div>
        <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Lil Orbit June" className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-base font-semibold text-white outline-none placeholder:text-white/28 focus:border-[#01F17C]/50" />
        <button type="submit" className="mt-4 h-13 w-full rounded-2xl bg-[#01F17C] text-sm font-black text-black">OK</button>
      </form>
    </div>
  );
}

function useWorkspace() {
  const [workspace, setWorkspaceState] = useState<MagicWorkspace>(() => starterWorkspace());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const localWorkspace = readWorkspace();
    setWorkspaceState(localWorkspace);
    setReady(true);

    fetch("/api/astro-magic/factory")
      .then((response) => response.ok ? response.json() : null)
      .then((data: { factory?: AiFactory } | null) => {
        if (!data?.factory) return;
        setWorkspaceState((current) => {
          const merged = mapFactoryToWorkspace(data.factory!, current);
          saveWorkspace(merged);
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  const setWorkspace = (next: MagicWorkspace | ((current: MagicWorkspace) => MagicWorkspace)) => {
    setWorkspaceState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      saveWorkspace(resolved);
      return resolved;
    });
  };

  return { workspace, setWorkspace, ready };
}

export default function AstroMagicProduct({ page, slug }: { page: MagicPage; slug?: string }) {
  const router = useRouter();
  const { workspace, setWorkspace, ready } = useWorkspace();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const createProject = (name: string) => {
    const id = `${slugify(name)}-${Date.now().toString(36)}`;
    const project: MagicProject = {
      id,
      name,
      createdAt: new Date().toISOString(),
      posts: Array.from({ length: 12 }, (_, index) => ({
        id: `post-${index + 1}`,
        title: `Content ${index + 1}`,
        type: index % 3 === 0 ? "video" : "image",
        caption: "",
        status: "draft",
      })),
    };
    setWorkspace((current) => ({ ...current, projects: [project, ...current.projects] }));
    setProjectDialogOpen(false);
    router.push(`/astro-magic/calendar/${project.id}`);
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#050507] p-4">
        <div className="mx-auto h-[80dvh] max-w-6xl animate-pulse rounded-[32px] bg-white/[0.05]" />
      </main>
    );
  }

  return (
    <Shell page={page} credits={workspace.credits}>
      {page === "home" && <HomeView workspace={workspace} onNewProject={() => setProjectDialogOpen(true)} />}
      {page === "factory" && <FactoryView workspace={workspace} setWorkspace={setWorkspace} />}
      {page === "generate" && <GenerateView workspace={workspace} setWorkspace={setWorkspace} />}
      {page === "calendar" && slug ? <ProjectCalendarView slug={slug} workspace={workspace} setWorkspace={setWorkspace} /> : page === "calendar" ? <CalendarListView workspace={workspace} onNewProject={() => setProjectDialogOpen(true)} /> : null}
      {page === "voice" && <VoiceView workspace={workspace} setWorkspace={setWorkspace} />}
      {page === "gallery" && <GalleryView workspace={workspace} setWorkspace={setWorkspace} />}
      {page === "chat" && <ChatView />}
      {page === "profile" && <ProfileView workspace={workspace} />}
      <ProjectDialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} onCreate={createProject} />
    </Shell>
  );
}

function HomeView({ workspace, onNewProject }: { workspace: MagicWorkspace; onNewProject: () => void }) {
  const [mode, setMode] = useState<"video" | "image" | "voice">("video");
  const filteredStyles = workspace.styles.filter((style) => {
    if (mode === "voice") return true;
    return style.type === "both" || style.type === mode;
  });
  const groupedStyles = STYLE_CATEGORIES.map((category) => ({
    id: category.id,
    name: categoryLabel[category.id],
    styles: filteredStyles.filter((style) => style.category === category.id),
  })).filter((category) => category.styles.length > 0);

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] p-2">
        {[
          { id: "video" as const, label: "Video" },
          { id: "image" as const, label: "Image" },
          { id: "voice" as const, label: "Voice Over" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`h-12 rounded-[18px] text-sm font-black transition-colors sm:text-base ${
              mode === item.id ? "bg-[#01F17C] text-black" : "text-white/68 hover:bg-white/[0.06]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-35 mix-blend-screen md:block" />
        <div className="relative max-w-2xl py-8">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#01F17C]">Content Calendar</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl">Start a new project.</h1>
          <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-white/45">Write the project name first, then open a clean calendar for images, videos, captions, approval, and generated assets.</p>
          <button type="button" onClick={onNewProject} className="mt-7 inline-flex h-13 items-center gap-3 rounded-2xl bg-[#01F17C] px-6 text-sm font-black text-black">
            <Icon name="calendar" />
            New Content Calendar
          </button>
        </div>
      </section>

      <section className="space-y-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-[-0.03em]">Astro Magic Folders</h2>
          <Link href={mode === "voice" ? "/astro-magic/generate?mode=voice" : `/astro-magic/generate?mode=${mode}`} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black text-white/55">
            Open
          </Link>
        </div>
        {groupedStyles.map((folder) => (
          <div key={folder.id}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-[-0.03em] text-white/70">{folder.name}</h3>
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-black text-white/35">{folder.styles.length}</span>
            </div>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
              {folder.styles.map((style) => (
                <Link key={style.id} href={mode === "voice" ? "/astro-magic/generate?mode=voice" : `/astro-magic/generate?mode=${mode}&style=${style.id}`} className="group relative h-64 w-[72vw] max-w-[300px] flex-none snap-start overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] sm:w-auto sm:max-w-none">
                  <img src={style.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur">{mode === "voice" ? "voice" : mode}</div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="line-clamp-2 text-lg font-black">{style.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/48">{style.prompt || "Open in Astro Magic"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function GenerateView({ workspace, setWorkspace }: { workspace: MagicWorkspace; setWorkspace: (next: MagicWorkspace | ((current: MagicWorkspace) => MagicWorkspace)) => void }) {
  const [mode, setMode] = useState<GenerateMode>("image");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [videoModel, setVideoModel] = useState<FalVideoModelKey>("seedance-2-fast");
  const [duration, setDuration] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [resolution, setResolution] = useState("720p");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [referenceVideo, setReferenceVideo] = useState("");
  const [referenceAudio, setReferenceAudio] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextMode = params.get("mode");
    if (nextMode === "video" || nextMode === "image" || nextMode === "voice") setMode(nextMode);
    const style = params.get("style");
    if (style) setSelectedStyle(style);
  }, []);

  const styles = workspace.styles.filter((style) => mode === "voice" || style.type === "both" || style.type === mode);
  const activeStyle = styles.find((style) => style.id === selectedStyle) ?? styles[0];
  const activeCharacter = workspace.characters.find((item) => item.id === selectedCharacter) ?? workspace.characters[0];
  const resolutionChoices = videoResolutionChoices(videoModel);
  const supportsReferenceVideo = videoModel.startsWith("seedance") || videoModel === "kling-motion";
  const supportsReferenceAudio = videoModel.startsWith("seedance");

  const generate = () => {
    if (mode === "voice") return;
    const title = prompt.trim() || `${mode === "video" ? "Video" : "Image"} concept`;
    setBusy(true);
    window.setTimeout(() => {
      const item: MagicGalleryItem = {
        id: `asset-${Date.now()}`,
        type: mode,
        title,
        createdAt: new Date().toISOString(),
        preview: uploadedImage || (activeStyle?.image ?? styleImages[0]),
      };
      setWorkspace((current) => ({ ...current, credits: Math.max(0, current.credits - (mode === "video" ? 8 : 3)), gallery: [item, ...current.gallery] }));
      setBusy(false);
    }, 800);
  };

  if (mode === "voice") {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <ModeTabs mode={mode} setMode={setMode} />
        <VoiceView workspace={workspace} setWorkspace={setWorkspace} compact />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <ModeTabs mode={mode} setMode={setMode} />

      <section className="rounded-[30px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-[-0.03em]">Astro Magic {mode === "video" ? "Video" : "Photo"}</h1>
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-white/45">{mode === "video" ? "8" : "3"} credits</span>
        </div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={mode === "video" ? "Write your prompt..." : "Write your image idea..."} className="min-h-[220px] w-full resize-none rounded-[24px] border border-white/10 bg-black/28 p-4 text-lg font-semibold leading-7 text-white outline-none placeholder:text-white/28 focus:border-[#01F17C]/45" />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
        <h2 className="mb-3 text-lg font-black">Upload</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <UploadTile
            label={mode === "video" ? "Start / reference image" : "Image reference"}
            accept="image/*"
            value={uploadedImage}
            onChange={setUploadedImage}
          />
          {mode === "video" && supportsReferenceVideo && (
            <UploadTile
              label={videoModel === "kling-motion" ? "Reference motion video" : "Reference video"}
              accept="video/*"
              value={referenceVideo}
              onChange={setReferenceVideo}
              kind="video"
            />
          )}
          {mode === "video" && supportsReferenceAudio && (
            <UploadTile
              label="Reference audio"
              accept="audio/*"
              value={referenceAudio}
              onChange={setReferenceAudio}
              kind="audio"
            />
          )}
        </div>
      </section>

      {mode === "video" && (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
          <h2 className="mb-3 text-lg font-black">Video Settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">Video model</span>
              <select value={videoModel} onChange={(event) => {
                const next = event.target.value as FalVideoModelKey;
                setVideoModel(next);
                const choices = videoResolutionChoices(next);
                setResolution(choices.includes(resolution) ? resolution : choices[0]);
                setDuration(next.startsWith("seedance") ? "5" : next === "veo-3" || next === "veo-3-1" ? "8" : duration);
                setAspectRatio(next === "veo-3" || next === "veo-3-1" ? "9:16" : aspectRatio);
              }} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45">
                {videoModelOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">Resolution</span>
              <select value={resolution} onChange={(event) => setResolution(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45">
                {resolutionChoices.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">Duration</span>
              <select value={duration} onChange={(event) => setDuration(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45">
                {durationOptions.map((option) => <option key={option} value={option}>{option}s</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">Aspect ratio</span>
              <select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45">
                {aspectRatioOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <textarea value={negativePrompt} onChange={(event) => setNegativePrompt(event.target.value)} placeholder="Negative prompt (optional)" className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-semibold outline-none placeholder:text-white/28 focus:border-[#01F17C]/45" />
          <p className="mt-3 text-xs leading-5 text-white/35">Selected AI characters and style images use the same Astroshot AI Factory references as the dashboard.</p>
        </section>
      )}

      <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">Styles</h2>
          <span className="text-xs font-bold text-white/35">Our styles</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {styles.map((style) => (
            <button key={style.id} type="button" onClick={() => setSelectedStyle(style.id)} className={`w-32 shrink-0 overflow-hidden rounded-2xl border text-left ${activeStyle?.id === style.id ? "border-[#01F17C]" : "border-white/10"}`}>
              <img src={style.image} alt="" className="h-24 w-full object-cover" />
              <p className="truncate px-3 py-2 text-xs font-black">{style.name}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">Characters</h2>
          <span className="text-xs font-semibold text-white/35">Synthetic references</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {workspace.characters.map((character) => (
            <button key={character.id} type="button" onClick={() => setSelectedCharacter(character.id)} className={`rounded-2xl border bg-white/[0.04] p-2 ${activeCharacter?.id === character.id ? "border-[#01F17C]" : "border-white/10"}`}>
              <img src={character.image} alt="" className="aspect-square w-full rounded-full object-cover" />
              <p className="mt-2 truncate text-xs font-black">{character.name}</p>
            </button>
          ))}
        </div>
      </section>

      <button type="button" onClick={generate} disabled={busy} className="h-14 w-full rounded-[22px] bg-[#01F17C] text-base font-black text-black disabled:opacity-45">
        {busy ? "Generating..." : mode === "video" ? "Generate Video" : "Generate Photo"}
      </button>
    </div>
  );
}

function ModeTabs({ mode, setMode }: { mode: GenerateMode; setMode: (mode: GenerateMode) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] p-2">
      {[
        { id: "video" as const, label: "Video" },
        { id: "image" as const, label: "Image" },
        { id: "voice" as const, label: "Voice Over" },
      ].map((item) => (
        <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`h-12 rounded-[18px] text-sm font-black transition-colors sm:text-base ${mode === item.id ? "bg-[#01F17C] text-black" : "text-white/68 hover:bg-white/[0.06]"}`}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function UploadTile({ label, accept, value, onChange, kind = "image" }: { label: string; accept: string; value: string; onChange: (url: string) => void; kind?: "image" | "video" | "audio" }) {
  return (
    <label className="group relative flex min-h-36 cursor-pointer flex-col justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/25 p-4 text-center transition-colors hover:border-[#01F17C]/45">
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          onChange(URL.createObjectURL(file));
        }}
      />
      {value ? (
        kind === "image" ? <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          : kind === "video" ? <video src={value} className="absolute inset-0 h-full w-full object-cover opacity-75" muted playsInline />
            : <div className="absolute inset-x-4 top-1/2 -translate-y-1/2"><audio src={value} controls className="w-full" /></div>
      ) : null}
      <div className="relative z-10 mx-auto w-fit rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs font-black text-white/75 backdrop-blur">
        {value ? "Replace" : label}
      </div>
    </label>
  );
}

function FactoryView({ workspace, setWorkspace }: { workspace: MagicWorkspace; setWorkspace: (next: MagicWorkspace | ((current: MagicWorkspace) => MagicWorkspace)) => void }) {
  const [styleName, setStyleName] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [styleType, setStyleType] = useState<"image" | "video" | "both">("both");
  const [characterName, setCharacterName] = useState("");

  const addStyle = () => {
    if (!styleName.trim()) return;
    const style: MagicStyle = {
      id: `style-${Date.now()}`,
      name: styleName.trim(),
      prompt: stylePrompt.trim() || "Premium commercial style.",
      type: styleType,
      image: styleImages[workspace.styles.length % styleImages.length],
      category: DEFAULT_STYLE_CATEGORY,
    };
    setWorkspace((current) => ({ ...current, styles: [style, ...current.styles] }));
    setStyleName("");
    setStylePrompt("");
  };

  const addCharacter = () => {
    if (!characterName.trim()) return;
    const character: MagicCharacter = {
      id: `character-${Date.now()}`,
      name: characterName.trim(),
      voice: "Kore",
      image: characterImages[workspace.characters.length % characterImages.length],
      prompt: "Synthetic AI commercial character reference.",
    };
    setWorkspace((current) => ({ ...current, characters: [character, ...current.characters] }));
    setCharacterName("");
  };

  const removeStyle = (id: string) => setWorkspace((current) => ({ ...current, styles: current.styles.filter((style) => style.id !== id) }));
  const removeCharacter = (id: string) => setWorkspace((current) => ({ ...current, characters: current.characters.filter((item) => item.id !== id) }));

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5">
        <h1 className="text-3xl font-black tracking-[-0.04em]">AI Factory</h1>
        <div className="mt-5 space-y-3">
          <input value={styleName} onChange={(event) => setStyleName(event.target.value)} placeholder="Style name" className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45" />
          <textarea value={stylePrompt} onChange={(event) => setStylePrompt(event.target.value)} placeholder="Style direction" className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45" />
          <div className="grid grid-cols-3 gap-2">
            {(["image", "video", "both"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setStyleType(item)} className={`h-11 rounded-xl border text-xs font-black capitalize ${styleType === item ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/[0.05]"}`}>{item}</button>
            ))}
          </div>
          <button type="button" onClick={addStyle} className="h-12 w-full rounded-2xl bg-[#01F17C] text-sm font-black text-black">Add Style</button>
        </div>
        <div className="mt-7 space-y-3">
          <input value={characterName} onChange={(event) => setCharacterName(event.target.value)} placeholder="Character name" className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45" />
          <button type="button" onClick={addCharacter} className="h-12 w-full rounded-2xl border border-[#01F17C]/35 bg-[#01F17C]/10 text-sm font-black text-[#01F17C]">Add Character</button>
        </div>
      </section>
      <section className="space-y-5">
        <div>
          <h2 className="mb-3 text-xl font-black">Styles</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {workspace.styles.map((style) => (
              <article key={style.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                <img src={style.image} alt="" className="h-32 w-full object-cover" />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{style.name}</p>
                    <button type="button" onClick={() => removeStyle(style.id)} className="text-white/35 hover:text-red-300">×</button>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/42">{style.prompt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-black">Characters</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {workspace.characters.map((character) => (
              <article key={character.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <img src={character.image} alt="" className="aspect-square w-full rounded-full object-cover" />
                <div className="mt-2 flex items-center justify-between">
                  <p className="truncate text-sm font-black">{character.name}</p>
                  <button type="button" onClick={() => removeCharacter(character.id)} className="text-white/35 hover:text-red-300">×</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CalendarListView({ workspace, onNewProject }: { workspace: MagicWorkspace; onNewProject: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#01F17C]">Projects</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">Content Calendars</h1>
        </div>
        <button type="button" onClick={onNewProject} className="h-11 rounded-full bg-[#01F17C] px-5 text-sm font-black text-black">New</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {workspace.projects.map((project) => (
          <Link key={project.id} href={`/astro-magic/calendar/${project.id}`} className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 hover:border-[#01F17C]/35">
            <p className="text-xl font-black">{project.name}</p>
            <p className="mt-2 text-sm text-white/40">{project.posts.filter((post) => post.status === "ready").length}/{project.posts.length} ready · {formatDate(project.createdAt)}</p>
          </Link>
        ))}
        {workspace.projects.length === 0 && <button type="button" onClick={onNewProject} className="min-h-56 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] text-sm font-black text-white/35">Create first project</button>}
      </div>
    </div>
  );
}

function ProjectCalendarView({ slug, workspace, setWorkspace }: { slug: string; workspace: MagicWorkspace; setWorkspace: (next: MagicWorkspace | ((current: MagicWorkspace) => MagicWorkspace)) => void }) {
  const router = useRouter();
  const project = workspace.projects.find((item) => item.id === slug);
  if (!project) {
    return <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-8 text-center"><p className="text-xl font-black">Project not found</p><Link href="/astro-magic/calendar" className="mt-4 inline-flex rounded-full bg-[#01F17C] px-5 py-3 text-sm font-black text-black">Back</Link></div>;
  }
  const updatePost = (id: string, patch: Partial<MagicProject["posts"][number]>) => {
    setWorkspace((current) => ({
      ...current,
      projects: current.projects.map((item) => item.id === project.id ? { ...item, posts: item.posts.map((post) => post.id === id ? { ...post, ...patch } : post) } : item),
    }));
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#01F17C]">Content Calendar</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">{project.name}</h1>
        </div>
        <Link href="/astro-magic/generate" className="h-11 rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-black">Generate</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {project.posts.map((post, index) => (
          <article key={post.id} className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-black">{post.title}</p>
              <select value={post.type} onChange={(event) => updatePost(post.id, { type: event.target.value as "image" | "video" })} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-bold outline-none">
                <option value="image">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/astro-magic/generate?mode=${post.type}&project=${project.id}&slot=${post.id}`)}
              className="group relative mb-3 flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-black/35"
            >
              <img src={styleImages[index % styleImages.length]} alt="" className="h-full w-full object-cover opacity-65" />
              <span className="absolute inset-x-6 bottom-5 rounded-full border border-white/15 bg-black/45 px-4 py-3 text-center text-sm font-black text-white backdrop-blur transition-colors group-hover:bg-[#01F17C] group-hover:text-black">
                Open Astro Magic {post.type === "video" ? "Video" : "Image"}
              </span>
            </button>
            <textarea value={post.caption} onChange={(event) => updatePost(post.id, { caption: event.target.value })} placeholder="Caption" className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-3 text-sm outline-none focus:border-[#01F17C]/45" />
            <button type="button" onClick={() => updatePost(post.id, { status: post.status === "ready" ? "draft" : "ready" })} className={`mt-3 h-10 w-full rounded-xl text-sm font-black ${post.status === "ready" ? "bg-[#01F17C] text-black" : "border border-white/10 bg-white/[0.06]"}`}>{post.status === "ready" ? "Ready" : "Draft"}</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function VoiceView({ workspace, setWorkspace, compact = false }: { workspace: MagicWorkspace; setWorkspace: (next: MagicWorkspace | ((current: MagicWorkspace) => MagicWorkspace)) => void; compact?: boolean }) {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("Kore");
  const [tone, setTone] = useState("Formal");
  const [brand, setBrand] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateVoice = async () => {
    if (!script.trim()) return;
    setLoading(true);
    setError("");
    setAudioUrl("");
    const res = await fetch("/api/astro-magic/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script, voice, tone, brand }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Voice generation failed.");
      return;
    }
    const data = (await res.json()) as { audio: string };
    setAudioUrl(data.audio);
    setWorkspace((current) => ({
      ...current,
      credits: Math.max(0, current.credits - 8),
      gallery: [{ id: `voice-${Date.now()}`, type: "voice", title: script.slice(0, 48) || "Voice generation", createdAt: new Date().toISOString(), preview: "" }, ...current.gallery],
    }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-[-0.03em]">Voice Generations</h1>
          {!compact && <Link href="/astro-magic/gallery" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"><Icon name="gallery" /></Link>}
        </div>
        <textarea value={script} onChange={(event) => setScript(event.target.value)} placeholder="Enter text" className="min-h-[300px] w-full resize-none rounded-[26px] border border-white/10 bg-black/25 p-4 text-lg font-semibold leading-7 outline-none placeholder:text-white/28 focus:border-[#01F17C]/45" />
      </section>
      <section className="rounded-[26px] border border-white/10 bg-white/[0.055] p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Brand name" className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45" />
          <select value={voice} onChange={(event) => setVoice(event.target.value)} className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold outline-none focus:border-[#01F17C]/45">
            {voiceOptions.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.tone}</option>)}
          </select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {toneOptions.map((item) => (
            <button key={item} type="button" onClick={() => setTone(item)} className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-bold ${tone === item ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/[0.06]"}`}>{item}</button>
          ))}
        </div>
      </section>
      <button type="button" onClick={generateVoice} disabled={loading || !script.trim()} className="h-14 w-full rounded-[22px] border border-[#01F17C]/50 bg-[#01F17C] text-base font-black text-black disabled:opacity-40">{loading ? "Generating..." : "Generate Speech"}</button>
      {error && <p className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</p>}
      {audioUrl && <audio src={audioUrl} controls className="w-full" />}
    </div>
  );
}

function GalleryView({ workspace, setWorkspace }: { workspace: MagicWorkspace; setWorkspace: (next: MagicWorkspace | ((current: MagicWorkspace) => MagicWorkspace)) => void }) {
  const [filter, setFilter] = useState<"all" | MagicGalleryItem["type"]>("all");
  const items = workspace.gallery.filter((item) => filter === "all" || item.type === filter);
  const remove = (id: string) => setWorkspace((current) => ({ ...current, gallery: current.gallery.filter((item) => item.id !== id) }));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-4xl font-black tracking-[-0.04em]">Gallery</h1>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["all", "image", "video", "caption", "voice"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`h-10 rounded-xl border px-4 text-sm font-black capitalize ${filter === item ? "border-[#01F17C] bg-[#01F17C] text-black" : "border-white/10 bg-white/[0.06]"}`}>{item}</button>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article key={item.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05]">
            <div className="flex aspect-[4/3] items-center justify-center bg-black/35">
              {item.type === "voice" ? <Icon name="mic" /> : <img src={item.preview || styleImages[index % styleImages.length]} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="line-clamp-1 font-black">{item.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/35">{item.type} · {formatDate(item.createdAt)}</p>
                </div>
                <button onClick={() => remove(item.id)} className="text-white/35 hover:text-red-300">×</button>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 && <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-sm font-bold text-white/35">No items yet</div>}
      </div>
    </div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try { setMessages(JSON.parse(window.localStorage.getItem(CHAT_KEY) ?? "[]")); } catch {}
  }, []);
  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(next));
    setInput("");
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/astro-magic/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Chat failed.");
        return;
      }
      const data = (await res.json()) as { reply: string };
      const withReply: ChatMessage[] = [...next, { role: "assistant", content: data.reply }];
      setMessages(withReply);
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(withReply));
    } catch {
      setError("Chat connection failed. Refresh and try again.");
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="mx-auto flex min-h-[74dvh] max-w-3xl flex-col">
      <div className="flex-1 space-y-3">
        {messages.length === 0 ? <div className="pt-24 text-center"><h1 className="text-5xl font-black tracking-[-0.05em]">AI Chat</h1></div> : messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#01F17C] text-black" : "border border-white/10 bg-white/[0.06]"}`}>{message.content}</div></div>
        ))}
        {sending && <div className="w-fit rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/45">Thinking...</div>}
        {error && <p className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</p>}
      </div>
      <div className="mt-5 rounded-[28px] border border-white/10 bg-black/55 p-3 backdrop-blur-xl">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask anything" className="min-h-20 w-full resize-none bg-transparent p-3 outline-none placeholder:text-white/28" />
        <button onClick={send} disabled={sending || !input.trim()} className="h-11 w-full rounded-2xl bg-[#01F17C] text-sm font-black text-black disabled:opacity-45">{sending ? "Sending..." : "Send"}</button>
      </div>
    </div>
  );
}

function ProfileView({ workspace }: { workspace: MagicWorkspace }) {
  return (
    <div className="mx-auto max-w-3xl rounded-[30px] border border-white/10 bg-white/[0.06] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#01F17C] text-3xl font-black text-black">A</div>
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em]">Astro Magic Team</h1>
          <p className="mt-1 text-sm font-semibold text-white/42">{workspace.credits} credits · {workspace.projects.length} projects</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/astro-magic/calendar" className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 font-black">Projects</Link>
        <Link href="/astro-magic/gallery" className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 font-black">Gallery</Link>
        <Link href="/astro-magic/voice" className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 font-black">Voice Over</Link>
      </div>
    </div>
  );
}
