export const RISK_LEVELS = [
  { key: "FAIBLE", label: "Faible", min: 1, max: 4, className: "bg-emerald-100 text-emerald-800" },
  { key: "MOYEN", label: "Moyen", min: 5, max: 9, className: "bg-amber-100 text-amber-800" },
  { key: "ELEVE", label: "Élevé", min: 10, max: 15, className: "bg-orange-100 text-orange-800" },
  { key: "CRITIQUE", label: "Critique", min: 16, max: 25, className: "bg-red-100 text-red-800" },
] as const;

export function criticality(probability: number, impact: number) {
  return probability * impact;
}

export function levelFor(score: number) {
  return RISK_LEVELS.find((l) => score >= l.min && score <= l.max) ?? RISK_LEVELS[0];
}

export const SCALE = [1, 2, 3, 4, 5];

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  CLOSED: "Fermé",
};

export const CONTROL_TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: "Préventif",
  DETECTIVE: "Détectif",
  CORRECTIVE: "Correctif",
};

export const ACTION_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Non démarré",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
};
