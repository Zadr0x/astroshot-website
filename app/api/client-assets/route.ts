import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import type { UploadedBrandAsset } from "@/lib/client-questionnaire";
import { uploadMedia } from "@/lib/media-upload";

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const MAX_FILES = 8;
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
]);

async function uploadClientAsset(file: File) {
  const cloudUrl = await uploadMedia(file, "client-brand-assets");
  if (cloudUrl) return cloudUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await client.storage.from("client-brand-assets").upload(path, file, {
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    console.error("Client asset upload failed:", error.message);
    return null;
  }

  const { data: urlData } = client.storage.from("client-brand-assets").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function POST(request: Request) {
  const session = await getClientPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files selected" }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Upload up to ${MAX_FILES} files at a time` }, { status: 400 });
  }

  const uploaded: UploadedBrandAsset[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${file.name} is larger than 250MB` }, { status: 400 });
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `${file.name} is not a supported brand file type` }, { status: 400 });
    }

    const url = await uploadClientAsset(file);
    if (!url) {
      return NextResponse.json({ error: `Could not upload ${file.name}` }, { status: 500 });
    }

    uploaded.push({
      name: file.name,
      url,
      type: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return NextResponse.json({ files: uploaded });
}
