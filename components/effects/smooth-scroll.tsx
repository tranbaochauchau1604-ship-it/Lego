"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { usePrefersReducedMotion } from "@/hooks/use-media";

type LenisWindow = Window & { __lenis?: Lenis };

/**
 * Lenis smooth scroll, đồng bộ với GSAP ScrollTrigger. Tắt khi người dùng chọn giảm chuyển động.
 * Lenis + GSAP được import động để không làm nặng bundle ban đầu.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup = () => {};
    (async () => {
      const [{ default: LenisCtor }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const w = window as LenisWindow;
      const lenis = new LenisCtor({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      w.__lenis = lenis;
      cleanup = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        delete w.__lenis;
      };
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced]);

  useEffect(() => {
    const lenis = (window as LenisWindow).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    const id = window.setTimeout(async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      ScrollTrigger.refresh();
    }, 300);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
