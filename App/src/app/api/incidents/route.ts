import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";

const categories = [
  "screen_issue",
  "player_offline",
  "content_not_loading",
  "usb_issue",
  "streaming_issue",
  "physical_damage",
  "remodeling_operation",
  "other",
] as const;
const priorities = ["low", "medium", "high", "critical"] as const;

export async function POST(request: Request) {
  const user = await requireUser("/dashboard/incidents");
  const body = await request.json().catch(() => null) as {
    assigneeName?: string;
    category?: string;
    description?: string;
    locationId?: string;
    locationIds?: string[];
    priority?: string;
    title?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const locationIds = Array.from(
    new Set(
      [...(body.locationIds ?? []), body.locationId ?? ""]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  );
  const title = body.title?.trim();
  const description = body.description?.trim();

  if (!locationIds.length || !title || !description) {
    return NextResponse.json(
      { error: "Taquilla, titulo y descripcion son requeridos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: locationRows, error: locationError } = await supabase
    .from("locations")
    .select("id, company_id")
    .in("id", locationIds);

  if (locationError) {
    return NextResponse.json({ error: locationError.message }, { status: 500 });
  }

  const locations = locationRows ?? [];

  if (locations.length !== locationIds.length) {
    return NextResponse.json({ error: "Una o mas taquillas no fueron encontradas." }, { status: 404 });
  }

  const companyId = locations[0].company_id;

  if (locations.some((location) => location.company_id !== companyId)) {
    return NextResponse.json(
      { error: "Todas las taquillas deben pertenecer a la misma marca." },
      { status: 400 },
    );
  }

  const { data: canManage, error: permissionError } = await supabase.rpc(
    "has_company_role",
    {
      _allowed_roles: ["admin"],
      _company_id: companyId,
    },
  );

  if (permissionError || canManage !== true) {
    return NextResponse.json(
      { error: permissionError?.message ?? "No tienes permisos para crear incidentes." },
      { status: 403 },
    );
  }

  const { data: incident, error } = await supabase
    .from("location_incidents")
    .insert({
      assignee_name: body.assigneeName?.trim() || null,
      category: categories.includes(body.category as (typeof categories)[number])
        ? body.category
        : "other",
      company_id: companyId,
      description,
      location_id: locationIds[0],
      priority: priorities.includes(body.priority as (typeof priorities)[number])
        ? body.priority
        : "medium",
      reported_by: user.id,
      status: "open",
      title,
    })
    .select("id, company_id, location_id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: linksError } = await supabase
    .from("location_incident_locations")
    .insert(
      locationIds.map((locationId) => ({
        company_id: companyId,
        incident_id: incident.id,
        location_id: locationId,
      })),
    );

  if (linksError) {
    return NextResponse.json({ error: linksError.message }, { status: 500 });
  }

  const { error: locationStatusError } = await supabase
    .from("locations")
    .update({ status: "incident" })
    .in("id", locationIds)
    .eq("company_id", companyId);

  if (locationStatusError) {
    return NextResponse.json({ error: locationStatusError.message }, { status: 500 });
  }

  revalidatePath("/dashboard/incidents");
  revalidatePath("/dashboard/locations");

  return NextResponse.json({ incident }, { status: 201 });
}
