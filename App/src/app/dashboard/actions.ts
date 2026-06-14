"use server";

import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { getUserCompanyAccess, requireUser } from "@/server/auth/session";
import {
  buildIncidentImagePath,
  buildCampaignMediaPath,
  CAMPAIGN_MEDIA_BUCKET,
  CAMPAIGN_MEDIA_MAX_BYTES,
  INCIDENT_IMAGE_BUCKET,
  INCIDENT_IMAGE_MAX_BYTES,
  INCIDENT_IMAGE_TOTAL_MAX_BYTES,
  assertCanCommentIncidents,
  getIncidentImageExtensionForMimeType,
  getExtensionForMimeType,
} from "@/server/media/storage";
import { createAdminClient } from "@/server/supabase/admin";

type ActionState = "success" | "error";

const assignmentStatuses = ["active", "draft", "inactive"] as const;
type AssignmentStatus = (typeof assignmentStatuses)[number];
const profileRoles = ["super_admin", "manager", "user"] as const;
type ProfileRole = (typeof profileRoles)[number];
const incidentCategories = [
  "screen_issue",
  "player_offline",
  "content_not_loading",
  "usb_issue",
  "streaming_issue",
  "physical_damage",
  "remodeling_operation",
  "other",
] as const;
type IncidentCategory = (typeof incidentCategories)[number];
const incidentPriorities = ["low", "medium", "high", "critical"] as const;
type IncidentPriority = (typeof incidentPriorities)[number];
const incidentStatuses = ["open", "in_progress", "waiting", "resolved", "canceled"] as const;
type IncidentStatus = (typeof incidentStatuses)[number];
const activeIncidentStatuses = ["open", "in_progress", "waiting"] as const;

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

function returnPath(formData: FormData, fallback: string) {
  const value = formData.get("returnPath");

  return value ? sanitizeNextPath(value) : fallback;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      code?: unknown;
      details?: unknown;
      message?: unknown;
    };

    if (
      maybeError.code === "23514" &&
      typeof maybeError.message === "string" &&
      maybeError.message.includes("campaign_locations_status_check")
    ) {
      return "Falta aplicar la migracion de estatus por taquilla. Ejecuta la migracion 202606130001_campaign_location_operational_status.sql en Supabase.";
    }

    if (
      maybeError.code === "23514" &&
      typeof maybeError.message === "string" &&
      maybeError.message.includes("locations_status_check")
    ) {
      return "Falta aplicar la migracion de estatus de taquillas. Ejecuta la migracion 202606120005_location_operational_status.sql en Supabase.";
    }

    if (typeof maybeError.message === "string") return maybeError.message;
    if (typeof maybeError.details === "string") return maybeError.details;
  }

  return fallback;
}

function profileRole(formData: FormData) {
  const role = field(formData, "globalRole");

  return profileRoles.includes(role as ProfileRole) ? (role as ProfileRole) : "user";
}

function incidentCategory(formData: FormData) {
  const category = field(formData, "category");

  return incidentCategories.includes(category as IncidentCategory)
    ? (category as IncidentCategory)
    : "other";
}

function incidentPriority(formData: FormData) {
  const priority = field(formData, "priority");

  return incidentPriorities.includes(priority as IncidentPriority)
    ? (priority as IncidentPriority)
    : "medium";
}

function incidentStatus(formData: FormData) {
  const status = field(formData, "status");

  return incidentStatuses.includes(status as IncidentStatus)
    ? (status as IncidentStatus)
    : "open";
}

