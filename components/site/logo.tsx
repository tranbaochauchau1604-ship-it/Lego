import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Logo riêng của BrickVerse: một viên gạch 2x2 vẽ bằng SVG (không dùng tài sản thương hiệu). */
export function BrickMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect x="2" y="10" width="28" height="18" rx="3" fill="#E3000B" />
      <rect x="2" y="22" width="28" height="6" rx="2" fill="#000" opacity="0.25" />
      <rect x="6" y="5" width="8" height="7" rx="2" fill="#FFD500" />
      <rect x="18" y="5" width="8" height="7" rx="2" fill="#0055BF" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} — Trang chủ`}>
      <BrickMark className="transition-transform duration-500 group-hover:-rotate-12" />
      <span className="font-display text-lg font-bold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
