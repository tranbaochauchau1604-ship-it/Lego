"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FolderTree, LayoutDashboard, Package, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Sản phẩm", icon: Package, exact: false },
  { href: "/admin/products/new", label: "Thêm sản phẩm", icon: PlusCircle, exact: true },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && !(href === "/admin/products" && pathname === "/admin/products/new");
  return (
    <nav aria-label="Quản trị" className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          aria-current={active(it.href, it.exact) ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            active(it.href, it.exact) && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
          )}
        >
          <it.icon className="size-4" aria-hidden />
          {it.label}
        </Link>
      ))}
      <Link
        href="/"
        target="_blank"
        className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:mt-4"
      >
        <ExternalLink className="size-4" aria-hidden /> Xem website
      </Link>
    </nav>
  );
}
