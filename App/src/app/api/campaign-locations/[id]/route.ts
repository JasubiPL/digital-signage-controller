import { NextResponse } from "next/server";

import { ApiError, jsonError } from "@/server/api/errors";
import { readJsonObject, requireApiUser } from "@/server/api/requests";
import {
  assertCanManageCompany,
  createApiClient,
  throwIfSupabaseError,
} from "@/server/api/supabase";
import { optionalEnum, validateUuid } from "@/server/api/validation";

const assignmentStatuses = ["active", "draft", "inactive"] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const assignmentId = validateUuid(id);
    const payload = await readJsonObject(request);
    const status = optionalEnum(payload, "status", assignmentStatuses);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("campaign_locations")
      .select("company_id")
      .eq("id", assignmentId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Asignacion no encontrada.");
    }

    if (!status) {
      throw new ApiError(400, "status es requerido.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    const { data, error } = await supabase
      .from("campaign_locations")
      .update({ status })
      .eq("id", assignmentId)
      .select("id, company_id, campaign_id, location_id, status, created_at, updated_at")
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ campaignLocation: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const assignmentId = validateUuid(id);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("campaign_locations")
      .select("company_id")
      .eq("id", assignmentId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Asignacion no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    const { error } = await supabase.from("campaign_locations").delete().eq("id", assignmentId);
    throwIfSupabaseError(error);

    return NextResponse.json({ deleted: true, id: assignmentId });
  } catch (error) {
    return jsonError(error);
  }
}

