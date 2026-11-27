import { z } from "zod";

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .transform((v) => (v == null || v.trim() === "" ? null : v.trim()))
    .pipe(z.string().max(max, `Tối đa ${max} ký tự`).nullable());

/** Số nguyên có thể bỏ trống (NaN từ input rỗng -> null). */
const optionalInt = (min: number, max: number, label: string) =>
  z
    .union([z.number(), z.null()])
    .transform((v) => (v == null || Number.isNaN(v) ? null : v))
    .pipe(
      z
        .number()
        .int(`${label} phải là số nguyên`)
        .min(min, `${label} tối thiểu ${min}`)
        .max(max, `${label} tối đa ${max}`)
        .nullable(),
    );

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(200, "Tên tối đa 200 ký tự"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug tối thiểu 2 ký tự")
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang"),
    set_number: optionalText(40),
    category_id: z
      .union([z.string(), z.null()])
      .transform((v) => (!v || v === "none" ? null : v))
      .pipe(z.uuid("Danh mục không hợp lệ").nullable()),
    theme: optionalText(80),
    price: z.number({ error: "Nhập giá bán" }).int("Giá phải là số nguyên").min(0, "Giá không được âm").max(10_000_000_000),
    sale_price: optionalInt(0, 10_000_000_000, "Giá sale"),
    stock: z.number({ error: "Nhập tồn kho" }).int().min(0, "Tồn kho không được âm"),
    pieces: optionalInt(0, 100_000, "Số mảnh"),
    age_range: optionalText(20),
    release_year: optionalInt(1949, 2100, "Năm phát hành"),
    short_description: optionalText(500),
    description: optionalText(20_000),
    images: z.array(z.string().min(1)).max(20, "Tối đa 20 ảnh"),
    thumbnail: z
      .union([z.string(), z.null()])
      .transform((v) => (v ? v : null)),
    is_featured: z.boolean(),
    is_published: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.sale_price != null && v.sale_price >= v.price && v.sale_price !== 0) {
      ctx.addIssue({ code: "custom", path: ["sale_price"], message: "Giá sale phải nhỏ hơn giá gốc" });
    }
    if (v.thumbnail && !v.images.includes(v.thumbnail)) {
      ctx.addIssue({ code: "custom", path: ["thumbnail"], message: "Ảnh đại diện phải nằm trong danh sách ảnh" });
    }
  });

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;

export const toggleSchema = z.object({
  id: z.uuid(),
  field: z.enum(["is_published", "is_featured"]),
  value: z.boolean(),
});
