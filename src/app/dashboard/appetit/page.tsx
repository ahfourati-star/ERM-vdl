import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { Appetit } from "@/components/dashboard/Appetit";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <Appetit risks={data} who={membership.profile.email} />;
}
