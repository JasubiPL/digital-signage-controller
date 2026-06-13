"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth/session";
import {
  buildCampaignMediaPath,
  CAMPAIGN_MEDIA_BUCKET,
  CAMPAIGN_MEDIA_MAX_BYTES,
  getExtensionForMimeType,
} from "@/server/media/storage";

type ActionState = "success" | "error";

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalField(formData: FormData, key: string) {
  const value = field(formData, key);
  return value.length > 0 ? value : null;
}

function finish(path: string, state: ActionState, message: string): never {
  redirect(`${path}?${new URLSearchParams({ [state]: message }).toString()}`);
}

async function assertCanManageCompany(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("has_company_role", {
    _allowed_roles: ["admin"],
    _company_id: companyId,
  });

  if (error || data !== true) {
    throw new Error(error?.message ?? "No tienes permisos de administracion para esta compania.");
  }
}

export async function createCampaign(formData: FormData) {
  const path = "/dashboard/campaigns";

  try {
    const user = await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("campaigns").insert({
      company_id: companyId,
      created_by: user.id,
      ends_on: optionalField(formData, "endsOn"),
      name: field(formData, "name"),
      starts_on: optionalField(formData, "startsOn"),
      status: field(formData, "status") || "draft",
    });

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Campania creada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo crear la campania.");
  }
}

export async function deleteCampaign(formData: FormData) {
  const path = "/dashboard/campaigns";

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Campania eliminada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la campania.");
  }
}

export async function createLocation(formData: FormData) {
  const path = "/dashboard/locations";

  try {
    const user = await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("locations").insert({
      company_id: companyId,
      created_by: user.id,
      device: optionalField(formData, "device"),
      name: field(formData, "name"),
      projection: optionalField(formData, "projection"),
      status: field(formData, "status") || "active",
    });

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Ubicacion creada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo crear la ubicacion.");
  }
}

export async function deleteLocation(formData: FormData) {
  const path = "/dashboard/locations";

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("locations").delete().eq("id", id);

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Ubicacion eliminada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la ubicacion.");
  }
}

export async function createScreen(formData: FormData) {
  const path = "/dashboard/screens";

  try {
    await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("screens").insert({
      company_id: companyId,
      device_identifier: optionalField(formData, "deviceIdentifier"),
      location_id: optionalField(formData, "locationId"),
      name: field(formData, "name"),
      status: field(formData, "status") || "active",
    });

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Pantalla creada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo crear la pantalla.");
  }
}

export async function deleteScreen(formData: FormData) {
  const path = "/dashboard/screens";

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("screens").delete().eq("id", id);

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Pantalla eliminada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la pantalla.");
  }
}

export async function assignCampaignToLocation(formData: FormData) {
  const path = "/dashboard/assignments";

  try {
    const user = await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("campaign_locations").insert({
      campaign_id: field(formData, "campaignId"),
      company_id: companyId,
      created_by: user.id,
      location_id: field(formData, "locationId"),
      status: "active",
    });

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Campania asignada a ubicacion.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo asignar la campania.");
  }
}

export async function assignCampaignToScreen(formData: FormData) {
  const path = "/dashboard/assignments";

  try {
    const user = await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("campaign_screens").insert({
      campaign_id: field(formData, "campaignId"),
      company_id: companyId,
      created_by: user.id,
      screen_id: field(formData, "screenId"),
      status: "active",
    });

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Campania asignada a pantalla.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo asignar la campania.");
  }
}

export async function deleteCampaignLocation(formData: FormData) {
  const path = "/dashboard/assignments";

  try {
    await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase
      .from("campaign_locations")
      .delete()
      .eq("id", field(formData, "id"));

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Asignacion eliminada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la asignacion.");
  }
}

export async function deleteCampaignScreen(formData: FormData) {
  const path = "/dashboard/assignments";

  try {
    await requireUser(path);
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase
      .from("campaign_screens")
      .delete()
      .eq("id", field(formData, "id"));

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Asignacion eliminada.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la asignacion.");
  }
}

export async function uploadCampaignMedia(formData: FormData) {
  const path = "/dashboard/files";

  try {
    const user = await requireUser(path);
    const companyId = field(formData, "companyId");
    const campaignId = field(formData, "campaignId");
    const fileValue = formData.get("file");
    await assertCanManageCompany(companyId);

    if (!(fileValue instanceof File) || fileValue.size <= 0) {
      throw new Error("Selecciona un archivo valido.");
    }

    if (fileValue.size > CAMPAIGN_MEDIA_MAX_BYTES) {
      throw new Error("El archivo supera el limite de 50 MB.");
    }

    const extension = getExtensionForMimeType(fileValue.type);

    if (!extension) {
      throw new Error("Tipo de archivo no permitido.");
    }

    const supabase = await createClient();
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

    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("media_files").insert({
      bucket: CAMPAIGN_MEDIA_BUCKET,
      campaign_id: campaignId,
      category: "campaign_media",
      company_id: companyId,
      mime_type: fileValue.type,
      original_name: fileValue.name.slice(0, 255),
      size_bytes: fileValue.size,
      status: "active",
      storage_path: storagePath,
      uploaded_by: user.id,
    });

    if (insertError) {
      await supabase.storage.from(CAMPAIGN_MEDIA_BUCKET).remove([storagePath]);
      throw insertError;
    }

    revalidatePath(path);
    finish(path, "success", "Archivo subido.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo subir el archivo.");
  }
}

export async function deleteMediaFile(formData: FormData) {
  const path = "/dashboard/files";

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    const storagePath = field(formData, "storagePath");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error: removeError } = await supabase
      .storage
      .from(CAMPAIGN_MEDIA_BUCKET)
      .remove([storagePath]);

    if (removeError) throw removeError;

    const { error } = await supabase
      .from("media_files")
      .update({ status: "deleted" })
      .eq("id", id);

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Archivo eliminado.");
  } catch (error) {
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar el archivo.");
  }
}

