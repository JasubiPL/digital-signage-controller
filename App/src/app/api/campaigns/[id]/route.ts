import { NextResponse } from "next/server";

import { ApiError, jsonError } from "@/server/api/errors";
import { readJsonObject, requireApiUser } from "@/server/api/requests";
import {
  assertCanManageCompany,
  createApiClient,
  throwIfSupabaseError,
} from "@/server/api/supabase";
import {
  optionalDate,
  optionalEnum,
  optionalString,
  validateUuid,
} from "@/server/api/validation";

const campaignStatuses = ["draft", "active", "inactive", "archived"] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const campaignId = validateUuid(id);
    const supabase = await createApiClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("id, company_id, name, starts_on, ends_on, status, created_at, updated_at")
      .eq("id", campaignId)
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw new ApiError(404, "Campania no encontrada.");
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const campaignId = validateUuid(id);
    const payload = await readJsonObject(request);
    const updates: Record<string, string | null> = {};
    const name = optionalString(payload, "name", { maxLength: 160 });
    const startsOn = optionalDate(payload, "startsOn");
    const endsOn = optionalDate(payload, "endsOn");
    const status = optionalEnum(payload, "status", campaignStatuses);
    const supabase = await createApiClient();

    const { data: existing, error: existingError } = await supabase
      .from("campaigns")
      .select("company_id")
      .eq("id", campaignId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Campania no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    if (name !== undefined && name !== null) updates.name = name;
    if (startsOn !== undefined) updates.starts_on = startsOn;
    if (endsOn !== undefined) updates.ends_on = endsOn;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No hay campos validos para actualizar.");
    }

    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", campaignId)
      .select("id, company_id, name, starts_on, ends_on, status, created_at, updated_at")
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ campaign: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const campaignId = validateUuid(id);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("campaigns")
      .select("company_id")
      .eq("id", campaignId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Campania no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    const { error } = await supabase.from("campaigns").delete().eq("id", campaignId);
    throwIfSupabaseError(error);

    return NextResponse.json({ deleted: true, id: campaignId });
  } catch (error) {
    return jsonError(error);
  }
}

