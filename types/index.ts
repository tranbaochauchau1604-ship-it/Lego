import type { Tables } from "./database";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductWithCategory = Product & { category: Pick<Category, "id" | "name" | "slug"> | null };

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export type ProductFilters = {
  q?: string;
  theme?: string;
  category?: string;
  age?: string;
  minPrice?: number;
  maxPrice?: number;
  sale?: boolean;
  sort?: ProductSort;
  page?: number;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
