import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SCALE, STATUS_LABELS } from "@/lib/risk";

const fieldClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

type Member = { id: string; email: string };

type RiskDefaults = {
  title?: string;
  description?: string | null;
  category?: string | null;
  process?: string | null;
  status?: string;
  ownerMembershipId?: string | null;
  inherentProbability?: number;
  inherentImpact?: number;
  residualProbability?: number;
  residualImpact?: number;
  targetProbability?: number;
  targetImpact?: number;
  exposureAmount?: string | null;
};

function ScalePair({
  label,
  probabilityName,
  impactName,
  defaultProbability,
  defaultImpact,
}: {
  label: string;
  probabilityName: string;
  impactName: string;
  defaultProbability?: number;
  defaultImpact?: number;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Probabilité (1-5)</Label>
          <select
            name={probabilityName}
            defaultValue={defaultProbability ?? 1}
            className={fieldClass}
          >
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Impact (1-5)</Label>
          <select name={impactName} defaultValue={defaultImpact ?? 1} className={fieldClass}>
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function RiskForm({
  action,
  members,
  defaults,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  members: Member[];
  defaults?: RiskDefaults;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Titre du risque</Label>
          <Input id="title" name="title" required defaultValue={defaults?.title} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={defaults?.description ?? ""}
            className={fieldClass + " h-auto py-2"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Input id="category" name="category" defaultValue={defaults?.category ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="process">Processus</Label>
          <Input id="process" name="process" defaultValue={defaults?.process ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerMembershipId">Responsable</Label>
          <select
            id="ownerMembershipId"
            name="ownerMembershipId"
            defaultValue={defaults?.ownerMembershipId ?? ""}
            className={fieldClass}
          >
            <option value="">Non assigné</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.email}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "OPEN"}
            className={fieldClass}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exposureAmount">Exposition financière (€)</Label>
          <Input
            id="exposureAmount"
            name="exposureAmount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults?.exposureAmount ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ScalePair
          label="Risque inhérent"
          probabilityName="inherentProbability"
          impactName="inherentImpact"
          defaultProbability={defaults?.inherentProbability}
          defaultImpact={defaults?.inherentImpact}
        />
        <ScalePair
          label="Risque résiduel"
          probabilityName="residualProbability"
          impactName="residualImpact"
          defaultProbability={defaults?.residualProbability}
          defaultImpact={defaults?.residualImpact}
        />
        <ScalePair
          label="Risque cible"
          probabilityName="targetProbability"
          impactName="targetImpact"
          defaultProbability={defaults?.targetProbability}
          defaultImpact={defaults?.targetImpact}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
