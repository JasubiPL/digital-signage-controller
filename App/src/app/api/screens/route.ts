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
  optionalEnum,
  optionalString,
  optionalUuid,
  requireString,
  requireUuid,
} from "@/server/api/validation";

const screenStatuses = ["active", "inactive", "maintenance", "archived"] as const;

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const supabase = await createApiClient();
    const searchParams = new URL(request.url).searchParams;
    const companyId = await resolveCompanyId(supabase, searchParams);
    const locationId = searchParams.get("locationId");
    let query = supabase
      .from("screens")
      .select(
        "id, company_id, location_id, name, device_identifier, status, last_seen_at, metadata, created_at, updated_at",
      )
      .order("name", { ascending: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    if (locationId) {
      query = query.eq("location_id", locationId);
    }

    const { data, error } = await query;
    throwIfSupabaseError(error);

    return NextResponse.json({ screens: data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const payload = await readJsonObject(request);
    const companyId = requireUuid(payload, "companyId");
    const name = requireString(payload, "name", { maxLength: 160 });
    const locationId = optionalUuid(payload, "locationId");
    const deviceIdentifier = optionalString(payload, "deviceIdentifier", {
      maxLength: 160,
      nullable: true,
    });
    const status = optionalEnum(payload, "status", screenStatuses) ?? "active";
    const supabase = await createApiClient();

    await assertCanManageCompany(supabase, companyId);

    const { data, error } = await supabase
      .from("screens")
      .insert({
        company_id: companyId,
        device_identifier: deviceIdentifier ?? null,
        location_id: locationId ?? null,
        name,
        status,
      })
      .select(
        "id, company_id, location_id, name, device_identifier, status, last_seen_at, metadata, created_at, updated_at",
      )
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ screen: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

