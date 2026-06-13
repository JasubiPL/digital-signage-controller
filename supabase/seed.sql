-- Development seed data for the normalized schema.
-- This seed is idempotent and does not create Supabase Auth users because
-- public.profiles depends on auth.users.

insert into public.companies (slug, legacy_code, name, status)
values
  ('etn', 'ETN', 'ETN Turistar', 'active'),
  ('gho', 'GHO', 'Grupo Herradura Occidente', 'active'),
  ('costaline', 'COSTA', 'Costaline', 'active'),
  ('iamsa', 'IAMSA', 'Grupo IAMSA', 'active')
on conflict (slug) do update
set
  legacy_code = excluded.legacy_code,
  name = excluded.name,
  status = excluded.status;

with location_seed (company_slug, name, device, projection, status) as (
  values
    ('etn', 'Mexico Norte TQ1', 'PANTALLAS', 'PLAYER', 'active'),
    ('etn', 'Queretaro TQ2', 'PANEL LED', 'PLAYER', 'active'),
    ('etn', 'Morelia TQ1', 'LED Y PANTALLAS', 'USB', 'maintenance'),
    ('gho', 'Guadalajara Central TQ1', 'PANTALLAS', 'PLAYER', 'active'),
    ('gho', 'Zapopan TQ2', 'PANTALLAS', 'USB', 'active'),
    ('gho', 'Tepic TQ1', 'PANEL LED', 'PLAYER', 'inactive'),
    ('costaline', 'Acapulco TQ1', 'PANTALLAS', 'PLAYER', 'active'),
    ('costaline', 'Taxquena TQ3', 'LED Y PANTALLAS', 'PLAYER', 'active'),
    ('costaline', 'Cuernavaca TQ1', 'PANTALLAS', 'USB', 'maintenance')
)
insert into public.locations (company_id, name, device, projection, status)
select
  c.id,
  s.name,
  s.device,
  s.projection,
  s.status
from location_seed s
join public.companies c on c.slug = s.company_slug
on conflict (company_id, name) do update
set
  device = excluded.device,
  projection = excluded.projection,
  status = excluded.status;

with campaign_seed (company_slug, name, starts_on, ends_on, status) as (
  values
    ('etn', 'Verano ETN 2026', date '2026-06-01', date '2026-08-31', 'active'),
    ('etn', 'Siempre On ETN', null::date, null::date, 'active'),
    ('etn', 'Preview Invierno ETN', date '2026-11-01', date '2027-01-15', 'draft'),
    ('gho', 'Rutas GHO Occidente', date '2026-06-01', date '2026-09-30', 'active'),
    ('gho', 'Promocion GHO Digital', null::date, null::date, 'active'),
    ('gho', 'Mantenimiento Artes GHO', date '2026-07-01', date '2026-07-31', 'inactive'),
    ('costaline', 'Costa Verano 2026', date '2026-06-01', date '2026-08-31', 'active'),
    ('costaline', 'Siempre On Costaline', null::date, null::date, 'active'),
    ('costaline', 'Back to School Costaline', date '2026-08-01', date '2026-09-15', 'draft')
)
insert into public.campaigns (company_id, name, starts_on, ends_on, status)
select
  c.id,
  s.name,
  s.starts_on,
  s.ends_on,
  s.status
from campaign_seed s
join public.companies c on c.slug = s.company_slug
on conflict (company_id, lower(name)) do update
set
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status;

with screen_seed (company_slug, location_name, name, device_identifier, status, metadata) as (
  values
    ('etn', 'Mexico Norte TQ1', 'ETN Norte Player 01', 'ETN-MEXN-PLAYER-01', 'active', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb),
    ('etn', 'Queretaro TQ2', 'ETN Queretaro LED 01', 'ETN-QRO-LED-01', 'active', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb),
    ('etn', 'Morelia TQ1', 'ETN Morelia USB 01', 'ETN-MOR-USB-01', 'maintenance', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb),
    ('gho', 'Guadalajara Central TQ1', 'GHO Guadalajara Player 01', 'GHO-GDL-PLAYER-01', 'active', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb),
    ('gho', 'Zapopan TQ2', 'GHO Zapopan USB 01', 'GHO-ZAP-USB-01', 'active', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb),
    ('costaline', 'Acapulco TQ1', 'Costaline Acapulco Player 01', 'COSTA-ACA-PLAYER-01', 'active', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb),
    ('costaline', 'Taxquena TQ3', 'Costaline Taxquena LED 01', 'COSTA-TAX-LED-01', 'active', '{"orientation":"horizontal","resolution":"1920x1080"}'::jsonb)
)
insert into public.screens (company_id, location_id, name, device_identifier, status, metadata)
select
  c.id,
  l.id,
  s.name,
  s.device_identifier,
  s.status,
  s.metadata
from screen_seed s
join public.companies c on c.slug = s.company_slug
join public.locations l on l.company_id = c.id and l.name = s.location_name
on conflict (company_id, device_identifier) where device_identifier is not null do update
set
  location_id = excluded.location_id,
  name = excluded.name,
  status = excluded.status,
  metadata = excluded.metadata;

with campaign_location_seed (company_slug, campaign_name, location_name, status) as (
  values
    ('etn', 'Verano ETN 2026', 'Mexico Norte TQ1', 'active'),
    ('etn', 'Verano ETN 2026', 'Queretaro TQ2', 'active'),
    ('etn', 'Siempre On ETN', 'Morelia TQ1', 'inactive'),
    ('gho', 'Rutas GHO Occidente', 'Guadalajara Central TQ1', 'active'),
    ('gho', 'Promocion GHO Digital', 'Zapopan TQ2', 'active'),
    ('costaline', 'Costa Verano 2026', 'Acapulco TQ1', 'active'),
    ('costaline', 'Costa Verano 2026', 'Taxquena TQ3', 'active'),
    ('costaline', 'Siempre On Costaline', 'Cuernavaca TQ1', 'inactive')
)
insert into public.campaign_locations (company_id, campaign_id, location_id, status)
select
  c.id,
  ca.id,
  l.id,
  s.status
from campaign_location_seed s
join public.companies c on c.slug = s.company_slug
join public.campaigns ca on ca.company_id = c.id and lower(ca.name) = lower(s.campaign_name)
join public.locations l on l.company_id = c.id and l.name = s.location_name
on conflict (campaign_id, location_id) do update
set
  status = excluded.status;

with campaign_screen_seed (company_slug, campaign_name, screen_identifier, status) as (
  values
    ('etn', 'Verano ETN 2026', 'ETN-MEXN-PLAYER-01', 'active'),
    ('etn', 'Preview Invierno ETN', 'ETN-QRO-LED-01', 'inactive'),
    ('gho', 'Rutas GHO Occidente', 'GHO-GDL-PLAYER-01', 'active'),
    ('gho', 'Promocion GHO Digital', 'GHO-ZAP-USB-01', 'active'),
    ('costaline', 'Costa Verano 2026', 'COSTA-ACA-PLAYER-01', 'active'),
    ('costaline', 'Back to School Costaline', 'COSTA-TAX-LED-01', 'inactive')
)
insert into public.campaign_screens (company_id, campaign_id, screen_id, status)
select
  c.id,
  ca.id,
  sc.id,
  s.status
from campaign_screen_seed s
join public.companies c on c.slug = s.company_slug
join public.campaigns ca on ca.company_id = c.id and lower(ca.name) = lower(s.campaign_name)
join public.screens sc on sc.company_id = c.id and sc.device_identifier = s.screen_identifier
on conflict (campaign_id, screen_id) do update
set
  status = excluded.status;