function incidentImageFiles(formData: FormData, key = "images") {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function revalidateIncidentPaths(
  supabase: SupabaseClient,
  input: { companyId?: string | null } = {},
) {
  revalidatePath("/dashboard/incidents");
  revalidatePath("/dashboard/locations");

  if (!input.companyId) return;

  const { data } = await supabase
    .from("companies")
    .select("slug")
    .eq("id", input.companyId)
    .maybeSingle();

  if (data?.slug) {
    revalidatePath(`/dashboard/locations/${data.slug}`);
  }
}

async function syncLocationIncidentStatus(
  supabase: SupabaseClient,
  input: {
    companyId: string;
    locationId: string;
  },
) {
  const { count, error: countError } = await supabase
    .from("location_incidents")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.companyId)
    .eq("location_id", input.locationId)
    .in("status", [...activeIncidentStatuses]);

  if (countError) throw countError;

  const { error } = await supabase
    .from("locations")
    .update({ status: (count ?? 0) > 0 ? "incident" : "ok" })
    .eq("id", input.locationId)
    .eq("company_id", input.companyId);

  if (error) throw error;
}

async function uploadIncidentImages(
  supabase: SupabaseClient,
  input: {
    caption?: string | null;
    companyId: string;
    files: File[];
    incidentId: string;
    locationId: string;
    noteId?: string | null;
    uploadedBy: string;
  },
) {
  const totalBytes = input.files.reduce((sum, fileValue) => sum + fileValue.size, 0);

  if (totalBytes > INCIDENT_IMAGE_TOTAL_MAX_BYTES) {
    throw new Error("La carga total de imagenes supera el limite de 30 MB.");
  }

  for (const fileValue of input.files) {
    if (fileValue.size > INCIDENT_IMAGE_MAX_BYTES) {
      throw new Error("Cada imagen debe pesar máximo 10 MB.");
    }

    const extension = getIncidentImageExtensionForMimeType(fileValue.type);

    if (!extension) {
      throw new Error("Solo se permiten imagenes JPG, PNG, WebP o GIF.");
    }

    const fileId = randomUUID();
    const storagePath = buildIncidentImagePath({
      companyId: input.companyId,
      extension,
      fileId,
      incidentId: input.incidentId,
      locationId: input.locationId,
    });
    const fileBuffer = Buffer.from(await fileValue.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(INCIDENT_IMAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: fileValue.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase
      .from("location_incident_attachments")
      .insert({
        bucket: INCIDENT_IMAGE_BUCKET,
        caption: input.caption,
        company_id: input.companyId,
        incident_id: input.incidentId,
        location_id: input.locationId,
        mime_type: fileValue.type,
        note_id: input.noteId ?? null,
        original_name: fileValue.name?.trim().slice(0, 255) || `${fileId}.${extension}`,
        size_bytes: fileValue.size,
        status: "active",
        storage_path: storagePath,
        uploaded_by: input.uploadedBy,
      });

    if (insertError) {
      await supabase.storage.from(INCIDENT_IMAGE_BUCKET).remove([storagePath]);
      throw insertError;
    }
  }
}

async function incidentForAction(supabase: SupabaseClient, incidentId: string) {
  const { data, error } = await supabase
    .from("location_incidents")
    .select("id, company_id, location_id, status")
    .eq("id", incidentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No se encontró el incidente.");

  return data;
}

function assignmentStatus(formData: FormData) {
  const status = field(formData, "status");

  if (!assignmentStatuses.includes(status as AssignmentStatus)) {
    throw new Error("Estatus de asignación inválido.");
  }

  return status as AssignmentStatus;
}

async function getUserManagementScope(path = "/dashboard/users") {
  const user = await requireUser(path);
  const access = await getUserCompanyAccess(user.id);

  if (access.error) {
    throw new Error(access.error);
  }

  if (!access.isGlobalAdmin) {
    throw new Error("No tienes permisos para gestionar usuarios.");
  }

  return {
    user,
  };
}

async function assertCanManageCompany(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("has_company_role", {
    _allowed_roles: ["admin"],
    _company_id: companyId,
  });

  if (error || data !== true) {
    throw new Error(error?.message ?? "No tienes permisos de administración para esta compañía.");
  }
}

export async function createManagedUser(formData: FormData) {
  const path = returnPath(formData, "/dashboard/users");

  try {
    await getUserManagementScope(path);
    const email = field(formData, "email").toLowerCase();
    const fullName = field(formData, "fullName");
    const password = field(formData, "password");
    const globalRole = profileRole(formData);

    if (!email) throw new Error("Captura el email del usuario.");
    if (password.length < 8) {
      throw new Error("La contraseña temporal debe tener al menos 8 caracteres.");
    }

    const admin = createAdminClient();
    const { data, error: authError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: {
        full_name: fullName || email,
      },
    });

    if (authError) throw authError;
    if (!data.user) throw new Error("Supabase no devolvio el usuario creado.");

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        email,
        full_name: fullName || email,
        global_role: globalRole,
        id: data.user.id,
      },
      { onConflict: "id" },
    );

    if (profileError) throw profileError;

    revalidatePath(path);
    finish(path, "success", "Usuario creado.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo crear el usuario.");
  }
}

