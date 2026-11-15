import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import type { UploadedBrandAsset } from "@/lib/client-questionnaire";

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const BUCKET = "client-brand-assets";
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/zip",
  "application/x-zip-compressed",
  "application/postscript",
  "application/illustrator",
  "application/octet-stream",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

type PresignPayload = {
  name?: string;
  type?: string;
  size?: number;
};

function buildStoragePath(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
}

export async function POST(request: Request) {
  const session = await getClientPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Large file upload storage is not configured" }, { status: 500 });
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

  if (!name || !size) {
    return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
  }

  if (size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `${name} is larger than 250MB` }, { status: 400 });
  }

  if (type && !ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: `${name} is not a supported brand file type` }, { status: 400 });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  await client.storage.createBucket(BUCKET, {
    public: true,
  });

  const path = buildStoragePath(name);
  const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(path, {
    upsert: true,
  });

  if (error || !data) {
    console.error("Signed upload URL failed:", error?.message);
    return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });
  }

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);

  const file: UploadedBrandAsset = {
    name,
    url: urlData.publicUrl,
    type,
    size,
  };

  return NextResponse.json({
    provider: "supabase",
    bucket: BUCKET,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    file,
  });
}
