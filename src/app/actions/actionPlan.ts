"use server";

import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ACTION_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "DONE"] as const;

function parseStatus(value: FormDataEntryValue | null) {
  const s = String(value ?? "NOT_STARTED");
  return ACTION_STATUSES.includes(s as (typeof ACTION_STATUSES)[number])
    ? (s as (typeof ACTION_STATUSES)[number])
    : "NOT_STARTED";
}

function parsePercent(value: FormDataEntryValue | null) {
  const n = parseInt(String(value ?? "0"), 10);
  return Math.min(100, Math.max(0, Number.isNaN(n) ? 0 : n));
}

async function assertRiskInOrg(riskId: string, orgId: string) {
  const risk = await prisma.risk.findFirst({ where: { id: riskId, orgId } });
  if (!risk) redirect("/dashboard/risks");
}

export async function createActionPlan(riskId: string, formData: FormData) {
  const { membership } = await requireMembership();
  await assertRiskInOrg(riskId, membership.orgId);

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/dashboard/risks/${riskId}`);

  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const ownerId = String(formData.get("ownerMembershipId") ?? "").trim();

  await prisma.actionPlan.create({
    data: {
      orgId: membership.orgId,
      riskId,
      title,
      status: parseStatus(formData.get("status")),
      percentComplete: parsePercent(formData.get("percentComplete")),
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      ownerMembershipId: ownerId || null,
    },
  });

  redirect(`/dashboard/risks/${riskId}`);
}

export async function deleteActionPlan(riskId: string, actionId: string) {
  const { membership } = await requireMembership();
  await prisma.actionPlan.deleteMany({ where: { id: actionId, orgId: membership.orgId } });
  redirect(`/dashboard/risks/${riskId}`);
}
