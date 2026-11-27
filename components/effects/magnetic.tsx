"use client";

import { useMotionValue, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/use-media";
import { cn } from "@/lib/utils";

/** Bọc nút để nút "hút" theo chuột khi lại gần. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 15, mass: 0.4 });
  const active = fine && !reduced;

  return (
    <m.div
      ref={ref}
      className={cn("inline-block", className)}
      style={active ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!active || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * strength);
        my.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </m.div>
  );
}
