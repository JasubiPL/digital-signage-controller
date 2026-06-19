-- Make brand/incident/role catalogs configurable and support first-run bootstrap.
--
-- * claim_super_admin(): lets the very first registered user become super_admin
--   when no super admin exists yet (empty database / first run).
-- * incident_categories, incident_priorities and company_roles become editable
--   catalog tables instead of hard-coded CHECK constraints.

begin;

-- 1. First-run bootstrap: promote the caller to super_admin only if there is
--    no super admin yet. Safe to expose to authenticated users because it is a
--    no-op once an admin exists.
create or replace function public.claim_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  promoted boolean := false;
begin
  if public.has_any_super_admin() then
    return false;
  end if;

  update public.profiles
  set global_role = 'super_admin'
  where id = auth.uid();

  get diagnostics promoted = row_count;
  return promoted > 0;
end;
$$;

grant execute on function public.claim_super_admin() to authenticated;

-- 2. Catalog tables -------------------------------------------------------

create table if not exists public.incident_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incident_categories_slug_key unique (slug),
  constraint incident_categories_slug_format_check check (slug ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint incident_categories_label_check check (length(btrim(label)) > 0)
);

create table if not exists public.incident_priorities (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  label text not null,
  weight int not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incident_priorities_slug_key unique (slug),
  constraint incident_priorities_slug_format_check check (slug ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint incident_priorities_label_check check (length(btrim(label)) > 0)
);

create table if not exists public.company_roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_roles_slug_key unique (slug),
  constraint company_roles_slug_format_check check (slug ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint company_roles_label_check check (length(btrim(label)) > 0)
);

-- 3. Seed the catalogs with the previously hard-coded values --------------

insert into public.incident_categories (slug, label, sort_order, is_system) values
  ('screen_issue', 'Pantalla', 1, true),
  ('player_offline', 'Player offline', 2, true),
  ('content_not_loading', 'Contenido sin cargar', 3, true),
  ('usb_issue', 'USB', 4, true),
  ('streaming_issue', 'Streaming', 5, true),
  ('physical_damage', 'Dano fisico', 6, true),
  ('remodeling_operation', 'Remodelacion', 7, true),
  ('other', 'Otro', 99, true)
on conflict (slug) do nothing;

insert into public.incident_priorities (slug, label, weight, sort_order, is_system) values
  ('low', 'Baja', 1, 1, true),
  ('medium', 'Media', 2, 2, true),
  ('high', 'Alta', 3, 3, true),
  ('critical', 'Critica', 4, 4, true)
on conflict (slug) do nothing;

insert into public.company_roles (slug, label, sort_order, is_system) values
  ('admin', 'Administrador', 1, true),
  ('operator', 'Operador', 2, true),
  ('designer', 'Disenador', 3, true),
  ('viewer', 'Visor', 4, true)
on conflict (slug) do nothing;

-- 4. Drop the rigid CHECK constraints; validation now lives in the catalogs.
alter table public.location_incidents drop constraint if exists location_incidents_category_check;
alter table public.location_incidents drop constraint if exists location_incidents_priority_check;
alter table public.user_companies drop constraint if exists user_companies_role_check;

-- 5. Keep updated_at fresh.
drop trigger if exists incident_categories_set_updated_at on public.incident_categories;
create trigger incident_categories_set_updated_at
  before update on public.incident_categories
  for each row execute function public.set_updated_at();

drop trigger if exists incident_priorities_set_updated_at on public.incident_priorities;
create trigger incident_priorities_set_updated_at
  before update on public.incident_priorities
  for each row execute function public.set_updated_at();

drop trigger if exists company_roles_set_updated_at on public.company_roles;
create trigger company_roles_set_updated_at
  before update on public.company_roles
  for each row execute function public.set_updated_at();

-- 6. Row level security: any authenticated user may read the catalogs, only
--    super admins may modify them.
alter table public.incident_categories enable row level security;
alter table public.incident_priorities enable row level security;
alter table public.company_roles enable row level security;

do $$
declare
  catalog text;
begin
  foreach catalog in array array['incident_categories', 'incident_priorities', 'company_roles']
  loop
    execute format('drop policy if exists "%1$s_select" on public.%1$s', catalog);
    execute format(
      'create policy "%1$s_select" on public.%1$s for select to authenticated using (true)',
      catalog
    );

    execute format('drop policy if exists "%1$s_insert_super_admin" on public.%1$s', catalog);
    execute format(
      'create policy "%1$s_insert_super_admin" on public.%1$s for insert to authenticated with check (public.is_super_admin())',
      catalog
    );

    execute format('drop policy if exists "%1$s_update_super_admin" on public.%1$s', catalog);
    execute format(
      'create policy "%1$s_update_super_admin" on public.%1$s for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin())',
      catalog
    );

    execute format('drop policy if exists "%1$s_delete_super_admin" on public.%1$s', catalog);
    execute format(
      'create policy "%1$s_delete_super_admin" on public.%1$s for delete to authenticated using (public.is_super_admin())',
      catalog
    );
  end loop;
end;
$$;

commit;
