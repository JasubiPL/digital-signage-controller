import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import { INCIDENT_IMAGE_BUCKET, isUuid } from "@/server/media/storage";
import { createAdminClient } from "@/server/supabase/admin";
import { supabaseServerEnv } from "@/server/supabase/env";

type IncidentNoteRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function privilegedClient() {
  return supabaseServerEnv.hasSecretKey ? createAdminClient() : createClient();
}

async function ownedComment(id: string, userId: string) {
  const supabase = await privilegedClient();
  const { data: note, error } = await supabase
    .from("location_incident_notes")
    .select("id, incident_id, author_id, event_type")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { error: NextResponse.json({ error: error.message }, { status: 500 }), note: null, supabase };
  }

  if (!note) {
    return { error: NextResponse.json({ error: "Comentario no encontrado." }, { status: 404 }), note: null, supabase };
  }

  if (note.event_type !== "note" || note.author_id !== userId) {
    return { error: NextResponse.json({ error: "Solo puedes modificar tus propios comentarios." }, { status: 403 }), note: null, supabase };
  }

  return { error: null, note, supabase };
}

export async function PATCH(
  request: Request,
  context: IncidentNoteRouteContext,
) {
  const user = await requireUser("/dashboard/incidents");
  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as { body?: string } | null;
  const nextBody = body?.body?.trim();

  if (!nextBody) {
    return NextResponse.json({ error: "Captura un comentario." }, { status: 400 });
  }

  const { error, note, supabase } = await ownedComment(id, user.id);
  if (error) return error;

  const { error: updateError } = await supabase
    .from("location_incident_notes")
    .update({ body: nextBody })
    .eq("id", note.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath("/dashboard/incidents");
  revalidatePath(`/dashboard/incidents/${note.incident_id}`);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: IncidentNoteRouteContext,
) {
  const user = await requireUser("/dashboard/incidents");
  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const { error, note, supabase } = await ownedComment(id, user.id);
  if (error) return error;

  const { data: attachments, error: attachmentError } = await supabase
    .from("location_incident_attachments")
    .select("id, bucket, storage_path")
    .eq("note_id", note.id)
    .eq("status", "active");

  if (attachmentError) {
    return NextResponse.json({ error: attachmentError.message }, { status: 500 });
  }

  const paths = (attachments ?? [])
    .filter((attachment) => attachment.bucket === INCIDENT_IMAGE_BUCKET)
    .map((attachment) => attachment.storage_path);

  if (paths.length) {
    const { error: removeError } = await supabase.storage
      .from(INCIDENT_IMAGE_BUCKET)
      .remove(paths);

    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }
  }

  if (attachments?.length) {
    const { error: deleteAttachmentsError } = await supabase
      .from("location_incident_attachments")
      .delete()
      .in("id", attachments.map((attachment) => attachment.id));

    if (deleteAttachmentsError) {
      return NextResponse.json({ error: deleteAttachmentsError.message }, { status: 500 });
    }
  }

  const { error: deleteError } = await supabase
    .from("location_incident_notes")
    .delete()
    .eq("id", note.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  revalidatePath("/dashboard/incidents");
  revalidatePath(`/dashboard/incidents/${note.incident_id}`);

  return NextResponse.json({ ok: true });
}