export async function updateManagedUser(formData: FormData) {
  const path = returnPath(formData, "/dashboard/users");

  try {
    const scope = await getUserManagementScope(path);
    const userId = field(formData, "userId");
    const email = field(formData, "email").toLowerCase();
    const fullName = field(formData, "fullName");
    const globalRole = profileRole(formData);

    if (!userId) throw new Error("Usuario invalido.");
    if (!email) throw new Error("Captura el email del usuario.");
    if (scope.user.id === userId && globalRole !== "super_admin") {
      throw new Error("No puedes quitarte tu propio rol de super usuario.");
    }

    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      email: email || undefined,
      user_metadata: {
        full_name: fullName || email,
      },
    });

    if (authError) throw authError;

    const profileUpdate: {
      email: string;
      full_name: string;
      global_role?: string;
    } = {
      email,
      full_name: fullName || email,
    };

    profileUpdate.global_role = globalRole;

    const { error: profileError } = await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profileError) throw profileError;

    revalidatePath(path);
    finish(path, "success", "Usuario actualizado.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo actualizar el usuario.");
  }
}

export async function deleteManagedUser(formData: FormData) {
  const path = returnPath(formData, "/dashboard/users");

  try {
    const scope = await getUserManagementScope(path);
    const userId = field(formData, "userId");

    if (!userId) throw new Error("Usuario invalido.");
    if (scope.user.id === userId) {
      throw new Error("No puedes eliminar tu propia cuenta.");
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("global_role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Usuario no encontrado.");

    if (profile.global_role === "super_admin") {
      const { count, error: countError } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("global_role", "super_admin");

      if (countError) throw countError;
      if ((count ?? 0) <= 1) {
        throw new Error("No puedes eliminar el ultimo super usuario.");
      }
    }

    const { error: authError } = await admin.auth.admin.deleteUser(userId);

    if (authError) throw authError;

    revalidatePath(path);
    finish(path, "success", "Usuario eliminado.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar el usuario.");
  }
}

export async function createCampaign(formData: FormData) {
  const path = returnPath(formData, "/dashboard/campaigns");

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
    finish(path, "success", "Campaña creada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo crear la campaña.");
  }
}

export async function deleteCampaign(formData: FormData) {
  const path = returnPath(formData, "/dashboard/campaigns");

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Campaña eliminada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la campaña.");
  }
}

export async function updateCampaign(formData: FormData) {
  const path = returnPath(formData, "/dashboard/campaigns");

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error } = await supabase
      .from("campaigns")
      .update({
        ends_on: optionalField(formData, "endsOn"),
        name: field(formData, "name"),
        starts_on: optionalField(formData, "startsOn"),
        status: field(formData, "status") || "draft",
      })
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Campaña actualizada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo actualizar la campaña.");
  }
}

