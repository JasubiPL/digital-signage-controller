import { NextResponse } from "next/server";

import { jsonError } from "@/server/api/errors";
import { readJsonObject, requireApiUser } from "@/server/api/requests";
import {
  assertCanManageCompany,
  createApiClient,
  resolveCompanyId,
  throwIfSupabaseError,
} from "@/server/api/supabase";
import {
  optionalDate,
  optionalEnum,
  requireString,
  requireUuid,
} from "@/server/api/validation";

const campaignStatuses = ["draft", "active", "inactive", "archived"] as const;

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const supabase = await createApiClient();
    const companyId = await resolveCompanyId(supabase, new URL(request.url).searchParams);
    let query = supabase
      .from("campaigns")
      .select("id, company_id, name, starts_on, ends_on, status, created_at, updated_at")
      .order("name", { ascending: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;
    throwIfSupabaseError(error);

    return NextResponse.json({ campaigns: data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await readJsonObject(request);
    const companyId = requireUuid(payload, "companyId");
    const name = requireString(payload, "name", { maxLength: 160 });
    const startsOn = optionalDate(payload, "startsOn");
    const endsOn = optionalDate(payload, "endsOn");
    const status = optionalEnum(payload, "status", campaignStatuses) ?? "draft";

    const supabase = await createApiClient();
    await assertCanManageCompany(supabase, companyId);

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        company_id: companyId,
        created_by: user.id,
        ends_on: endsOn ?? null,
        name,
        starts_on: startsOn ?? null,
        status,
      })
      .select("id, company_id, name, starts_on, ends_on, status, created_at, updated_at")
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

