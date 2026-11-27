"use client";

import { useEffect, useRef } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/use-media";

/** Con trỏ tuỳ biến: chấm nhỏ + vòng tròn đuổi theo, phóng to khi hover phần tử tương tác. */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("has-custom-cursor");
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let scale = 1;
    let raf = 0;
    let hovering = false;
    let visible = false;

    const setOpacity = (v: string) => {
      dot.current?.style.setProperty("opacity", v);
      ring.current?.style.setProperty("opacity", v);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        setOpacity("1");
      }
      const t = e.target as HTMLElement | null;
      hovering = Boolean(t?.closest("a, button, [role=button], input, select, textarea, label, [data-cursor=hover]"));
    };
    const leave = () => {
      visible = false;
      setOpacity("0");
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += ((hovering ? 1.8 : 1) - scale) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      html.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] size-9 rounded-full border border-brick-yellow/80 opacity-0 transition-opacity duration-200"
      />
      <div ref={dot} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[100] size-1.5 rounded-full bg-brick-yellow opacity-0" />
    </>
  );
}
