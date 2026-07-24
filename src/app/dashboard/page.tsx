import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { criticality, levelFor } from "@/lib/risk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { membership } = await requireMembership();

  const risks = await prisma.risk.findMany({
    where: { orgId: membership.orgId },
    select: { residualProbability: true, residualImpact: true },
  });

  const critical = risks.filter(
    (r) => levelFor(criticality(r.residualProbability, r.residualImpact)).key === "CRITIQUE"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bienvenue chez {membership.organization.name}</h1>
        <p className="text-muted-foreground">Voici un aperçu de votre registre des risques.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risques enregistrés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{risks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risques critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{critical}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3 text-sm">
        <Link href="/dashboard/risks" className="text-primary hover:underline">
          Voir le registre des risques →
        </Link>
        <Link href="/dashboard/matrix" className="text-primary hover:underline">
          Voir la matrice 5x5 →
        </Link>
      </div>
    </div>
  );
}
