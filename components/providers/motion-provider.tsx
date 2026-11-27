"use client";

import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

// Tải bộ tính năng animation của Motion bất đồng bộ → bundle ban đầu nhỏ hơn nhiều.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
