"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold">Đã có lỗi xảy ra</h1>
        <p className="mt-2 text-muted-foreground">{error.digest ? `Mã lỗi: ${error.digest}` : "Vui lòng thử lại sau ít phút."}</p>
        <button onClick={reset} className="mt-6 rounded-full bg-brick-red px-6 py-3 font-semibold text-white">Thử lại</button>
      </div>
    </main>
  );
}
