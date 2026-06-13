import { NextResponse } from "next/server";

import { ApiError, jsonError } from "@/server/api/errors";
import { readJsonObject, requireApiUser } from "@/server/api/requests";
import {
  assertCanManageCompany,
  createApiClient,
  throwIfSupabaseError,
} from "@/server/api/supabase";
import {
  optionalEnum,
  optionalString,
  optionalUuid,
  validateUuid,
} from "@/server/api/validation";

const screenStatuses = ["active", "inactive", "maintenance", "archived"] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const screenId = validateUuid(id);
    const supabase = await createApiClient();
    const { data, error } = await supabase
      .from("screens")
      .select(
        "id, company_id, location_id, name, device_identifier, status, last_seen_at, metadata, created_at, updated_at",
      )
      .eq("id", screenId)
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw new ApiError(404, "Pantalla no encontrada.");
    }

    return NextResponse.json({ screen: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const screenId = validateUuid(id);
    const payload = await readJsonObject(request);
    const updates: Record<string, string | null> = {};
    const name = optionalString(payload, "name", { maxLength: 160 });
    const locationId = optionalUuid(payload, "locationId");
    const deviceIdentifier = optionalString(payload, "deviceIdentifier", {
      maxLength: 160,
      nullable: true,
    });
    const status = optionalEnum(payload, "status", screenStatuses);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("screens")
      .select("company_id")
      .eq("id", screenId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Pantalla no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    if (name !== undefined && name !== null) updates.name = name;
    if (locationId !== undefined) updates.location_id = locationId;
    if (deviceIdentifier !== undefined) updates.device_identifier = deviceIdentifier;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No hay campos validos para actualizar.");
    }

    const { data, error } = await supabase
      .from("screens")
      .update(updates)
      .eq("id", screenId)
      .select(
        "id, company_id, location_id, name, device_identifier, status, last_seen_at, metadata, created_at, updated_at",
      )
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ screen: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const screenId = validateUuid(id);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("screens")
      .select("company_id")
      .eq("id", screenId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Pantalla no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    const { error } = await supabase.from("screens").delete().eq("id", screenId);
    throwIfSupabaseError(error);

    return NextResponse.json({ deleted: true, id: screenId });
  } catch (error) {
    return jsonError(error);
  }
}

