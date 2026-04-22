"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/lib/supabase";

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-black text-[#111] mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black text-[#111] mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black text-[#111] mt-12 mb-6">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#111]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-sm font-mono text-[#333]">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[#01F17C] pl-4 italic text-[#666] my-4">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[#444] mb-1">$1</li>')
    .replace(/(<li.+<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#01F17C] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-[#444] leading-relaxed my-4">')
    .replace(/^(.+)$/gm, (line) => {
      if (line.startsWith("<")) return line;
      return line;
    });
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        if (!data) { setNotFoundState(true); }
        else setPost(data as BlogPost);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-4">
          <div className="h-6 w-24 bg-[#f0f0f0] rounded animate-pulse" />
          <div className="h-12 w-3/4 bg-[#f0f0f0] rounded-xl animate-pulse" />
          <div className="h-64 bg-[#f0f0f0] rounded-2xl animate-pulse mt-8" />
        </div>
      </div>
    );
  }

  if (notFoundState || !post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-black text-[#f0f0f0]">404</p>
          <p className="text-[#999] mt-2">Post not found.</p>
          <Link href="/blog" className="mt-6 inline-block text-sm text-[#01F17C] hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const rendered = post.content ? renderMarkdown(post.content) : "";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <article className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link href="/blog" className="text-xs font-bold uppercase tracking-widest text-[#01F17C] hover:underline">
            ← Blog
          </Link>

          {post.published_at && (
            <p className="mt-4 text-sm text-[#999]">
              {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}

          <h1 className="mt-3 text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg text-[#666] leading-relaxed">{post.excerpt}</p>
          )}
        </motion.div>

        {post.cover_image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 rounded-2xl overflow-hidden"
          >
            <img src={post.cover_image_url} alt={post.title} className="w-full h-72 lg:h-96 object-cover" />
          </motion.div>
        )}

        {post.content && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <div
              className="text-[#444] leading-relaxed text-base [&>p]:my-4 [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-[#111] [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-black [&>h3]:text-[#111] [&>h3]:mt-8 [&>h3]:mb-3"
              dangerouslySetInnerHTML={{ __html: `<p class="text-[#444] leading-relaxed my-4">${rendered}</p>` }}
            />
          </motion.div>
        )}

        <div className="mt-16 pt-8 border-t border-[#f0f0f0]">
          <Link
            href="/blog"
            className="text-sm font-bold text-[#111] hover:text-[#01F17C] transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}
