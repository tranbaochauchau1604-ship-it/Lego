import { STORAGE_BUCKET } from "@/lib/env";

const MARKER = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

/** Lấy đường dẫn file trong bucket từ public URL. Trả về null nếu không phải ảnh của bucket. */
export function storagePathFromUrl(url: string): string | null {
  const i = url.indexOf(MARKER);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);
}

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
