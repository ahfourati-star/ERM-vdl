import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Priorisation } from "@/components/dashboard/Priorisation";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Priorisation risks={data} who={membership.profile.email} />;
}
