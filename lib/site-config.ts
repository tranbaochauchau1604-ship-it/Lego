/** Cấu hình chung của website — đổi tên thương hiệu tại đây. */
export const siteConfig = {
  name: "BrickVerse",
  shortName: "BrickVerse",
  tagline: "Vũ trụ gạch xếp hình",
  description:
    "BrickVerse — catalog các bộ đồ chơi gạch xếp hình chính hãng: Technic, City, Star Wars, Creator, Ideas… Giá tốt, tư vấn tận tâm.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "vi_VN",
  nav: [
    { href: "/", label: "Trang chủ" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/products?sale=1", label: "Đang giảm giá" },
  ],
  pageSize: 12,
} as const;

export const AGE_RANGES = ["4+", "6+", "7+", "8+", "9+", "10+", "12+", "16+", "18+"] as const;