export async function syncCampaignLocations(formData: FormData) {
  const path = returnPath(formData, "/dashboard/campaigns");

  try {
    const user = await requireUser(path);
    const campaignId = field(formData, "campaignId");
    const companyId = field(formData, "companyId");
    const locationIds = formData.getAll("locationIds").map(String);
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { data: existingAssignments, error: existingError } = await supabase
      .from("campaign_locations")
      .select("location_id, status")
      .eq("campaign_id", campaignId)
      .eq("company_id", companyId);

    if (existingError) throw existingError;

    const statusByLocation = new Map(
      (existingAssignments ?? []).map((assignment) => [
        assignment.location_id,
        assignment.status,
      ]),
    );
    const { error: deleteError } = await supabase
      .from("campaign_locations")
      .delete()
      .eq("campaign_id", campaignId)
      .eq("company_id", companyId);

    if (deleteError) throw deleteError;

    if (locationIds.length) {
      const { error: insertError } = await supabase.from("campaign_locations").insert(
        locationIds.map((locationId) => ({
          campaign_id: campaignId,
          company_id: companyId,
          created_by: user.id,
          location_id: locationId,
          status: statusByLocation.get(locationId) ?? "active",
        })),
      );

      if (insertError) throw insertError;
    }

    revalidatePath(path);
    finish(path, "success", "Taquillas asignadas.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudieron asignar las taquillas.");
  }
}

export async function createLocation(formData: FormData) {
  const path = returnPath(formData, "/dashboard/locations");

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
      status: field(formData, "status") || "ok",
    });

    if (error) throw error;
    revalidatePath(path);
    finish(path, "success", "Ubicación creada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo crear la ubicación.");
  }
}

export async function deleteLocation(formData: FormData) {
  const path = returnPath(formData, "/dashboard/locations");

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { error: screensError } = await supabase
      .from("screens")
      .update({ location_id: null })
      .eq("location_id", id)
      .eq("company_id", companyId);

    if (screensError) throw screensError;

    const { data, error } = await supabase
      .from("locations")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("No se encontro la taquilla para eliminar.");

    revalidatePath(path);
    finish(path, "success", "Ubicación eliminada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo eliminar la ubicación."));
  }
}

export async function updateLocation(formData: FormData) {
  const path = returnPath(formData, "/dashboard/locations");

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("locations")
      .update({
        device: optionalField(formData, "device"),
        name: field(formData, "name"),
        projection: optionalField(formData, "projection"),
        status: field(formData, "status") || "ok",
      })
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("No se encontro la taquilla para actualizar.");

    revalidatePath(path);
    finish(path, "success", "Taquilla actualizada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo actualizar la taquilla."));
  }
}

export async function syncLocationCampaigns(formData: FormData) {
  const path = returnPath(formData, "/dashboard/locations");

  try {
    const user = await requireUser(path);
    const companyId = field(formData, "companyId");
    const locationId = field(formData, "locationId");
    const campaignIds = formData.getAll("campaignIds").map(String);
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { data: existingAssignments, error: existingError } = await supabase
      .from("campaign_locations")
      .select("campaign_id, status")
      .eq("location_id", locationId)
      .eq("company_id", companyId);

    if (existingError) throw existingError;

    const statusByCampaign = new Map(
      (existingAssignments ?? []).map((assignment) => [
        assignment.campaign_id,
        assignment.status,
      ]),
    );
    const { error: deleteError } = await supabase
      .from("campaign_locations")
      .delete()
      .eq("location_id", locationId)
      .eq("company_id", companyId);

    if (deleteError) throw deleteError;

    if (campaignIds.length) {
      const { error: insertError } = await supabase.from("campaign_locations").insert(
        campaignIds.map((campaignId) => ({
          campaign_id: campaignId,
          company_id: companyId,
          created_by: user.id,
          location_id: locationId,
          status: statusByCampaign.get(campaignId) ?? "active",
        })),
      );

      if (insertError) throw insertError;
    }

    revalidatePath(path);
    finish(path, "success", "Campañas asignadas.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudieron asignar las campañas.");
  }
}

export async function updateCampaignLocationStatus(formData: FormData) {
  const path = returnPath(formData, "/dashboard/locations");

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const companyId = field(formData, "companyId");
    await assertCanManageCompany(companyId);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("campaign_locations")
      .update({ status: assignmentStatus(formData) })
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("No se encontró la asignación de esta campaña en la taquilla.");

    revalidatePath(path);
    finish(path, "success", "Estatus de campaña actualizado para esta taquilla.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo actualizar el estatus de la campaña."));
  }
}

