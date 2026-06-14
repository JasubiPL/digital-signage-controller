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
    priority?: string;
    title?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const locationId = body.locationId?.trim();
  const title = body.title?.trim();
  const description = body.description?.trim();

  if (!locationId || !title || !description) {
    return NextResponse.json(
      { error: "Taquilla, titulo y descripcion son requeridos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("id, company_id")
    .eq("id", locationId)
    .maybeSingle();

  if (locationError) {
    return NextResponse.json({ error: locationError.message }, { status: 500 });
  }

  if (!location) {
    return NextResponse.json({ error: "Taquilla no encontrada." }, { status: 404 });
  }

  const { data: canManage, error: permissionError } = await supabase.rpc(
    "has_company_role",
    {
      _allowed_roles: ["admin"],
      _company_id: location.company_id,
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
      company_id: location.company_id,
      description,
      location_id: location.id,
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

  const { error: locationStatusError } = await supabase
    .from("locations")
    .update({ status: "incident" })
    .eq("id", incident.location_id)
    .eq("company_id", incident.company_id);

  if (locationStatusError) {
    return NextResponse.json({ error: locationStatusError.message }, { status: 500 });
  }

  revalidatePath("/dashboard/incidents");
  revalidatePath("/dashboard/locations");

  return NextResponse.json({ incident }, { status: 201 });
}
