"use client";

import { useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/use-media";
import { cn } from "@/lib/utils";

/** Card nghiêng 3D theo chuột, có lớp glare ánh sáng chạy theo con trỏ. */
export function TiltCard({ children, className, max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const active = fine && !reduced;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 260, damping: 22 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`;
  const glow = useMotionValue(0);
  const glowSpring = useSpring(glow, { stiffness: 200, damping: 30 });

  return (
    <div className="h-full [perspective:1000px]">
      <m.div
        ref={ref}
        className={cn("relative h-full [transform-style:preserve-3d]", className)}
        style={active ? { rotateX, rotateY } : undefined}
        onPointerMove={(e) => {
          if (!active || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerEnter={() => glow.set(1)}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          glow.set(0);
        }}
      >
        {children}
        {active && (
          <m.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-overlay"
            style={{ background: glare, opacity: glowSpring }}
          />
        )}
      </m.div>
    </div>
  );
}
