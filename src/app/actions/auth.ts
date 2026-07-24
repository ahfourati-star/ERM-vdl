"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureBootstrapped } from "@/lib/org";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const orgName = String(formData.get("orgName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { orgName },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session && data.user) {
    await ensureBootstrapped(data.user);
    redirect("/dashboard");
  }

  redirect("/auth/check-email");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await ensureBootstrapped(data.user);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
