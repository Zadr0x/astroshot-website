"use client";

import { useState } from "react";
import { supabase, uploadFile } from "@/lib/supabase";
import type { Project, ProjectImage } from "@/lib/supabase";
import ImageUpload from "./ImageUpload";

type ProjectFormData = {
  title: string;
  category: Project["category"];
  description: string;
  client_name: string;
  featured: boolean;
  status: Project["status"];
  thumbnail_url: string;
  media_url: string;
  media_type: Project["media_type"];
};

interface ProjectFormProps {
  initialData?: Partial<Project>;
  initialImages?: ProjectImage[];
  projectId?: string;
  onSuccess: () => void;
}

export default function ProjectForm({ initialData, initialImages = [], projectId, onSuccess }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: initialData?.title ?? "",
    category: initialData?.category ?? "VFX",
    description: initialData?.description ?? "",
    client_name: "",
    featured: initialData?.featured ?? false,
    status: initialData?.status ?? "draft",
    thumbnail_url: initialData?.thumbnail_url ?? "",
    media_url: initialData?.media_url ?? "",
    media_type: initialData?.media_type ?? "image",
  });
  const [images, setImages] = useState<ProjectImage[]>(initialImages);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof ProjectFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setMediaFile(file);
    if (file) set("media_type", file.type.startsWith("video") ? "video" : "image");
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const url = await uploadFile(file, "project-images");
      if (url && projectId) {
        const { data } = await supabase.from("project_images").insert({
          project_id: projectId,
          image_url: url,
          sort_order: images.length,
        }).select().single();
        if (data) setImages((prev) => [...prev, data as ProjectImage]);
      }
    }
  };

  const removeImage = async (id: string) => {
    await supabase.from("project_images").delete().eq("id", id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    let mediaUrl = form.media_url;
    if (mediaFile) {
      const url = await uploadFile(mediaFile, "media");
      if (url) mediaUrl = url;
    }

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description || null,
      featured: form.featured,
      status: form.status,
      thumbnail_url: form.thumbnail_url || null,
      media_url: mediaUrl || null,
      media_type: form.media_type,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (projectId) {
      const { error: e } = await supabase.from("projects").update(payload).eq("id", projectId);
      err = e;
    } else {
      const { error: e } = await supabase.from("projects").insert(payload);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Project Details</h2>

          <div>
            <label className={labelCls}>Title *</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Project title" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value as Project["category"])} className={inputCls}>
                <option>VFX</option>
                <option>Social Media</option>
                <option>Branding</option>
                <option>3D Animation</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as Project["status"])} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description / Case Study</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              placeholder="Describe this project..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="w-4 h-4 accent-[#01F17C]"
            />
            <label htmlFor="featured" className="text-sm text-white/60 cursor-pointer">Mark as Featured (shows on homepage)</label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Media</h2>
            <ImageUpload
              bucket="thumbnails"
              label="Thumbnail"
              currentUrl={form.thumbnail_url || null}
              onUploaded={(url) => set("thumbnail_url", url)}
            />
            <div>
              <label className={labelCls}>Main Media (Image or Video)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="w-full text-sm text-[#666] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#01F17C]/10 file:text-[#01F17C] cursor-pointer"
              />
              {form.media_url && !mediaFile && (
                <p className="mt-1 text-xs text-[#555] truncate">Current: {form.media_url}</p>
              )}
            </div>
          </div>

          {projectId && (
            <div className="rounded-2xl bg-[#111] border border-white/10 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666]">Project Gallery</h2>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className={labelCls}>Add Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="w-full text-sm text-[#666] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#01F17C]/10 file:text-[#01F17C] cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : projectId ? "Save Changes →" : "Create Project →"}
        </button>
      </div>
    </form>
  );
}
