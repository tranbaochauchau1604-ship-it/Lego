import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(100, "Tên tối đa 100 ký tự"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug tối thiểu 2 ký tự")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
