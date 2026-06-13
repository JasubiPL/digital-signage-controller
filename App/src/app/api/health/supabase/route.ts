import { NextResponse } from "next/server";

import { supabaseEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/server/supabase/admin";
import { supabaseServerEnv } from "@/server/supabase/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const publicConfigured = supabaseEnv.isConfigured;
  const adminConfigured = publicConfigured && supabaseServerEnv.hasSecretKey;
  const probe = new URL(request.url).searchParams.get("probe");

  if (probe === "cloud") {
    if (!publicConfigured) {
      return NextResponse.json({
        service: "supabase",
        configured: false,
        connection: "skipped",
        browser: {
          hasUrl: supabaseEnv.hasUrl,
          hasPublishableKey: supabaseEnv.hasPublishableKey,
        },
        server: {
          hasSecretKey: supabaseServerEnv.hasSecretKey,
        },
      });
    }

    const response = await fetch(`${supabaseEnv.url}/auth/v1/settings`, {
      cache: "no-store",
      headers: {
        apikey: supabaseEnv.publishableKey,
        Authorization: `Bearer ${supabaseEnv.publishableKey}`,
      },
    });

    return NextResponse.json({
      service: "supabase",
      configured: true,
      connection: response.ok ? "ok" : "failed",
      status: response.status,
      browser: {
        hasUrl: supabaseEnv.hasUrl,
        hasPublishableKey: supabaseEnv.hasPublishableKey,
      },
      server: {
        hasSecretKey: supabaseServerEnv.hasSecretKey,
      },
    });
  }

  if (probe !== "admin") {
    return NextResponse.json({
      service: "supabase",
      configured: publicConfigured,
      connection: "not_requested",
      browser: {
        hasUrl: supabaseEnv.hasUrl,
        hasPublishableKey: supabaseEnv.hasPublishableKey,
      },
      server: {
        hasSecretKey: supabaseServerEnv.hasSecretKey,
      },
    });
  }

  if (!adminConfigured) {
    return NextResponse.json({
      service: "supabase",
      configured: publicConfigured,
      connection: "skipped",
      browser: {
        hasUrl: supabaseEnv.hasUrl,
        hasPublishableKey: supabaseEnv.hasPublishableKey,
      },
      server: {
        hasSecretKey: supabaseServerEnv.hasSecretKey,
      },
    });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  return NextResponse.json({
    service: "supabase",
    configured: publicConfigured,
    connection: error ? "failed" : "ok",
    error: error?.message,
    browser: {
      hasUrl: supabaseEnv.hasUrl,
      hasPublishableKey: supabaseEnv.hasPublishableKey,
    },
    server: {
      hasSecretKey: supabaseServerEnv.hasSecretKey,
    },
  });
}
