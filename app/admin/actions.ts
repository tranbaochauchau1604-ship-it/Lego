"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminError, assertAdmin } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/env";
import { storagePathFromUrl } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations/category";
import { productSchema, toggleSchema } from "@/lib/validations/product";
import type { ActionResult } from "@/types";

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------
function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof AdminError) return { ok: false, error: error.message };
  console.error("[admin-action]", error);
  const msg = (error as { message?: string })?.message;
  return { ok: false, error: msg ? `Lỗi: ${msg}` : "Đã có lỗi xảy ra, vui lòng thử lại." };
}

/** Làm mới toàn bộ trang khách (trang chủ, danh sách, chi tiết, sitemap) + admin. */
function revalidateStorefront(...slugs: (string | null | undefined)[]) {
  revalidatePath("/", "layout");
  revalidatePath("/products");
  for (const slug of slugs) if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}

/** Xoá file trên Storage (chỉ các URL thuộc bucket product-images). */
async function removeStorageFiles(urls: string[]) {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => Boolean(p));
  if (!paths.length) return;
  // Dùng service role nếu có (đã kiểm tra quyền admin trước đó), nếu không dùng session admin (RLS cho phép).
  const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
  const { error } = await client.storage.from(STORAGE_BUCKET).remove(paths);
  if (error) console.error("[storage-remove]", error);
}

function uniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Sản phẩm
// ---------------------------------------------------------------------------
export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await assertAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    const values = { ...parsed.data, thumbnail: parsed.data.thumbnail ?? parsed.data.images[0] ?? null };

    const { data, error } = await supabase.from("products").insert(values).select("id, slug").single();
    if (uniqueViolation(error)) return { ok: false, error: "Slug đã tồn tại", fieldErrors: { slug: ["Slug đã tồn tại, hãy chọn slug khác"] } };
    if (error) throw error;

    revalidateStorefront(data.slug);
    return { ok: true, message: "Đã tạo sản phẩm", data: { id: data.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    if (!z.uuid().safeParse(id).success) return { ok: false, error: "ID không hợp lệ" };
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    const values = { ...parsed.data, thumbnail: parsed.data.thumbnail ?? parsed.data.images[0] ?? null };

    const { data: old, error: oldErr } = await supabase.from("products").select("slug, images").eq("id", id).single();
    if (oldErr) throw oldErr;

    const { error } = await supabase.from("products").update(values).eq("id", id);
    if (uniqueViolation(error)) return { ok: false, error: "Slug đã tồn tại", fieldErrors: { slug: ["Slug đã tồn tại, hãy chọn slug khác"] } };
    if (error) throw error;

    // Ảnh bị gỡ khỏi sản phẩm -> xoá luôn file trên Storage
    const removed = (old.images ?? []).filter((u) => !values.images.includes(u));
    await removeStorageFiles(removed);

    revalidateStorefront(old.slug, values.slug);
    return { ok: true, message: "Đã lưu thay đổi" };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    if (!z.uuid().safeParse(id).success) return { ok: false, error: "ID không hợp lệ" };
    const { data: product, error: getErr } = await supabase.from("products").select("slug, images").eq("id", id).single();
    if (getErr) throw getErr;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    await removeStorageFiles(product.images ?? []);
    revalidateStorefront(product.slug);
    return { ok: true, message: "Đã xoá sản phẩm" };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleProductField(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const parsed = toggleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ" };
    const { id, field, value } = parsed.data;
    const { data, error } = await supabase
      .from("products")
      .update(field === "is_published" ? { is_published: value } : { is_featured: value })
      .eq("id", id)
      .select("slug")
      .single();
    if (error) throw error;
    revalidateStorefront(data.slug);
    const label = field === "is_published" ? (value ? "Đã hiển thị sản phẩm" : "Đã ẩn sản phẩm") : value ? "Đã đặt làm nổi bật" : "Đã bỏ nổi bật";
    return { ok: true, message: label };
  } catch (e) {
    return fail(e);
  }
}

/** Xoá ảnh vừa upload nhưng chưa lưu vào sản phẩm (ảnh mồ côi). */
export async function deleteUploadedImages(urls: string[]): Promise<ActionResult> {
  try {
    await assertAdmin();
    const list = z.array(z.string()).max(50).parse(urls);
    await removeStorageFiles(list);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Danh mục
// ---------------------------------------------------------------------------
export async function saveCategory(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    const { id, name, slug } = parsed.data;
    const { error } = id
      ? await supabase.from("categories").update({ name, slug }).eq("id", id)
      : await supabase.from("categories").insert({ name, slug });
    if (uniqueViolation(error)) return { ok: false, error: "Slug đã tồn tại", fieldErrors: { slug: ["Slug đã tồn tại"] } };
    if (error) throw error;
    revalidateStorefront();
    return { ok: true, message: id ? "Đã cập nhật danh mục" : "Đã thêm danh mục" };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    if (!z.uuid().safeParse(id).success) return { ok: false, error: "ID không hợp lệ" };
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    revalidateStorefront();
    return { ok: true, message: "Đã xoá danh mục" };
  } catch (e) {
    return fail(e);
  }
}
