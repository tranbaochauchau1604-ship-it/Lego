import { MessageCircle, Send } from "lucide-react";
import { Magnetic } from "@/components/effects/magnetic";
import type { Contacts } from "@/lib/contact";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function ContactButtons({ productName, setNumber, contacts }: { productName: string; setNumber: string | null; contacts: Contacts }) {
  const { zalo, messenger, instagram } = contacts;
  const count = [zalo, messenger, instagram].filter(Boolean).length;
  const note = `Mình muốn đặt: ${productName}${setNumber ? ` (#${setNumber})` : ""}`;
  const messengerHref = messenger ? `${messenger}${messenger.includes("?") ? "&" : "?"}text=${encodeURIComponent(note)}` : "";

  if (count === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Chưa có kênh liên hệ. Vào Admin → Cài đặt để thêm Zalo, Instagram hoặc Messenger.
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
            <MessageCircle className="size-5" aria-hidden /> {count > 1 ? "Zalo" : "Liên hệ đặt hàng qua Zalo"}
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
            <Send className="size-5" aria-hidden /> {count > 1 ? "Messenger" : "Liên hệ đặt hàng qua Messenger"}
          </a>
        </Magnetic>
      )}
      {instagram && (
        <Magnetic>
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-2.5 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] px-7 font-semibold text-white shadow-[0_10px_40px_-10px_rgb(214_41_118/0.7)] transition-transform hover:scale-[1.03]"
          >
            <InstagramIcon className="size-5" /> {count > 1 ? "Instagram" : "Liên hệ đặt hàng qua Instagram"}
          </a>
        </Magnetic>
      )}
    </div>
  );
}
