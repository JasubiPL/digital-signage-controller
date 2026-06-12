import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    slug: string;
    name: string;
  } | null;
};

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
      global_role: "user",
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

  const { data, error } = await supabase
    .from("user_companies")
    .select("role, companies(id, slug, name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: [],
      error: error.message,
    };
  }

  return {
    data: (data ?? []) as unknown as CompanyAccess[],
    error: null,
  };
}

export async function getBootstrapState() {
  const supabase = await createClient();

  const [{ count: accessCount, error: accessError }, { count: companyCount, error: companyError }] =
    await Promise.all([
      supabase
        .from("user_companies")
        .select("id", { count: "exact", head: true }),
      supabase.from("companies").select("id", { count: "exact", head: true }),
    ]);

  return {
    canBootstrap: !accessError && !companyError && accessCount === 0 && (companyCount ?? 0) > 0,
    accessCount: accessCount ?? 0,
    companyCount: companyCount ?? 0,
    error: accessError?.message ?? companyError?.message ?? null,
  };
}
