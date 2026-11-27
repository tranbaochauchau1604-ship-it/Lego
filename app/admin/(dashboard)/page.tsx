import Link from "next/link";
import { AlertTriangle, BadgePercent, Eye, Package, Plus } from "lucide-react";
import { ProductImage } from "@/components/products/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Tổng quan" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const count = { count: "exact" as const, head: true };
  const [total, onSale, outOfStock, hidden, recent] = await Promise.all([
    supabase.from("products").select("id", count),
    supabase.from("products").select("id", count).eq("is_on_sale", true),
    supabase.from("products").select("id", count).lte("stock", 0),
    supabase.from("products").select("id", count).eq("is_published", false),
    supabase
      .from("products")
      .select("id, name, slug, thumbnail, images, price, sale_price, stock, is_published, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: "Tổng sản phẩm", value: total.count ?? 0, icon: Package, tone: "text-brick-blue dark:text-[#4d8eff]", href: "/admin/products" },
    { label: "Đang sale", value: onSale.count ?? 0, icon: BadgePercent, tone: "text-primary", href: "/admin/products?status=sale" },
    { label: "Hết hàng", value: outOfStock.count ?? 0, icon: AlertTriangle, tone: "text-amber-500", href: "/admin/products?status=out" },
    { label: "Đang ẩn", value: hidden.count ?? 0, icon: Eye, tone: "text-muted-foreground", href: "/admin/products?status=draft" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground">Tình hình catalog hôm nay.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/products/new">
            <Plus /> Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`size-5 ${s.tone}`} aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="font-display text-4xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm mới cập nhật</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.error ? (
            <p className="text-sm text-destructive">Không tải được dữ liệu: {recent.error.message}</p>
          ) : !recent.data?.length ? (
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.data.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-4 py-3 hover:opacity-80">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <ProductImage src={p.thumbnail ?? p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Cập nhật {formatDate(p.updated_at)}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold">{formatPrice(p.sale_price ?? p.price)}</p>
                      <p className="text-xs text-muted-foreground">Kho: {p.stock}</p>
                    </div>
                    {!p.is_published && <Badge variant="secondary">Ẩn</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
