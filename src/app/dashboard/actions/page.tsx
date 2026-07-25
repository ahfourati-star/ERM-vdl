import { requireMembership } from "@/lib/auth";
import { getOrgRisks } from "@/lib/risk-data";
import { ActionsReport } from "@/components/dashboard/ActionsReport";

export default async function Page() {
  const { membership } = await requireMembership();
  const data = await getOrgRisks(membership.orgId);
  return <ActionsReport risks={data} who={membership.profile.email} />;
}
