import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function requireMembership() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { profileId: user.id },
    include: { organization: true, profile: true },
  });

  if (!membership) redirect("/login");

  return { user, membership };
}
