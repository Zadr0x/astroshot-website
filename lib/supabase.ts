import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Project = {
  id: string;
  title: string;
  category: "Mixed Reality" | "Full CGI" | "Cinema AI" | "Social Media Content" | "Motion Graphics" | "Branding" | "VFX" | "Social Media" | "3D Animation";
  description: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  media_type: "image" | "video";
  featured: boolean;
  status: "draft" | "published";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  company: string | null;
  service: string | null;
  message: string;
  email: string | null;
  phone: string | null;
  status: "new" | "read" | "replied";
  created_at: string;
};

export type Service = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type SiteContent = {
  id: string;
  key: string;
  value: string;
  label: string | null;
  section: string | null;
  updated_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

let _client: SupabaseClient<AnyDB> | null = null;

export function getSupabase(): SupabaseClient<AnyDB> {
  if (!_client) {
    _client = createClient<AnyDB>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );
  }
  return _client;
}

export const supabase: SupabaseClient<AnyDB> = new Proxy(
  {} as SupabaseClient<AnyDB>,
  {
    get(_target, prop) {
      return getSupabase()[prop as keyof SupabaseClient<AnyDB>];
    },
  }
);

export async function uploadFile(file: File, bucket: string): Promise<string | null> {
  const client = getSupabase();
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    console.error("Upload failed:", bucket, error);
    return null;
  }

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
