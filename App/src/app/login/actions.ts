"use server";

import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

function loginError(message: string, next: string) {
  redirect(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(formData.get("next"));

  if (!email || !password) {
    loginError("Usuario/email y contraseña son requeridos.", next);
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
