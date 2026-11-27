import { PageTransition } from "@/components/effects/page-transition";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { Pagination } from "@/components/products/pagination";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { getCategories, getProducts, getThemes } from "@/lib/data/products";
import { parseProductFilters } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm",
  description: "Danh sách các bộ gạch xếp hình: lọc theo theme, danh mục, độ tuổi, khoảng giá. Tìm theo tên hoặc mã bộ.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const [result, themes, categories] = await Promise.all([getProducts(filters), getThemes(), getCategories()]);

  return (
    <PageTransition>
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10 md:px-6 md:pt-32">
      <div>
        <p className="text-sm font-semibold tracking-[0.3em] text-brick-yellow uppercase">Catalog</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
          Tất cả <span className="text-gradient">sản phẩm</span>
        </h1>
      </div>

      <div className="mt-10">
        <Suspense>
          <ProductFilters themes={themes} categories={categories} total={result.total} />
        </Suspense>
      </div>

      {result.items.length === 0 ? (
        <div className="glass mt-10 flex flex-col items-center gap-3 rounded-3xl p-16 text-center">
          <PackageSearch className="size-10 text-muted-foreground" aria-hidden />
          <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm phù hợp</h2>
          <p className="text-muted-foreground">Hãy thử từ khoá khác hoặc bỏ bớt bộ lọc.</p>
        </div>
      ) : (
        <>
        <h2 className="sr-only">Danh sách sản phẩm</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {result.items.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={(i % 4) * 0.06} className="h-full">
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            </li>
          ))}
        </ul>
        </>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} searchParams={sp} />
    </div>
    </PageTransition>
  );
}
