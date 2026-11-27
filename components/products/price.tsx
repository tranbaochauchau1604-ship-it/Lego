import { discountPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  price,
  salePrice,
  size = "md",
  className,
}: {
  price: number;
  salePrice: number | null;
  size?: "md" | "lg";
  className?: string;
}) {
  const pct = discountPercent(price, salePrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cn("font-display font-bold tracking-tight", size === "lg" ? "text-3xl sm:text-4xl" : "text-base sm:text-lg", pct > 0 && "text-brick-yellow")}>
        {formatPrice(pct > 0 ? salePrice : price)}
      </span>
      {pct > 0 && (
        <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
          <span className="sr-only">Giá gốc: </span>
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}

export function SaleBadge({ price, salePrice, className }: { price: number; salePrice: number | null; className?: string }) {
  const pct = discountPercent(price, salePrice);
  if (!pct) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-brick-red px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-brick-red/30", className)}>
      Sale −{pct}%
    </span>
  );
}
