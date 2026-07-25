"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { currentPeriod } from "@/lib/period";
import { levelFor } from "@/lib/risk";

/**
 * "Closes" the current quarter: stores a snapshot of every current risk's
 * residual criticality and exposure under the current quarter label. Re-running
 * in the same quarter overwrites that quarter's snapshot. Admin only.
 */
export async function closeQuarter() {
  const { membership } = await requireMembership();
  if (membership.role !== "ADMIN") {
    redirect("/dashboard/tendance?error=Réservé aux administrateurs");
  }

  const risks = await prisma.risk.findMany({
    where: { orgId: membership.orgId },
    select: { id: true, residualProbability: true, residualImpact: true, exposureAmount: true },
  });

  const { period, periodOrder } = currentPeriod();

  await prisma.$transaction([
    prisma.riskSnapshot.deleteMany({ where: { orgId: membership.orgId, period } }),
    prisma.riskSnapshot.createMany({
      data: risks.map((r) => {
        const cr = r.residualProbability * r.residualImpact;
        return {
          orgId: membership.orgId,
          riskId: r.id,
          period,
          periodOrder,
          cr,
          exposure: r.exposureAmount,
          level: levelFor(cr).label,
        };
      }),
    }),
  ]);

  revalidatePath("/dashboard/tendance");
  redirect("/dashboard/tendance?saved=1");
}
