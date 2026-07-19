-- MathToolsHub private downloadable content
-- Run in Supabase Dashboard > SQL Editor before changing public asset links.

alter table public.profiles
add column if not exists content_access_until timestamptz not null default '2026-08-01T00:00:00+08:00';

update public.profiles
set content_access_until = greatest(content_access_until, '2026-08-01T00:00:00+08:00'::timestamptz);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('protected-content', 'protected-content', false, 26214400, array['application/pdf'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Authenticated users read protected content" on storage.objects;
create policy "Authenticated users read protected content" on storage.objects
for select to authenticated using (
  bucket_id = 'protected-content' and exists (
    select 1 from public.profiles
    where id=(select auth.uid())
      and (role='admin' or content_access_until > now())
  )
);

drop policy if exists "Admins insert protected content" on storage.objects;
create policy "Admins insert protected content" on storage.objects
for insert to authenticated with check (
  bucket_id = 'protected-content' and exists (
    select 1 from public.profiles where id=(select auth.uid()) and role='admin'
  )
);

drop policy if exists "Admins update protected content" on storage.objects;
create policy "Admins update protected content" on storage.objects
for update to authenticated using (
  bucket_id = 'protected-content' and exists (
    select 1 from public.profiles where id=(select auth.uid()) and role='admin'
  )
) with check (
  bucket_id = 'protected-content' and exists (
    select 1 from public.profiles where id=(select auth.uid()) and role='admin'
  )
);

drop policy if exists "Admins delete protected content" on storage.objects;
create policy "Admins delete protected content" on storage.objects
for delete to authenticated using (
  bucket_id = 'protected-content' and exists (
    select 1 from public.profiles where id=(select auth.uid()) and role='admin'
  )
);