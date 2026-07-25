import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Synthese } from "@/components/dashboard/Synthese";

export default async function DashboardPage() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Synthese risks={data} who={membership.profile.email} />;
}
