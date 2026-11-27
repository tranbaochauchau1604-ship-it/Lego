"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ProductImage } from "@/components/products/product-image";
import { STORAGE_BUCKET } from "@/lib/env";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  thumbnail: string | null;
  onChange: (images: string[]) => void;
  onThumbnailChange: (url: string | null) => void;
  /** Gọi khi admin xoá ảnh khỏi danh sách (để form quyết định có xoá file ngay hay không). */
  onRemove: (url: string) => void;
  disabled?: boolean;
};

export function ImageUploader({ images, thumbnail, onChange, onThumbnailChange, onRemove, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    const valid = list.filter((f) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        toast.error(`${f.name}: định dạng không hỗ trợ (chỉ JPG, PNG, WEBP, AVIF, GIF)`);
        return false;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`${f.name}: dung lượng vượt 5MB`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    const supabase = createClient();
    setUploading((n) => n + valid.length);
    const uploaded: string[] = [];
    await Promise.all(
      valid.map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `products/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type });
        setUploading((n) => n - 1);
        if (error) {
          toast.error(`Upload ${file.name} thất bại: ${error.message}`);
          return;
        }
        uploaded.push(supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl);
      }),
    );
    if (uploaded.length) {
      const next = [...images, ...uploaded];
      onChange(next);
      if (!thumbnail) onThumbnailChange(next[0]);
      toast.success(`Đã tải lên ${uploaded.length} ảnh`);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = images.indexOf(String(active.id));
    const to = images.indexOf(String(over.id));
    onChange(arrayMove(images, from, to));
  }

  function remove(url: string) {
    const next = images.filter((u) => u !== url);
    onChange(next);
    if (thumbnail === url) onThumbnailChange(next[0] ?? null);
    onRemove(url);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Kéo thả ảnh vào đây hoặc bấm để chọn ảnh"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          dragOver && "border-primary bg-primary/10",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {uploading > 0 ? <Loader2 className="size-8 animate-spin text-primary" /> : <ImagePlus className="size-8 text-muted-foreground" />}
        <p className="font-medium">{uploading > 0 ? `Đang tải lên ${uploading} ảnh…` : "Kéo thả ảnh vào đây hoặc bấm để chọn"}</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, AVIF, GIF · tối đa 5MB/ảnh · chọn được nhiều ảnh</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">Kéo biểu tượng ⋮⋮ để sắp xếp thứ tự. Bấm ★ để chọn ảnh đại diện.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {images.map((url, i) => (
                  <SortableImage
                    key={url}
                    url={url}
                    index={i}
                    isThumbnail={thumbnail === url}
                    onThumbnail={() => onThumbnailChange(url)}
                    onRemove={() => remove(url)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}

function SortableImage({
  url,
  index,
  isThumbnail,
  onThumbnail,
  onRemove,
}: {
  url: string;
  index: number;
  isThumbnail: boolean;
  onThumbnail: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted",
        isThumbnail ? "border-brick-yellow" : "border-transparent",
        isDragging && "z-10 opacity-80 shadow-xl",
      )}
    >
      <ProductImage src={url} alt={`Ảnh ${index + 1}`} fill sizes="160px" className="object-cover" />
      <button
        type="button"
        className="absolute top-1 left-1 grid size-7 cursor-grab touch-none place-items-center rounded-md bg-black/60 text-white active:cursor-grabbing"
        aria-label={`Kéo để sắp xếp ảnh ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="absolute top-1 right-1 flex gap-1">
        <button
          type="button"
          onClick={onThumbnail}
          className={cn("grid size-7 place-items-center rounded-md bg-black/60", isThumbnail ? "text-brick-yellow" : "text-white")}
          aria-label={isThumbnail ? "Ảnh đại diện hiện tại" : `Đặt ảnh ${index + 1} làm ảnh đại diện`}
          aria-pressed={isThumbnail}
        >
          <Star className={cn("size-4", isThumbnail && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md bg-black/60 text-white hover:bg-destructive"
          aria-label={`Xoá ảnh ${index + 1}`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {isThumbnail && <span className="absolute inset-x-1 bottom-1 rounded bg-brick-yellow px-1 py-0.5 text-center text-[10px] font-bold text-ink">ẢNH ĐẠI DIỆN</span>}
    </li>
  );
}
