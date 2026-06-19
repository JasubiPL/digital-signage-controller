import { createClient } from "@/lib/supabase/server";
import {
  ensureProfile,
  getUserCompanyAccess,
  requireUser,
} from "@/server/auth/session";
import { createAdminClient } from "@/server/supabase/admin";
import { supabaseServerEnv } from "@/server/supabase/env";

export async function getDashboardContext(next = "/dashboard") {
  const user = await requireUser(next);
  await ensureProfile(user);
  const access = await getUserCompanyAccess(user.id);

  return {
    access,
    companies: access.data
      .map((item) => item.companies)
      .filter((company): company is NonNullable<typeof company> => Boolean(company)),
    supabase: supabaseServerEnv.hasSecretKey ? createAdminClient() : await createClient(),
    user,
  };
}

export function formatDate(value: string | null) {
  if (!value) return "Siempre";
  return value;
}

export function formatBytes(value: number | null) {
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export type CatalogOption = {
  is_active: boolean;
  label: string;
  slug: string;
};

type CatalogClient = Awaited<ReturnType<typeof getDashboardContext>>["supabase"];

// Loads incident category/priority catalogs. Returns every entry (so labels can
// be resolved even for deactivated values) plus convenience active-only lists
// and label maps for rendering.
export async function loadIncidentCatalogs(supabase: CatalogClient) {
  const [{ data: categories }, { data: priorities }] = await Promise.all([
    supabase
      .from("incident_categories")
      .select("slug, label, is_active, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("incident_priorities")
      .select("slug, label, is_active, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const allCategories = (categories ?? []) as CatalogOption[];
  const allPriorities = (priorities ?? []) as CatalogOption[];

  return {
    categories: allCategories,
    priorities: allPriorities,
    activeCategories: allCategories.filter((option) => option.is_active),
    activePriorities: allPriorities.filter((option) => option.is_active),
    categoryLabels: new Map(allCategories.map((option) => [option.slug, option.label])),
    priorityLabels: new Map(allPriorities.map((option) => [option.slug, option.label])),
  };
}
