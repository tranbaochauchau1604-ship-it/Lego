"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { AGE_RANGES } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const PRICE_PRESETS = [
  { label: "Dưới 1 triệu", min: "", max: "1000000" },
  { label: "1 – 3 triệu", min: "1000000", max: "3000000" },
  { label: "3 – 5 triệu", min: "3000000", max: "5000000" },
  { label: "Trên 5 triệu", min: "5000000", max: "" },
];

const selectCls =
  "h-11 w-full appearance-none rounded-xl border border-input bg-background/60 px-3 pr-8 text-sm outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring";

export function ProductFilters({ themes, categories, total }: { themes: string[]; categories: Category[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Tìm kiếm có debounce
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeCount = ["theme", "category", "age", "min", "max", "sale"].filter((k) => params.get(k)).length;
  const priceKey = `${params.get("min") ?? ""}-${params.get("max") ?? ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Tìm theo tên hoặc mã bộ</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên hoặc mã bộ…"
            className="h-12 w-full rounded-2xl border border-input bg-background/60 pr-10 pl-11 text-sm outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring"
          />
          {pending && <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-label="Đang tải" />}
        </label>
        <div className="flex gap-3">
          <label className="relative min-w-44 flex-1">
            <span className="sr-only">Sắp xếp</span>
            <select className={cn(selectCls, "h-12 rounded-2xl")} value={params.get("sort") ?? "newest"} onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name">Tên A → Z</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-input bg-background/60 px-4 text-sm font-medium backdrop-blur lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Bộ lọc
            {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brick-red text-[10px] text-white">{activeCount}</span>}
          </button>
        </div>
      </div>

      <div id="filter-panel" className={cn("glass grid-cols-2 gap-3 rounded-2xl p-3 sm:p-4 lg:grid lg:grid-cols-5", open ? "grid" : "hidden")}>
        <Field label="Theme">
          <select className={selectCls} value={params.get("theme") ?? ""} onChange={(e) => update({ theme: e.target.value })}>
            <option value="">Tất cả theme</option>
            {themes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Danh mục">
          <select className={selectCls} value={params.get("category") ?? ""} onChange={(e) => update({ category: e.target.value })}>
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Độ tuổi">
          <select className={selectCls} value={params.get("age") ?? ""} onChange={(e) => update({ age: e.target.value })}>
            <option value="">Mọi độ tuổi</option>
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Khoảng giá">
          <select
            className={selectCls}
            value={PRICE_PRESETS.some((p) => `${p.min}-${p.max}` === priceKey) ? priceKey : ""}
            onChange={(e) => {
              const [min, max] = e.target.value.split("-");
              update({ min: min || null, max: max || null });
            }}
          >
            <option value="">Mọi mức giá</option>
            {PRICE_PRESETS.map((p) => (
              <option key={p.label} value={`${p.min}-${p.max}`}>{p.label}</option>
            ))}
          </select>
        </Field>
        <div className="col-span-2 flex items-end gap-2 lg:col-span-1">
          <label className="flex h-11 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-input bg-background/60 px-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[#E3000B]"
              checked={params.get("sale") === "1"}
              onChange={(e) => update({ sale: e.target.checked ? "1" : null })}
            />
            Đang sale
          </label>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => update({ theme: null, category: null, age: null, min: null, max: null, sale: null })}
              className="grid size-11 place-items-center rounded-xl border border-input hover:border-brick-red"
              aria-label="Xoá bộ lọc"
              title="Xoá bộ lọc"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Tìm thấy <strong className="text-foreground">{total}</strong> sản phẩm
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      <span className="relative block">
        {children}
        <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">▾</span>
      </span>
    </label>
  );
}
