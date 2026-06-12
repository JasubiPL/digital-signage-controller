import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import { ApiError } from "./errors";
import { getQuerySlug, getQueryUuid } from "./validation";

export async function createApiClient() {
  return createClient();
}

export async function resolveCompanyId(
  supabase: SupabaseClient,
  searchParams: URLSearchParams,
) {
  const companyId = getQueryUuid(searchParams, "companyId");

  if (companyId) {
    return companyId;
  }

  const companySlug = getQuerySlug(searchParams, "companySlug");

  if (!companySlug) {
    return null;
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", companySlug)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message);
  }

  if (!data) {
    throw new ApiError(404, "Compania no encontrada.");
  }

  return data.id as string;
}

export async function requireCompanyId(
  supabase: SupabaseClient,
  searchParams: URLSearchParams,
) {
  const companyId = await resolveCompanyId(supabase, searchParams);

  if (!companyId) {
    throw new ApiError(400, "companyId o companySlug es requerido.");
  }

  return companyId;
}

export async function assertCanManageCompany(
  supabase: SupabaseClient,
  companyId: string,
) {
  const { data, error } = await supabase.rpc("has_company_role", {
    _allowed_roles: ["admin"],
    _company_id: companyId,
  });

  if (error) {
    throw new ApiError(500, error.message);
  }

  if (data !== true) {
    throw new ApiError(403, "No tienes permisos para administrar esta compania.");
  }
}

export function throwIfSupabaseError(error: unknown) {
  if (!error) {
    return;
  }

  const message =
    typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Error de Supabase.";

  throw new ApiError(500, message);
}

