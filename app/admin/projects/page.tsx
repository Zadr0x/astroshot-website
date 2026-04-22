"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";

const categoryColors: Record<string, string> = {
  VFX: "bg-[#01F17C]/10 text-[#01F17C]",
  "Social Media": "bg-blue-500/10 text-blue-400",
  Branding: "bg-purple-500/10 text-purple-400",
  "3D Animation": "bg-orange-500/10 text-orange-400",
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    let result = projects;
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    setFiltered(result);
  }, [projects, categoryFilter, statusFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/admin/login"); return; }
    loadProjects();
  };

  const loadProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await supabase.from("projects").delete().eq("id", id);
    loadProjects();
  };

  const toggleFeatured = async (project: Project) => {
    await supabase.from("projects").update({ featured: !project.featured }).eq("id", project.id);
    loadProjects();
  };

  const toggleStatus = async (project: Project) => {
    const newStatus = project.status === "published" ? "draft" : "published";
    await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);
    loadProjects();
  };

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Projects"
        actions={
          <Link
            href="/admin/projects/new"
            className="px-4 py-2 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] transition-colors"
          >
            + Add Project
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-[#01F17C]"
        >
          <option value="all">All Categories</option>
          <option>VFX</option>
          <option>Social Media</option>
          <option>Branding</option>
          <option>3D Animation</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-[#01F17C]"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <span className="ml-auto text-xs text-[#555] self-center">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#555]">
          <p>No projects found.</p>
          <Link href="/admin/projects/new" className="mt-3 inline-block text-sm text-[#01F17C] hover:underline">
            Add your first project →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555] hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555] hidden md:table-cell">Featured</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555] hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-white">{project.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[project.category] ?? "bg-white/10 text-white"}`}>
                      {project.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(project)} title="Click to toggle">
                      <StatusBadge status={project.status} />
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button
                      onClick={() => toggleFeatured(project)}
                      className={`text-sm ${project.featured ? "text-[#01F17C]" : "text-[#444] hover:text-[#666]"} transition-colors`}
                      title="Toggle featured"
                    >
                      {project.featured ? "★" : "☆"}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#555]">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/projects/${project.id}/edit`} className="text-xs text-[#666] hover:text-white transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(project.id)} className="text-xs text-[#666] hover:text-red-400 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
