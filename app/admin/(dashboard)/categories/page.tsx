import { CategoryManager } from "@/components/admin/category-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Danh mục" };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories, error }, { data: rows }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("category_id").not("category_id", "is", null),
  ]);
  if (error) return <p className="text-destructive">Lỗi tải danh mục: {error.message}</p>;
  const counts: Record<string, number> = {};
  for (const r of rows ?? []) if (r.category_id) counts[r.category_id] = (counts[r.category_id] ?? 0) + 1;
  return <CategoryManager categories={categories ?? []} counts={counts} />;
}
