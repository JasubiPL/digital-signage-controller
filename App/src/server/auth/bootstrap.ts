"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getBootstrapState, requireUser } from "@/server/auth/session";

export async function bootstrapFirstAdmin() {
  const user = await requireUser("/dashboard");
  const profile = await ensureProfile(user);

  if (!profile.ok) {
    redirect(`/dashboard?error=${encodeURIComponent(profile.message)}`);
  }

  const state = await getBootstrapState();

  if (!state.canBootstrap) {
    redirect("/dashboard?error=bootstrap-not-available");
  }

  const supabase = await createClient();
  const { data: promoted, error } = await supabase.rpc("claim_super_admin");

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  if (promoted !== true) {
    redirect("/dashboard?error=bootstrap-not-available");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
