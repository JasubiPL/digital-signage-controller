import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import {
  assertCanManageCompanyMedia,
  CAMPAIGN_MEDIA_BUCKET,
  CAMPAIGN_MEDIA_SIGNED_URL_SECONDS,
  isUuid,
} from "@/server/media/storage";

type MediaRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: MediaRouteContext) {
  await requireUser("/dashboard");
  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: file, error } = await supabase
    .from("media_files")
    .select("id, bucket, storage_path, original_name, mime_type, size_bytes, status")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  if (file.bucket !== CAMPAIGN_MEDIA_BUCKET) {
    return NextResponse.json({ error: "Bucket no soportado." }, { status: 400 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(file.bucket)
    .createSignedUrl(file.storage_path, CAMPAIGN_MEDIA_SIGNED_URL_SECONDS);

  if (signedUrlError) {
    return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
  }

  return NextResponse.json({
    expiresIn: CAMPAIGN_MEDIA_SIGNED_URL_SECONDS,
    file,
    signedUrl: data.signedUrl,
  });
}

export async function DELETE(_request: Request, context: MediaRouteContext) {
  await requireUser("/dashboard");
  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: file, error } = await supabase
    .from("media_files")
    .select("id, bucket, company_id, storage_path, status")
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  if (file.bucket !== CAMPAIGN_MEDIA_BUCKET) {
    return NextResponse.json({ error: "Bucket no soportado." }, { status: 400 });
  }

  const permission = await assertCanManageCompanyMedia(supabase, file.company_id);

  if (!permission.ok) {
    return NextResponse.json({ error: permission.message }, { status: 403 });
  }

  const { error: removeError } = await supabase.storage
    .from(file.bucket)
    .remove([file.storage_path]);

  if (removeError) {
    return NextResponse.json({ error: removeError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("media_files")
    .update({ status: "deleted" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true, id });
}
