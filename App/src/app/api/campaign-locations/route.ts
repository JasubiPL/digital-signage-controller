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
  getQueryUuid,
  optionalEnum,
  requireUuid,
} from "@/server/api/validation";

const assignmentStatuses = ["active", "inactive"] as const;

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const supabase = await createApiClient();
    const searchParams = new URL(request.url).searchParams;
    const companyId = await resolveCompanyId(supabase, searchParams);
    const campaignId = getQueryUuid(searchParams, "campaignId");
    const locationId = getQueryUuid(searchParams, "locationId");
    let query = supabase
      .from("campaign_locations")
      .select(
        "id, company_id, campaign_id, location_id, status, created_at, updated_at, campaigns(id, name, starts_on, ends_on, status), locations(id, name, device, projection, status)",
      )
      .order("created_at", { ascending: false });

    if (companyId) query = query.eq("company_id", companyId);
    if (campaignId) query = query.eq("campaign_id", campaignId);
    if (locationId) query = query.eq("location_id", locationId);

    const { data, error } = await query;
    throwIfSupabaseError(error);

    return NextResponse.json({ campaignLocations: data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await readJsonObject(request);
    const companyId = requireUuid(payload, "companyId");
    const campaignId = requireUuid(payload, "campaignId");
    const locationId = requireUuid(payload, "locationId");
    const status = optionalEnum(payload, "status", assignmentStatuses) ?? "active";
    const supabase = await createApiClient();

    await assertCanManageCompany(supabase, companyId);

    const { data, error } = await supabase
      .from("campaign_locations")
      .insert({
        campaign_id: campaignId,
        company_id: companyId,
        created_by: user.id,
        location_id: locationId,
        status,
      })
      .select("id, company_id, campaign_id, location_id, status, created_at, updated_at")
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ campaignLocation: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

