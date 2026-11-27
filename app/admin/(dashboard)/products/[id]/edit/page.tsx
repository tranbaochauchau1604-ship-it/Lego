import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sửa sản phẩm" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: product }, { data: categories }, { data: themeRows }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("theme").not("theme", "is", null),
  ]);
  if (!product) notFound();
  const themes = [...new Set((themeRows ?? []).map((t) => t.theme!))].sort();
  return <ProductForm key={product.updated_at} product={product} categories={categories ?? []} themes={themes} />;
}
