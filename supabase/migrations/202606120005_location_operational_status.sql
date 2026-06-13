-- Match ticket office status values used by the brand-scoped UI.

alter table public.locations
  drop constraint if exists locations_status_check;

update public.locations
set status = case status
  when 'active' then 'ok'
  when 'maintenance' then 'remodeling'
  when 'inactive' then 'incident'
  else status
end
where status in ('active', 'maintenance', 'inactive');

alter table public.locations
  add constraint locations_status_check
  check (status in ('ok', 'remodeling', 'incident', 'archived'));
