-- Allow a single incident to be linked to multiple ticket offices (taquillas).
--
-- Design:
--   * location_incidents.location_id stays as the "primary" taquilla. It keeps
--     storage paths and the original single-location behaviour working.
--   * A new junction table (location_incident_locations) is the source of truth
--     for every taquilla affected by an incident, including the primary one.
--   * Notes and attachments now reference the incident by (incident_id, company_id)
--     instead of (incident_id, company_id, location_id) so the primary taquilla can
--     change without breaking existing rows.

-- 1. Unique key used as the FK target for notes/attachments going forward.
alter table public.location_incidents
  add constraint location_incidents_id_company_key unique (id, company_id);

-- 2. Junction table: every taquilla linked to an incident.
create table if not exists public.location_incident_locations (
  incident_id uuid not null,
  company_id uuid not null,
  location_id uuid not null,
  created_at timestamptz not null default now(),
  constraint location_incident_locations_pkey primary key (incident_id, location_id),
  constraint location_incident_locations_incident_fkey foreign key (incident_id, company_id)
    references public.location_incidents(id, company_id) on delete cascade,
  constraint location_incident_locations_location_company_fkey foreign key (location_id, company_id)
    references public.locations(id, company_id) on delete cascade
);

create index if not exists location_incident_locations_incident_id_idx
  on public.location_incident_locations (incident_id);
create index if not exists location_incident_locations_location_id_idx
  on public.location_incident_locations (location_id);
create index if not exists location_incident_locations_company_id_idx
  on public.location_incident_locations (company_id);

-- 3. Backfill the junction table from the existing primary taquilla.
insert into public.location_incident_locations (incident_id, company_id, location_id)
select id, company_id, location_id
from public.location_incidents
on conflict (incident_id, location_id) do nothing;

-- 4. Re-point notes/attachments FKs to (incident_id, company_id) so the primary
--    taquilla can change freely. The location_id columns are kept for storage path
--    bookkeeping but are no longer required.
alter table public.location_incident_notes
  drop constraint if exists location_incident_notes_incident_fkey;
alter table public.location_incident_notes
  alter column location_id drop not null;
alter table public.location_incident_notes
  add constraint location_incident_notes_incident_fkey foreign key (incident_id, company_id)
    references public.location_incidents(id, company_id) on delete cascade;

alter table public.location_incident_attachments
  drop constraint if exists location_incident_attachments_incident_fkey;
alter table public.location_incident_attachments
  alter column location_id drop not null;
alter table public.location_incident_attachments
  add constraint location_incident_attachments_incident_fkey foreign key (incident_id, company_id)
    references public.location_incidents(id, company_id) on delete cascade;

-- 5. Row level security mirroring location_incidents.
alter table public.location_incident_locations enable row level security;

drop policy if exists "location_incident_locations_select_manager" on public.location_incident_locations;
create policy "location_incident_locations_select_manager"
on public.location_incident_locations
for select
to authenticated
using (public.can_access_incidents(company_id));

drop policy if exists "location_incident_locations_insert_super_admin" on public.location_incident_locations;
create policy "location_incident_locations_insert_super_admin"
on public.location_incident_locations
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "location_incident_locations_update_super_admin" on public.location_incident_locations;
create policy "location_incident_locations_update_super_admin"
on public.location_incident_locations
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "location_incident_locations_delete_super_admin" on public.location_incident_locations;
create policy "location_incident_locations_delete_super_admin"
on public.location_incident_locations
for delete
to authenticated
using (public.is_super_admin());
