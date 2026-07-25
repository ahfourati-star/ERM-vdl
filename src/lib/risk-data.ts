import { prisma } from "@/lib/db";
import type { RiskDTO, HistoryPoint } from "@/components/dashboard/types";

/** All snapshot points for an org, ordered chronologically. */
export async function getOrgHistory(orgId: string): Promise<HistoryPoint[]> {
  const snaps = await prisma.riskSnapshot.findMany({
    where: { orgId },
    orderBy: { periodOrder: "asc" },
  });
  return snaps.map((s) => ({
    period: s.period,
    periodOrder: s.periodOrder,
    riskId: s.riskId,
    cr: s.cr,
    exposure: Number(s.exposure ?? 0),
  }));
}

/**
 * Fetches every risk for one organisation and shapes it into the plain
 * RiskDTO the dashboard components expect. Used by all report pages so the
 * query + mapping live in a single place.
 */
export async function getOrgRisks(orgId: string): Promise<RiskDTO[]> {
  const risks = await prisma.risk.findMany({
    where: { orgId },
    include: {
      ownerMembership: { include: { profile: true } },
      controls: true,
      actionPlans: { include: { ownerMembership: { include: { profile: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return risks.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category || "Non catégorisé",
    process: r.process,
    owner: r.ownerMembership?.profile.email || "Non assigné",
    status: r.status,
    cause: r.description,
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
      overdue: a.dueDate ? a.dueDate < now && a.status !== "DONE" : false,
    })),
  }));
}
