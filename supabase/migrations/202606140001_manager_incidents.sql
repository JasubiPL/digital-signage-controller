-- Add manager role and incident tracking for ticket offices.

alter table public.profiles
  drop constraint if exists profiles_global_role_check;

alter table public.profiles
  add constraint profiles_global_role_check
  check (global_role in ('user', 'manager', 'super_admin'));

create or replace function public.can_read_company(_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      public.current_global_role() in ('user', 'manager')
      and exists (
        select 1
        from public.companies c
        where c.id = _company_id
          and c.status = 'active'
      )
    )
$$;

create or replace function public.can_access_incidents(_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      public.current_global_role() = 'manager'
      and exists (
        select 1
        from public.companies c
        where c.id = _company_id
          and c.status = 'active'
      )
    )
$$;

create or replace function public.can_comment_incidents(_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin() or public.can_access_incidents(_company_id)
$$;

grant execute on function public.can_read_company(uuid) to authenticated;
grant execute on function public.can_access_incidents(uuid) to authenticated;
grant execute on function public.can_comment_incidents(uuid) to authenticated;

drop policy if exists "companies_select_by_access" on public.companies;
create policy "companies_select_by_access"
on public.companies
for select
to authenticated
using (
  public.is_super_admin()
  or (public.current_global_role() in ('user', 'manager') and status = 'active')
  or not public.has_any_super_admin()
);

create table if not exists public.location_incidents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid not null,
  title text not null,
  description text not null,
  category text not null default 'other',
  priority text not null default 'medium',
  status text not null default 'open',
  assignee_name text,
  reported_by uuid references public.profiles(id) on delete set null,
  resolved_by uuid references public.profiles(id) on delete set null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint location_incidents_id_company_location_key unique (id, company_id, location_id),
  constraint location_incidents_location_company_fkey foreign key (location_id, company_id)
    references public.locations(id, company_id) on delete cascade,
  constraint location_incidents_title_check check (length(btrim(title)) > 0),
  constraint location_incidents_description_check check (length(btrim(description)) > 0),
  constraint location_incidents_category_check check (
    category in (
      'screen_issue',
      'player_offline',
      'content_not_loading',
      'usb_issue',
      'streaming_issue',
      'physical_damage',
      'remodeling_operation',
      'other'
    )
  ),
  constraint location_incidents_priority_check check (priority in ('low', 'medium', 'high', 'critical')),
  constraint location_incidents_status_check check (status in ('open', 'in_progress', 'waiting', 'resolved', 'canceled')),
  constraint location_incidents_resolution_check check (
    (status in ('resolved', 'canceled') and resolved_at is not null)
    or (status in ('open', 'in_progress', 'waiting') and resolved_at is null)
  )
);

create table if not exists public.location_incident_notes (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null,
  company_id uuid not null,
  location_id uuid not null,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  event_type text not null default 'note',
  created_at timestamptz not null default now(),
  constraint location_incident_notes_incident_fkey foreign key (incident_id, company_id, location_id)
    references public.location_incidents(id, company_id, location_id) on delete cascade,
  constraint location_incident_notes_body_check check (length(btrim(body)) > 0),
  constraint location_incident_notes_event_type_check check (
    event_type in ('note', 'status_change', 'priority_change', 'assignment_change', 'resolution')
  )
);

create table if not exists public.location_incident_attachments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null,
  note_id uuid references public.location_incident_notes(id) on delete set null,
  company_id uuid not null,
  location_id uuid not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  bucket text not null default 'incident-images',
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  caption text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint location_incident_attachments_storage_path_key unique (storage_path),
  constraint location_incident_attachments_incident_fkey foreign key (incident_id, company_id, location_id)
    references public.location_incidents(id, company_id, location_id) on delete cascade,
  constraint location_incident_attachments_size_check check (size_bytes > 0 and size_bytes <= 10485760),
  constraint location_incident_attachments_mime_type_check check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  ),
  constraint location_incident_attachments_status_check check (status in ('active', 'deleted'))
);

