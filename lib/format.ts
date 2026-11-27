const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

/** 1290000 -> "1.290.000 ₫" */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return vnd.format(Number(value)).replace(/ /g, " ");
}

export function discountPercent(price: number, salePrice: number | null | undefined): number {
  if (!salePrice || salePrice <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function effectivePrice(p: { price: number; sale_price: number | null }): number {
  return p.sale_price && p.sale_price > 0 && p.sale_price < p.price ? p.sale_price : p.price;
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
