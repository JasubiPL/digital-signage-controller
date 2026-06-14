import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import {
  assertCanCommentIncidents,
  buildIncidentImagePath,
  getIncidentImageExtensionForMimeType,
  INCIDENT_IMAGE_BUCKET,
  INCIDENT_IMAGE_MAX_BYTES,
} from "@/server/media/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireUser("/dashboard/incidents");
  const formData = await request.formData();
  const incidentId = String(formData.get("incidentId") ?? "");
  const noteId = String(formData.get("noteId") ?? "") || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const fileValue = formData.get("file");

  if (!incidentId || !(fileValue instanceof File) || fileValue.size <= 0) {
    return NextResponse.json(
      { error: "Incidente e imagen son requeridos." },
      { status: 400 },
    );
  }

  if (fileValue.size > INCIDENT_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "Cada imagen debe pesar máximo 10 MB." },
      { status: 413 },
    );
  }

  const extension = getIncidentImageExtensionForMimeType(fileValue.type);

  if (!extension) {
    return NextResponse.json(
      { error: "Solo se permiten imagenes JPG, PNG, WebP o GIF." },
      { status: 415 },
    );
  }

  const supabase = await createClient();
  const { data: incident, error: incidentError } = await supabase
    .from("location_incidents")
    .select("id, company_id, location_id")
    .eq("id", incidentId)
    .maybeSingle();

  if (incidentError) {
    return NextResponse.json({ error: incidentError.message }, { status: 500 });
  }

  if (!incident) {
    return NextResponse.json({ error: "Incidente no encontrado." }, { status: 404 });
  }

  if (noteId) {
    const { data: note, error: noteError } = await supabase
      .from("location_incident_notes")
      .select("id")
      .eq("id", noteId)
      .eq("incident_id", incident.id)
      .maybeSingle();

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }

    if (!note) {
      return NextResponse.json({ error: "Comentario no encontrado." }, { status: 404 });
    }
  }

  if (noteId) {
    const permission = await assertCanCommentIncidents(supabase, incident.company_id);

    if (!permission.ok) {
      return NextResponse.json({ error: permission.message }, { status: 403 });
    }
  } else {
    const { data: canManage, error: permissionError } = await supabase.rpc(
      "has_company_role",
      {
        _allowed_roles: ["admin"],
        _company_id: incident.company_id,
      },
    );

    if (permissionError || canManage !== true) {
      return NextResponse.json(
        { error: permissionError?.message ?? "No tienes permisos para subir imagenes al incidente." },
        { status: 403 },
      );
    }
  }

  const fileId = randomUUID();
  const storagePath = buildIncidentImagePath({
    companyId: incident.company_id,
    extension,
    fileId,
    incidentId: incident.id,
    locationId: incident.location_id,
  });
  const fileBuffer = Buffer.from(await fileValue.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(INCIDENT_IMAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: fileValue.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: attachment, error: insertError } = await supabase
    .from("location_incident_attachments")
    .insert({
      bucket: INCIDENT_IMAGE_BUCKET,
      caption,
      company_id: incident.company_id,
      incident_id: incident.id,
      location_id: incident.location_id,
      mime_type: fileValue.type,
      note_id: noteId,
      original_name: fileValue.name?.trim().slice(0, 255) || `${fileId}.${extension}`,
      size_bytes: fileValue.size,
      status: "active",
      storage_path: storagePath,
      uploaded_by: user.id,
    })
    .select("id, original_name, size_bytes")
    .single();

  if (insertError) {
    await supabase.storage.from(INCIDENT_IMAGE_BUCKET).remove([storagePath]);

    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  revalidatePath("/dashboard/incidents");

  return NextResponse.json({ attachment }, { status: 201 });
}
