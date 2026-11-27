"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, Loader2, PencilLine, Save, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createProduct, deleteUploadedImages, updateProduct } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Markdown } from "@/components/products/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { discountPercent, formatPrice } from "@/lib/format";
import { AGE_RANGES } from "@/lib/site-config";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { productSchema, type ProductFormInput, type ProductFormOutput } from "@/lib/validations/product";
import type { Category, Product } from "@/types";

type Props = { product?: Product; categories: Category[]; themes: string[] };

const empty: ProductFormInput = {
  name: "",
  slug: "",
  set_number: "",
  category_id: null,
  theme: "",
  price: 0,
  sale_price: null,
  stock: 0,
  pieces: null,
  age_range: "",
  release_year: new Date().getFullYear(),
  short_description: "",
  description: "",
  images: [],
  thumbnail: null,
  is_featured: false,
  is_published: true,
};

export function ProductForm({ product, categories, themes }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [savedImages, setSavedImages] = useState(() => new Set(product?.images ?? []));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [preview, setPreview] = useState(false);

  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          set_number: product.set_number ?? "",
          category_id: product.category_id,
          theme: product.theme ?? "",
          price: Number(product.price),
          sale_price: product.sale_price == null ? null : Number(product.sale_price),
          stock: product.stock,
          pieces: product.pieces,
          age_range: product.age_range ?? "",
          release_year: product.release_year,
          short_description: product.short_description ?? "",
          description: product.description ?? "",
          images: product.images ?? [],
          thumbnail: product.thumbnail,
          is_featured: product.is_featured,
          is_published: product.is_published,
        }
      : empty,
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const [images, thumbnail, description, price, salePrice] = useWatch({
    control,
    name: ["images", "thumbnail", "description", "price", "sale_price"],
  });
  const pct = discountPercent(Number(price) || 0, salePrice == null || Number.isNaN(salePrice) ? null : Number(salePrice));

  const onSubmit = async (values: ProductFormOutput) => {
    const res = product ? await updateProduct(product.id, values) : await createProduct(values);
    if (!res.ok) {
      toast.error(res.error);
      for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
        if (msgs?.[0]) setError(field as keyof ProductFormInput, { message: msgs[0] });
      }
      return;
    }
    toast.success(res.message ?? "Đã lưu");
    if (!product) {
      router.push("/admin/products");
    } else {
      setSavedImages(new Set(values.images));
      form.reset(values);
      router.refresh();
    }
  };

  /** Ảnh vừa upload (chưa lưu) bị gỡ -> xoá file ngay. Ảnh cũ -> xoá khi bấm Lưu. */
  const handleRemoveImage = async (url: string) => {
    if (savedImages.has(url)) {
      toast.info("Ảnh sẽ bị xoá khỏi Storage khi bạn bấm Lưu.");
      return;
    }
    const res = await deleteUploadedImages([url]);
    if (!res.ok) toast.error(res.error);
  };

  const err = (name: keyof ProductFormInput) =>
    errors[name]?.message ? (
      <p className="text-xs text-destructive" role="alert">
        {String(errors[name]?.message)}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Quay lại danh sách">
            <Link href="/admin/products">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting || (isEdit && !isDirty)}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  {...register("name", {
                    onChange: (e) => {
                      if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: !!errors.slug });
                    },
                  })}
                />
                {err("name")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (đường dẫn) *</Label>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center rounded-lg border border-input pl-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring/50">
                    /products/
                    <input
                      id="slug"
                      className="h-8 flex-1 bg-transparent pr-3 text-foreground outline-none"
                      aria-invalid={!!errors.slug}
                      {...register("slug", { onChange: () => setSlugTouched(true) })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setValue("slug", slugify(form.getValues("name")), { shouldDirty: true, shouldValidate: true });
                      setSlugTouched(false);
                    }}
                    title="Sinh slug từ tên"
                  >
                    <Wand2 /> Tự sinh
                  </Button>
                </div>
                {err("slug")}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="set_number">Mã bộ</Label>
                  <Input id="set_number" placeholder="vd: 75192" {...register("set_number")} />
                  {err("set_number")}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="theme">Theme</Label>
                  <Input id="theme" list="theme-list" placeholder="Technic, City, Star Wars…" {...register("theme")} />
                  <datalist id="theme-list">
                    {themes.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  {err("theme")}
                </div>
                <div className="space-y-1.5">
                  <Label>Danh mục</Label>
                  <Controller
                    control={control}
                    name="category_id"
                    render={({ field }) => (
                      <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                        <SelectTrigger className="w-full" aria-label="Danh mục">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Không chọn —</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {err("category_id")}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age_range">Độ tuổi</Label>
                  <Input id="age_range" list="age-list" placeholder="vd: 18+" {...register("age_range")} />
                  <datalist id="age-list">
                    {AGE_RANGES.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                  {err("age_range")}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pieces">Số mảnh</Label>
                  <Input id="pieces" type="number" inputMode="numeric" min={0} {...register("pieces", { setValueAs: toNullableInt })} />
                  {err("pieces")}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="release_year">Năm phát hành</Label>
                  <Input id="release_year" type="number" inputMode="numeric" min={1949} max={2100} {...register("release_year", { setValueAs: toNullableInt })} />
                  {err("release_year")}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="short_description">Mô tả ngắn</Label>
                <Textarea id="short_description" rows={2} placeholder="Hiển thị dưới tên sản phẩm và trong kết quả tìm kiếm Google" {...register("short_description")} />
                {err("short_description")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mô tả chi tiết</CardTitle>
                <CardDescription>Hỗ trợ Markdown: ## tiêu đề, **đậm**, - danh sách, [link](url)…</CardDescription>
              </div>
              <div className="flex rounded-lg border border-border p-0.5" role="tablist" aria-label="Chế độ mô tả">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!preview}
                  onClick={() => setPreview(false)}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-sm", !preview && "bg-muted font-medium")}
                >
                  <PencilLine className="size-3.5" /> Soạn
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={preview}
                  onClick={() => setPreview(true)}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-sm", preview && "bg-muted font-medium")}
                >
                  <Eye className="size-3.5" /> Xem trước
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="min-h-64 rounded-lg border border-border p-4">
                  {description ? <Markdown>{description}</Markdown> : <p className="text-sm text-muted-foreground">Chưa có nội dung.</p>}
                </div>
              ) : (
                <Textarea rows={14} className="min-h-64 font-mono text-sm" aria-label="Mô tả markdown" {...register("description")} />
              )}
              {err("description")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
              <CardDescription>Ảnh đầu tiên / ảnh có ★ là ảnh đại diện hiển thị ở danh sách.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                images={images ?? []}
                thumbnail={thumbnail ?? null}
                onChange={(next) => setValue("images", next, { shouldDirty: true, shouldValidate: true })}
                onThumbnailChange={(url) => setValue("thumbnail", url, { shouldDirty: true })}
                onRemove={handleRemoveImage}
                disabled={isSubmitting}
              />
              {err("images")}
              {err("thumbnail")}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Giá & kho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Giá gốc (₫) *</Label>
                <Input id="price" type="number" inputMode="numeric" min={0} step={1000} {...register("price", { valueAsNumber: true })} />
                {err("price")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sale_price">Giá sale (₫)</Label>
                <Input id="sale_price" type="number" inputMode="numeric" min={0} step={1000} placeholder="Để trống nếu không sale" {...register("sale_price", { setValueAs: toNullableInt })} />
                {err("sale_price")}
                {pct > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Giảm <strong className="text-primary">{pct}%</strong> · khách thấy giá {formatPrice(Number(salePrice))}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Tồn kho *</Label>
                <Input id="stock" type="number" inputMode="numeric" min={0} {...register("stock", { valueAsNumber: true })} />
                {err("stock")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hiển thị</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="is_published"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium">Hiển thị trên website</span>
                      <span className="block text-xs text-muted-foreground">Tắt để lưu nháp / ẩn sản phẩm</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium">Sản phẩm nổi bật</span>
                      <span className="block text-xs text-muted-foreground">Hiện ở trang chủ</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

/** "" -> null, "12" -> 12 */
function toNullableInt(v: unknown): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
