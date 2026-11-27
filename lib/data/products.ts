import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { demoCategories, demoImagePaths, demoProducts } from "@/lib/data/demo-data";
import { effectivePrice } from "@/lib/format";
import type { Category, Paginated, ProductFilters, ProductWithCategory } from "@/types";

const PRODUCT_SELECT = "*, category:categories(id, name, slug)";

// ---------------------------------------------------------------------------
// Dữ liệu demo (khi chưa cấu hình Supabase)
// ---------------------------------------------------------------------------
const demoList: ProductWithCategory[] = demoProducts.map((p) => {
  const cat = demoCategories.find((c) => c.slug === p.category_slug) ?? null;
  const images = demoImagePaths(p.slug);
  const onSale = p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    set_number: p.set_number,
    category_id: cat?.id ?? null,
    theme: p.theme,
    price: p.price,
    sale_price: p.sale_price,
    stock: p.stock,
    pieces: p.pieces,
    age_range: p.age_range,
    release_year: p.release_year,
    short_description: p.short_description,
    description: p.description,
    images,
    thumbnail: images[0],
    is_featured: p.is_featured,
    is_published: true,
    created_at: p.created_at,
    updated_at: p.created_at,
    effective_price: onSale ? p.sale_price! : p.price,
    is_on_sale: onSale,
    category: cat,
  };
});

function normalize(p: ProductWithCategory): ProductWithCategory {
  return {
    ...p,
    price: Number(p.price),
    sale_price: p.sale_price == null ? null : Number(p.sale_price),
    effective_price: Number(p.effective_price ?? effectivePrice(p)),
    images: p.images ?? [],
  };
}

function logError(scope: string, error: unknown) {
  console.error(`[data:${scope}]`, error);
}

/** Loại bỏ ký tự đặc biệt của cú pháp filter PostgREST. */
function sanitizeSearch(q: string) {
  return q.replace(/[,()*%\\:"']/g, " ").trim().slice(0, 80);
}

// ---------------------------------------------------------------------------
// Truy vấn công khai
// ---------------------------------------------------------------------------
export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return demoCategories.map((c) => ({ ...c, created_at: "2025-01-01T00:00:00Z" }));
  const { data, error } = await createPublicClient().from("categories").select("*").order("name");
  if (error) {
    logError("categories", error);
    return [];
  }
  return data;
});

