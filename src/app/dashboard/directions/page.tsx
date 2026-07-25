import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Directions } from "@/components/dashboard/Directions";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Directions risks={data} who={membership.profile.email} />;
}
