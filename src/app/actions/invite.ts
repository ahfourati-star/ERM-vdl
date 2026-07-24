"use server";

import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function createInvitation(formData: FormData) {
  const { membership } = await requireMembership();
  if (membership.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    redirect("/dashboard/invite?error=Email requis");
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      orgId: membership.orgId,
      email,
      invitedBy: membership.profileId,
      expiresAt,
    },
  });

  redirect("/dashboard/invite");
}

export async function acceptInvitation(token: string, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    redirect(`/invite/${token}?error=${encodeURIComponent("Invitation invalide ou expirée.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: invitation.email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error || !data.user) {
    redirect(`/invite/${token}?error=${encodeURIComponent(error?.message ?? "Erreur")}`);
  }

  await prisma.profile.upsert({
    where: { id: data.user.id },
    update: { email: invitation.email },
    create: { id: data.user.id, email: invitation.email },
  });

  await prisma.membership.upsert({
    where: { orgId_profileId: { orgId: invitation.orgId, profileId: data.user.id } },
    update: {},
    create: {
      orgId: invitation.orgId,
      profileId: data.user.id,
      role: invitation.role,
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/auth/check-email");
}
