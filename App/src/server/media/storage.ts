import type { SupabaseClient } from "@supabase/supabase-js";

export const CAMPAIGN_MEDIA_BUCKET = "campaign-media";
export const CAMPAIGN_MEDIA_MAX_BYTES = 50 * 1024 * 1024;
export const CAMPAIGN_MEDIA_SIGNED_URL_SECONDS = 5 * 60;
export const INCIDENT_IMAGE_BUCKET = "incident-images";
export const INCIDENT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const INCIDENT_IMAGE_TOTAL_MAX_BYTES = 30 * 1024 * 1024;
export const INCIDENT_IMAGE_SIGNED_URL_SECONDS = 5 * 60;

const allowedMimeExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["application/pdf", "pdf"],
]);

const allowedIncidentImageExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function getAllowedMimeTypes() {
  return Array.from(allowedMimeExtensions.keys());
}

export function getExtensionForMimeType(mimeType: string) {
  return allowedMimeExtensions.get(mimeType);
}

export function getAllowedIncidentImageMimeTypes() {
  return Array.from(allowedIncidentImageExtensions.keys());
}

export function getIncidentImageExtensionForMimeType(mimeType: string) {
  return allowedIncidentImageExtensions.get(mimeType);
}

export function buildCampaignMediaPath(input: {
  campaignId: string;
  companyId: string;
  extension: string;
  fileId: string;
}) {
  return `${input.companyId}/${input.campaignId}/${input.fileId}.${input.extension}`;
}

export function buildIncidentImagePath(input: {
  companyId: string;
  extension: string;
  fileId: string;
  incidentId: string;
  locationId: string;
}) {
  return `${input.companyId}/${input.locationId}/${input.incidentId}/${input.fileId}.${input.extension}`;
}

export async function assertCanManageCompanyMedia(
  supabase: SupabaseClient,
  companyId: string,
) {
  const { data, error } = await supabase.rpc("has_company_role", {
    _allowed_roles: ["admin"],
    _company_id: companyId,
  });

  if (error || data !== true) {
    return {
      ok: false,
      message: error?.message ?? "No tienes permisos para administrar archivos de esta compañía.",
    };
  }

  return {
    ok: true,
    message: "Permisos validados.",
  };
}

export async function assertCampaignBelongsToCompany(
  supabase: SupabaseClient,
  input: {
    campaignId: string;
    companyId: string;
  },
) {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", input.campaignId)
    .eq("company_id", input.companyId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: error?.message ?? "La campaña no existe o no pertenece a la compañía indicada.",
    };
  }

  return {
    ok: true,
    message: "Campaña validada.",
  };
}

export async function assertCanAccessIncidents(
  supabase: SupabaseClient,
  companyId: string,
) {
  const { data, error } = await supabase.rpc("can_access_incidents", {
    _company_id: companyId,
  });

  if (error || data !== true) {
    return {
      ok: false,
      message: error?.message ?? "No tienes permisos para consultar incidentes de esta compañía.",
    };
  }

  return {
    ok: true,
    message: "Permisos validados.",
  };
}

export async function assertCanCommentIncidents(
  supabase: SupabaseClient,
  companyId: string,
) {
  const { data, error } = await supabase.rpc("can_comment_incidents", {
    _company_id: companyId,
  });

  if (error || data !== true) {
    return {
      ok: false,
      message: error?.message ?? "No tienes permisos para comentar incidentes de esta compañía.",
    };
  }

  return {
    ok: true,
    message: "Permisos validados.",
  };
}
