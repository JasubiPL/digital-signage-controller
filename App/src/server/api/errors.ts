import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function jsonError(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Error interno del servidor.";
  console.error("[api]", message);

  return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
}

