import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Thêm sản phẩm" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: themeRows }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("theme").not("theme", "is", null),
  ]);
  const themes = [...new Set((themeRows ?? []).map((t) => t.theme!))].sort();
  return <ProductForm categories={categories ?? []} themes={themes} />;
}
