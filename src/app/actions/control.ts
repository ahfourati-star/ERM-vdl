"use server";

import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";

const CONTROL_TYPES = ["PREVENTIVE", "DETECTIVE", "CORRECTIVE"] as const;

function parseType(value: FormDataEntryValue | null) {
  const s = String(value ?? "PREVENTIVE");
  return CONTROL_TYPES.includes(s as (typeof CONTROL_TYPES)[number])
    ? (s as (typeof CONTROL_TYPES)[number])
    : "PREVENTIVE";
}

function parseEfficacy(value: FormDataEntryValue | null) {
  const n = parseInt(String(value ?? "3"), 10);
  return Math.min(5, Math.max(1, Number.isNaN(n) ? 3 : n));
}

async function assertRiskInOrg(riskId: string, orgId: string) {
  const risk = await prisma.risk.findFirst({ where: { id: riskId, orgId } });
  if (!risk) redirect("/dashboard/risks");
}

export async function createControl(riskId: string, formData: FormData) {
  const { membership } = await requireMembership();
  await assertRiskInOrg(riskId, membership.orgId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(`/dashboard/risks/${riskId}`);

  await prisma.control.create({
    data: {
      orgId: membership.orgId,
      riskId,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      type: parseType(formData.get("type")),
      efficacy: parseEfficacy(formData.get("efficacy")),
    },
  });

  redirect(`/dashboard/risks/${riskId}`);
}

export async function deleteControl(riskId: string, controlId: string) {
  const { membership } = await requireMembership();
  await prisma.control.deleteMany({ where: { id: controlId, orgId: membership.orgId } });
  redirect(`/dashboard/risks/${riskId}`);
}
