import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroSceneLoader } from "@/components/3d/hero-scene-loader";
import { Magnetic } from "@/components/effects/magnetic";
import { SplitText } from "@/components/effects/split-text";
import { siteConfig } from "@/lib/site-config";

export function Hero({ productCount }: { productCount: number }) {
  return (
    <section className="relative isolate flex min-h-dvh items-end overflow-hidden pt-24 pb-16 md:items-center md:pb-0" aria-labelledby="hero-heading">
      <div className="absolute inset-0 -z-10">
        <HeroSceneLoader />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="pointer-events-none mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="glass pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="size-4 text-brick-yellow" aria-hidden />
            {productCount > 0 ? `${productCount}+ bộ xếp hình đang chờ bạn` : siteConfig.tagline}
          </p>
          <h1 id="hero-heading" className="mt-6 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] font-bold tracking-[-0.04em]">
            <SplitText text="Xếp từng viên," className="block" />
            <span className="block">
              <SplitText text="dựng cả" delay={0.35} />{" "}
              <SplitText text="vũ trụ." delay={0.55} charClassName="text-gradient" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            Catalog gạch xếp hình chọn lọc — từ siêu xe cơ khí đến thành phố tí hon. Giá rõ ràng, tư vấn tận tâm, giao toàn quốc.
          </p>
          <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link
                href="/products"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-brick-red pr-3 pl-7 font-semibold text-white shadow-[0_10px_50px_-10px_rgb(227_0_11/0.9)]"
              >
                Khám phá ngay
                <span className="grid size-9 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-[-45deg]">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/products?sale=1" className="glass inline-flex h-14 items-center rounded-full px-7 font-semibold transition-colors hover:border-brick-yellow/60">
                Đang giảm giá
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase md:flex">
        Cuộn xuống
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-foreground/60 to-transparent" />
      </div>
    </section>
  );
}
