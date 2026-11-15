import { getSupabaseServiceClient } from "@/lib/access-control";
import {
  aiVideoJobsStorageKey,
  normalizeCalendarSlug,
  parseAiVideoJobs,
  type AiVideoJob,
} from "@/lib/content-calendar";

function now() {
  return new Date().toISOString();
}

export async function getAiVideoJobs(slug: string) {
  const normalizedSlug = normalizeCalendarSlug(slug) || "content-calendar";
  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", aiVideoJobsStorageKey(normalizedSlug))
    .maybeSingle();

  if (error) {
    console.error("AI video jobs read failed:", error.message);
    return [];
  }

  return parseAiVideoJobs(data?.value);
}

export async function saveAiVideoJobs(slug: string, jobs: AiVideoJob[]) {
  const normalizedSlug = normalizeCalendarSlug(slug) || "content-calendar";
  const client = getSupabaseServiceClient();
  const prunedJobs = jobs
    .filter((job) => job.endpointId && job.requestId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 50);

  const { error } = await client.from("site_content").upsert({
    key: aiVideoJobsStorageKey(normalizedSlug),
    value: JSON.stringify({ jobs: prunedJobs, updatedAt: now() }),
    label: `${normalizedSlug} AI Video Jobs`,
    section: "content-calendar-video-jobs",
    updated_at: now(),
  }, { onConflict: "key" });

  if (error) {
    console.error("AI video jobs save failed:", error.message);
    throw error;
  }
}

export async function upsertAiVideoJob(slug: string, job: AiVideoJob) {
  const normalizedSlug = normalizeCalendarSlug(slug) || "content-calendar";
  const jobs = await getAiVideoJobs(normalizedSlug);
  const nextJob: AiVideoJob = {
    ...job,
    slug: normalizedSlug,
    updatedAt: now(),
  };
  const existingIndex = jobs.findIndex((item) => item.id === nextJob.id || item.requestId === nextJob.requestId);
  const nextJobs = existingIndex >= 0
    ? jobs.map((item, index) => index === existingIndex ? { ...item, ...nextJob } : item)
    : [nextJob, ...jobs];

  await saveAiVideoJobs(normalizedSlug, nextJobs);
  return nextJob;
}

export async function updateAiVideoJob(slug: string, requestId: string, patch: Partial<AiVideoJob>) {
  const normalizedSlug = normalizeCalendarSlug(slug) || "content-calendar";
  const jobs = await getAiVideoJobs(normalizedSlug);
  const index = jobs.findIndex((job) => job.requestId === requestId);
  if (index < 0) return null;

  const nextJob: AiVideoJob = {
    ...jobs[index],
    ...patch,
    slug: normalizedSlug,
    updatedAt: now(),
  };
  const nextJobs = jobs.map((job, jobIndex) => jobIndex === index ? nextJob : job);
  await saveAiVideoJobs(normalizedSlug, nextJobs);
  return nextJob;
}
