-- Allow location-specific campaign assignments to track loading state.
alter table public.campaign_locations
  drop constraint if exists campaign_locations_status_check;

alter table public.campaign_locations
  add constraint campaign_locations_status_check
  check (status in ('active', 'draft', 'inactive'));
