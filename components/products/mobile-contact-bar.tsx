import { MessageCircle, Send } from "lucide-react";
import { effectivePrice, formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

/** Thanh liên hệ cố định ở đáy màn hình điện thoại: luôn thấy giá và nút đặt hàng. */
export function MobileContactBar({
  name,
  setNumber,
  price,
  salePrice,
}: {
  name: string;
  setNumber: string | null;
  price: number;
  salePrice: number | null;
}) {
  const { zalo, messenger } = siteConfig.contact;
  if (!zalo && !messenger) return null;
  const note = `Mình muốn đặt: ${name}${setNumber ? ` (#${setNumber})` : ""}`;
  const messengerHref = messenger ? `${messenger}${messenger.includes("?") ? "&" : "?"}text=${encodeURIComponent(note)}` : "";
  const href = zalo || messengerHref;
  const Icon = zalo ? MessageCircle : Send;

  return (
    <div className="glass fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{name}</p>
        <p className="font-display text-lg leading-tight font-bold text-brick-yellow">{formatPrice(effectivePrice({ price, sale_price: salePrice }))}</p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-brick-red px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgb(227_0_11/0.8)]"
      >
        <Icon className="size-4" aria-hidden /> Đặt hàng
      </a>
    </div>
  );
}
