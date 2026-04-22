import { createClient } from "@supabase/supabase-js";

// Admin client with service role key — bypasses RLS for storage uploads
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function uploadFileAdmin(file: File, bucket: string): Promise<string | null> {
  const client = getSupabaseAdmin();
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    console.error("Admin upload failed:", bucket, error.message);
    return null;
  }

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
