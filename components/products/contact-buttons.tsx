import { MessageCircle, Send } from "lucide-react";
import { Magnetic } from "@/components/effects/magnetic";
import { siteConfig } from "@/lib/site-config";

export function ContactButtons({ productName, setNumber }: { productName: string; setNumber: string | null }) {
  const { zalo, messenger } = siteConfig.contact;
  const note = `Mình muốn đặt: ${productName}${setNumber ? ` (#${setNumber})` : ""}`;
  const messengerHref = messenger ? `${messenger}${messenger.includes("?") ? "&" : "?"}text=${encodeURIComponent(note)}` : "";

  if (!zalo && !messenger) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Chưa cấu hình kênh liên hệ. Khai báo <code>NEXT_PUBLIC_CONTACT_ZALO</code> hoặc <code>NEXT_PUBLIC_CONTACT_MESSENGER</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {zalo && (
        <Magnetic>
          <a
            href={zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-2.5 rounded-full bg-brick-red px-7 font-semibold text-white shadow-[0_10px_40px_-10px_rgb(227_0_11/0.8)] transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="size-5" aria-hidden /> Liên hệ đặt hàng qua Zalo
          </a>
        </Magnetic>
      )}
      {messenger && (
        <Magnetic>
          <a
            href={messengerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-2.5 rounded-full bg-brick-blue px-7 font-semibold text-white shadow-[0_10px_40px_-10px_rgb(0_85_191/0.8)] transition-transform hover:scale-[1.03]"
          >
            <Send className="size-5" aria-hidden /> {zalo ? "Messenger" : "Liên hệ đặt hàng qua Messenger"}
          </a>
        </Magnetic>
      )}
    </div>
  );
}
