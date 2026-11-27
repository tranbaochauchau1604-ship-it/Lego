"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, toggleProductField } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function ToggleField({ id, field, value, label }: { id: string; field: "is_published" | "is_featured"; value: boolean; label: string }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [, startTransition] = useTransition();
  return (
    <Switch
      checked={optimistic}
      aria-label={label}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          setOptimistic(checked);
          const res = await toggleProductField({ id, field, value: checked });
          if (res.ok) toast.success(res.message);
          else toast.error(res.error);
        })
      }
    />
  );
}

export function ProductRowActions({ id, name, slug, published }: { id: string; name: string; slug: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center justify-end gap-1">
      {published && (
        <Button asChild variant="ghost" size="icon" title="Xem trên website">
          <Link href={`/products/${slug}`} target="_blank" aria-label={`Xem ${name} trên website`}>
            <ExternalLink />
          </Link>
        </Button>
      )}
      <Button asChild variant="ghost" size="icon" title="Sửa">
        <Link href={`/admin/products/${id}/edit`} aria-label={`Sửa ${name}`}>
          <Pencil />
        </Link>
      </Button>
      <ConfirmDialog
        title="Xoá sản phẩm?"
        description={`"${name}" và toàn bộ ảnh của sản phẩm trên Storage sẽ bị xoá vĩnh viễn. Không thể hoàn tác.`}
        confirmLabel="Xoá sản phẩm"
        pending={pending}
        onConfirm={() =>
          new Promise<void>((resolve) =>
            startTransition(async () => {
              const res = await deleteProduct(id);
              if (res.ok) toast.success(res.message);
              else toast.error(res.error);
              resolve();
            }),
          )
        }
        trigger={
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Xoá" aria-label={`Xoá ${name}`}>
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}
