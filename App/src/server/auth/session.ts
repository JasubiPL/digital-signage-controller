import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import { supabaseServerEnv } from "@/server/supabase/env";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
};

export type CompanyAccess = {
  role: string;
  companies: {
    id: string;
    legacy_code?: string | null;
    slug: string;
    name: string;
  } | null;
};

export type ProfileRole = "user" | "manager" | "super_admin";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user as SupabaseUser;
}

export async function requireUser(next = "/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}

export async function ensureProfile(user: SupabaseUser) {
  const supabase = await createClient();
  const email = user.email;

  if (!email) {
    return {
      ok: false,
      message: "El usuario autenticado no tiene email confirmado.",
    };
  }

  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? email;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      full_name: fullName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Perfil disponible.",
  };
}

export async function getUserCompanyAccess(userId: string) {
  const supabase = await createClient();
  const dataClient = supabaseServerEnv.hasSecretKey ? createAdminClient() : supabase;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return {
      canAccessIncidents: false,
      data: [],
      error: profileError.message,
      isGlobalAdmin: false,
      isManager: false,
    };
  }

  const globalRole = (profile?.global_role as ProfileRole | undefined) ?? "user";
  const { data, error } = await dataClient
    .from("companies")
    .select("id, slug, legacy_code, name")
    .eq("status", "active")
    .order("slug", { ascending: true });

  if (error) {
    return {
      canAccessIncidents: globalRole === "super_admin" || globalRole === "manager",
      data: [],
      error: error.message,
      isGlobalAdmin: globalRole === "super_admin",
      isManager: globalRole === "manager",
    };
  }

  return {
    data: (data ?? []).map((company) => ({
      role: globalRole,
      companies: company,
    })),
    canAccessIncidents: globalRole === "super_admin" || globalRole === "manager",
    error: null,
    isGlobalAdmin: globalRole === "super_admin",
    isManager: globalRole === "manager",
  };
}

export async function getBootstrapState() {
  const supabase = await createClient();

  const [{ data: hasAdmin, error: adminError }, { count: companyCount, error: companyError }] =
    await Promise.all([
      supabase.rpc("has_any_super_admin"),
      supabase.from("companies").select("id", { count: "exact", head: true }),
    ]);
  const hasSuperAdmin = hasAdmin === true;

  return {
    // The first registered user may become super_admin even on an empty
    // database (no companies yet) so the project can bootstrap from scratch.
    canBootstrap: !adminError && !hasSuperAdmin,
    accessCount: hasSuperAdmin ? 1 : 0,
    companyCount: companyCount ?? 0,
    error: adminError?.message ?? companyError?.message ?? null,
  };
}
