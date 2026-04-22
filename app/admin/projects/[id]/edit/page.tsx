"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectImage } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadProject();
    });
  }, [router, id]);

  const loadProject = async () => {
    const [{ data: p }, { data: imgs }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
    ]);
    setProject(p as Project);
    setImages((imgs as ProjectImage[]) ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="h-8 w-48 bg-[#111] rounded-xl animate-pulse mb-8" />
        <div className="h-96 bg-[#111] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 lg:p-10 text-center text-[#555]">
        Project not found.{" "}
        <Link href="/admin/projects" className="text-[#01F17C] hover:underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title={`Edit: ${project.title}`}
        actions={
          <Link href="/admin/projects" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
            ← Back
          </Link>
        }
      />
      <ProjectForm
        initialData={project}
        initialImages={images}
        projectId={id}
        onSuccess={() => router.push("/admin/projects")}
      />
    </div>
  );
}
