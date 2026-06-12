-- Development seed data for the normalized schema.
-- This seed does not create users because profiles depend on auth.users.

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

with selected_companies as (
  select id, slug
  from public.companies
  where slug in ('etn', 'gho', 'costaline')
)
insert into public.locations (company_id, name, device, projection, status)
select
  id,
  case slug
    when 'etn' then 'Mexico Norte TQ1'
    when 'gho' then 'Guadalajara Central TQ1'
    when 'costaline' then 'Acapulco TQ1'
  end,
  'pending',
  'horizontal',
  'active'
from selected_companies
on conflict (company_id, name) do update
set
  device = excluded.device,
  projection = excluded.projection,
  status = excluded.status;

with selected_companies as (
  select id, slug
  from public.companies
  where slug in ('etn', 'gho', 'costaline')
)
insert into public.campaigns (company_id, name, status)
select
  id,
  case slug
    when 'etn' then 'Campania de prueba ETN'
    when 'gho' then 'Campania de prueba GHO'
    when 'costaline' then 'Campania de prueba Costaline'
  end,
  'draft'
from selected_companies
on conflict do nothing;
