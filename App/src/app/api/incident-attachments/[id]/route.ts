import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import {
  INCIDENT_IMAGE_BUCKET,
  INCIDENT_IMAGE_SIGNED_URL_SECONDS,
  isUuid,
} from "@/server/media/storage";

type IncidentAttachmentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: IncidentAttachmentRouteContext,
) {
  await requireUser("/dashboard/incidents");
  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: attachment, error } = await supabase
    .from("location_incident_attachments")
    .select("id, bucket, storage_path, status")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!attachment) {
    return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  if (attachment.bucket !== INCIDENT_IMAGE_BUCKET) {
    return NextResponse.json({ error: "Bucket no soportado." }, { status: 400 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(attachment.bucket)
    .createSignedUrl(
      attachment.storage_path,
      INCIDENT_IMAGE_SIGNED_URL_SECONDS,
    );

  if (signedUrlError) {
    return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
