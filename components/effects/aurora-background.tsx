/**
 * Nền aurora/gradient mesh chuyển động + lưới mờ + noise. Thuần CSS (không tốn JS).
 * Dùng radial-gradient thay cho filter: blur() và chỉ animate transform → chạy trên compositor, rất nhẹ.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="noise pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="absolute -top-1/3 -left-1/4 h-[80vmax] w-[80vmax] animate-aurora will-change-transform"
        style={{ background: "radial-gradient(closest-side, rgb(227 0 11 / 0.28), transparent)" }}
      />
      <div
        className="absolute top-1/4 -right-1/4 h-[70vmax] w-[70vmax] animate-aurora will-change-transform"
        style={{
          background: "radial-gradient(closest-side, rgb(0 85 191 / 0.32), transparent)",
          animationDelay: "-6s",
          animationDuration: "22s",
        }}
      />
      <div
        className="absolute -bottom-1/3 left-1/4 h-[60vmax] w-[60vmax] animate-aurora opacity-70 will-change-transform dark:opacity-50"
        style={{
          background: "radial-gradient(closest-side, rgb(255 213 0 / 0.25), transparent)",
          animationDelay: "-12s",
          animationDuration: "26s",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(127_127_127/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(127_127_127/0.07)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
    </div>
  );
}
