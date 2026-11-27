// Sinh ảnh placeholder (public/placeholders/*.svg) và supabase/seed.sql từ lib/data/demo-data.ts
// Chạy: npm run gen:seed   (Node >= 22.18 hỗ trợ chạy TypeScript trực tiếp)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { demoCategories, demoImagePaths, demoProducts, type DemoProduct } from "../lib/data/demo-data.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "placeholders");
mkdirSync(outDir, { recursive: true });

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Vẽ một viên gạch isometric với các núm tròn. */
function brick(x: number, y: number, w: number, color: string, studs: number): string {
  const h = 34;
  const d = 26;
  const top = shade(color, 30);
  const side = shade(color, -45);
  let s = `<g>`;
  s += `<polygon points="${x},${y} ${x + w},${y} ${x + w + d},${y - d * 0.6} ${x + d},${y - d * 0.6}" fill="${top}"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
  s += `<polygon points="${x + w},${y} ${x + w + d},${y - d * 0.6} ${x + w + d},${y + h - d * 0.6} ${x + w},${y + h}" fill="${side}"/>`;
  const gap = w / studs;
  for (let i = 0; i < studs; i++) {
    const cx = x + gap * i + gap / 2 + d / 2;
    const cy = y - d * 0.3;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${gap * 0.3}" ry="${gap * 0.14}" fill="${side}"/>`;
    s += `<rect x="${cx - gap * 0.3}" y="${cy - 8}" width="${gap * 0.6}" height="8" fill="${color}"/>`;
    s += `<ellipse cx="${cx}" cy="${cy - 8}" rx="${gap * 0.3}" ry="${gap * 0.14}" fill="${top}"/>`;
  }
  return s + `</g>`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgFor(p: DemoProduct, variant: 1 | 2): string {
  const W = 800;
  const H = 800;
  const bg1 = variant === 1 ? "#14141c" : shade(p.color, -90);
  const bg2 = variant === 1 ? shade(p.color, -70) : "#0a0a0f";
  const palette = [p.color, p.accent === "#0A0A0F" ? "#FFD500" : p.accent, "#0055BF", "#E3000B", "#FFD500"];
  let bricks = "";
  const rows = variant === 1 ? 5 : 4;
  for (let r = 0; r < rows; r++) {
    const w = 160 + ((r * 53) % 3) * 70;
    const x = 400 - w / 2 - 13 + (r % 2 === 0 ? -30 : 30) * (variant === 1 ? 1 : -1);
    const y = 560 - r * 62;
    bricks += brick(x, y, w, palette[(r + variant) % palette.length], Math.round(w / 60));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<radialGradient id="g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${bg2}"/><stop offset="1" stop-color="${bg1}"/></radialGradient>
<radialGradient id="glow" cx="50%" cy="60%" r="40%"><stop offset="0" stop-color="${p.color}" stop-opacity="0.45"/><stop offset="1" stop-color="${p.color}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<ellipse cx="400" cy="640" rx="260" ry="26" fill="#000" opacity="0.35"/>
${bricks}
<text x="48" y="80" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#ffffff" opacity="0.55" letter-spacing="4">${escapeXml(p.theme.toUpperCase())} · ${p.set_number}</text>
</svg>`;
}

for (const p of demoProducts) {
  const [a, b] = demoImagePaths(p.slug);
  writeFileSync(join(root, "public", a), svgFor(p, 1));
  writeFileSync(join(root, "public", b), svgFor(p, 2));
}

const q = (v: string | null) => (v == null ? "null" : `'${v.replace(/'/g, "''")}'`);
const arr = (xs: string[]) => `array[${xs.map(q).join(", ")}]::text[]`;

let sql = `-- =====================================================================
-- BrickVerse — dữ liệu mẫu (sinh tự động bởi scripts/generate-seed.mts)
-- Chạy SAU 001_init.sql. Ảnh mẫu là placeholder SVG trong /public/placeholders.
-- =====================================================================

insert into public.categories (id, name, slug) values
${demoCategories.map((c) => `  (${q(c.id)}, ${q(c.name)}, ${q(c.slug)})`).join(",\n")}
on conflict (slug) do nothing;

insert into public.products
  (id, name, slug, set_number, category_id, theme, price, sale_price, stock, pieces, age_range, release_year,
   short_description, description, images, thumbnail, is_featured, is_published, created_at)
values
`;
sql += demoProducts
  .map((p) => {
    const imgs = demoImagePaths(p.slug);
    return `  (${q(p.id)}, ${q(p.name)}, ${q(p.slug)}, ${q(p.set_number)},
   (select id from public.categories where slug = ${q(p.category_slug)}), ${q(p.theme)},
   ${p.price}, ${p.sale_price ?? "null"}, ${p.stock}, ${p.pieces}, ${q(p.age_range)}, ${p.release_year},
   ${q(p.short_description)},
   ${q(p.description)},
   ${arr(imgs)}, ${q(imgs[0])}, ${p.is_featured}, true, ${q(p.created_at)})`;
  })
  .join(",\n");
sql += `\non conflict (slug) do nothing;\n`;

writeFileSync(join(root, "supabase", "seed.sql"), sql);
console.log(`✓ ${demoProducts.length * 2} ảnh placeholder + supabase/seed.sql`);
