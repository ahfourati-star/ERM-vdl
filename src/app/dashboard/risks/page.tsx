import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { criticality, levelFor, STATUS_LABELS } from "@/lib/risk";
import { deleteRisk } from "@/app/actions/risk";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function RisksPage() {
  const { membership } = await requireMembership();

  const risks = await prisma.risk.findMany({
    where: { orgId: membership.orgId },
    include: { ownerMembership: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Registre des risques</h1>
          <p className="text-muted-foreground">{risks.length} risque(s) enregistré(s)</p>
        </div>
        <Link href="/dashboard/risks/new" className={buttonVariants()}>
          + Ajouter un risque
        </Link>
      </div>

      {risks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun risque pour l&apos;instant. Ajoutez le premier avec le bouton ci-dessus.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Titre</th>
                <th className="px-4 py-2 font-medium">Catégorie</th>
                <th className="px-4 py-2 font-medium">Responsable</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Criticité résiduelle</th>
                <th className="px-4 py-2 font-medium">Exposition</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => {
                const score = criticality(risk.residualProbability, risk.residualImpact);
                const level = levelFor(score);
                return (
                  <tr key={risk.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{risk.title}</td>
                    <td className="px-4 py-2 text-muted-foreground">{risk.category ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {risk.ownerMembership?.profile.email ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {STATUS_LABELS[risk.status]}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${level.className}`}
                      >
                        {level.label} ({score})
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {risk.exposureAmount ? `${risk.exposureAmount} €` : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/risks/${risk.id}/edit`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Modifier
                        </Link>
                        <form action={deleteRisk.bind(null, risk.id)}>
                          <Button type="submit" variant="destructive" size="sm">
                            Supprimer
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
