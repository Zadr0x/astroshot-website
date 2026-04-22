"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      supabase.from("blog_posts").select("*").eq("id", id).single().then(({ data }) => {
        setPost(data as BlogPost);
        setLoading(false);
      });
    });
  }, [router, id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="h-8 w-48 bg-[#111] rounded-xl animate-pulse mb-8" />
        <div className="h-96 bg-[#111] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 lg:p-10 text-center text-[#555]">
        Post not found. <Link href="/admin/blog" className="text-[#01F17C] hover:underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title={`Edit: ${post.title}`}
        actions={
          <Link href="/admin/blog" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
            ← Back
          </Link>
        }
      />
      <BlogPostForm initialData={post} postId={id} onSuccess={() => router.push("/admin/blog")} />
    </div>
  );
}
