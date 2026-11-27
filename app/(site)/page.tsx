import { PageTransition } from "@/components/effects/page-transition";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Marquee } from "@/components/effects/marquee";
import { Reveal } from "@/components/effects/reveal";
import { ProductCard } from "@/components/products/product-card";
import { Bento } from "@/components/site/bento";
import { Hero } from "@/components/site/hero";
import { ThemeScroller } from "@/components/site/theme-scroller";
import { getFeaturedProducts, getThemeSummaries } from "@/lib/data/products";

// ISR: trang chủ được tạo tĩnh, làm mới mỗi giờ hoặc ngay khi admin cập nhật.
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, themes] = await Promise.all([getFeaturedProducts(8), getThemeSummaries()]);
  const productCount = themes.reduce((s, t) => s + t.count, 0);

  return (
    <PageTransition>
      <Hero productCount={productCount} />

      <div className="border-y border-border py-8">
        <Marquee items={themes.map((t) => t.theme)} />
      </div>

      <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-brick-yellow uppercase">Tuyển chọn</p>
            <h2 id="featured-heading" className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
              Sản phẩm <span className="text-gradient">nổi bật</span>
            </h2>
          </div>
          <Link href="/products" className="group inline-flex items-center gap-2 font-semibold">
            Xem tất cả <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
        {featured.length ? (
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={(i % 4) * 0.08} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 text-muted-foreground">Chưa có sản phẩm nổi bật.</p>
        )}
      </section>

      <ThemeScroller themes={themes} />

      <Bento productCount={productCount} themeCount={themes.length} />

      <div className="py-6">
        <Marquee items={["Xếp hình", "Sáng tạo", "Kết nối", "Sưu tầm", "Quà tặng"]} reverse duration={50} className="text-muted-foreground" />
      </div>
    </PageTransition>
  );
}
