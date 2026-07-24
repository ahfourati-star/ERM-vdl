import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Synthese } from "@/components/dashboard/Synthese";
import type { RiskDTO } from "@/components/dashboard/types";

export default async function DashboardPage() {
  const { membership } = await requireMembership();

  const risks = await prisma.risk.findMany({
    where: { orgId: membership.orgId },
    include: {
      ownerMembership: { include: { profile: true } },
      controls: true,
      actionPlans: { include: { ownerMembership: { include: { profile: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data: RiskDTO[] = risks.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category || "Non catégorisé",
    process: r.process,
    owner: r.ownerMembership?.profile.email || "Non assigné",
    status: r.status,
    cause: r.description, // reuse description as "cause" until a dedicated field exists
    consequence: null,
    pi: r.inherentProbability,
    ii: r.inherentImpact,
    pr: r.residualProbability,
    ir: r.residualImpact,
    pt: r.targetProbability,
    it: r.targetImpact,
    expo: Number(r.exposureAmount ?? 0),
    controls: r.controls.map((c) => ({
      name: c.name,
      type: c.type,
      efficacy: c.efficacy,
      description: c.description,
    })),
    actions: r.actionPlans.map((a) => ({
      title: a.title,
      status: a.status,
      percent: a.percentComplete,
      owner: a.ownerMembership?.profile.email ?? null,
      due: a.dueDate ? a.dueDate.toLocaleDateString("fr-FR") : null,
    })),
  }));

  return <Synthese risks={data} who={membership.profile.email} />;
}