export async function createLocationIncident(formData: FormData) {
  const path = returnPath(formData, "/dashboard/incidents");

  try {
    const user = await requireUser(path);
    const locationId = field(formData, "locationId");
    const title = field(formData, "title");
    const description = field(formData, "description");

    if (!title) throw new Error("Captura el titulo del incidente.");
    if (!description) throw new Error("Captura la descripcion del incidente.");

    const supabase = await createClient();
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id, company_id")
      .eq("id", locationId)
      .maybeSingle();

    if (locationError) throw locationError;
    if (!location) throw new Error("Selecciona una taquilla valida.");

    await assertCanManageCompany(location.company_id);

    const status = incidentStatus(formData);
    const isResolved = status === "resolved" || status === "canceled";
    const { data: incident, error } = await supabase
      .from("location_incidents")
      .insert({
        assignee_name: optionalField(formData, "assigneeName"),
        category: incidentCategory(formData),
        company_id: location.company_id,
        description,
        location_id: location.id,
        priority: incidentPriority(formData),
        reported_by: user.id,
        resolved_at: isResolved ? new Date().toISOString() : null,
        resolved_by: isResolved ? user.id : null,
        resolution_summary: isResolved ? optionalField(formData, "resolutionSummary") : null,
        status,
        title,
      })
      .select("id, company_id, location_id")
      .single();

    if (error) throw error;

    await uploadIncidentImages(supabase, {
      caption: optionalField(formData, "caption"),
      companyId: incident.company_id,
      files: incidentImageFiles(formData),
      incidentId: incident.id,
      locationId: incident.location_id,
      uploadedBy: user.id,
    });
    await syncLocationIncidentStatus(supabase, {
      companyId: incident.company_id,
      locationId: incident.location_id,
    });
    await revalidateIncidentPaths(supabase, { companyId: incident.company_id });
    finish(path, "success", "Incidente creado.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo crear el incidente."));
  }
}

export async function updateLocationIncident(formData: FormData) {
  const path = returnPath(formData, "/dashboard/incidents");

  try {
    const user = await requireUser(path);
    const id = field(formData, "id");
    const title = field(formData, "title");
    const description = field(formData, "description");

    if (!title) throw new Error("Captura el titulo del incidente.");
    if (!description) throw new Error("Captura la descripcion del incidente.");

    const supabase = await createClient();
    const incident = await incidentForAction(supabase, id);
    await assertCanManageCompany(incident.company_id);

    const status = incidentStatus(formData);
    const isResolved = status === "resolved" || status === "canceled";
    const { error } = await supabase
      .from("location_incidents")
      .update({
        assignee_name: optionalField(formData, "assigneeName"),
        category: incidentCategory(formData),
        description,
        priority: incidentPriority(formData),
        resolved_at: isResolved ? new Date().toISOString() : null,
        resolved_by: isResolved ? user.id : null,
        resolution_summary: isResolved ? optionalField(formData, "resolutionSummary") : null,
        status,
        title,
      })
      .eq("id", incident.id);

    if (error) throw error;

    const note = optionalField(formData, "note");
    if (note) {
      const { error: noteError } = await supabase
        .from("location_incident_notes")
        .insert({
          author_id: user.id,
          body: note,
          company_id: incident.company_id,
          event_type: isResolved ? "resolution" : "note",
          incident_id: incident.id,
          location_id: incident.location_id,
        });

      if (noteError) throw noteError;
    }

    await syncLocationIncidentStatus(supabase, {
      companyId: incident.company_id,
      locationId: incident.location_id,
    });
    await revalidateIncidentPaths(supabase, { companyId: incident.company_id });
    finish(path, "success", "Incidente actualizado.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo actualizar el incidente."));
  }
}

