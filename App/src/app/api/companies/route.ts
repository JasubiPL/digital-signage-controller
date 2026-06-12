import { NextResponse } from "next/server";

import { jsonError } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/requests";
import { createApiClient, throwIfSupabaseError } from "@/server/api/supabase";

export async function GET() {
  try {
    await requireApiUser();
    const supabase = await createApiClient();
    const { data, error } = await supabase
      .from("companies")
      .select("id, slug, legacy_code, name, status, created_at, updated_at")
      .order("slug", { ascending: true });

    throwIfSupabaseError(error);

    return NextResponse.json({ companies: data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

