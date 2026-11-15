import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calendarStorageKey,
  normalizeCalendarSlug,
  parseContentCalendar,
  type ContentCalendar,
} from "@/lib/content-calendar";

const MAX_HISTORY_SNAPSHOTS = 30;

export type CalendarHistoryActor = "admin" | "client" | "system";
export type CalendarHistoryAction = "admin_save" | "client_feedback" | "client_reorder" | "restore";

export type CalendarHistorySnapshot = {
  id: string;
  slug: string;
  createdAt: string;
  actor: CalendarHistoryActor;
  action: CalendarHistoryAction;
  summary: string;
  calendar: ContentCalendar;
};

type CalendarHistoryStore = {
  snapshots: CalendarHistorySnapshot[];
};

export function calendarHistoryStorageKey(slug: string) {
  return `${calendarStorageKey(slug)}_history`;
}

function parseHistory(value: string | null | undefined, slug: string): CalendarHistoryStore {
  if (!value) return { snapshots: [] };
  try {
    const parsed = JSON.parse(value) as Partial<CalendarHistoryStore>;
    return {
      snapshots: Array.isArray(parsed.snapshots)
        ? parsed.snapshots
            .filter((snapshot): snapshot is CalendarHistorySnapshot => Boolean(snapshot?.id && snapshot.calendar))
            .map((snapshot) => ({
              ...snapshot,
              slug: normalizeCalendarSlug(snapshot.slug || slug) || normalizeCalendarSlug(slug),
              calendar: parseContentCalendar(JSON.stringify(snapshot.calendar), slug),
            }))
        : [],
    };
  } catch {
    return { snapshots: [] };
  }
}

export async function readCalendarHistory(client: SupabaseClient, slug: string) {
  const normalizedSlug = normalizeCalendarSlug(slug) || "content-calendar";
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarHistoryStorageKey(normalizedSlug))
    .maybeSingle();

  if (error) throw error;
  return parseHistory(data?.value, normalizedSlug).snapshots;
}

export async function saveCalendarSnapshot(
  client: SupabaseClient,
  slug: string,
  calendar: ContentCalendar,
  meta: { actor: CalendarHistoryActor; action: CalendarHistoryAction; summary: string },
) {
  const normalizedSlug = normalizeCalendarSlug(slug) || "content-calendar";
  const snapshots = await readCalendarHistory(client, normalizedSlug).catch((error) => {
    console.error("Content calendar history read failed:", error.message);
    return [] as CalendarHistorySnapshot[];
  });

  const snapshot: CalendarHistorySnapshot = {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    slug: normalizedSlug,
    createdAt: new Date().toISOString(),
    actor: meta.actor,
    action: meta.action,
    summary: meta.summary,
    calendar: {
      ...calendar,
      slug: normalizedSlug,
    },
  };

  const nextStore: CalendarHistoryStore = {
    snapshots: [snapshot, ...snapshots].slice(0, MAX_HISTORY_SNAPSHOTS),
  };

  const { error } = await client.from("site_content").upsert({
    key: calendarHistoryStorageKey(normalizedSlug),
    value: JSON.stringify(nextStore),
    label: `${calendar.clientName || normalizedSlug} Content Calendar History`,
    section: "content-calendar-history",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) {
    console.error("Content calendar history save failed:", error.message);
  }

  return snapshot;
}