export async function resolveLocationIncident(formData: FormData) {
  formData.set("status", "resolved");
  await updateLocationIncident(formData);
}

export async function cancelLocationIncident(formData: FormData) {
  formData.set("status", "canceled");
  await updateLocationIncident(formData);
}

export async function addLocationIncidentNote(formData: FormData) {
  const path = returnPath(formData, "/dashboard/incidents");

  try {
    const user = await requireUser(path);
    const incidentId = field(formData, "incidentId");
    const body = field(formData, "body");

    if (!body) throw new Error("Captura un comentario.");

    const supabase = await createClient();
    const incident = await incidentForAction(supabase, incidentId);
    const permission = await assertCanCommentIncidents(supabase, incident.company_id);

    if (!permission.ok) throw new Error(permission.message);

    const { data: note, error } = await supabase
      .from("location_incident_notes")
      .insert({
        author_id: user.id,
        body,
        company_id: incident.company_id,
        event_type: "note",
        incident_id: incident.id,
        location_id: incident.location_id,
      })
      .select("id")
      .single();

    if (error) throw error;

    await uploadIncidentImages(supabase, {
      caption: optionalField(formData, "caption"),
      companyId: incident.company_id,
      files: incidentImageFiles(formData),
      incidentId: incident.id,
      locationId: incident.location_id,
      noteId: note.id,
      uploadedBy: user.id,
    });
    await revalidateIncidentPaths(supabase, { companyId: incident.company_id });
    finish(path, "success", "Comentario agregado.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo agregar el comentario."));
  }
}

export async function uploadIncidentAttachment(formData: FormData) {
  const path = returnPath(formData, "/dashboard/incidents");

  try {
    const user = await requireUser(path);
    const incidentId = field(formData, "incidentId");
    const supabase = await createClient();
    const incident = await incidentForAction(supabase, incidentId);
    await assertCanManageCompany(incident.company_id);

    const files = incidentImageFiles(formData).concat(incidentImageFiles(formData, "file"));

    if (!files.length) throw new Error("Selecciona al menos una imagen.");

    await uploadIncidentImages(supabase, {
      caption: optionalField(formData, "caption"),
      companyId: incident.company_id,
      files,
      incidentId: incident.id,
      locationId: incident.location_id,
      uploadedBy: user.id,
    });
    await revalidateIncidentPaths(supabase, { companyId: incident.company_id });
    finish(path, "success", "Imagen subida.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo subir la imagen."));
  }
}

export async function deleteIncidentAttachment(formData: FormData) {
  const path = returnPath(formData, "/dashboard/incidents");

  try {
    await requireUser(path);
    const id = field(formData, "id");
    const supabase = await createClient();
    const { data: attachment, error } = await supabase
      .from("location_incident_attachments")
      .select("id, bucket, company_id, storage_path")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    if (!attachment) throw new Error("No se encontro la imagen.");

    await assertCanManageCompany(attachment.company_id);

    const { error: removeError } = await supabase.storage
      .from(INCIDENT_IMAGE_BUCKET)
      .remove([attachment.storage_path]);

    if (removeError) throw removeError;

    const { error: updateError } = await supabase
      .from("location_incident_attachments")
      .update({ status: "deleted" })
      .eq("id", attachment.id);

    if (updateError) throw updateError;

    await revalidateIncidentPaths(supabase, { companyId: attachment.company_id });
    finish(path, "success", "Imagen eliminada.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", errorMessage(error, "No se pudo eliminar la imagen."));
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
    unstable_rethrow(error);
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
    unstable_rethrow(error);
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
    finish(path, "success", "Campaña asignada a ubicación.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo asignar la campaña.");
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
    finish(path, "success", "Campaña asignada a pantalla.");
  } catch (error) {
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo asignar la campaña.");
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
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la asignación.");
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
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar la asignación.");
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
    unstable_rethrow(error);
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
    unstable_rethrow(error);
    finish(path, "error", error instanceof Error ? error.message : "No se pudo eliminar el archivo.");
  }
}
