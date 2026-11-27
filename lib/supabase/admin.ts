import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SUPABASE_URL } from "@/lib/env";

/**
 * Client dùng SERVICE ROLE KEY — bỏ qua RLS. CHỈ dùng phía server, sau khi đã
 * kiểm tra quyền admin. `server-only` đảm bảo file này không bao giờ bị bundle ra client.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
