"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ContactSubmission } from "@/lib/supabase";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminHeader from "@/components/admin/AdminHeader";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

type Stats = {
  totalProjects: number;
  publishedProjects: number;
  blogPosts: number;
  newSubmissions: number;
  activeClients: number;
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, publishedProjects: 0, blogPosts: 0, newSubmissions: 0, activeClients: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/admin/login"); return; }
    loadData();
  };

  const loadData = async () => {
    const [projectsRes, blogRes, submissionsRes, clientsRes] = await Promise.all([
      supabase.from("projects").select("id, status"),
      supabase.from("blog_posts").select("id, status"),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("clients").select("id, active"),
    ]);

    const projects = projectsRes.data ?? [];
    const blogs = blogRes.data ?? [];
    const submissions = (submissionsRes.data ?? []) as ContactSubmission[];
    const clients = clientsRes.data ?? [];

    setStats({
      totalProjects: projects.length,
      publishedProjects: projects.filter((p: { status: string }) => p.status === "published").length,
      blogPosts: blogs.length,
      newSubmissions: submissions.filter((s) => s.status === "new").length,
      activeClients: clients.filter((c: { active: boolean }) => c.active).length,
    });
    setRecentSubmissions(submissions);
    setLoading(false);
  };

  const statCards = [
    { label: "Total Projects", value: stats.totalProjects, href: "/admin/projects", color: "text-white" },
    { label: "Published Projects", value: stats.publishedProjects, href: "/admin/projects", color: "text-[#01F17C]" },
    { label: "Blog Posts", value: stats.blogPosts, href: "/admin/blog", color: "text-white" },
    { label: "New Submissions", value: stats.newSubmissions, href: "/admin/submissions", color: stats.newSubmissions > 0 ? "text-red-400" : "text-white" },
    { label: "Active Clients", value: stats.activeClients, href: "/admin/clients", color: "text-white" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title={`${getGreeting()}, Mahdi 👋`} />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#111] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl bg-[#111] border border-white/10 p-5 hover:border-white/20 transition-colors group"
            >
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-xs text-[#555] uppercase tracking-widest mt-1 group-hover:text-[#777] transition-colors">
                {card.label}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent submissions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Recent Submissions</h2>
            <Link href="/admin/submissions" className="text-xs text-[#01F17C] hover:underline">View all →</Link>
          </div>
          <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden">
            {recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-[#444] text-sm">No submissions yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Name", "Company", "Service", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-semibold">{sub.name}</td>
                      <td className="px-4 py-3 text-sm text-[#666]">{sub.company ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#666]">{sub.service ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-[#555]">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666] mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Upload Project", href: "/admin/projects/new", icon: "⬡" },
              { label: "Write Blog Post", href: "/admin/blog/new", icon: "✍" },
              { label: "Add Client Logo", href: "/admin/clients", icon: "★" },
              { label: "Edit Site Content", href: "/admin/content", icon: "✦" },
              { label: "View Submissions", href: "/admin/submissions", icon: "◎" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#111] border border-white/10 hover:border-[#01F17C]/40 hover:bg-[#01F17C]/5 transition-all group"
              >
                <span className="text-[#01F17C] text-sm">{action.icon}</span>
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{action.label}</span>
                <span className="ml-auto text-[#444] group-hover:text-[#01F17C] transition-colors text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
