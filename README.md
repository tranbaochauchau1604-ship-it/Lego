# BrickVerse — Catalog gạch xếp hình

Website catalog bộ đồ chơi gạch xếp hình: khách xem sản phẩm, giá (VNĐ), hình ảnh và liên hệ đặt hàng qua Zalo/Messenger. Admin đăng nhập để thêm, sửa, xoá sản phẩm, upload ảnh và bật/tắt hiển thị.

> Tên website đặt trong `lib/site-config.ts` (đổi `name` là xong). Website không dùng logo, font hay tài sản thương hiệu chính thức của nhà sản xuất.

## Công nghệ

| Phần | Thư viện |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions), TypeScript strict |
| Giao diện | Tailwind CSS 4, shadcn/ui (admin), lucide-react, next/font (Space Grotesk + Be Vietnam Pro) |
| Dữ liệu | Supabase: Postgres + Auth + Storage, `@supabase/ssr` |
| 3D | three.js, @react-three/fiber, @react-three/drei |
| Animation | Motion, GSAP + ScrollTrigger, Lenis, View Transitions (React `<ViewTransition>`) |
| Form | react-hook-form + zod |

## Cấu trúc thư mục

```
app/
  (site)/              Trang cho khách: /, /products, /products/[slug]
  admin/
    login/             Trang đăng nhập
    (dashboard)/       Tổng quan, sản phẩm, danh mục (yêu cầu quyền admin)
    actions.ts         Server Actions (validate zod + revalidatePath)
  sitemap.ts, robots.ts, opengraph-image.tsx, manifest.ts
components/
  3d/                  Scene 3D hero (brick tự dựng bằng geometry)
  effects/             Tilt card, magnetic, split text, marquee, aurora, cursor, smooth scroll...
  products/            Card, gallery, bộ lọc, phân trang, markdown
  admin/               Form sản phẩm, upload ảnh kéo thả, bảng, danh mục
  ui/                  Component shadcn/ui
lib/
  supabase/            client.ts (trình duyệt), server.ts (server), middleware.ts (làm mới session), admin.ts (service role, chỉ server)
  validations/         Schema zod
  data/                Truy vấn dữ liệu công khai + dữ liệu demo
types/                 Type TypeScript của database
supabase/
  migrations/001_init.sql   Bảng, RLS, hàm is_admin(), bucket Storage
  seed.sql                  12 sản phẩm mẫu
proxy.ts               (Next 16 đổi tên middleware → proxy) chặn /admin/*
```

## Chạy thử ngay (không cần Supabase)

Khi chưa khai báo biến môi trường Supabase, trang khách tự chạy bằng **dữ liệu demo** (12 sản phẩm mẫu, ảnh placeholder). Trang admin sẽ báo "Chưa cấu hình Supabase".

```bash
npm install
npm run dev
```

Mở http://localhost:3000

---

## Hướng dẫn cài đặt đầy đủ

### Bước 1 — Tạo project Supabase

1. Vào https://supabase.com → **New project**. Đặt tên, mật khẩu database, chọn region gần Việt Nam (vd: Singapore).
2. Đợi project khởi tạo xong (~2 phút).
3. Vào **Project Settings → API** (hoặc **API Keys**), ghi lại:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (**bí mật**, không chia sẻ, không đưa lên GitHub)

### Bước 2 — Chạy migration, seed và tạo bucket

1. Trong Supabase Dashboard, mở **SQL Editor → New query**.
2. Copy toàn bộ nội dung `supabase/migrations/001_init.sql`, dán vào, bấm **Run**.
   File này tạo các bảng `categories`, `products`, `admins`, hàm `is_admin()`, chính sách RLS, và **tự tạo bucket `product-images`** (đọc công khai, chỉ admin ghi/xoá).
3. Tạo query mới, dán nội dung `supabase/seed.sql`, bấm **Run** để thêm 12 sản phẩm mẫu.
4. Kiểm tra: **Storage** có bucket `product-images` (Public). Nếu chưa thấy, tạo thủ công: **New bucket** → tên `product-images` → bật **Public bucket** (các policy đã có sẵn từ migration).

> Ảnh của sản phẩm mẫu là file SVG trong `public/placeholders` — khi bạn upload ảnh thật qua trang admin, ảnh sẽ lưu trên Supabase Storage.

### Bước 3 — Khai báo biến môi trường local

```bash
cp .env.example .env.local
```

Điền vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONTACT_ZALO=https://zalo.me/0901234567
NEXT_PUBLIC_CONTACT_MESSENGER=https://m.me/tenfanpage
```

Chạy lại `npm run dev`.

### Bước 4 — Tạo tài khoản admin đầu tiên

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**.
   Nhập email + mật khẩu, tick **Auto Confirm User**, bấm **Create user**.
2. Copy **User UID** của user vừa tạo.
3. Mở **SQL Editor**, chạy:

   ```sql
   insert into public.admins (user_id) values ('DÁN-USER-UID-VÀO-ĐÂY');
   ```

   Hoặc theo email:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-cua-ban@example.com';
   ```

