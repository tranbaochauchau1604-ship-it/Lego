"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Đóng menu khi đổi trang
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]) && !href.includes("?"));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
      <a
        href="#main"
        className="sr-only rounded-md bg-brick-yellow px-3 py-2 text-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Bỏ qua tới nội dung
      </a>
      <div
        className={cn(
          "mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl px-3 transition-all duration-500 md:px-5",
          scrolled || open ? "glass shadow-lg shadow-black/10" : "border border-transparent",
        )}
      >
        <Logo />
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item.href) && "bg-foreground/8 text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            aria-label="Tìm kiếm sản phẩm"
            className="grid size-10 place-items-center rounded-full border border-glass-border bg-glass transition-colors hover:border-brick-yellow/60"
          >
            <Search className="size-4" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-glass-border bg-glass md:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-nav"
            aria-label="Điều hướng di động"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="glass mx-auto mt-2 flex max-w-7xl flex-col rounded-2xl p-2 md:hidden"
          >
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 font-display text-lg font-semibold hover:bg-foreground/5">
                {item.label}
              </Link>
            ))}
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
