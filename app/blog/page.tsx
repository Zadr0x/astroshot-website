"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/lib/supabase";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPost[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">Blog</span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            Insights & Stories
          </h1>
          <p className="mt-4 text-white/60 max-w-xl">
            Behind the scenes, industry insights, and creative stories from Astroshot.
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#111] h-80 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-24 text-center text-white/50">
            <p className="text-lg">No posts published yet.</p>
            <p className="text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 overflow-hidden hover:border-[#01F17C]/40 hover:shadow-lg hover:shadow-[#01F17C]/5 transition-all duration-300 h-full flex flex-col">
                    {post.cover_image_url ? (
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-[#111] to-[#050505] flex items-center justify-center">
                        <span className="text-4xl text-white/10">✍</span>
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      {post.published_at && (
                        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">
                          {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                      <h2 className="text-lg font-extrabold text-white leading-tight group-hover:text-[#01F17C] transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-white/60 leading-relaxed flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="mt-4 text-xs font-bold text-[#01F17C]">
                        Read more →
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
