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
  requireString,
  requireUuid,
} from "@/server/api/validation";

const locationStatuses = ["ok", "remodeling", "incident", "pending_migration"] as const;

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const supabase = await createApiClient();
    const companyId = await resolveCompanyId(supabase, new URL(request.url).searchParams);
    let query = supabase
      .from("locations")
      .select("id, company_id, name, device, projection, status, created_at, updated_at")
      .order("name", { ascending: true });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;
    throwIfSupabaseError(error);

    return NextResponse.json({ locations: data ?? [] });
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
    const device = optionalString(payload, "device", { maxLength: 120, nullable: true });
    const projection = optionalString(payload, "projection", { maxLength: 80, nullable: true });
    const status = optionalEnum(payload, "status", locationStatuses) ?? "ok";
    const supabase = await createApiClient();

    await assertCanManageCompany(supabase, companyId);

    const { data, error } = await supabase
      .from("locations")
      .insert({
        company_id: companyId,
        created_by: user.id,
        device: device ?? null,
        name,
        projection: projection ?? null,
        status,
      })
      .select("id, company_id, name, device, projection, status, created_at, updated_at")
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ location: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

