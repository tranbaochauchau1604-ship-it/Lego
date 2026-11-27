import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Làm mới session Supabase và chặn /admin/* nếu chưa đăng nhập hoặc không phải admin.
 * Được gọi từ proxy.ts (Next.js 16 đổi tên middleware → proxy).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!isSupabaseConfigured) {
    if (pathname.startsWith("/admin") && !isLogin) {
      return redirectTo(request, "/admin/login", { error: "config" });
    }
    return response;
  }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Quan trọng: getUser() xác thực token với Supabase Auth và làm mới cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin") && !isLogin) {
    if (!user) return redirectTo(request, "/admin/login", { next: pathname }, response);
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) return redirectTo(request, "/admin/login", { error: "forbidden" }, response);
  }

  if (isLogin && user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) return redirectTo(request, "/admin", {}, response);
  }

  return response;
}

function redirectTo(
  request: NextRequest,
  path: string,
  params: Record<string, string>,
  from?: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = NextResponse.redirect(url);
  // Giữ lại cookie session đã làm mới
  from?.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}
