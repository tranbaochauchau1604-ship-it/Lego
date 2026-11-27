import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Supabase client gắn với session của người dùng (đọc cookie).
 * Dùng cho trang admin, Server Actions. Mọi truy vấn vẫn đi qua RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Gọi từ Server Component: bỏ qua, proxy.ts sẽ làm mới session.
        }
      },
    },
  });
}

/**
 * Client ẩn danh, không đọc cookie — dùng cho trang khách để có thể cache/ISR.
 * Chỉ thấy dữ liệu công khai theo RLS (sản phẩm is_published = true).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
