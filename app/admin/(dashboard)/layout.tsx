import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrickMark } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: `%s · Quản trị ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Kiểm tra lần 2 phía server (proxy.ts đã chặn trước) — không bao giờ chỉ tin vào proxy.
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-sidebar p-4 md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0">
        <div className="flex items-center justify-between md:flex-col md:items-start md:gap-6">
          <div className="flex items-center gap-2">
            <BrickMark className="size-7" />
            <span className="font-display font-bold">{siteConfig.name}</span>
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">Admin</span>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-4 md:mt-6">
          <AdminNav />
        </div>
        <div className="mt-4 hidden border-t border-border pt-4 md:absolute md:inset-x-4 md:bottom-4 md:block">
          <p className="truncate text-xs text-muted-foreground" title={user.email}>{user.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <form action={signOut} className="flex-1">
              <Button type="submit" variant="outline" className="w-full">
                <LogOut /> Đăng xuất
              </Button>
            </form>
            <ThemeToggle className="size-8" />
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
        <form action={signOut} className="px-4 pb-8 md:hidden">
          <Button type="submit" variant="outline" className="w-full">
            <LogOut /> Đăng xuất ({user.email})
          </Button>
        </form>
      </div>
    </div>
  );
}
