import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { BlogPost, Client, Project, ProjectImage } from "@/lib/supabase";

function createPublicContentClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

async function fetchPublishedProjects(): Promise<Project[]> {
  const client = createPublicContentClient();
  const { data, error } = await client
    .from("projects")
    .select("id,title,category,thumbnail_url,media_url,media_type,featured,status,sort_order,created_at,updated_at")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to load published projects:", error.message);
    return [];
  }

  return ((data ?? []).map((project) => ({
    ...project,
    description: null,
  })) as Project[]) ?? [];
}

export const getPublishedProjects = unstable_cache(
  fetchPublishedProjects,
  ["published-projects-v3"],
  {
    revalidate: 300,
    tags: ["published-projects"],
  }
);

async function fetchActiveClients(): Promise<Client[]> {
  const client = createPublicContentClient();
  const { data, error } = await client
    .from("clients")
    .select("id,name,logo_url,website_url,sort_order,active,created_at")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load active clients:", error.message);
    return [];
  }

  return (data as Client[]) ?? [];
}

export const getActiveClients = unstable_cache(fetchActiveClients, ["active-clients"], {
  revalidate: 300,
  tags: ["active-clients"],
});

export async function getPublishedProject(id: string): Promise<Project | null> {
  const client = createPublicContentClient();
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to load published project:", error.message);
    return null;
  }

  return (data as Project | null) ?? null;
}

export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  const client = createPublicContentClient();
  const { data, error } = await client
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load project images:", error.message);
    return [];
  }

  return (data as ProjectImage[]) ?? [];
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const client = createPublicContentClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load published blog posts:", error.message);
    return [];
  }

  return (data as BlogPost[]) ?? [];
}
