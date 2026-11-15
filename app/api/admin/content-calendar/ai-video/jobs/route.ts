import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canAccessCalendarSlug } from "@/lib/access-control";
import { getAiVideoJobs } from "@/lib/ai-video-jobs";
import { normalizeCalendarSlug } from "@/lib/content-calendar";

function text(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const slug = normalizeCalendarSlug(searchParams.get("slug") ?? "content-calendar") || "content-calendar";
  if (account && !canAccessCalendarSlug(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const includeCompleted = text(searchParams.get("includeCompleted")) === "1";
  const jobs = await getAiVideoJobs(slug);
  const visibleJobs = includeCompleted
    ? jobs
    : jobs.filter((job) => job.status === "pending" || job.status === "processing");

  return NextResponse.json({ jobs: visibleJobs });
}
