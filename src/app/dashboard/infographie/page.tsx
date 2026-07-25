import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Infographie } from "@/components/dashboard/Infographie";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Infographie risks={data} who={membership.profile.email} />;
}
