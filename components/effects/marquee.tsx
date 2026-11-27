import { cn } from "@/lib/utils";

const dots = ["bg-brick-red", "bg-brick-yellow", "bg-brick-blue"];

/** Marquee chạy vô tận (CSS thuần, nhân đôi nội dung để lặp liền mạch). */
export function Marquee({
  items,
  className,
  reverse = false,
  duration = 40,
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
  duration?: number;
}) {
  const row = items.length ? items : ["BrickVerse"];
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden select-none [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]",
        className,
      )}
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[0, 1].map((k) => (
          <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
            {row.map((t, i) => (
              <li
                key={`${k}-${i}`}
                className="flex items-center gap-8 px-8 font-display text-4xl font-bold tracking-tight whitespace-nowrap uppercase md:text-6xl"
              >
                <span className={i % 2 ? "text-transparent opacity-80 [-webkit-text-stroke:1.5px_currentColor]" : ""}>{t}</span>
                <span aria-hidden className={cn("inline-block size-4 rounded-sm md:size-5", dots[i % 3])} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
