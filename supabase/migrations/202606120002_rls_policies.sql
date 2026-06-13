-- Row Level Security policies for the normalized application schema.
-- These policies keep authorization in Postgres instead of relying on UI state.

create or replace function public.current_global_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.global_role
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_global_role() = 'super_admin', false)
$$;

create or replace function public.has_any_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.global_role = 'super_admin'
  )
$$;

create or replace function public.has_company_role(_company_id uuid, _allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or exists (
      select 1
      from public.user_companies uc
      where uc.user_id = auth.uid()
        and uc.company_id = _company_id
        and uc.role = any(_allowed_roles)
    )
$$;

grant execute on function public.current_global_role() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.has_any_super_admin() to authenticated;
grant execute on function public.has_company_role(uuid, text[]) to authenticated;

create index if not exists user_companies_company_role_idx
  on public.user_companies (company_id, role);

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.user_companies enable row level security;
alter table public.locations enable row level security;
alter table public.campaigns enable row level security;
alter table public.screens enable row level security;
alter table public.campaign_locations enable row level security;
alter table public.campaign_screens enable row level security;
alter table public.media_files enable row level security;

drop policy if exists "companies_select_by_access" on public.companies;
create policy "companies_select_by_access"
on public.companies
for select
to authenticated
using (
  public.is_super_admin()
  or public.has_company_role(id, array['admin', 'operator', 'designer', 'viewer'])
  or not public.has_any_super_admin()
);

drop policy if exists "companies_insert_super_admin" on public.companies;
create policy "companies_insert_super_admin"
on public.companies
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "companies_update_super_admin" on public.companies;
create policy "companies_update_super_admin"
on public.companies
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "companies_delete_super_admin" on public.companies;
create policy "companies_delete_super_admin"
on public.companies
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "profiles_select_self_or_super_admin" on public.profiles;
create policy "profiles_select_self_or_super_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and global_role = 'user');

drop policy if exists "profiles_update_self_or_super_admin" on public.profiles;
create policy "profiles_update_self_or_super_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (
  public.is_super_admin()
  or (
    id = auth.uid()
    and (
      global_role = public.current_global_role()
      or (global_role = 'super_admin' and not public.has_any_super_admin())
    )
  )
);

drop policy if exists "profiles_delete_super_admin" on public.profiles;
create policy "profiles_delete_super_admin"
on public.profiles
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "user_companies_select_by_access" on public.user_companies;
create policy "user_companies_select_by_access"
on public.user_companies
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_super_admin()
  or public.has_company_role(company_id, array['admin'])
);

drop policy if exists "user_companies_insert_company_admin" on public.user_companies;
create policy "user_companies_insert_company_admin"
on public.user_companies
for insert
to authenticated
with check (
  public.is_super_admin()
  or public.has_company_role(company_id, array['admin'])
);

drop policy if exists "user_companies_update_company_admin" on public.user_companies;
create policy "user_companies_update_company_admin"
on public.user_companies
for update
to authenticated
using (
  public.is_super_admin()
  or public.has_company_role(company_id, array['admin'])
)
with check (
  public.is_super_admin()
  or public.has_company_role(company_id, array['admin'])
);

drop policy if exists "user_companies_delete_company_admin" on public.user_companies;
create policy "user_companies_delete_company_admin"
on public.user_companies
for delete
to authenticated
using (
  public.is_super_admin()
  or public.has_company_role(company_id, array['admin'])
);

drop policy if exists "locations_select_by_company_access" on public.locations;
create policy "locations_select_by_company_access"
on public.locations
for select
to authenticated
using (public.has_company_role(company_id, array['admin', 'operator', 'designer', 'viewer']));

drop policy if exists "locations_insert_company_admin" on public.locations;
create policy "locations_insert_company_admin"
on public.locations
for insert
to authenticated
with check (
  public.has_company_role(company_id, array['admin'])
  and (created_by is null or created_by = auth.uid() or public.is_super_admin())
);

drop policy if exists "locations_update_company_admin" on public.locations;
create policy "locations_update_company_admin"
on public.locations
for update
to authenticated
using (public.has_company_role(company_id, array['admin']))
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "locations_delete_company_admin" on public.locations;
create policy "locations_delete_company_admin"
on public.locations
for delete
to authenticated
using (public.has_company_role(company_id, array['admin']));

drop policy if exists "campaigns_select_by_company_access" on public.campaigns;
create policy "campaigns_select_by_company_access"
on public.campaigns
for select
to authenticated
using (public.has_company_role(company_id, array['admin', 'operator', 'designer', 'viewer']));

