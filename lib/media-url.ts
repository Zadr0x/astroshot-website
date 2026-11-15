const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const R2_PUBLIC_HOST = "pub-cedabf5231a848dfb49375ca69e25d88.r2.dev";
const PUBLIC_STORAGE_BUCKETS = new Set([
  "thumbnails",
  "media",
  "project-images",
  "blog-covers",
  "client-logos",
  "hero-video",
]);

export function normalizePublicMediaUrl(url: string | null | undefined) {
  if (!url) return url ?? null;
  if (!SUPABASE_URL) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== R2_PUBLIC_HOST) return url;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const bucketIndex = parts[0] === "astroshot" ? 1 : 0;
    const bucket = parts[bucketIndex];
    const objectPath = parts.slice(bucketIndex + 1).join("/");

    if (!bucket || !objectPath || !PUBLIC_STORAGE_BUCKETS.has(bucket)) return url;

    return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;
  } catch {
    return url;
  }
}
