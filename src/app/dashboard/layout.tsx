import "./dashboard.css";
import { requireMembership } from "@/lib/auth";
import { Rail } from "@/components/dashboard/Rail";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { membership } = await requireMembership();

  return (
    <div className="rk">
      <div className="app">
        <Rail orgName={membership.organization.name} isAdmin={membership.role === "ADMIN"} />
        <div className="main">{children}</div>
      </div>
    </div>
  );
}
