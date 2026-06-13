-- Digital Signage Controller initial PostgreSQL schema.
-- Apply this migration in Supabase before enabling application flows.

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  legacy_code text,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_slug_key unique (slug),
  constraint companies_legacy_code_key unique (legacy_code),
  constraint companies_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint companies_status_check check (status in ('active', 'inactive', 'archived'))
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email citext not null,
  avatar_url text,
  global_role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_key unique (email),
  constraint profiles_global_role_check check (global_role in ('user', 'super_admin'))
);

create table public.user_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint user_companies_user_company_key unique (user_id, company_id),
  constraint user_companies_role_check check (role in ('admin', 'operator', 'designer', 'viewer'))
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  device text,
  projection text,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_id_company_key unique (id, company_id),
  constraint locations_company_name_key unique (company_id, name),
  constraint locations_status_check check (status in ('active', 'inactive', 'maintenance', 'archived'))
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  status text not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_id_company_key unique (id, company_id),
  constraint campaigns_dates_check check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint campaigns_status_check check (status in ('draft', 'active', 'inactive', 'archived'))
);

create table public.screens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid,
  name text not null,
  device_identifier text,
  status text not null default 'active',
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint screens_id_company_key unique (id, company_id),
  constraint screens_location_company_fkey foreign key (location_id, company_id)
    references public.locations(id, company_id) on delete restrict,
  constraint screens_status_check check (status in ('active', 'inactive', 'maintenance', 'archived'))
);

create table public.campaign_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  campaign_id uuid not null,
  location_id uuid not null,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_locations_campaign_company_fkey foreign key (campaign_id, company_id)
    references public.campaigns(id, company_id) on delete cascade,
  constraint campaign_locations_location_company_fkey foreign key (location_id, company_id)
    references public.locations(id, company_id) on delete cascade,
  constraint campaign_locations_campaign_location_key unique (campaign_id, location_id),
  constraint campaign_locations_status_check check (status in ('active', 'inactive'))
);

create table public.campaign_screens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  campaign_id uuid not null,
  screen_id uuid not null,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_screens_campaign_company_fkey foreign key (campaign_id, company_id)
    references public.campaigns(id, company_id) on delete cascade,
  constraint campaign_screens_screen_company_fkey foreign key (screen_id, company_id)
    references public.screens(id, company_id) on delete cascade,
  constraint campaign_screens_campaign_screen_key unique (campaign_id, screen_id),
  constraint campaign_screens_status_check check (status in ('active', 'inactive'))
);

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  bucket text not null default 'company-files',
  storage_path text not null,
  category text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_files_storage_path_key unique (storage_path),
  constraint media_files_size_check check (size_bytes is null or size_bytes >= 0),
  constraint media_files_category_check check (category in ('blueprint', 'template', 'price', 'campaign_media', 'software')),
  constraint media_files_status_check check (status in ('active', 'archived', 'deleted'))
);

create unique index campaigns_company_lower_name_key
  on public.campaigns (company_id, lower(name));

create unique index screens_company_device_identifier_key
  on public.screens (company_id, device_identifier)
  where device_identifier is not null;

create index companies_status_idx on public.companies (status);
create index profiles_global_role_idx on public.profiles (global_role);
create index user_companies_company_id_idx on public.user_companies (company_id);
create index user_companies_user_id_idx on public.user_companies (user_id);
create index locations_company_id_idx on public.locations (company_id);
create index locations_created_at_idx on public.locations (created_at);
create index campaigns_company_id_idx on public.campaigns (company_id);
create index campaigns_created_at_idx on public.campaigns (created_at);
create index campaigns_status_idx on public.campaigns (status);
create index campaign_locations_company_id_idx on public.campaign_locations (company_id);
create index campaign_locations_campaign_id_idx on public.campaign_locations (campaign_id);
create index campaign_locations_location_id_idx on public.campaign_locations (location_id);
create index campaign_screens_company_id_idx on public.campaign_screens (company_id);
create index campaign_screens_campaign_id_idx on public.campaign_screens (campaign_id);
create index campaign_screens_screen_id_idx on public.campaign_screens (screen_id);
create index media_files_company_id_idx on public.media_files (company_id);
create index media_files_category_idx on public.media_files (category);
create index media_files_created_at_idx on public.media_files (created_at);
create index screens_company_id_idx on public.screens (company_id);
create index screens_location_id_idx on public.screens (location_id);
create index screens_created_at_idx on public.screens (created_at);

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create trigger screens_set_updated_at
  before update on public.screens
  for each row execute function public.set_updated_at();

create trigger campaign_locations_set_updated_at
  before update on public.campaign_locations
  for each row execute function public.set_updated_at();

create trigger campaign_screens_set_updated_at
  before update on public.campaign_screens
  for each row execute function public.set_updated_at();

create trigger media_files_set_updated_at
  before update on public.media_files
  for each row execute function public.set_updated_at();
