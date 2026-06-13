const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseServerEnv = {
  hasSecretKey: Boolean(supabaseSecretKey),
  secretKey: supabaseSecretKey,
};

export function getSupabaseAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!url || !supabaseSecretKey) {
    throw new Error(
      "Missing Supabase admin configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url,
    secretKey: supabaseSecretKey,
  };
}

