export type ContactKind = "zalo" | "instagram" | "messenger";

export type Contacts = { zalo: string; messenger: string; instagram: string };

/** Khoá lưu trong bảng site_settings. */
export const CONTACT_KEYS = {
  zalo: "contact_zalo",
  messenger: "contact_messenger",
  instagram: "contact_instagram",
} as const;

/**
 * Chuẩn hoá link liên hệ. Chấp nhận link http(s) đầy đủ hoặc dạng rút gọn
 * (số điện thoại Zalo, tên tài khoản Instagram/Messenger). Luôn trả về link https hợp lệ hoặc "".
 */
export function contactUrl(raw: string | null | undefined, kind: ContactKind): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ""; // chặn javascript:, data:, ...
  if (kind === "zalo") {
    const digits = v.replace(/\D/g, "");
    return digits ? `https://zalo.me/${digits}` : "";
  }
  const name = v.replace(/^@/, "").replace(/\/+$/, "");
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return "";
  return kind === "instagram" ? `https://www.instagram.com/${name}` : `https://m.me/${name}`;
}
