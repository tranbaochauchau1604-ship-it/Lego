-- =====================================================================
-- BrickVerse — khởi tạo database
-- Chạy file này trong Supabase Dashboard → SQL Editor (hoặc `supabase db push`)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Bảng categories
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Bảng products
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,
  set_number         text,
  category_id        uuid references public.categories(id) on delete set null,
  theme              text,
  price              numeric(12, 0) not null default 0 check (price >= 0),
  sale_price         numeric(12, 0) check (sale_price is null or sale_price >= 0),
  stock              integer not null default 0 check (stock >= 0),
  pieces             integer check (pieces is null or pieces >= 0),
  age_range          text,
  release_year       integer check (release_year is null or release_year between 1949 and 2100),
  short_description  text,
  description        text,
  images             text[] not null default '{}',
  thumbnail          text,
  is_featured        boolean not null default false,
  is_published       boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Cột sinh tự động: giá thực bán và trạng thái sale (dùng để lọc/sắp xếp)
  effective_price    numeric(12, 0) generated always as (
                       case when sale_price is not null and sale_price > 0 and sale_price < price
                            then sale_price else price end
                     ) stored,
  is_on_sale         boolean generated always as (
                       sale_price is not null and sale_price > 0 and sale_price < price
                     ) stored
);

create index if not exists products_category_idx   on public.products (category_id);
create index if not exists products_theme_idx      on public.products (theme);
create index if not exists products_published_idx  on public.products (is_published, created_at desc);
create index if not exists products_featured_idx   on public.products (is_featured) where is_featured;
create index if not exists products_set_number_idx on public.products (set_number);
create index if not exists products_price_idx      on public.products (effective_price);

-- Trigger tự cập nhật updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Bảng admins: danh sách user được quyền quản trị
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Hàm kiểm tra quyền admin (security definer để đọc bảng admins bỏ qua RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.admins     enable row level security;

-- categories: ai cũng đọc được; chỉ admin ghi
drop policy if exists "categories_select_all"   on public.categories;
drop policy if exists "categories_admin_insert" on public.categories;
drop policy if exists "categories_admin_update" on public.categories;
drop policy if exists "categories_admin_delete" on public.categories;

create policy "categories_select_all" on public.categories
  for select using (true);
create policy "categories_admin_insert" on public.categories
  for insert to authenticated with check (public.is_admin());
create policy "categories_admin_update" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories_admin_delete" on public.categories
  for delete to authenticated using (public.is_admin());

-- products: khách chỉ đọc sản phẩm đã publish; admin đọc tất cả và ghi
drop policy if exists "products_select_published" on public.products;
drop policy if exists "products_admin_select"     on public.products;
drop policy if exists "products_admin_insert"     on public.products;
drop policy if exists "products_admin_update"     on public.products;
drop policy if exists "products_admin_delete"     on public.products;

create policy "products_select_published" on public.products
  for select using (is_published = true);
create policy "products_admin_select" on public.products
  for select to authenticated using (public.is_admin());
create policy "products_admin_insert" on public.products
  for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete to authenticated using (public.is_admin());

-- admins: user chỉ thấy dòng của chính mình; không ai ghi qua API (thêm bằng SQL Editor)
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Storage: bucket product-images (đọc công khai, admin ghi/xoá)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read"  on storage.objects;
drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_update" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
