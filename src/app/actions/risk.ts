"use server";

import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STATUS_VALUES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

function parseStatus(value: FormDataEntryValue | null) {
  const s = String(value ?? "OPEN");
  return STATUS_VALUES.includes(s as (typeof STATUS_VALUES)[number])
    ? (s as (typeof STATUS_VALUES)[number])
    : "OPEN";
}

function parseScale(formData: FormData, name: string) {
  const n = parseInt(String(formData.get(name) ?? ""), 10);
  return Math.min(5, Math.max(1, Number.isNaN(n) ? 1 : n));
}

function riskDataFromForm(formData: FormData) {
  const exposureRaw = String(formData.get("exposureAmount") ?? "").trim();
  const ownerMembershipId = String(formData.get("ownerMembershipId") ?? "").trim();

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    process: String(formData.get("process") ?? "").trim() || null,
    status: parseStatus(formData.get("status")),
    ownerMembershipId: ownerMembershipId || null,
    inherentProbability: parseScale(formData, "inherentProbability"),
    inherentImpact: parseScale(formData, "inherentImpact"),
    residualProbability: parseScale(formData, "residualProbability"),
    residualImpact: parseScale(formData, "residualImpact"),
    targetProbability: parseScale(formData, "targetProbability"),
    targetImpact: parseScale(formData, "targetImpact"),
    exposureAmount: exposureRaw ? exposureRaw : null,
  };
}

export async function createRisk(formData: FormData) {
  const { membership } = await requireMembership();

  const data = riskDataFromForm(formData);
  if (!data.title) {
    redirect("/dashboard/risks/new?error=Le titre est requis");
  }

  await prisma.risk.create({
    data: { ...data, orgId: membership.orgId },
  });

  redirect("/dashboard/risks");
}

export async function updateRisk(riskId: string, formData: FormData) {
  const { membership } = await requireMembership();

  const existing = await prisma.risk.findFirst({
    where: { id: riskId, orgId: membership.orgId },
  });
  if (!existing) redirect("/dashboard/risks");

  const data = riskDataFromForm(formData);
  if (!data.title) {
    redirect(`/dashboard/risks/${riskId}/edit?error=Le titre est requis`);
  }

  await prisma.risk.update({
    where: { id: riskId },
    data,
  });

  redirect("/dashboard/risks");
}

export async function deleteRisk(riskId: string) {
  const { membership } = await requireMembership();
  await prisma.risk.deleteMany({ where: { id: riskId, orgId: membership.orgId } });
  redirect("/dashboard/risks");
}
