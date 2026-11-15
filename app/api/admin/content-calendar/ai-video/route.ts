import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canAccessCalendarSlug } from "@/lib/access-control";
import { upsertAiVideoJob } from "@/lib/ai-video-jobs";
import { normalizeCalendarSlug } from "@/lib/content-calendar";
import { submitFalVideo, type FalVideoPayload } from "@/lib/fal-video";

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canUseAiTools");
  if (response) return response;

  let payload: FalVideoPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";
  if (account && !canAccessCalendarSlug(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await submitFalVideo(payload);
    const createdAt = new Date().toISOString();
    const job = await upsertAiVideoJob(slug, {
      id: `video-job-${result.requestId}`,
      slug,
      postIndex: Number.isFinite(Number(payload.postIndex)) ? Number(payload.postIndex) : 0,
      postLabel: payload.postLabel || "Content",
      status: "pending",
      endpointId: result.endpointId,
      requestId: result.requestId,
      statusUrl: result.statusUrl,
      responseUrl: result.responseUrl,
      modelKey: result.modelKey,
      prompt: payload.prompt ?? "",
      videoPrompt: payload.videoPrompt ?? payload.prompt ?? "",
      thumbnailUrl: payload.thumbnailUrl ?? payload.startImageUrl ?? "",
      videoUrl: "",
      sourceVideoUrl: "",
      error: "",
      logs: [],
      createdAt,
      updatedAt: createdAt,
      completedAt: "",
    });
    return NextResponse.json({ ...result, job });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start video generation" }, { status: 500 });
  }
}
