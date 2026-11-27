import type { Metadata } from "next";
import { Suspense } from "react";
import { BrickMark } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Đăng nhập quản trị", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="absolute -top-40 -left-40 size-[480px] rounded-full bg-brick-red/25 blur-[120px]" />
      <div aria-hidden className="absolute -right-40 -bottom-40 size-[480px] rounded-full bg-brick-blue/25 blur-[120px]" />
      <div className="glass relative w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <BrickMark />
          <span className="font-display text-xl font-bold">{siteConfig.name}</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Đăng nhập quản trị</h1>
        <p className="mt-1 text-sm text-muted-foreground">Chỉ dành cho tài khoản có quyền admin.</p>
        <Suspense>
          <LoginForm configured={isSupabaseConfigured} />
        </Suspense>
      </div>
    </main>
  );
}
