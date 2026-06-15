-- Allow ticket offices to be marked as pending migration.

alter table public.locations
  drop constraint if exists locations_status_check;

alter table public.locations
  add constraint locations_status_check
  check (status in ('ok', 'remodeling', 'incident', 'pending_migration', 'archived'));