drop policy if exists "campaigns_insert_company_admin" on public.campaigns;
create policy "campaigns_insert_company_admin"
on public.campaigns
for insert
to authenticated
with check (
  public.has_company_role(company_id, array['admin'])
  and (created_by is null or created_by = auth.uid() or public.is_super_admin())
);

drop policy if exists "campaigns_update_company_admin" on public.campaigns;
create policy "campaigns_update_company_admin"
on public.campaigns
for update
to authenticated
using (public.has_company_role(company_id, array['admin']))
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "campaigns_delete_company_admin" on public.campaigns;
create policy "campaigns_delete_company_admin"
on public.campaigns
for delete
to authenticated
using (public.has_company_role(company_id, array['admin']));

drop policy if exists "screens_select_by_company_access" on public.screens;
create policy "screens_select_by_company_access"
on public.screens
for select
to authenticated
using (public.has_company_role(company_id, array['admin', 'operator', 'designer', 'viewer']));

drop policy if exists "screens_insert_company_admin" on public.screens;
create policy "screens_insert_company_admin"
on public.screens
for insert
to authenticated
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "screens_update_company_admin" on public.screens;
create policy "screens_update_company_admin"
on public.screens
for update
to authenticated
using (public.has_company_role(company_id, array['admin']))
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "screens_delete_company_admin" on public.screens;
create policy "screens_delete_company_admin"
on public.screens
for delete
to authenticated
using (public.has_company_role(company_id, array['admin']));

drop policy if exists "campaign_locations_select_by_company_access" on public.campaign_locations;
create policy "campaign_locations_select_by_company_access"
on public.campaign_locations
for select
to authenticated
using (public.has_company_role(company_id, array['admin', 'operator', 'designer', 'viewer']));

drop policy if exists "campaign_locations_insert_company_admin" on public.campaign_locations;
create policy "campaign_locations_insert_company_admin"
on public.campaign_locations
for insert
to authenticated
with check (
  public.has_company_role(company_id, array['admin'])
  and (created_by is null or created_by = auth.uid() or public.is_super_admin())
);

drop policy if exists "campaign_locations_update_company_admin" on public.campaign_locations;
create policy "campaign_locations_update_company_admin"
on public.campaign_locations
for update
to authenticated
using (public.has_company_role(company_id, array['admin']))
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "campaign_locations_delete_company_admin" on public.campaign_locations;
create policy "campaign_locations_delete_company_admin"
on public.campaign_locations
for delete
to authenticated
using (public.has_company_role(company_id, array['admin']));

drop policy if exists "campaign_screens_select_by_company_access" on public.campaign_screens;
create policy "campaign_screens_select_by_company_access"
on public.campaign_screens
for select
to authenticated
using (public.has_company_role(company_id, array['admin', 'operator', 'designer', 'viewer']));

drop policy if exists "campaign_screens_insert_company_admin" on public.campaign_screens;
create policy "campaign_screens_insert_company_admin"
on public.campaign_screens
for insert
to authenticated
with check (
  public.has_company_role(company_id, array['admin'])
  and (created_by is null or created_by = auth.uid() or public.is_super_admin())
);

drop policy if exists "campaign_screens_update_company_admin" on public.campaign_screens;
create policy "campaign_screens_update_company_admin"
on public.campaign_screens
for update
to authenticated
using (public.has_company_role(company_id, array['admin']))
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "campaign_screens_delete_company_admin" on public.campaign_screens;
create policy "campaign_screens_delete_company_admin"
on public.campaign_screens
for delete
to authenticated
using (public.has_company_role(company_id, array['admin']));

drop policy if exists "media_files_select_by_company_access" on public.media_files;
create policy "media_files_select_by_company_access"
on public.media_files
for select
to authenticated
using (public.has_company_role(company_id, array['admin', 'operator', 'designer', 'viewer']));

drop policy if exists "media_files_insert_company_admin" on public.media_files;
create policy "media_files_insert_company_admin"
on public.media_files
for insert
to authenticated
with check (
  public.has_company_role(company_id, array['admin'])
  and (uploaded_by is null or uploaded_by = auth.uid() or public.is_super_admin())
);

drop policy if exists "media_files_update_company_admin" on public.media_files;
create policy "media_files_update_company_admin"
on public.media_files
for update
to authenticated
using (public.has_company_role(company_id, array['admin']))
with check (public.has_company_role(company_id, array['admin']));

drop policy if exists "media_files_delete_company_admin" on public.media_files;
create policy "media_files_delete_company_admin"
on public.media_files
for delete
to authenticated
using (public.has_company_role(company_id, array['admin']));
