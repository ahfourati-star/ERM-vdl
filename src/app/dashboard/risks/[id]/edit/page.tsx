import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateRisk } from "@/app/actions/risk";
import { RiskForm } from "@/components/risk-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditRiskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { membership } = await requireMembership();
  const { id } = await params;
  const { error } = await searchParams;

  const risk = await prisma.risk.findFirst({ where: { id, orgId: membership.orgId } });
  if (!risk) redirect("/dashboard/risks");

  const memberships = await prisma.membership.findMany({
    where: { orgId: membership.orgId },
    include: { profile: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Modifier le risque</h1>
      <Card>
        <CardHeader>
          <CardTitle>Détails du risque</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskForm
            action={updateRisk.bind(null, risk.id)}
            members={memberships.map((m) => ({ id: m.id, email: m.profile.email }))}
            defaults={{
              title: risk.title,
              description: risk.description,
              category: risk.category,
              process: risk.process,
              status: risk.status,
              ownerMembershipId: risk.ownerMembershipId,
              inherentProbability: risk.inherentProbability,
              inherentImpact: risk.inherentImpact,
              residualProbability: risk.residualProbability,
              residualImpact: risk.residualImpact,
              targetProbability: risk.targetProbability,
              targetImpact: risk.targetImpact,
              exposureAmount: risk.exposureAmount?.toString(),
            }}
            error={error}
            submitLabel="Enregistrer les modifications"
          />
        </CardContent>
      </Card>
    </div>
  );
}
