import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // Files arrive browser-compressed; 5 MB guardrail.
const ALLOWED_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

/**
 * Vercel-safe artwork upload endpoint.
 *
 * Compression happens in the browser before this request (see ImageUploader),
 * avoiding native `sharp` binaries and their Vercel installation warnings.
 * On Vercel, the filesystem is read-only, so the compressed image is returned
 * as a database-storable data URI. Locally it is also written to public/uploads.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter(Boolean) as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No image files were provided." }, { status: 400 });
    }

    const uploads: Array<{
      url: string;
      filename: string;
      originalName: string;
      sizeKB: number;
      storage: "filesystem" | "inline";
    }> = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `“${file.name}” must be a JPG, PNG, or WebP image.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `“${file.name}” is larger than 5 MB after compression.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `artevo-${randomUUID().replace(/-/g, "").slice(0, 16)}.webp`;
      const sizeKB = Math.max(1, Math.round(buffer.length / 1024));

      if (process.env.VERCEL) {
        // Vercel's serverless filesystem is immutable: persist with artwork JSON in Postgres.
        uploads.push({
          url: `data:image/webp;base64,${buffer.toString("base64")}`,
          filename,
          originalName: file.name,
          sizeKB,
          storage: "inline",
        });
      } else {
        await mkdir(UPLOAD_DIR, { recursive: true });
        await writeFile(path.join(UPLOAD_DIR, filename), buffer);
        uploads.push({
          url: `/uploads/${filename}`,
          filename,
          originalName: file.name,
          sizeKB,
          storage: "filesystem",
        });
      }
    }

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("[ARTÉVO] Upload failed:", error);
    return NextResponse.json(
      { error: "The image could not be uploaded. Please try a different file." },
      { status: 500 }
    );
  }
}
