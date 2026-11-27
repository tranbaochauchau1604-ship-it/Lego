import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ProductRowActions, ToggleField } from "@/components/admin/product-row-actions";
import { ProductTableControls } from "@/components/admin/product-table-controls";
import { ProductImage } from "@/components/products/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { discountPercent, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sản phẩm" };

const PAGE_SIZE = 15;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp: SP = await searchParams;
  const q = one(sp.q).replace(/[,()*%\\:"']/g, " ").trim().slice(0, 80);
  const status = one(sp.status);
  const theme = one(sp.theme);
  const sort = one(sp.sort) || "updated";
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, slug, set_number, theme, price, sale_price, stock, thumbnail, images, is_published, is_featured, category:categories(name)", {
      count: "exact",
    });

  if (q) query = query.or(`name.ilike.*${q}*,set_number.ilike.*${q}*,slug.ilike.*${q}*`);
  if (theme) query = query.eq("theme", theme);
  if (status === "published") query = query.eq("is_published", true);
  if (status === "draft") query = query.eq("is_published", false);
  if (status === "featured") query = query.eq("is_featured", true);
  if (status === "sale") query = query.eq("is_on_sale", true);
  if (status === "out") query = query.lte("stock", 0);

  const orders: Record<string, [string, boolean]> = {
    updated: ["updated_at", false],
    newest: ["created_at", false],
    name: ["name", true],
    "price-asc": ["effective_price", true],
    "price-desc": ["effective_price", false],
    stock: ["stock", true],
  };
  const [col, asc] = orders[sort] ?? orders.updated;
  query = query.order(col, { ascending: asc });

  const from = (page - 1) * PAGE_SIZE;
  const [{ data, count, error }, themesRes] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    supabase.from("products").select("theme").not("theme", "is", null),
  ]);
  const themes = [...new Set((themesRes.data ?? []).map((t) => t.theme!))].sort();
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (k !== "page" && v) next.set(k, one(v));
    if (p > 1) next.set("page", String(p));
    return `/admin/products?${next.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground">{total} sản phẩm</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/products/new">
            <Plus /> Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <Suspense>
        <ProductTableControls themes={themes} />
      </Suspense>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">Lỗi tải dữ liệu: {error.message}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Sản phẩm</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead className="text-center">Kho</TableHead>
                <TableHead className="text-center">Hiển thị</TableHead>
                <TableHead className="text-center">Nổi bật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Không có sản phẩm nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
              {data?.map((p) => {
                const pct = discountPercent(Number(p.price), p.sale_price == null ? null : Number(p.sale_price));
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <ProductImage src={p.thumbnail ?? p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}/edit`} className="line-clamp-1 font-medium hover:underline">
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {[p.set_number && `#${p.set_number}`, p.theme, p.category?.name].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{formatPrice(pct ? p.sale_price : p.price)}</div>
                      {pct > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="line-through">{formatPrice(p.price)}</span>
                          <Badge className="h-4 px-1 text-[10px]">-{pct}%</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.stock <= 0 ? <Badge variant="destructive">Hết</Badge> : <span className="tabular-nums">{p.stock}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <ToggleField id={p.id} field="is_published" value={p.is_published} label={`Hiển thị ${p.name}`} />
                    </TableCell>
                    <TableCell className="text-center">
                      <ToggleField id={p.id} field="is_featured" value={p.is_featured} label={`Nổi bật ${p.name}`} />
                    </TableCell>
                    <TableCell>
                      <ProductRowActions id={p.id} name={p.name} slug={p.slug} published={p.is_published} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Link href={pageHref(page - 1)} aria-label="Trang trước">
                <ChevronLeft /> Trước
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className={page >= totalPages ? "pointer-events-none opacity-50" : ""}>
              <Link href={pageHref(page + 1)} aria-label="Trang sau">
                Sau <ChevronRight />
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
