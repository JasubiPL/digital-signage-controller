import { ApiError } from "./errors";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function requireString(
  input: Record<string, unknown>,
  field: string,
  options: {
    maxLength?: number;
  } = {},
) {
  const value = input[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${field} es requerido.`);
  }

  const trimmed = value.trim();

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new ApiError(400, `${field} no puede exceder ${options.maxLength} caracteres.`);
  }

  return trimmed;
}

export function optionalString(
  input: Record<string, unknown>,
  field: string,
  options: {
    maxLength?: number;
    nullable?: boolean;
  } = {},
) {
  const value = input[field];

  if (value === undefined) {
    return undefined;
  }

  if (value === null && options.nullable) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${field} debe ser texto.`);
  }

  const trimmed = value.trim();

  if (!trimmed && options.nullable) {
    return null;
  }

  if (!trimmed) {
    return undefined;
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new ApiError(400, `${field} no puede exceder ${options.maxLength} caracteres.`);
  }

  return trimmed;
}

export function requireUuid(input: Record<string, unknown>, field: string) {
  const value = requireString(input, field);

  if (!uuidPattern.test(value)) {
    throw new ApiError(400, `${field} debe ser un UUID valido.`);
  }

  return value;
}

export function optionalUuid(input: Record<string, unknown>, field: string) {
  const value = optionalString(input, field);

  if (value === undefined || value === null) {
    return undefined;
  }

  if (!uuidPattern.test(value)) {
    throw new ApiError(400, `${field} debe ser un UUID valido.`);
  }

  return value;
}

export function validateUuid(value: string, label = "id") {
  if (!uuidPattern.test(value)) {
    throw new ApiError(400, `${label} debe ser un UUID valido.`);
  }

  return value;
}

export function optionalDate(input: Record<string, unknown>, field: string) {
  const value = optionalString(input, field, { nullable: true });

  if (value === undefined || value === null) {
    return value;
  }

  if (!datePattern.test(value)) {
    throw new ApiError(400, `${field} debe tener formato YYYY-MM-DD.`);
  }

  return value;
}

export function optionalEnum<const T extends readonly string[]>(
  input: Record<string, unknown>,
  field: string,
  allowed: T,
) {
  const value = optionalString(input, field);

  if (value === undefined || value === null) {
    return undefined;
  }

  if (!allowed.includes(value)) {
    throw new ApiError(400, `${field} debe ser uno de: ${allowed.join(", ")}.`);
  }

  return value as T[number];
}

export function requireEnum<const T extends readonly string[]>(
  input: Record<string, unknown>,
  field: string,
  allowed: T,
) {
  const value = requireString(input, field);

  if (!allowed.includes(value)) {
    throw new ApiError(400, `${field} debe ser uno de: ${allowed.join(", ")}.`);
  }

  return value as T[number];
}

export function optionalSlug(input: Record<string, unknown>, field: string) {
  const value = optionalString(input, field, { maxLength: 80 });

  if (value === undefined || value === null) {
    return undefined;
  }

  if (!slugPattern.test(value)) {
    throw new ApiError(400, `${field} debe ser un slug valido.`);
  }

  return value;
}

export function getQueryUuid(searchParams: URLSearchParams, field: string) {
  const value = searchParams.get(field);

  if (!value) {
    return null;
  }

  return validateUuid(value, field);
}

export function getQuerySlug(searchParams: URLSearchParams, field: string) {
  const value = searchParams.get(field);

  if (!value) {
    return null;
  }

  if (!slugPattern.test(value)) {
    throw new ApiError(400, `${field} debe ser un slug valido.`);
  }

  return value;
}

