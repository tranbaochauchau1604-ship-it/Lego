"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { saveContactSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactUrl, type ContactKind } from "@/lib/contact";
import { contactSettingsSchema, type ContactSettingsInput } from "@/lib/validations/settings";

const FIELDS: { name: keyof ContactSettingsInput; kind: ContactKind; label: string; placeholder: string; hint: string }[] = [
  { name: "zalo", kind: "zalo", label: "Zalo", placeholder: "0901234567", hint: "Số điện thoại Zalo hoặc link zalo.me/…" },
  { name: "instagram", kind: "instagram", label: "Instagram", placeholder: "brickverse.vn", hint: "Tên tài khoản (có hoặc không có @) hoặc link Instagram" },
  { name: "messenger", kind: "messenger", label: "Messenger", placeholder: "brickverse", hint: "Tên trang Facebook hoặc link m.me/…" },
];

export function ContactSettingsForm({ defaults }: { defaults: ContactSettingsInput }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContactSettingsInput>({ resolver: zodResolver(contactSettingsSchema), defaultValues: defaults });
  const values = useWatch({ control });

  const onSubmit = async (data: ContactSettingsInput) => {
    const res = await saveContactSettings(data);
    if (!res.ok) {
      toast.error(res.error);
      for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
        if (msgs?.[0]) setError(field as keyof ContactSettingsInput, { message: msgs[0] });
      }
      return;
    }
    toast.success(res.message);
    reset(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Kênh liên hệ đặt hàng</CardTitle>
          <CardDescription>
            Hiển thị ở nút &quot;Liên hệ đặt hàng&quot; trên trang sản phẩm, thanh đặt hàng trên điện thoại và chân trang. Để trống để ẩn kênh đó.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {FIELDS.map((f) => {
            const preview = contactUrl(values[f.name], f.kind);
            return (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input id={f.name} placeholder={f.placeholder} autoComplete="off" aria-invalid={!!errors[f.name]} {...register(f.name)} />
                {errors[f.name] ? (
                  <p className="text-xs text-destructive" role="alert">
                    {errors[f.name]?.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">{f.hint}</p>
                )}
                {preview && !errors[f.name] && (
                  <a href={preview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="size-3" aria-hidden /> Link khách sẽ thấy: {preview}
                  </a>
                )}
              </div>
            );
          })}
          <Button type="submit" size="lg" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            Lưu cài đặt
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
