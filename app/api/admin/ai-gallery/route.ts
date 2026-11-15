import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canAccessCalendarSlug, getSupabaseServiceClient } from "@/lib/access-control";
import { parseContentCalendar } from "@/lib/content-calendar";

type CalendarRow = {
  key: string;
  value: string | null;
  updated_at: string | null;
};

function calendarSlugFromKey(key: string) {
  return key.replace(/^content_calendar_/, "");
}

export async function GET(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("key,value,updated_at")
    .eq("section", "content-calendar")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("AI gallery read failed:", error.message);
    return NextResponse.json({ error: "Could not load gallery" }, { status: 500 });
  }

  const items = ((data as CalendarRow[] | null) ?? [])
    .filter((row) => row.key.startsWith("content_calendar_"))
    .flatMap((row) => {
      const slug = calendarSlugFromKey(row.key);
      if (!account || !canAccessCalendarSlug(account, slug)) return [];

      const calendar = parseContentCalendar(row.value, slug);
      return calendar.posts.flatMap((post, postIndex) => {
        const generated = post.generatedMedia.length > 0
          ? post.generatedMedia
          : post.mediaUrl ? [{
              id: `${post.id}-current`,
              url: post.mediaUrl,
              originalUrl: post.originalMediaUrl,
              thumbnailUrl: post.thumbnailUrl,
              mediaType: post.mediaType,
              prompt: post.aiPrompt,
              source: "upload" as const,
              createdAt: calendar.updatedAt || row.updated_at || "",
            }] : [];

        return generated.map((asset) => ({
          id: `${calendar.slug}-${post.id}-${asset.id}`,
          url: asset.url,
          originalUrl: asset.originalUrl || asset.url,
          thumbnailUrl: asset.thumbnailUrl,
          mediaType: asset.mediaType,
          prompt: asset.prompt || post.aiPrompt,
          source: asset.source,
          createdAt: asset.createdAt || calendar.updatedAt || row.updated_at || "",
          projectSlug: calendar.slug,
          projectName: calendar.clientName || calendar.slug,
          postLabel: post.label || `Content ${postIndex + 1}`,
        }));
      });
    })
    .filter((item) => Boolean(item.url))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return NextResponse.json({ items });
}
