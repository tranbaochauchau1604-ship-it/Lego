-- Cài đặt website chỉnh được trong trang admin (liên hệ Zalo / Instagram / Messenger).
-- Ai cũng đọc được (các giá trị này hiển thị công khai trên website); chỉ admin được ghi.

create table if not exists public.site_settings (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_all"   on public.site_settings;
drop policy if exists "site_settings_admin_insert" on public.site_settings;
drop policy if exists "site_settings_admin_update" on public.site_settings;
drop policy if exists "site_settings_admin_delete" on public.site_settings;

create policy "site_settings_select_all" on public.site_settings
  for select using (true);
create policy "site_settings_admin_insert" on public.site_settings
  for insert to authenticated with check (public.is_admin());
create policy "site_settings_admin_update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_settings_admin_delete" on public.site_settings
  for delete to authenticated using (public.is_admin());

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();
