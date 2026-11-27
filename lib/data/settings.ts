import "server-only";

import { cache } from "react";
import { CONTACT_KEYS, contactUrl, type Contacts } from "@/lib/contact";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";

type RawContacts = Record<keyof Contacts, string>;

const envRaw = (): RawContacts => ({
  zalo: process.env.NEXT_PUBLIC_CONTACT_ZALO ?? "",
  messenger: process.env.NEXT_PUBLIC_CONTACT_MESSENGER ?? "",
  instagram: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM ?? "",
});

/**
 * Giá trị liên hệ chưa chuẩn hoá (đúng như admin đã nhập).
 * Ưu tiên bảng site_settings; kênh nào chưa có dòng trong bảng thì dùng biến môi trường làm dự phòng.
 */
export const getRawContacts = cache(async (): Promise<RawContacts> => {
  const raw = envRaw();
  if (!isSupabaseConfigured) return raw;
  const { data, error } = await createPublicClient().from("site_settings").select("key, value").in("key", Object.values(CONTACT_KEYS));
  if (error) {
    console.error("[data:settings]", error);
    return raw;
  }
  for (const row of data) {
    const field = (Object.keys(CONTACT_KEYS) as (keyof Contacts)[]).find((k) => CONTACT_KEYS[k] === row.key);
    if (field) raw[field] = row.value; // có dòng trong DB (kể cả rỗng) thì ghi đè biến môi trường
  }
  return raw;
});

/** Link liên hệ đã chuẩn hoá, dùng ở trang khách. */
export const getContacts = cache(async (): Promise<Contacts> => {
  const raw = await getRawContacts();
  return {
    zalo: contactUrl(raw.zalo, "zalo"),
    messenger: contactUrl(raw.messenger, "messenger"),
    instagram: contactUrl(raw.instagram, "instagram"),
  };
});
