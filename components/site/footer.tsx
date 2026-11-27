import Link from "next/link";
import { BrickMark } from "@/components/site/logo";
import type { Contacts } from "@/lib/contact";
import { siteConfig } from "@/lib/site-config";

export function Footer({ contacts }: { contacts: Contacts }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 border-t md:mt-32 border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-4 md:px-6 md:py-14">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <BrickMark />
            <span className="font-display text-xl font-bold">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Khám phá</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-brick-yellow" href="/products">Tất cả sản phẩm</Link></li>
            <li><Link className="hover:text-brick-yellow" href="/products?sale=1">Đang giảm giá</Link></li>
            <li><Link className="hover:text-brick-yellow" href="/products?sort=newest">Hàng mới về</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Liên hệ</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {contacts.zalo && (
              <li><a className="hover:text-brick-yellow" href={contacts.zalo} target="_blank" rel="noopener noreferrer">Zalo</a></li>
            )}
            {contacts.messenger && (
              <li><a className="hover:text-brick-yellow" href={contacts.messenger} target="_blank" rel="noopener noreferrer">Messenger</a></li>
            )}
            {contacts.instagram && (
              <li><a className="hover:text-brick-yellow" href={contacts.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            )}
            <li className="text-muted-foreground">Giao hàng toàn quốc</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground md:px-6">
          © {year} {siteConfig.name}. Website catalog độc lập, không liên kết với nhà sản xuất. Tên thương hiệu thuộc về chủ sở hữu tương ứng.
        </p>
      </div>
    </footer>
  );
}
