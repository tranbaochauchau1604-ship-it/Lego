import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Chỉ chạy cho khu vực admin để trang khách giữ được cache tĩnh (ISR).
  matcher: ["/admin/:path*"],
};
