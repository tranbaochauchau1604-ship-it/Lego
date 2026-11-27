import Link from "next/link";
import { BrickMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <BrickMark className="mx-auto size-16 animate-bounce" />
        <p className="mt-6 font-display text-8xl font-bold text-gradient">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Viên gạch này bị thất lạc rồi!</h1>
        <p className="mt-2 text-muted-foreground">Trang bạn tìm không tồn tại hoặc đã bị gỡ.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-brick-red px-6 py-3 font-semibold text-white">Về trang chủ</Link>
          <Link href="/products" className="rounded-full border border-border px-6 py-3 font-semibold">Xem sản phẩm</Link>
        </div>
      </div>
    </main>
  );
}
