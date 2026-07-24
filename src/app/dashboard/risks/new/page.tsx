import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRisk } from "@/app/actions/risk";
import { RiskForm } from "@/components/risk-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewRiskPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { membership } = await requireMembership();
  const { error } = await searchParams;

  const memberships = await prisma.membership.findMany({
    where: { orgId: membership.orgId },
    include: { profile: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ajouter un risque</h1>
      <Card>
        <CardHeader>
          <CardTitle>Détails du risque</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskForm
            action={createRisk}
            members={memberships.map((m) => ({ id: m.id, email: m.profile.email }))}
            error={error}
            submitLabel="Créer le risque"
          />
        </CardContent>
      </Card>
    </div>
  );
}
