-- Supabase Storage setup for campaign media files.
-- Objects must be managed through the Storage API; SQL is used only for bucket
-- configuration and RLS policies.

alter table public.media_files
  add column if not exists campaign_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'media_files_campaign_company_fkey'
  ) then
    alter table public.media_files
      add constraint media_files_campaign_company_fkey
      foreign key (campaign_id, company_id)
      references public.campaigns(id, company_id)
      on delete restrict;
  end if;
end;
$$;

create index if not exists media_files_campaign_id_idx
  on public.media_files (campaign_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'campaign-media',
  'campaign-media',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.storage_company_id(_object_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  _company_id uuid;
begin
  _company_id := (storage.foldername(_object_name))[1]::uuid;
  return _company_id;
exception
  when others then
    return null;
end;
$$;

grant execute on function public.storage_company_id(text) to authenticated;

drop policy if exists "campaign_media_select_by_company_access" on storage.objects;
create policy "campaign_media_select_by_company_access"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'campaign-media'
  and public.has_company_role(
    public.storage_company_id(name),
    array['admin', 'operator', 'designer', 'viewer']
  )
);

drop policy if exists "campaign_media_insert_company_admin" on storage.objects;
create policy "campaign_media_insert_company_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'campaign-media'
  and public.has_company_role(public.storage_company_id(name), array['admin'])
);

drop policy if exists "campaign_media_update_company_admin" on storage.objects;
create policy "campaign_media_update_company_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'campaign-media'
  and public.has_company_role(public.storage_company_id(name), array['admin'])
)
with check (
  bucket_id = 'campaign-media'
  and public.has_company_role(public.storage_company_id(name), array['admin'])
);

drop policy if exists "campaign_media_delete_company_admin" on storage.objects;
create policy "campaign_media_delete_company_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'campaign-media'
  and public.has_company_role(public.storage_company_id(name), array['admin'])
);
