"use client";

import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "published", label: "Đang hiển thị" },
  { value: "draft", label: "Đang ẩn" },
  { value: "featured", label: "Nổi bật" },
  { value: "sale", label: "Đang sale" },
  { value: "out", label: "Hết hàng" },
] as const;

export const SORT_OPTIONS = [
  { value: "updated", label: "Mới cập nhật" },
  { value: "newest", label: "Mới tạo" },
  { value: "name", label: "Tên A → Z" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "stock", label: "Tồn kho ít nhất" },
] as const;

export function ProductTableControls({ themes }: { themes: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v || v === "all") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  };

  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên, mã bộ…" className="h-10 pl-9" aria-label="Tìm sản phẩm" />
        {pending && <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      <div className="grid grid-cols-3 gap-3 md:flex">
        <Select value={params.get("status") ?? "all"} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className="h-10 w-full md:w-44" aria-label="Lọc trạng thái">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={params.get("theme") ?? "all"} onValueChange={(v) => update({ theme: v })}>
          <SelectTrigger className="h-10 w-full md:w-40" aria-label="Lọc theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi theme</SelectItem>
            {themes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={params.get("sort") ?? "updated"} onValueChange={(v) => update({ sort: v === "updated" ? null : v })}>
          <SelectTrigger className="h-10 w-full md:w-44" aria-label="Sắp xếp">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
