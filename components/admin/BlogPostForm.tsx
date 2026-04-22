"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/lib/supabase";
import ImageUpload from "./ImageUpload";

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>;
  postId?: string;
  onSuccess: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BlogPostForm({ initialData, postId, onSuccess }: BlogPostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_image_url ?? "");
  const [status, setStatus] = useState<BlogPost["status"]>(initialData?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : ""
  );
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!postId) setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image_url: coverUrl || null,
      status,
      published_at: status === "published" ? (publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (postId) {
      const { error: e } = await supabase.from("blog_posts").update(payload).eq("id", postId);
      err = e;
    } else {
      const { error: e } = await supabase.from("blog_posts").insert(payload);
      err = e;
    }

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    onSuccess();
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#01F17C] transition-colors";
  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-[#666] mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-5">
            <div>
              <label className={labelCls}>Title *</label>
              <input required value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Slug</label>
              <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="url-friendly-slug" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Short description shown in listings..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Content (Markdown)</h2>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs text-[#01F17C] hover:underline"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div
                className="prose prose-invert prose-sm max-w-none min-h-40 p-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white/80 text-sm whitespace-pre-wrap"
              >
                {content || <span className="text-[#444]">Nothing to preview.</span>}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Write your post in Markdown..."
                className={`${inputCls} resize-none font-mono`}
              />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Publish</h2>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BlogPost["status"])} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            {status === "published" && (
              <div>
                <label className={labelCls}>Publish Date</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : status === "published" ? "Save & Publish →" : "Save Draft →"}
            </button>
          </div>

          <div className="rounded-2xl bg-[#111] border border-white/10 p-6">
            <ImageUpload
              bucket="blog-covers"
              label="Cover Image"
              currentUrl={coverUrl || null}
              onUploaded={setCoverUrl}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
