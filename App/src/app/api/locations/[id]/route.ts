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
  validateUuid,
} from "@/server/api/validation";

const locationStatuses = ["active", "inactive", "maintenance", "archived"] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const locationId = validateUuid(id);
    const supabase = await createApiClient();
    const { data, error } = await supabase
      .from("locations")
      .select("id, company_id, name, device, projection, status, created_at, updated_at")
      .eq("id", locationId)
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw new ApiError(404, "Ubicacion no encontrada.");
    }

    return NextResponse.json({ location: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const locationId = validateUuid(id);
    const payload = await readJsonObject(request);
    const updates: Record<string, string | null> = {};
    const name = optionalString(payload, "name", { maxLength: 160 });
    const device = optionalString(payload, "device", { maxLength: 120, nullable: true });
    const projection = optionalString(payload, "projection", { maxLength: 80, nullable: true });
    const status = optionalEnum(payload, "status", locationStatuses);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("locations")
      .select("company_id")
      .eq("id", locationId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Ubicacion no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    if (name !== undefined && name !== null) updates.name = name;
    if (device !== undefined) updates.device = device;
    if (projection !== undefined) updates.projection = projection;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No hay campos validos para actualizar.");
    }

    const { data, error } = await supabase
      .from("locations")
      .update(updates)
      .eq("id", locationId)
      .select("id, company_id, name, device, projection, status, created_at, updated_at")
      .single();

    throwIfSupabaseError(error);

    return NextResponse.json({ location: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = await context.params;
    const locationId = validateUuid(id);
    const supabase = await createApiClient();
    const { data: existing, error: existingError } = await supabase
      .from("locations")
      .select("company_id")
      .eq("id", locationId)
      .maybeSingle();

    throwIfSupabaseError(existingError);

    if (!existing) {
      throw new ApiError(404, "Ubicacion no encontrada.");
    }

    await assertCanManageCompany(supabase, existing.company_id);

    const { error } = await supabase.from("locations").delete().eq("id", locationId);
    throwIfSupabaseError(error);

    return NextResponse.json({ deleted: true, id: locationId });
  } catch (error) {
    return jsonError(error);
  }
}

