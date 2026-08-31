"use client";

import { getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Upload a compressed WebP file to Firebase Storage.
 * Returns the CDN download URL. Falls back to the /api/upload endpoint
 * if Firebase is not configured.
 */
export async function uploadToFirebase(
  file: File,
  folder: string = "artworks"
): Promise<{ url: string; sizeKB: number; storage: "firebase" } | null> {
  if (!isFirebaseConfigured()) return null;

  const storage = getFirebaseStorage();
  if (!storage) return null;

  try {
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const filename = `${folder}/artevo-${id}.webp`;
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: "image/webp",
      customMetadata: { source: "artevo-admin", originalName: file.name },
    });
    const url = await getDownloadURL(snapshot.ref);
    return {
      url,
      sizeKB: Math.max(1, Math.round(file.size / 1024)),
      storage: "firebase",
    };
  } catch (error) {
    console.error("[ARTÉVO] Firebase Storage upload failed:", error);
    return null;
  }
}
