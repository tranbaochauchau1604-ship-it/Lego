"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/use-media";

/** Fallback nhẹ hiển thị trong lúc tải three.js (và khi trình duyệt không hỗ trợ WebGL). */
function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[16vh] md:items-end md:justify-end md:pt-0 md:pr-[12%] md:pb-[22vh]" aria-hidden>
      <div className="relative h-28 w-52 animate-pulse rounded-xl bg-gradient-to-br from-brick-red to-[#8a0007] shadow-[0_30px_80px_-20px_rgb(227_0_11/0.7)] md:h-36 md:w-72">
        <div className="absolute -top-5 left-0 grid w-full grid-cols-4 gap-3 px-3">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="h-6 rounded-md bg-brick-red" />
          ))}
        </div>
      </div>
    </div>
  );
}

const HeroScene = dynamic(() => import("@/components/3d/hero-scene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

/** Chỉ tải three.js khi trình duyệt rảnh — nội dung chữ của hero hiển thị trước (tốt cho LCP/TBT). */
function useIdle(timeout = 3500) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timer: number | undefined;
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    const go = () => {
      cleanup();
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => setReady(true), { timeout: 1000 });
      else setReady(true);
    };
    // Khởi tạo WebGL khi người dùng tương tác lần đầu, hoặc sau `timeout` ms kể từ lúc trang tải xong.
    // Trang hiển thị và tương tác được ngay, scene 3D nặng tải sau.
    const onLoad = () => (timer = window.setTimeout(go, timeout));
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      window.removeEventListener("load", onLoad);
      if (timer) window.clearTimeout(timer);
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      cleanup();
      if (idleId !== undefined) {
        if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, [timeout]);
  return ready;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroSceneLoader() {
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const idle = useIdle();
  const [webgl] = useState(() => (typeof window === "undefined" ? true : hasWebGL()));
  if (!idle || !webgl) return <SceneFallback />;
  return <HeroScene mobile={mobile} reduced={reduced} />;
}