create index if not exists location_incidents_company_id_idx on public.location_incidents (company_id);
create index if not exists location_incidents_location_id_idx on public.location_incidents (location_id);
create index if not exists location_incidents_status_idx on public.location_incidents (status);
create index if not exists location_incidents_priority_idx on public.location_incidents (priority);
create index if not exists location_incidents_created_at_idx on public.location_incidents (created_at);
create index if not exists location_incident_notes_incident_id_idx on public.location_incident_notes (incident_id);
create index if not exists location_incident_notes_company_id_idx on public.location_incident_notes (company_id);
create index if not exists location_incident_attachments_incident_id_idx on public.location_incident_attachments (incident_id);
create index if not exists location_incident_attachments_note_id_idx on public.location_incident_attachments (note_id);
create index if not exists location_incident_attachments_company_id_idx on public.location_incident_attachments (company_id);

drop trigger if exists location_incidents_set_updated_at on public.location_incidents;
create trigger location_incidents_set_updated_at
  before update on public.location_incidents
  for each row execute function public.set_updated_at();

alter table public.location_incidents enable row level security;
alter table public.location_incident_notes enable row level security;
alter table public.location_incident_attachments enable row level security;

drop policy if exists "location_incidents_select_manager" on public.location_incidents;
create policy "location_incidents_select_manager"
on public.location_incidents
for select
to authenticated
using (public.can_access_incidents(company_id));

drop policy if exists "location_incidents_insert_super_admin" on public.location_incidents;
create policy "location_incidents_insert_super_admin"
on public.location_incidents
for insert
to authenticated
with check (
  public.is_super_admin()
  and (reported_by is null or reported_by = auth.uid())
);

drop policy if exists "location_incidents_update_super_admin" on public.location_incidents;
create policy "location_incidents_update_super_admin"
on public.location_incidents
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "location_incidents_delete_super_admin" on public.location_incidents;
create policy "location_incidents_delete_super_admin"
on public.location_incidents
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "location_incident_notes_select_manager" on public.location_incident_notes;
create policy "location_incident_notes_select_manager"
on public.location_incident_notes
for select
to authenticated
using (public.can_access_incidents(company_id));

drop policy if exists "location_incident_notes_insert_manager" on public.location_incident_notes;
create policy "location_incident_notes_insert_manager"
on public.location_incident_notes
for insert
to authenticated
with check (
  public.can_comment_incidents(company_id)
  and (author_id is null or author_id = auth.uid())
);

drop policy if exists "location_incident_notes_update_super_admin" on public.location_incident_notes;
create policy "location_incident_notes_update_super_admin"
on public.location_incident_notes
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "location_incident_notes_delete_super_admin" on public.location_incident_notes;
create policy "location_incident_notes_delete_super_admin"
on public.location_incident_notes
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "location_incident_attachments_select_manager" on public.location_incident_attachments;
create policy "location_incident_attachments_select_manager"
on public.location_incident_attachments
for select
to authenticated
using (public.can_access_incidents(company_id));

drop policy if exists "location_incident_attachments_insert_manager" on public.location_incident_attachments;
create policy "location_incident_attachments_insert_manager"
on public.location_incident_attachments
for insert
to authenticated
with check (
  public.can_comment_incidents(company_id)
  and (uploaded_by is null or uploaded_by = auth.uid())
  and (public.is_super_admin() or note_id is not null)
);

drop policy if exists "location_incident_attachments_update_super_admin" on public.location_incident_attachments;
create policy "location_incident_attachments_update_super_admin"
on public.location_incident_attachments
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "location_incident_attachments_delete_super_admin" on public.location_incident_attachments;
create policy "location_incident_attachments_delete_super_admin"
on public.location_incident_attachments
for delete
to authenticated
using (public.is_super_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'incident-images',
  'incident-images',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "incident_images_select_manager" on storage.objects;
create policy "incident_images_select_manager"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'incident-images'
  and public.can_access_incidents(public.storage_company_id(name))
);

drop policy if exists "incident_images_insert_manager" on storage.objects;
create policy "incident_images_insert_manager"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'incident-images'
  and public.can_comment_incidents(public.storage_company_id(name))
);

drop policy if exists "incident_images_update_super_admin" on storage.objects;
create policy "incident_images_update_super_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'incident-images'
  and public.is_super_admin()
)
with check (
  bucket_id = 'incident-images'
  and public.is_super_admin()
);

drop policy if exists "incident_images_delete_super_admin" on storage.objects;
create policy "incident_images_delete_super_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'incident-images'
  and public.is_super_admin()
);
