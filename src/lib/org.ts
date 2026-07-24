import { prisma } from "@/lib/db";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "organisation"
  );
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let attempt = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

/**
 * Called right after a user has a valid Supabase session (either immediately
 * after signup, or after confirming their email). Creates their Profile and,
 * on first login only, a brand-new Organization where they are the admin.
 */
export async function ensureBootstrapped(user: SupabaseUser) {
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: { email: user.email ?? "" },
    create: { id: user.id, email: user.email ?? "" },
    include: { memberships: true },
  });

  if (profile.memberships.length > 0) {
    return profile.memberships[0];
  }

  const orgName =
    (user.user_metadata?.orgName as string | undefined)?.trim() || "Mon organisation";
  const slug = await uniqueSlug(orgName);

  const organization = await prisma.organization.create({
    data: { name: orgName, slug },
  });

  return prisma.membership.create({
    data: {
      orgId: organization.id,
      profileId: profile.id,
      role: "ADMIN",
    },
  });
}
