"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export function createClient() {
  const { url, publishableKey } = getSupabaseBrowserConfig();

  return createBrowserClient(url, publishableKey);
}

