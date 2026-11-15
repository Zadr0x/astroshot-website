import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canAccessCalendarSlug } from "@/lib/access-control";
import { updateAiVideoJob } from "@/lib/ai-video-jobs";
import { normalizeCalendarSlug } from "@/lib/content-calendar";
import {
  extractFalVideoUrl,
  getFalResult,
  getFalStatus,
  uploadGeneratedVideoToSupabase,
} from "@/lib/fal-video";

function text(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;

  let payload: {
    endpointId?: string;
    requestId?: string;
    statusUrl?: string;
    responseUrl?: string;
    slug?: string;
    postLabel?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const endpointId = text(payload.endpointId);
  const requestId = text(payload.requestId);
  if (!endpointId || !requestId) {
    return NextResponse.json({ error: "Missing fal request details" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (account && !canAccessCalendarSlug(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const status = await getFalStatus(endpointId, requestId, payload.statusUrl);
    const normalizedStatus = text(status.status).toUpperCase();
    if (["FAILED", "ERROR", "CANCELLED", "CANCELED"].includes(normalizedStatus)) {
      const latestLog = status.logs?.map((log) => log.message).filter(Boolean).at(-1);
      const job = await updateAiVideoJob(slug, requestId, {
        status: "failed",
        error: latestLog || `fal video generation ${status.status || "failed"}`,
        logs: status.logs ?? [],
      });
      return NextResponse.json({
        error: latestLog || `fal video generation ${status.status || "failed"}`,
        status: status.status || "FAILED",
        logs: status.logs ?? [],
        job,
      }, { status: 500 });
    }

    if (!["COMPLETED", "SUCCEEDED"].includes(normalizedStatus)) {
      const job = await updateAiVideoJob(slug, requestId, {
        status: "processing",
        logs: status.logs ?? [],
      });
      return NextResponse.json({
        status: status.status || "IN_PROGRESS",
        logs: status.logs ?? [],
        job,
      });
    }

    const result = await getFalResult(endpointId, requestId, payload.responseUrl || status.response_url);
    const falVideoUrl = extractFalVideoUrl(result);
    if (!falVideoUrl) {
      return NextResponse.json({ error: "fal returned no video URL" }, { status: 500 });
    }

    const videoUrl = await uploadGeneratedVideoToSupabase({
      slug: payload.slug,
      postLabel: payload.postLabel,
      videoUrl: falVideoUrl,
    });
    const job = await updateAiVideoJob(slug, requestId, {
      status: "completed",
      videoUrl,
      sourceVideoUrl: falVideoUrl,
      logs: status.logs ?? [],
      completedAt: new Date().toISOString(),
      error: "",
    });

    return NextResponse.json({
      status: "COMPLETED",
      videoUrl,
      sourceVideoUrl: falVideoUrl,
      job,
    });
  } catch (error) {
    console.error("AI video status failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read video generation status" }, { status: 500 });
  }
}
