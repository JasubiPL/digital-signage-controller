"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

async function getCallbackUrl(next: string) {
  const origin =
    (await headers()).get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

function loginError(message: string, next: string) {
  redirect(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(formData.get("next"));

  if (!email || !password) {
    loginError("Email y password son requeridos.", next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginError(error.message, next);
  }

  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(formData.get("next"));

  if (!email || !password) {
    loginError("Email y password son requeridos.", next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await getCallbackUrl(next),
    },
  });

  if (error) {
    loginError(error.message, next);
  }

  redirect(`/login?next=${encodeURIComponent(next)}&message=Revisa tu email para confirmar la cuenta.`);
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = sanitizeNextPath(formData.get("next"));

  if (!email) {
    loginError("Email es requerido.", next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: await getCallbackUrl(next),
    },
  });

  if (error) {
    loginError(error.message, next);
  }

  redirect(`/login?next=${encodeURIComponent(next)}&message=Te enviamos un enlace de acceso.`);
}
