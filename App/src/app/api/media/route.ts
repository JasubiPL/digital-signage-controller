import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import {
  assertCampaignBelongsToCompany,
  assertCanManageCompanyMedia,
  buildCampaignMediaPath,
  CAMPAIGN_MEDIA_BUCKET,
  CAMPAIGN_MEDIA_MAX_BYTES,
  getAllowedMimeTypes,
  getExtensionForMimeType,
  isUuid,
} from "@/server/media/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireUser("/dashboard");
  const formData = await request.formData();
  const companyId = String(formData.get("companyId") ?? formData.get("company_id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? formData.get("campaign_id") ?? "");
  const fileValue = formData.get("file");

  if (!isUuid(companyId) || !isUuid(campaignId)) {
    return NextResponse.json(
      { error: "companyId y campaignId deben ser UUIDs validos." },
      { status: 400 },
    );
  }

  if (!(fileValue instanceof File)) {
    return NextResponse.json(
      { error: "El campo file es requerido." },
      { status: 400 },
    );
  }

  if (fileValue.size <= 0) {
    return NextResponse.json(
      { error: "El archivo esta vacio." },
      { status: 400 },
    );
  }

  if (fileValue.size > CAMPAIGN_MEDIA_MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el limite de 50 MB." },
      { status: 413 },
    );
  }

  const extension = getExtensionForMimeType(fileValue.type);

  if (!extension) {
    return NextResponse.json(
      {
        allowedMimeTypes: getAllowedMimeTypes(),
        error: "Tipo de archivo no permitido.",
      },
      { status: 415 },
    );
  }

  const supabase = await createClient();
  const permission = await assertCanManageCompanyMedia(supabase, companyId);

  if (!permission.ok) {
    return NextResponse.json({ error: permission.message }, { status: 403 });
  }

  const campaign = await assertCampaignBelongsToCompany(supabase, {
    campaignId,
    companyId,
  });

  if (!campaign.ok) {
    return NextResponse.json({ error: campaign.message }, { status: 404 });
  }

  const fileId = randomUUID();
  const storagePath = buildCampaignMediaPath({
    campaignId,
    companyId,
    extension,
    fileId,
  });
  const fileBuffer = Buffer.from(await fileValue.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(CAMPAIGN_MEDIA_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: fileValue.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const originalName = fileValue.name?.trim().slice(0, 255) || `${fileId}.${extension}`;
  const { data, error: insertError } = await supabase
    .from("media_files")
    .insert({
      bucket: CAMPAIGN_MEDIA_BUCKET,
      campaign_id: campaignId,
      category: "campaign_media",
      company_id: companyId,
      mime_type: fileValue.type,
      original_name: originalName,
      size_bytes: fileValue.size,
      status: "active",
      storage_path: storagePath,
      uploaded_by: user.id,
    })
    .select("id, bucket, campaign_id, storage_path, original_name, mime_type, size_bytes, status, created_at")
    .single();

  if (insertError) {
    await supabase.storage.from(CAMPAIGN_MEDIA_BUCKET).remove([storagePath]);

    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ file: data }, { status: 201 });
}
