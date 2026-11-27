import type { ProductFilters, ProductSort } from "@/types";

const SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "name"];

type RawParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const num = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseProductFilters(sp: RawParams): ProductFilters {
  const sort = one(sp.sort) as ProductSort | undefined;
  const page = Number(one(sp.page));
  return {
    q: one(sp.q)?.slice(0, 80),
    theme: one(sp.theme),
    category: one(sp.category),
    age: one(sp.age),
    minPrice: num(one(sp.min)),
    maxPrice: num(one(sp.max)),
    sale: one(sp.sale) === "1",
    sort: sort && SORTS.includes(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}
