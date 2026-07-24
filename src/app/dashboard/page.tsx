import { requireMembership } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { membership } = await requireMembership();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bienvenue chez {membership.organization.name}</h1>
        <p className="text-muted-foreground">
          Votre espace est prêt. Le registre des risques arrive à la prochaine étape.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Risques enregistrés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">0</p>
        </CardContent>
      </Card>
    </div>
  );
}
