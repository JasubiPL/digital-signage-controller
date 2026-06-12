import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export async function createClient() {
  const { url, publishableKey } = getSupabaseBrowserConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Middleware will handle refreshes.
        }
      },
    },
  });
}

