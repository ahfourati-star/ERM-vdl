import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Tendance } from "@/components/dashboard/Tendance";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Tendance risks={data} who={membership.profile.email} />;
}
