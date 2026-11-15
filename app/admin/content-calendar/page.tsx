"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

type CalendarSummary = {
  slug: string;
  clientName: string;
  campaignTitle: string;
  logoUrl: string;
  totalPosts: number;
  filledPosts: number;
  updatedAt: string;
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#01F17C]";
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35";

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ContentCalendarProjectsPage() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<CalendarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return calendars.reduce(
      (summary, calendar) => ({
        projects: summary.projects + 1,
        slots: summary.slots + calendar.totalPosts,
        filled: summary.filled + calendar.filledPosts,
      }),
      { projects: 0, slots: 0, filled: 0 }
    );
  }, [calendars]);

  useEffect(() => {
    loadCalendars();
  }, []);

  const getSessionToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return null;
    }
    return session.access_token;
  };

  const loadCalendars = async () => {
    const token = await getSessionToken();
    if (!token) return;

    const res = await fetch("/api/admin/content-calendar", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError("Could not load content calendar projects.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { calendars: CalendarSummary[] };
    setCalendars(data.calendars);
    setLoading(false);
  };

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = await getSessionToken();
    if (!token) return;

    setCreating(true);
    setError("");

    const res = await fetch("/api/admin/content-calendar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName,
        campaignTitle,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not create project.");
      return;
    }

    const data = (await res.json()) as { calendar: { slug: string } };
    router.push(`/admin/content-calendar/${data.calendar.slug}`);
  };

  const deleteProject = async (calendar: CalendarSummary) => {
    const confirmed = window.confirm(`Delete ${calendar.clientName} content calendar? This cannot be undone.`);
    if (!confirmed) return;

    const token = await getSessionToken();
    if (!token) return;

    setDeletingSlug(calendar.slug);
    setError("");

    const res = await fetch(`/api/admin/content-calendar?slug=${encodeURIComponent(calendar.slug)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setDeletingSlug("");

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not delete project.");
      return;
    }

    setCalendars((current) => current.filter((item) => item.slug !== calendar.slug));
  };

  if (loading) {
    return <div className="p-6 lg:p-10"><div className="h-96 rounded-2xl bg-[#111] animate-pulse" /></div>;
  }

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Content Calendar" />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-white">{totals.projects}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Projects</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-[#01F17C]">{totals.filled}/{totals.slots}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Filled content</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-3xl font-black text-white">{formatDate(calendars[0]?.updatedAt ?? "")}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#555]">Latest update</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="mb-5">
          <h2 className="text-lg font-black text-white">Create client project</h2>
          <p className="mt-1 text-sm text-white/40">Create a new private content calendar, then upload media and captions inside the project.</p>
        </div>

        <form onSubmit={createProject} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label>
            <span className={labelClass}>Client name</span>
            <input
              className={fieldClass}
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Example: Lil Orbit"
              required
            />
          </label>
          <label>
            <span className={labelClass}>Campaign</span>
            <input
              className={fieldClass}
              value={campaignTitle}
              onChange={(event) => setCampaignTitle(event.target.value)}
              placeholder="Example: June Content Calendar"
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition-colors hover:bg-[#00d96e] disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Projects</h2>
            <p className="mt-1 text-sm text-white/40">Open a client project to edit logo, bio, highlights, content, captions, and dates.</p>
          </div>
        </div>

        {calendars.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-sm font-semibold text-white/50">No content calendar projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {calendars.map((calendar) => (
              <article key={calendar.slug} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-black text-white/35">
                    {calendar.logoUrl ? (
                      <img src={calendar.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      calendar.clientName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-black text-white">{calendar.clientName}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-white/45">{calendar.campaignTitle}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-white/35">
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5">{calendar.filledPosts}/{calendar.totalPosts} filled</span>
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5">Updated {formatDate(calendar.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/content-calendar/${calendar.slug}`}
                    className="rounded-xl bg-[#01F17C] px-4 py-2 text-sm font-black text-black transition-colors hover:bg-[#00d96e]"
                  >
                    Open Project
                  </Link>
                  <Link
                    href={`/client/preview/${calendar.slug}`}
                    target="_blank"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Preview
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteProject(calendar)}
                    disabled={deletingSlug === calendar.slug}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {deletingSlug === calendar.slug ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
