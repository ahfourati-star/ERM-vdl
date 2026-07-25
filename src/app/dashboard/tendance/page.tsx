import { requireMembership } from "@/lib/auth";
import { getOrgRisks, getOrgHistory } from "@/lib/risk-data";
import { Tendance } from "@/components/dashboard/Tendance";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { membership } = await requireMembership();
  const [data, history] = await Promise.all([
    getOrgRisks(membership.orgId),
    getOrgHistory(membership.orgId),
  ]);
  const sp = await searchParams;
  const notice = sp.saved ? "saved" : sp.error ? "error" : null;

  return (
    <Tendance
      risks={data}
      history={history}
      who={membership.profile.email}
      isAdmin={membership.role === "ADMIN"}
      notice={notice}
    />
  );
}
