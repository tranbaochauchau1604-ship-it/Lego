import { ProductCardSkeleton } from "@/components/products/product-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-10 md:px-6" aria-busy="true" aria-label="Đang tải sản phẩm">
      <div className="skeleton-shimmer h-4 w-24 rounded" />
      <div className="skeleton-shimmer mt-4 h-14 w-2/3 max-w-xl rounded-xl" />
      <div className="skeleton-shimmer mt-10 h-12 w-full rounded-2xl" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
