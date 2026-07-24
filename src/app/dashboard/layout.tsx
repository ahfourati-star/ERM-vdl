import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { membership } = await requireMembership();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="font-semibold">{membership.organization.name}</p>
            <p className="text-xs text-muted-foreground">
              {membership.profile.email} · {membership.role === "ADMIN" ? "Administrateur" : "Membre"}
            </p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Accueil
            </Link>
            {membership.role === "ADMIN" && (
              <Link href="/dashboard/invite" className="hover:underline">
                Inviter un collègue
              </Link>
            )}
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Se déconnecter
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
