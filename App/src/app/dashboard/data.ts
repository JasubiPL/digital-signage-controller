import { createClient } from "@/lib/supabase/server";
import {
  ensureProfile,
  getUserCompanyAccess,
  requireUser,
} from "@/server/auth/session";

export async function getDashboardContext(next = "/dashboard") {
  const user = await requireUser(next);
  await ensureProfile(user);
  const access = await getUserCompanyAccess(user.id);

  return {
    access,
    companies: access.data
      .map((item) => item.companies)
      .filter((company): company is NonNullable<typeof company> => Boolean(company)),
    supabase: await createClient(),
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

