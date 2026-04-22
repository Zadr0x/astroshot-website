"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/supabase";

interface ImageUploadProps {
  bucket: string;
  label?: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  accept?: string;
}

export default function ImageUpload({
  bucket,
  label = "Upload Image",
  currentUrl,
  onUploaded,
  accept = "image/*",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    const url = await uploadFile(file, bucket);
    setUploading(false);
    if (url) {
      onUploaded(url);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#666]">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
          dragOver ? "border-[#01F17C] bg-[#01F17C]/5" : "border-white/10 hover:border-white/30"
        } overflow-hidden`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold">Click to replace</span>
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-[#555]">
            <span className="text-2xl">↑</span>
            <span className="text-xs">
              {uploading ? "Uploading..." : "Drag & drop or click to upload"}
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#01F17C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  );
}
