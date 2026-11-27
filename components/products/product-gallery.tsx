"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ViewTransition, useCallback, useEffect, useState } from "react";
import { ProductImage } from "@/components/products/product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, slug }: { images: string[]; name: string; slug: string }) {
  const list = images.length ? images : ["/placeholders/empty.svg"];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const reduced = useReducedMotion();

  const go = useCallback(
    (next: number) => {
      setDir(next > index ? 1 : -1);
      setIndex((next + list.length) % list.length);
    },
    [index, list.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go, index]);

  const variants = {
    enter: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * 60, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * -60, scale: 0.98 }),
  };

  const main = (
    <div
      className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-card"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerLeave={() => setZoom(null)}
      onClick={() => setLightbox(true)}
      data-cursor="hover"
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <m.div
          key={index}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <ProductImage
            src={list[index]}
            alt={`${name} — ảnh ${index + 1}`}
            fill
            loading={index === 0 ? "eager" : undefined}
            fetchPriority={index === 0 ? "high" : undefined}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out"
            style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        </m.div>
      </AnimatePresence>
      <span className="glass pointer-events-none absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100">
        <Expand className="size-3.5" aria-hidden /> Bấm để phóng to
      </span>
      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={(e) => {
              e.stopPropagation();
              go(index - 1);
            }}
            className="glass absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Ảnh sau"
            onClick={(e) => {
              e.stopPropagation();
              go(index + 1);
            }}
            className="glass absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Ảnh đầu tiên "bay" từ card sang (View Transitions) */}
      {index === 0 ? (
        <ViewTransition name={`product-image-${slug}`} share="morph" default="none">
          {main}
        </ViewTransition>
      ) : (
        main
      )}

      {list.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto pb-1" aria-label="Chọn ảnh">
          {list.map((src, i) => (
            <li key={src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-xl border-2 transition-all",
                  i === index ? "border-brick-yellow" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <ProductImage src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {lightbox && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={`Ảnh phóng to: ${name}`}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            data-lenis-prevent
          >
            <m.div
              className="relative aspect-square w-full max-w-[min(90vw,85vh)]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProductImage src={list[index]} alt={`${name} — ảnh ${index + 1}`} fill sizes="90vw" className="rounded-2xl object-contain" />
            </m.div>
            <button type="button" autoFocus aria-label="Đóng" onClick={() => setLightbox(false)} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white">
              <X className="size-5" />
            </button>
            {list.length > 1 && (
              <p className="absolute bottom-6 text-sm text-white/70">
                {index + 1} / {list.length} · dùng phím ← → để chuyển ảnh
              </p>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
