// Level thresholds and colors mirror the reference dashboard exactly:
// score = probability × impact; Faible ≤4, Moyen 5-9, Élevé 10-14, Critique 15-25.
export const RISK_LEVELS = [
  { key: "FAIBLE", label: "Faible", min: 1, max: 4, solid: "#63BE7B", fill: "#C6EFCE" },
  { key: "MOYEN", label: "Moyen", min: 5, max: 9, solid: "#F2C94C", fill: "#FFEB9C" },
  { key: "ELEVE", label: "Élevé", min: 10, max: 14, solid: "#EE8B34", fill: "#FCD5B4" },
  { key: "CRITIQUE", label: "Critique", min: 15, max: 25, solid: "#E15759", fill: "#FFC7CE" },
] as const;

export const LEVEL_ORDER = ["Faible", "Moyen", "Élevé", "Critique"] as const;

export function criticality(probability: number, impact: number) {
  return probability * impact;
}

export function levelFor(score: number) {
  return RISK_LEVELS.find((l) => score >= l.min && score <= l.max) ?? RISK_LEVELS[0];
}

export function fmtEuro(n: number) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " M€";
  if (n >= 1e3) return Math.round(n / 1e3) + " k€";
  return n + " €";
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
