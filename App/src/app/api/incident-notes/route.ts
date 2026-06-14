import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import { assertCanCommentIncidents } from "@/server/media/storage";

export async function POST(request: Request) {
  const user = await requireUser("/dashboard/incidents");
  const body = await request.json().catch(() => null) as {
    body?: string;
    incidentId?: string;
  } | null;

  if (!body?.incidentId || !body.body?.trim()) {
    return NextResponse.json(
      { error: "Incidente y comentario son requeridos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: incident, error: incidentError } = await supabase
    .from("location_incidents")
    .select("id, company_id, location_id")
    .eq("id", body.incidentId)
    .maybeSingle();

  if (incidentError) {
    return NextResponse.json({ error: incidentError.message }, { status: 500 });
  }

  if (!incident) {
    return NextResponse.json({ error: "Incidente no encontrado." }, { status: 404 });
  }

  const permission = await assertCanCommentIncidents(supabase, incident.company_id);

  if (!permission.ok) {
    return NextResponse.json({ error: permission.message }, { status: 403 });
  }

  const { data: note, error } = await supabase
    .from("location_incident_notes")
    .insert({
      author_id: user.id,
      body: body.body.trim(),
      company_id: incident.company_id,
      event_type: "note",
      incident_id: incident.id,
      location_id: incident.location_id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/dashboard/incidents");

  return NextResponse.json({ note }, { status: 201 });
}
