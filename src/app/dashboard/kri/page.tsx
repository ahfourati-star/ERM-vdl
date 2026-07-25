import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Kri } from "@/components/dashboard/Kri";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Kri risks={data} who={membership.profile.email} />;
}
