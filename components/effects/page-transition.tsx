import { ViewTransition, type ReactNode } from "react";

/**
 * Chuyển trang mượt bằng View Transitions API (React <ViewTransition>).
 * Đặt trong từng page (không phải layout) để enter/exit chạy khi điều hướng.
 * Trình duyệt không hỗ trợ: trang vẫn hoạt động bình thường, chỉ không có hiệu ứng.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
