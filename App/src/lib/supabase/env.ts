const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseEnv = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
  hasUrl: Boolean(supabaseUrl),
  hasPublishableKey: Boolean(supabasePublishableKey),
  isConfigured: Boolean(supabaseUrl && supabasePublishableKey),
};

export function getSupabaseBrowserConfig() {
  if (!supabaseEnv.isConfigured) {
    throw new Error(
      "Missing Supabase browser configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: supabaseEnv.url,
    publishableKey: supabaseEnv.publishableKey,
  };
}

