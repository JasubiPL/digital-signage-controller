-- Collapse authorization to two global roles:
-- super_admin manages everything, user can only read active operational data.

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
      public.current_global_role() = 'user'
      and exists (
        select 1
        from public.companies c
        where c.id = _company_id
          and c.status = 'active'
      )
    )
$$;

grant execute on function public.can_read_company(uuid) to authenticated;

-- Backward-compatible helper for app and storage code that still calls it.
-- Write checks pass only ['admin']; read checks pass a wider role list.
create or replace function public.has_company_role(_company_id uuid, _allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when _allowed_roles = array['admin']::text[] then public.is_super_admin()
      else public.can_read_company(_company_id)
    end
$$;

grant execute on function public.has_company_role(uuid, text[]) to authenticated;

drop policy if exists "companies_select_by_access" on public.companies;
create policy "companies_select_by_access"
on public.companies
for select
to authenticated
using (
  public.is_super_admin()
  or (public.current_global_role() = 'user' and status = 'active')
  or not public.has_any_super_admin()
);

drop policy if exists "user_companies_select_by_access" on public.user_companies;
drop policy if exists "user_companies_insert_company_admin" on public.user_companies;
drop policy if exists "user_companies_update_company_admin" on public.user_companies;
drop policy if exists "user_companies_delete_company_admin" on public.user_companies;
drop table if exists public.user_companies;

drop policy if exists "locations_select_by_company_access" on public.locations;
create policy "locations_select_by_company_access"
on public.locations
for select
to authenticated
using (public.can_read_company(company_id));

drop policy if exists "locations_insert_company_admin" on public.locations;
create policy "locations_insert_super_admin"
on public.locations
for insert
to authenticated
with check (
  public.is_super_admin()
  and (created_by is null or created_by = auth.uid())
);

drop policy if exists "locations_update_company_admin" on public.locations;
create policy "locations_update_super_admin"
on public.locations
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "locations_delete_company_admin" on public.locations;
create policy "locations_delete_super_admin"
on public.locations
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "campaigns_select_by_company_access" on public.campaigns;
create policy "campaigns_select_by_company_access"
on public.campaigns
for select
to authenticated
using (public.can_read_company(company_id));

drop policy if exists "campaigns_insert_company_admin" on public.campaigns;
create policy "campaigns_insert_super_admin"
on public.campaigns
for insert
to authenticated
with check (
  public.is_super_admin()
  and (created_by is null or created_by = auth.uid())
);

drop policy if exists "campaigns_update_company_admin" on public.campaigns;
create policy "campaigns_update_super_admin"
on public.campaigns
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "campaigns_delete_company_admin" on public.campaigns;
create policy "campaigns_delete_super_admin"
on public.campaigns
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "screens_select_by_company_access" on public.screens;
create policy "screens_select_by_company_access"
on public.screens
for select
to authenticated
using (public.can_read_company(company_id));

drop policy if exists "screens_insert_company_admin" on public.screens;
create policy "screens_insert_super_admin"
on public.screens
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "screens_update_company_admin" on public.screens;
create policy "screens_update_super_admin"
on public.screens
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "screens_delete_company_admin" on public.screens;
create policy "screens_delete_super_admin"
on public.screens
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "campaign_locations_select_by_company_access" on public.campaign_locations;
create policy "campaign_locations_select_by_company_access"
on public.campaign_locations
for select
to authenticated
using (public.can_read_company(company_id));

drop policy if exists "campaign_locations_insert_company_admin" on public.campaign_locations;
create policy "campaign_locations_insert_super_admin"
on public.campaign_locations
for insert
to authenticated
with check (
  public.is_super_admin()
  and (created_by is null or created_by = auth.uid())
);

drop policy if exists "campaign_locations_update_company_admin" on public.campaign_locations;
create policy "campaign_locations_update_super_admin"
on public.campaign_locations
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "campaign_locations_delete_company_admin" on public.campaign_locations;
create policy "campaign_locations_delete_super_admin"
on public.campaign_locations
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "campaign_screens_select_by_company_access" on public.campaign_screens;
create policy "campaign_screens_select_by_company_access"
on public.campaign_screens
for select
to authenticated
using (public.can_read_company(company_id));

drop policy if exists "campaign_screens_insert_company_admin" on public.campaign_screens;
create policy "campaign_screens_insert_super_admin"
on public.campaign_screens
for insert
to authenticated
with check (
  public.is_super_admin()
  and (created_by is null or created_by = auth.uid())
);

drop policy if exists "campaign_screens_update_company_admin" on public.campaign_screens;
create policy "campaign_screens_update_super_admin"
on public.campaign_screens
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "campaign_screens_delete_company_admin" on public.campaign_screens;
create policy "campaign_screens_delete_super_admin"
on public.campaign_screens
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "media_files_select_by_company_access" on public.media_files;
create policy "media_files_select_by_company_access"
on public.media_files
for select
to authenticated
using (public.can_read_company(company_id));

drop policy if exists "media_files_insert_company_admin" on public.media_files;
create policy "media_files_insert_super_admin"
on public.media_files
for insert
to authenticated
with check (
  public.is_super_admin()
  and (uploaded_by is null or uploaded_by = auth.uid())
);

drop policy if exists "media_files_update_company_admin" on public.media_files;
create policy "media_files_update_super_admin"
on public.media_files
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "media_files_delete_company_admin" on public.media_files;
create policy "media_files_delete_super_admin"
on public.media_files
for delete
to authenticated
using (public.is_super_admin());
