import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { requireTeamAccount } from "@/lib/admin-auth";
import { canAccessCalendarSlug } from "@/lib/access-control";
import {
  CONTENT_CALENDAR_BUCKET,
  isAllowedCalendarUpload,
  normalizeCalendarSlug,
} from "@/lib/content-calendar";
import {
  buildObjectKey,
  createR2PresignedPutUrl,
  getR2PublicUrl,
  hasR2Config,
  R2_BUCKET,
} from "@/lib/media-upload";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const SUPABASE_DIRECT_UPLOAD_LIMIT = 10 * 1024 * 1024;

type PresignPayload = {
  slug?: string;
  name?: string;
  type?: string;
  size?: number;
};

function buildStoragePath(slug: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${normalizeCalendarSlug(slug) || "content-calendar"}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function createUploadRelayToken(payload: {
  path: string;
  type: string;
  size: number;
  exp: number;
}) {
  const secret = process.env.UPLOAD_RELAY_SECRET;
  if (!secret) return null;
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("hex");
  return `${encodedPayload}.${signature}`;
}

export async function POST(request: Request) {
  const { account, response } = await requireTeamAccount(request, "canManageContentCalendar");
  if (response) return response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
  }

  let payload: PresignPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = payload.name?.trim();
  const type = payload.type?.trim() || "application/octet-stream";
  const size = Number(payload.size ?? 0);
  const slug = normalizeCalendarSlug(payload.slug ?? "content-calendar") || "content-calendar";

  if (account && !canAccessCalendarSlug(account, slug)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!name || !size) {
    return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
  }

  if (size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `${name} is larger than 500MB` }, { status: 400 });
  }

  if (!isAllowedCalendarUpload(type)) {
    return NextResponse.json({ error: `${name} must be an image, video, or audio file` }, { status: 400 });
  }

  const r2DirectUploadsEnabled = process.env.ENABLE_R2_DIRECT_UPLOADS === "true";
  const uploadRelayBaseUrl = process.env.UPLOAD_RELAY_BASE_URL?.replace(/\/$/, "");
  if (uploadRelayBaseUrl && hasR2Config() && size > SUPABASE_DIRECT_UPLOAD_LIMIT) {
    const path = buildObjectKey(CONTENT_CALENDAR_BUCKET, name);
    const token = createUploadRelayToken({
      path,
      type,
      size,
      exp: Math.floor(Date.now() / 1000) + 20 * 60,
    });
    if (!token) {
      return NextResponse.json({ error: "Large file upload relay is not configured" }, { status: 500 });
    }

    return NextResponse.json({
      provider: "upload-relay",
      bucket: R2_BUCKET,
      path,
      signedUrl: `${uploadRelayBaseUrl}/upload?token=${encodeURIComponent(token)}`,
      file: {
        name,
        url: getR2PublicUrl(path),
        type,
        size,
      },
    });
  }

  if (r2DirectUploadsEnabled && hasR2Config()) {
    const path = buildObjectKey(CONTENT_CALENDAR_BUCKET, name);
    const signedUrl = createR2PresignedPutUrl(path);
    if (!signedUrl) {
      return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });
    }

    return NextResponse.json({
      provider: "cloudflare-r2",
      bucket: R2_BUCKET,
      path,
      signedUrl,
      file: {
        name,
        url: getR2PublicUrl(path),
        type,
        size,
      },
    });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  await client.storage.createBucket(CONTENT_CALENDAR_BUCKET, {
    public: true,
    fileSizeLimit: null,
  });
  await client.storage.updateBucket(CONTENT_CALENDAR_BUCKET, {
    public: true,
    fileSizeLimit: null,
  });

  const path = buildStoragePath(slug, name);
  const { data, error } = await client.storage.from(CONTENT_CALENDAR_BUCKET).createSignedUploadUrl(path, {
    upsert: true,
  });

  if (error || !data) {
    console.error("Content calendar signed upload failed:", error?.message);
    return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });
  }

  const { data: urlData } = client.storage.from(CONTENT_CALENDAR_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    bucket: CONTENT_CALENDAR_BUCKET,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    file: {
      name,
      url: urlData.publicUrl,
      type,
      size,
    },
  });
}
