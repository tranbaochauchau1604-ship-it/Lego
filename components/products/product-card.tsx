import Link from "next/link";
import { ViewTransition } from "react";
import { Blocks } from "lucide-react";
import { TiltCard } from "@/components/effects/tilt-card";
import { Price, SaleBadge } from "@/components/products/price";
import { ProductImage } from "@/components/products/product-image";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/types";

export function ProductCard({ product, priority = false, className }: { product: ProductWithCategory; priority?: boolean; className?: string }) {
  const cover = product.thumbnail ?? product.images[0];
  const outOfStock = product.stock <= 0;
  return (
    <TiltCard className={cn("rounded-3xl", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="group gradient-border relative flex h-full flex-col overflow-hidden rounded-3xl bg-card/85 transition-shadow duration-500 hover:shadow-[0_20px_60px_-15px_rgb(227_0_11/0.45)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden">
          <ViewTransition name={`product-image-${product.slug}`} share="morph" default="none">
            <ProductImage
              src={cover}
              alt={product.name}
              fill
              loading={priority ? "eager" : undefined}
              fetchPriority={priority ? "high" : undefined}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </ViewTransition>
          <div className="absolute top-3 left-3 z-10 flex gap-2 [transform:translateZ(40px)]">
            <SaleBadge price={product.price} salePrice={product.sale_price} />
            {outOfStock && <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">Hết hàng</span>}
          </div>
          {product.theme && (
            <span className="glass absolute right-3 bottom-3 z-10 rounded-full px-3 py-1 text-xs font-medium">{product.theme}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5 [transform:translateZ(30px)]">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {product.set_number && <span>#{product.set_number}</span>}
            {product.pieces != null && (
              <span className="inline-flex items-center gap-1">
                <Blocks className="size-3.5" aria-hidden /> {formatNumber(product.pieces)} mảnh
              </span>
            )}
            {product.age_range && <span>{product.age_range}</span>}
          </div>
          <h3 className="line-clamp-2 font-display text-lg leading-snug font-semibold">{product.name}</h3>
          <Price price={product.price} salePrice={product.sale_price} className="mt-auto pt-2" />
        </div>
      </Link>
    </TiltCard>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card/50">
      <div className="skeleton-shimmer aspect-square" />
      <div className="space-y-3 p-5">
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
        <div className="skeleton-shimmer h-5 w-4/5 rounded" />
        <div className="skeleton-shimmer h-6 w-1/3 rounded" />
      </div>
    </div>
  );
}
