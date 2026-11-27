"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/products/product-image";
import { formatPrice } from "@/lib/format";
import type { ThemeSummary } from "@/lib/data/products";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const accents = ["#E3000B", "#FFD500", "#0055BF", "#00852B", "#FF7A00", "#7FD1C1"];

/**
 * Section theme: khi cuộn dọc, các thẻ chạy ngang (GSAP ScrollTrigger pin).
 * Trên mobile / khi giảm chuyển động: chuyển thành danh sách vuốt ngang bình thường.
 */
export function ThemeScroller({ themes }: { themes: ThemeSummary[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 48);
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [themes.length] },
  );

  if (!themes.length) return null;

  return (
    <section ref={section} aria-labelledby="themes-heading" className="relative overflow-hidden py-16 md:flex md:h-dvh md:flex-col md:justify-center md:py-0">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <p className="text-sm font-semibold tracking-[0.3em] text-brick-blue uppercase dark:text-[#4d8eff]">Bộ sưu tập</p>
        <h2 id="themes-heading" className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
          Khám phá theo <span className="text-gradient">theme</span>
        </h2>
      </div>
      <div
        ref={track}
        className="mt-10 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 will-change-transform md:w-max md:snap-none md:overflow-visible md:px-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {themes.map((t, i) => (
          <Link
            key={t.theme}
            href={`/products?theme=${encodeURIComponent(t.theme)}`}
            data-theme-card
            className="group relative flex h-[420px] w-[78vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[2rem] border border-border bg-card sm:w-[360px] md:h-[min(60vh,520px)] md:w-[400px]"
          >
            <ProductImage
              src={t.cover}
              alt=""
              fill
              sizes="400px"
              className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute top-5 left-5 h-2 w-14 rounded-full" style={{ background: accents[i % accents.length] }} />
            <div className="relative p-7 text-white">
              <p className="text-sm text-white/70">
                {t.count} sản phẩm · từ {formatPrice(t.minPrice)}
              </p>
              <h3 className="mt-1 flex items-center justify-between font-display text-4xl font-bold">
                {t.theme}
                <ArrowUpRight className="size-8 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12" aria-hidden />
              </h3>
            </div>
          </Link>
        ))}
        <Link
          href="/products"
          className="group grid h-[420px] w-[60vw] shrink-0 snap-start place-items-center rounded-[2rem] border border-dashed border-border sm:w-[300px] md:h-[min(60vh,520px)]"
        >
          <span className="text-center font-display text-2xl font-semibold">
            Xem tất cả
            <ArrowUpRight className="mx-auto mt-2 size-8 transition-transform group-hover:rotate-45" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}
