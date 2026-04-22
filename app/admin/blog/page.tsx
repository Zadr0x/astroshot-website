"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      loadPosts();
    });
  }, [router]);

  const loadPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    loadPosts();
  };

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Blog Posts"
        actions={
          <Link href="/admin/blog/new" className="px-4 py-2 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] transition-colors">
            + Write Post
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-[#555]">
          <p>No blog posts yet.</p>
          <Link href="/admin/blog/new" className="mt-3 inline-block text-sm text-[#01F17C] hover:underline">Write your first post →</Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555] hidden md:table-cell">Published</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#555]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{post.title}</p>
                      {post.excerpt && <p className="text-xs text-[#555] mt-0.5 truncate max-w-xs">{post.excerpt}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-[#555]">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-xs text-[#666] hover:text-white transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(post.id)} className="text-xs text-[#666] hover:text-red-400 transition-colors">Delete</button>
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
