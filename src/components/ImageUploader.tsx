"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, X, ImageIcon, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { uploadToFirebase } from "@/lib/firebase-storage";

interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  sizeKB: number;
  storage: "filesystem" | "inline" | "firebase";
}

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  existing?: string[];
  multiple?: boolean;
  label?: string;
  className?: string;
}

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 0.82;

/**
 * Canvas-based browser compression.
 * Resizing through canvas removes EXIF/GPS metadata by design. It keeps the
 * longest edge at 2400px and emits WebP at 82% quality before network upload.
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`“${file.name}” is not an image.`);
  }

  // HEIC is not uniformly decodable by browser canvas. Ask for a supported export.
  if (file.type === "image/heic" || file.type === "image/heif") {
    throw new Error("HEIC files are not supported by all browsers. Please export as JPG or PNG first.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Could not read “${file.name}”.`));
      img.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Your browser could not prepare this image.");

    context.fillStyle = "#FAF7F2";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Image compression failed."))),
        "image/webp",
        WEBP_QUALITY
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "artwork";
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function ImageUploader({
  onUpload,
  existing = [],
  multiple = true,
  label = "Upload Artwork Image(s)",
  className = "",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [previews, setPreviews] = useState<string[]>(existing.filter(Boolean));

  const publishUrls = (next: string[]) => {
    setPreviews(next);
    onUpload(next);
  };

  const removePreview = (url: string) => {
    const next = previews.filter((item) => item !== url);
    setUploaded((items) => items.filter((item) => item.url !== url));
    publishUrls(next);
  };

  const handleFiles = async (files: FileList | File[]) => {
    const chosen = Array.from(files);
    if (chosen.length === 0) return;

    setLoading(true);
    setError("");

    try {
      setProgressLabel("Optimising image quality…");
      const compressed = await Promise.all(chosen.map(compressImage));

      setProgressLabel("Uploading compressed artwork…");

      // Strategy: try Firebase Storage first (CDN-backed, permanent).
      // If Firebase is not configured, fall back to /api/upload (data URI on Vercel).
      const newUploads: UploadedFile[] = [];
      let usedFirebase = false;

      for (const file of compressed) {
        const fbResult = await uploadToFirebase(file);
        if (fbResult) {
          usedFirebase = true;
          newUploads.push({
            url: fbResult.url,
            filename: file.name,
            originalName: file.name,
            sizeKB: fbResult.sizeKB,
            storage: "firebase",
          });
        }
      }

      // Fallback: use /api/upload for any files that Firebase didn't handle
      if (!usedFirebase) {
        const formData = new FormData();
        compressed.forEach((file) => formData.append("files", file, file.name));
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed.");
        newUploads.push(...(data.uploads as UploadedFile[]));
      }
      const newUrls = newUploads.map((item) => item.url);
      const nextUploads = multiple ? [...uploaded, ...newUploads] : newUploads;
      const nextUrls = multiple ? [...previews, ...newUrls] : newUrls;

      setUploaded(nextUploads);
      publishUrls(nextUrls);
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      setProgressLabel("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <span className="block text-[10px] uppercase tracking-wider text-[#161616] font-semibold">{label}</span>

      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center min-h-[120px] ${
          dragging ? "border-[#A85C43] bg-[#A85C43]/5" : "border-[#161616]/20 hover:border-[#A85C43]/50 hover:bg-[#A85C43]/3 bg-white"
        } ${loading ? "cursor-wait" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          className="hidden"
          onChange={(event) => event.target.files && void handleFiles(event.target.files)}
        />

        {loading ? (
          <>
            <Loader2 className="w-8 h-8 text-[#A85C43] animate-spin" />
            <p className="text-xs text-[#B7AEA2]">{progressLabel}</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-[#B5965A]" />
            <p className="text-xs font-semibold text-[#161616]">Drop image{multiple ? "s" : ""} here or click to browse</p>
            <p className="text-[10px] text-[#B7AEA2]">JPG, PNG or WebP · auto-compressed to WebP · 2,400 px max · privacy metadata removed</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((url, index) => {
            const uploadInfo = uploaded.find((item) => item.url === url);
            return (
              <div key={url} className="relative group rounded overflow-hidden border border-[#161616]/10 aspect-square bg-[#f0ece5]">
                <img src={url} alt={`Artwork preview ${index + 1}`} className="w-full h-full object-cover" />
                {uploadInfo && (
                  <div className="absolute top-1 left-1 bg-emerald-700 text-white text-[8px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {uploadInfo.sizeKB} KB
                  </div>
                )}
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); removePreview(url); }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#161616]/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {index === 0 && <div className="absolute bottom-1 left-1 bg-[#A85C43] text-white text-[8px] px-1.5 py-0.5 rounded font-semibold">Main</div>}
              </div>
            );
          })}
        </div>
      )}

      {previews.length === 0 && !loading && (
        <div className="flex items-center gap-2 p-3 rounded bg-[#FAF7F2] border border-[#161616]/10 text-[11px] text-[#B7AEA2]">
          <ImageIcon className="w-4 h-4 shrink-0" /> No images added yet. The first uploaded image becomes the main artwork preview.
        </div>
      )}
    </div>
  );
}
