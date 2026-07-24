import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  criticality,
  levelFor,
  STATUS_LABELS,
  CONTROL_TYPE_LABELS,
  ACTION_STATUS_LABELS,
} from "@/lib/risk";
import { createControl, deleteControl } from "@/app/actions/control";
import { createActionPlan, deleteActionPlan } from "@/app/actions/actionPlan";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

function ScoreBox({ label, probability, impact }: { label: string; probability: number; impact: number }) {
  const score = criticality(probability, impact);
  const level = levelFor(score);
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">
        {probability} × {impact} ={" "}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${level.className}`}>
          {level.label} ({score})
        </span>
      </p>
    </div>
  );
}

export default async function RiskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { membership } = await requireMembership();
  const { id } = await params;

  const risk = await prisma.risk.findFirst({
    where: { id, orgId: membership.orgId },
    include: {
      ownerMembership: { include: { profile: true } },
      controls: { orderBy: { createdAt: "desc" } },
      actionPlans: {
        include: { ownerMembership: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!risk) redirect("/dashboard/risks");

  const memberships = await prisma.membership.findMany({
    where: { orgId: membership.orgId },
    include: { profile: true },
  });

  const addControl = createControl.bind(null, risk.id);
  const addAction = createActionPlan.bind(null, risk.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{risk.title}</h1>
          <p className="text-muted-foreground">
            {risk.category ?? "Sans catégorie"} · {STATUS_LABELS[risk.status]} ·{" "}
            {risk.ownerMembership?.profile.email ?? "Non assigné"}
          </p>
        </div>
        <Link
          href={`/dashboard/risks/${risk.id}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          Modifier le risque
        </Link>
      </div>

      {risk.description && <p className="text-sm">{risk.description}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <ScoreBox label="Inhérent" probability={risk.inherentProbability} impact={risk.inherentImpact} />
        <ScoreBox label="Résiduel" probability={risk.residualProbability} impact={risk.residualImpact} />
        <ScoreBox label="Cible" probability={risk.targetProbability} impact={risk.targetImpact} />
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositifs de maîtrise ({risk.controls.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {risk.controls.length > 0 ? (
            <div className="space-y-2">
              {risk.controls.map((control) => (
                <div
                  key={control.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{control.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {CONTROL_TYPE_LABELS[control.type]} · Efficacité {control.efficacy}/5
                    </p>
                    {control.description && <p className="mt-1 text-sm">{control.description}</p>}
                  </div>
                  <form action={deleteControl.bind(null, risk.id, control.id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      Supprimer
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun dispositif pour l&apos;instant.</p>
          )}

          <form action={addControl} className="space-y-3 rounded-lg border border-dashed p-3">
            <p className="text-sm font-medium">Ajouter un dispositif</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="control-name">Nom</Label>
                <Input id="control-name" name="name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="control-type">Type</Label>
                <select id="control-type" name="type" className={fieldClass}>
                  {Object.entries(CONTROL_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="control-efficacy">Efficacité (1-5)</Label>
                <select id="control-efficacy" name="efficacy" defaultValue="3" className={fieldClass}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="control-description">Description</Label>
                <Input id="control-description" name="description" />
              </div>
            </div>
            <Button type="submit" size="sm">
              Ajouter le dispositif
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Action plans */}
      <Card>
        <CardHeader>
          <CardTitle>Plans d&apos;action ({risk.actionPlans.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {risk.actionPlans.length > 0 ? (
            <div className="space-y-2">
              {risk.actionPlans.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ACTION_STATUS_LABELS[action.status]} · {action.percentComplete}% ·{" "}
                      {action.ownerMembership?.profile.email ?? "Non assigné"}
                      {action.dueDate
                        ? ` · échéance ${action.dueDate.toLocaleDateString("fr-FR")}`
                        : ""}
                    </p>
                  </div>
                  <form action={deleteActionPlan.bind(null, risk.id, action.id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      Supprimer
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun plan d&apos;action pour l&apos;instant.</p>
          )}

          <form action={addAction} className="space-y-3 rounded-lg border border-dashed p-3">
            <p className="text-sm font-medium">Ajouter un plan d&apos;action</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="action-title">Intitulé</Label>
                <Input id="action-title" name="title" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="action-owner">Responsable</Label>
                <select id="action-owner" name="ownerMembershipId" className={fieldClass}>
                  <option value="">Non assigné</option>
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.profile.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="action-due">Échéance</Label>
                <Input id="action-due" name="dueDate" type="date" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="action-status">Statut</Label>
                <select id="action-status" name="status" className={fieldClass}>
                  {Object.entries(ACTION_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="action-percent">Avancement (%)</Label>
                <Input
                  id="action-percent"
                  name="percentComplete"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="0"
                />
              </div>
            </div>
            <Button type="submit" size="sm">
              Ajouter le plan d&apos;action
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
