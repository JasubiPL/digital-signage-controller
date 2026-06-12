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
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("status", "active")
    .order("slug", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (companyError || !company) {
    redirect("/dashboard?error=no-company-available");
  }

  const { error } = await supabase.from("user_companies").insert({
    user_id: user.id,
    company_id: company.id,
    role: "admin",
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