export const getThemes = cache(async (): Promise<string[]> => {
  if (!isSupabaseConfigured) return [...new Set(demoList.map((p) => p.theme!))].sort();
  const { data, error } = await createPublicClient().from("products").select("theme").not("theme", "is", null);
  if (error) {
    logError("themes", error);
    return [];
  }
  return [...new Set(data.map((r) => r.theme!).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"));
});

export const getFeaturedProducts = cache(async (limit = 8): Promise<ProductWithCategory[]> => {
  if (!isSupabaseConfigured) return demoList.filter((p) => p.is_featured).slice(0, limit);
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    logError("featured", error);
    return [];
  }
  return (data as ProductWithCategory[]).map(normalize);
});

export type ThemeSummary = { theme: string; count: number; minPrice: number; cover: string | null };

export const getThemeSummaries = cache(async (): Promise<ThemeSummary[]> => {
  let rows: Pick<ProductWithCategory, "theme" | "effective_price" | "thumbnail" | "images">[];
  if (!isSupabaseConfigured) rows = demoList;
  else {
    const { data, error } = await createPublicClient()
      .from("products")
      .select("theme, effective_price, thumbnail, images")
      .not("theme", "is", null);
    if (error) {
      logError("theme-summaries", error);
      return [];
    }
    rows = data;
  }
  const map = new Map<string, ThemeSummary>();
  for (const r of rows) {
    if (!r.theme) continue;
    const cur = map.get(r.theme);
    const price = Number(r.effective_price);
    const cover = r.thumbnail ?? r.images?.[0] ?? null;
    if (!cur) map.set(r.theme, { theme: r.theme, count: 1, minPrice: price, cover });
    else {
      cur.count += 1;
      cur.minPrice = Math.min(cur.minPrice, price);
      cur.cover ??= cover;
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
});

export async function getProducts(filters: ProductFilters): Promise<Paginated<ProductWithCategory>> {
  const pageSize = siteConfig.pageSize;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * pageSize;

  if (!isSupabaseConfigured) {
    let list = [...demoList];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.set_number?.includes(q));
    }
    if (filters.theme) list = list.filter((p) => p.theme === filters.theme);
    if (filters.category) list = list.filter((p) => p.category?.slug === filters.category);
    if (filters.age) list = list.filter((p) => p.age_range === filters.age);
    if (filters.sale) list = list.filter((p) => p.is_on_sale);
    if (filters.minPrice != null) list = list.filter((p) => p.effective_price >= filters.minPrice!);
    if (filters.maxPrice != null) list = list.filter((p) => p.effective_price <= filters.maxPrice!);
    list.sort((a, b) => {
      switch (filters.sort) {
        case "price-asc":
          return a.effective_price - b.effective_price;
        case "price-desc":
          return b.effective_price - a.effective_price;
        case "name":
          return a.name.localeCompare(b.name, "vi");
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
    const total = list.length;
    return { items: list.slice(from, from + pageSize), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  let query = createPublicClient().from("products").select(PRODUCT_SELECT, { count: "exact" });

  if (filters.q) {
    const q = sanitizeSearch(filters.q);
    if (q) query = query.or(`name.ilike.*${q}*,set_number.ilike.*${q}*`);
  }
  if (filters.theme) query = query.eq("theme", filters.theme);
  if (filters.category) {
    const cats = await getCategories();
    const cat = cats.find((c) => c.slug === filters.category);
    query = cat ? query.eq("category_id", cat.id) : query.eq("category_id", "00000000-0000-0000-0000-000000000000");
  }
  if (filters.age) query = query.eq("age_range", filters.age);
  if (filters.sale) query = query.eq("is_on_sale", true);
  if (filters.minPrice != null) query = query.gte("effective_price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("effective_price", filters.maxPrice);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("effective_price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("effective_price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) {
    logError("products", error);
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }
  const total = count ?? 0;
  return {
    items: (data as ProductWithCategory[]).map(normalize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductWithCategory | null> => {
  if (!isSupabaseConfigured) return demoList.find((p) => p.slug === slug) ?? null;
  const { data, error } = await createPublicClient().from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) {
    logError("product", error);
    return null;
  }
  return data ? normalize(data as ProductWithCategory) : null;
});

export async function getRelatedProducts(product: ProductWithCategory, limit = 4): Promise<ProductWithCategory[]> {
  if (!isSupabaseConfigured) {
    return demoList
      .filter((p) => p.id !== product.id && (p.theme === product.theme || p.category_id === product.category_id))
      .concat(demoList.filter((p) => p.id !== product.id))
      .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, limit);
  }
  const supabase = createPublicClient();
  const ors = [product.theme ? `theme.eq.${JSON.stringify(product.theme)}` : null, product.category_id ? `category_id.eq.${product.category_id}` : null]
    .filter(Boolean)
    .join(",");
  let q = supabase.from("products").select(PRODUCT_SELECT).neq("id", product.id).limit(limit);
  if (ors) q = q.or(ors);
  const { data, error } = await q;
  if (error) {
    logError("related", error);
    return [];
  }
  const items = (data as ProductWithCategory[]).map(normalize);
  if (items.length < limit) {
    const { data: more } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(limit * 2);
    for (const m of (more as ProductWithCategory[] | null) ?? []) {
      if (items.length >= limit) break;
      if (!items.some((i) => i.id === m.id)) items.push(normalize(m));
    }
  }
  return items.slice(0, limit);
}

export async function getAllProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured) return demoList.map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
  const { data, error } = await createPublicClient().from("products").select("slug, updated_at");
  if (error) {
    logError("slugs", error);
    return [];
  }
  return data;
}
