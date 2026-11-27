import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string | string[] | undefined> }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v == null) continue;
      sp.set(k, Array.isArray(v) ? v[0] : v);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  };
  const base = "grid h-11 min-w-11 place-items-center rounded-xl border border-input px-3 text-sm font-medium transition-colors";
  return (
    <nav aria-label="Phân trang" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(base, "hover:border-brick-yellow")} aria-label="Trang trước">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "opacity-40")} aria-hidden><ChevronLeft className="size-4" /></span>
      )}
      {pages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, p === page ? "border-brick-red bg-brick-red text-white" : "hover:border-brick-yellow")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(base, "hover:border-brick-yellow")} aria-label="Trang sau">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "opacity-40")} aria-hidden><ChevronRight className="size-4" /></span>
      )}
    </nav>
  );
}
