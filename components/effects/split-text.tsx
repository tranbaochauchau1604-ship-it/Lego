import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Kinetic typography: tách chữ thành từng ký tự, hiện lần lượt (split text reveal).
 * Thuần CSS (server component) nên chạy ngay khi trang vẽ, không phải chờ JS → tốt cho LCP.
 * Không ngắt giữa từ; trình đọc màn hình đọc nguyên câu qua aria-label.
 * prefers-reduced-motion: rule chung trong globals.css tắt animation.
 */
export function SplitText({
  text,
  className,
  charClassName,
  delay = 0,
  stagger = 0.03,
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  let index = 0;
  return (
    <span className={cn("inline", className)} role="text" aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch) => {
            const i = index++;
            return (
              <span key={i} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span
                  className={cn("split-char inline-block", charClassName)}
                  style={{ "--d": `${delay + i * stagger}s` } as CSSProperties}
                >
                  {ch}
                </span>
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
