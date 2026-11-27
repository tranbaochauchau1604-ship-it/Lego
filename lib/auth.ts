import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** Trả về user nếu đã đăng nhập VÀ có trong bảng admins, ngược lại null. */
export async function getAdminUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin ? user : null;
}

/** Dùng trong layout/page admin: chuyển về trang đăng nhập nếu không phải admin. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * Dùng trong Server Actions: kiểm tra lại quyền admin (không tin tưởng client)
 * và trả về Supabase client gắn session để mọi truy vấn vẫn qua RLS.
 */
export async function assertAdmin() {
  if (!isSupabaseConfigured) throw new AdminError("Chưa cấu hình Supabase.");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AdminError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new AdminError("Bạn không có quyền thực hiện thao tác này.");
  return { supabase, user };
}

export class AdminError extends Error {}
