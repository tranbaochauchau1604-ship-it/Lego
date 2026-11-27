"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slugify } from "@/lib/slugify";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import type { Category } from "@/types";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Danh mục</h1>
          <p className="text-muted-foreground">{categories.length} danh mục</p>
        </div>
        <Button size="lg" onClick={() => setEditing("new")}>
          <Plus /> Thêm danh mục
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Số sản phẩm</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!categories.length && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">Chưa có danh mục nào.</TableCell>
              </TableRow>
            )}
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-center tabular-nums">{counts[c.id] ?? 0}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Sửa ${c.name}`} onClick={() => setEditing(c)}>
                      <Pencil />
                    </Button>
                    <ConfirmDialog
                      title="Xoá danh mục?"
                      description={`Xoá "${c.name}". ${counts[c.id] ? `${counts[c.id]} sản phẩm thuộc danh mục này sẽ chuyển về "không có danh mục".` : ""} Không thể hoàn tác.`}
                      confirmLabel="Xoá danh mục"
                      pending={pendingId === c.id}
                      onConfirm={() =>
                        new Promise<void>((resolve) => {
                          setPendingId(c.id);
                          startTransition(async () => {
                            const res = await deleteCategory(c.id);
                            setPendingId(null);
                            if (res.ok) toast.success(res.message);
                            else toast.error(res.error);
                            resolve();
                          });
                        })
                      }
                      trigger={
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Xoá ${c.name}`}>
                          <Trash2 />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing !== null && <CategoryForm key={editing === "new" ? "new" : editing.id} category={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { id: category?.id, name: category?.name ?? "", slug: category?.slug ?? "" },
  });

  const onSubmit = async (values: CategoryInput) => {
    const res = await saveCategory(values);
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors?.slug?.[0]) setError("slug", { message: res.fieldErrors.slug[0] });
      if (res.fieldErrors?.name?.[0]) setError("name", { message: res.fieldErrors.name[0] });
      return;
    }
    toast.success(res.message);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>{category ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
        <DialogDescription>Slug dùng trong đường dẫn lọc sản phẩm.</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Tên danh mục</Label>
        <Input
          id="cat-name"
          autoFocus
          aria-invalid={!!errors.name}
          {...register("name", { onChange: (e) => !slugTouched && setValue("slug", slugify(e.target.value)) })}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input id="cat-slug" aria-invalid={!!errors.slug} {...register("slug", { onChange: () => setSlugTouched(true) })} />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Huỷ</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Lưu
        </Button>
      </DialogFooter>
    </form>
  );
}
