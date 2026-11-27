import { BadgeCheck, Gift, MessagesSquare, Truck } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { formatNumber } from "@/lib/format";

export function Bento({ productCount, themeCount }: { productCount: number; themeCount: number }) {
  return (
    <section aria-labelledby="why-heading" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <p className="text-sm font-semibold tracking-[0.3em] text-brick-red uppercase">Vì sao chọn chúng tôi</p>
        <h2 id="why-heading" className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-6xl">
          Mỗi hộp là một <span className="text-gradient">câu chuyện</span>
        </h2>
      </Reveal>
      <div className="mt-12 grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4 md:row-span-2">
          <div className="gradient-border relative flex h-full flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-brick-red/90 to-[#7a0006] p-8 text-white">
            <div aria-hidden className="absolute -top-10 -right-10 grid grid-cols-4 gap-3 opacity-25">
              {Array.from({ length: 16 }, (_, i) => (
                <span key={i} className="size-12 rounded-full border-4 border-white/70" />
              ))}
            </div>
            <BadgeCheck className="size-10" aria-hidden />
            <h3 className="mt-4 font-display text-3xl font-bold md:text-5xl">Hàng mới 100%, nguyên seal</h3>
            <p className="mt-3 max-w-lg text-white/80">Nhập chính ngạch, kiểm tra kỹ từng hộp trước khi giao. Được kiểm tra hàng khi nhận.</p>
          </div>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.1}>
          <div className="glass flex h-full flex-col justify-between rounded-[2rem] p-7">
            <span className="font-display text-6xl font-bold text-brick-yellow">{formatNumber(productCount)}+</span>
            <p className="text-muted-foreground">bộ sản phẩm thuộc {themeCount} theme khác nhau</p>
          </div>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.15}>
          <div className="flex h-full flex-col justify-between rounded-[2rem] bg-brick-yellow p-7 text-ink">
            <Truck className="size-9" aria-hidden />
            <div>
              <h3 className="font-display text-2xl font-bold">Giao toàn quốc</h3>
              <p className="text-ink/70">Đóng gói chống sốc, giao nhanh 1–3 ngày.</p>
            </div>
          </div>
        </Reveal>
        <Reveal className="md:col-span-3" delay={0.1}>
          <div className="glass flex h-full items-center gap-5 rounded-[2rem] p-7">
            <MessagesSquare className="size-10 shrink-0 text-brick-blue dark:text-[#4d8eff]" aria-hidden />
            <div>
              <h3 className="font-display text-2xl font-bold">Tư vấn tận tâm</h3>
              <p className="text-muted-foreground">Nhắn Zalo hoặc Messenger để được tư vấn chọn bộ phù hợp độ tuổi và ngân sách.</p>
            </div>
          </div>
        </Reveal>
        <Reveal className="md:col-span-3" delay={0.15}>
          <div className="flex h-full items-center gap-5 rounded-[2rem] bg-brick-blue p-7 text-white">
            <Gift className="size-10 shrink-0" aria-hidden />
            <div>
              <h3 className="font-display text-2xl font-bold">Gói quà miễn phí</h3>
              <p className="text-white/75">Kèm thiệp viết tay cho những dịp đặc biệt.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