4. Vào http://localhost:3000/admin/login và đăng nhập.

> Nên tắt đăng ký công khai: **Authentication → Sign In / Providers → Email** → tắt **Allow new users to sign up**. (Dù có đăng ký được, user mới cũng không có quyền admin vì không nằm trong bảng `admins`.)

### Bước 5 — Đẩy code lên GitHub

```bash
git add .
git commit -m "BrickVerse catalog"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/<tên-repo>.git
git push -u origin main
```

File `.env.local` đã được `.gitignore` bỏ qua — **không** commit key.

### Bước 6 — Deploy lên Vercel

1. Vào https://vercel.com → **Add New → Project** → chọn repo GitHub vừa đẩy → **Import**.
2. Framework Preset: **Next.js** (tự nhận). Giữ nguyên build command.
3. Mở **Environment Variables**, thêm đủ 6 biến như `.env.local`, trong đó:
   - `NEXT_PUBLIC_SITE_URL` = domain Vercel của bạn, vd `https://brickverse.vercel.app`
4. Bấm **Deploy**. Mỗi lần push lên `main`, Vercel sẽ tự deploy lại.

> Sau khi đổi biến môi trường trên Vercel, cần **Redeploy** để có hiệu lực (biến `NEXT_PUBLIC_*` được nhúng lúc build).

### Bước 7 — Cấu hình URL trong Supabase Auth

Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://brickverse.vercel.app` (domain Vercel/domain riêng của bạn)
- **Redirect URLs**: thêm
  - `https://brickverse.vercel.app/**`
  - `http://localhost:3000/**` (để vẫn đăng nhập được khi chạy local)

Nếu gắn domain riêng (vd `brickverse.vn`), thêm domain đó vào cả Vercel (**Settings → Domains**) và mục Redirect URLs ở trên, rồi cập nhật `NEXT_PUBLIC_SITE_URL`.

---

## Sử dụng trang admin

| Trang | Chức năng |
| --- | --- |
| `/admin` | Tổng sản phẩm, số đang sale, hết hàng, đang ẩn; sản phẩm mới cập nhật |
| `/admin/products` | Tìm kiếm, lọc trạng thái/theme, sắp xếp, phân trang; bật/tắt **Hiển thị** và **Nổi bật** ngay trên bảng; xoá có hộp xác nhận |
| `/admin/products/new` | Tạo sản phẩm: slug tự sinh từ tên (bỏ dấu tiếng Việt), kéo thả nhiều ảnh, kéo để sắp xếp, ★ chọn ảnh đại diện, xem trước markdown |
| `/admin/categories` | Thêm, sửa, xoá danh mục |

- Xoá ảnh vừa upload (chưa lưu) → file trên Storage bị xoá ngay. Xoá ảnh đã lưu → file bị xoá khi bấm **Lưu**. Xoá sản phẩm → xoá toàn bộ ảnh của sản phẩm.
- Mọi thao tác ghi dùng Server Actions, validate bằng zod và gọi `revalidatePath` nên trang khách cập nhật ngay.

## Bảo mật

- **RLS** bật cho mọi bảng: khách chỉ đọc được sản phẩm `is_published = true` và danh mục; chỉ user trong bảng `admins` (kiểm tra qua `is_admin()`) mới được thêm/sửa/xoá.
- Khu vực `/admin/*` được kiểm tra **3 lớp**: `proxy.ts` (chuyển về login), layout admin (`requireAdmin()` phía server), và mỗi Server Action (`assertAdmin()`).
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng trong `lib/supabase/admin.ts` có `import "server-only"` — build sẽ báo lỗi nếu file này bị import vào client.

## Hiệu năng & SEO

- Trang chủ và trang chi tiết là trang tĩnh **ISR** (`revalidate = 3600`), được làm mới ngay khi admin sửa dữ liệu.
- Ảnh qua `next/image` (AVIF/WebP), `remotePatterns` cho domain Supabase.
- Scene 3D tải bằng `dynamic(..., { ssr: false })`, chỉ khởi tạo sau khi trang tải xong / người dùng tương tác, có fallback; tự dừng render khi cuộn khỏi màn hình; trên mobile giảm dpr, số vật thể và chất lượng vật liệu.
- Metadata + Open Graph cho từng sản phẩm, JSON-LD `Product`, `sitemap.xml`, `robots.txt`, manifest.
- Tôn trọng `prefers-reduced-motion`: tắt smooth scroll, con trỏ tuỳ biến, nghiêng 3D, chuyển động scene và animation CSS.

## Lệnh hữu ích

| Lệnh | Ý nghĩa |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` / `npm start` | Build và chạy bản production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run gen:seed` | Sinh lại ảnh placeholder + `supabase/seed.sql` từ `lib/data/demo-data.ts` |
| `npx supabase gen types typescript --project-id <ID> --schema public > types/database.ts` | Sinh lại type database sau khi đổi schema |
