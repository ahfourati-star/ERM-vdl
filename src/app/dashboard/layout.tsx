import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { membership } = await requireMembership();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {membership.organization.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{membership.organization.name}</p>
              <p className="text-xs text-muted-foreground">
                {membership.profile.email} ·{" "}
                {membership.role === "ADMIN" ? "Administrateur" : "Membre"}
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-medium text-foreground/80 hover:text-primary">
              Accueil
            </Link>
            <Link
              href="/dashboard/risks"
              className="font-medium text-foreground/80 hover:text-primary"
            >
              Risques
            </Link>
            <Link
              href="/dashboard/matrix"
              className="font-medium text-foreground/80 hover:text-primary"
            >
              Matrice
            </Link>
            {membership.role === "ADMIN" && (
              <Link
                href="/dashboard/invite"
                className="font-medium text-foreground/80 hover:text-primary"
              >
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
