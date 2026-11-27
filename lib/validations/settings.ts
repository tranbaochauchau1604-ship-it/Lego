import { z } from "zod";

const url = z.string().regex(/^https?:\/\/\S+$/i, "Link phải bắt đầu bằng http:// hoặc https://");

/** Chuỗi rỗng = xoá kênh liên hệ. */
const optional = (schema: z.ZodType<string>, label: string) =>
  z
    .string()
    .trim()
    .max(200, "Tối đa 200 ký tự")
    .refine((v) => v === "" || schema.safeParse(v).success, label);

const zaloShort = z.string().regex(/^\+?[0-9][0-9\s.-]{7,14}$/);
const handle = (min: number, max: number) => z.string().regex(new RegExp(`^@?[A-Za-z0-9._]{${min},${max}}$`));

export const contactSettingsSchema = z.object({
  zalo: optional(z.union([url, zaloShort]), "Nhập số điện thoại Zalo (vd: 0901234567) hoặc link zalo.me/…"),
  instagram: optional(z.union([url, handle(1, 30)]), "Nhập tên tài khoản (vd: brickverse.vn) hoặc link Instagram"),
  messenger: optional(z.union([url, handle(5, 50)]), "Nhập tên trang Facebook (vd: brickverse) hoặc link m.me/…"),
});

export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;
