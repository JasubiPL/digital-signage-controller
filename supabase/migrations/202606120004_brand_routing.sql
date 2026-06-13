-- Align active brands with the Next.js brand-scoped routes.
-- Routes such as /dashboard/locations/[companySlug] and
-- /dashboard/campaigns/[companySlug] are generated from active companies.

update public.companies
set
  status = 'archived',
  updated_at = now()
where slug = 'iamsa'
  and status <> 'archived';

create index if not exists companies_status_slug_idx
  on public.companies (status, slug);
