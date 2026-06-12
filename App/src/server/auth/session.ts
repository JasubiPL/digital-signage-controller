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

type ProfileRole = "user" | "super_admin";

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return {
      data: [],
      error: profileError.message,
      isGlobalAdmin: false,
    };
  }

  if ((profile?.global_role as ProfileRole | undefined) === "super_admin") {
    const { data, error } = await supabase
      .from("companies")
      .select("id, slug, name")
      .eq("status", "active")
      .order("slug", { ascending: true });

    if (error) {
      return {
        data: [],
        error: error.message,
        isGlobalAdmin: true,
      };
    }

    return {
      data: (data ?? []).map((company) => ({
        role: "super_admin",
        companies: company,
      })),
      error: null,
      isGlobalAdmin: true,
    };
  }

  const { data, error } = await supabase
    .from("user_companies")
    .select("role, companies(id, slug, name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: [],
      error: error.message,
      isGlobalAdmin: false,
    };
  }

  return {
    data: (data ?? []) as unknown as CompanyAccess[],
    error: null,
    isGlobalAdmin: false,
  };
}

export async function getBootstrapState() {
  const supabase = await createClient();

  const [{ count: adminCount, error: adminError }, { count: companyCount, error: companyError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("global_role", "super_admin"),
      supabase.from("companies").select("id", { count: "exact", head: true }),
    ]);

  return {
    canBootstrap: !adminError && !companyError && adminCount === 0 && (companyCount ?? 0) > 0,
    accessCount: adminCount ?? 0,
    companyCount: companyCount ?? 0,
    error: adminError?.message ?? companyError?.message ?? null,
  };
}
