import { getCurrentUser } from "@/server/auth/session";

import { ApiError } from "./errors";

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(401, "Sesion requerida.");
  }

  return user;
}

export async function readJsonObject(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ApiError(400, "El cuerpo debe ser JSON valido.");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "El cuerpo debe ser un objeto JSON.");
  }

  return payload as Record<string, unknown>;
}

