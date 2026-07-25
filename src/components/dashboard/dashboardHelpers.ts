import { RISK_LEVELS, LEVEL_ORDER, levelFor, fmtEuro } from "@/lib/risk";
import { STATUS_LABELS } from "@/lib/risk";
import type { RiskDTO } from "./types";

export { fmtEuro, STATUS_LABELS, LEVEL_ORDER };

export const SOLID: Record<string, string> = Object.fromEntries(
  RISK_LEVELS.map((l) => [l.label, l.solid])
);
export const FILL: Record<string, string> = Object.fromEntries(
  RISK_LEVELS.map((l) => [l.label, l.fill])
);

export const IMP_LABEL: Record<number, string> = {
  5: "5 Critique",
  4: "4 Majeur",
  3: "3 Modéré",
  2: "2 Mineur",
  1: "1 Négligeable",
};
export const PROB_LABEL: Record<number, string> = {
  1: "1 Rare",
  2: "2 Peu prob.",
  3: "3 Possible",
  4: "4 Probable",
  5: "5 Quasi-cert.",
};

export function niveau(score: number) {
  return levelFor(score).label;
}

export function avg(a: number[]) {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
}
export function sum(a: number[]) {
  return a.reduce((s, x) => s + (Number(x) || 0), 0);
}

/** A risk enriched with computed criticalities and level labels. */
export type Computed = RiskDTO & {
  ci: number;
  cr: number;
  ct: number;
  ni: string;
  nr: string;
  nt: string;
  seuil: number;
  hors: boolean;
};

const DEFAULT_APPETITE = 9;

export function compute(risk: RiskDTO): Computed {
  const ci = risk.pi * risk.ii;
  const cr = risk.pr * risk.ir;
  const ct = risk.pt * risk.it;
  const seuil = DEFAULT_APPETITE;
  return {
    ...risk,
    ci,
    cr,
    ct,
    ni: niveau(ci),
    nr: niveau(cr),
    nt: niveau(ct),
    seuil,
    hors: cr > seuil,
  };
}

// Qualitative palette for donuts keyed by arbitrary labels (categories, owners…).
export const PAL = [
  "#2E4C7E", "#4C7EBF", "#63BE7B", "#F2C94C", "#EE8B34",
  "#E15759", "#8E7CC3", "#5AA9A0", "#B07AA1", "#9BBB59",
];

// Status colours mirror the reference (keys are Prisma RiskStatus values).
export const STATUS_COL: Record<string, string> = {
  OPEN: "#B0B0B0",
  IN_PROGRESS: "#4C7EBF",
  CLOSED: "#63BE7B",
};

/** Rough treatment progress from a risk status, 0-100. */
export function progressOf(status: string) {
  return status === "CLOSED" ? 100 : status === "IN_PROGRESS" ? 50 : 0;
}

/** Maps a euro exposure to a labelled severity band with a colour. */
export function expoBand(v: number): { l: string; c: string } {
  v = Number(v) || 0;
  if (v >= 3e6) return { l: "Extrême", c: "#E15759" };
  if (v >= 2e6) return { l: "Très élevée", c: "#EE8B34" };
  if (v >= 1e6) return { l: "Élevée", c: "#F2C94C" };
  if (v >= 5e5) return { l: "Moyenne", c: "#9BBB59" };
  return { l: "Faible", c: "#63BE7B" };
}

// ---- SVG donut helpers (ported from the reference) ----
// Coordinates are rounded to 3 decimals so the server- and client-rendered
// path strings are byte-identical (avoids React hydration mismatches from
// tiny floating-point differences between Node and the browser).
function r3(n: number) {
  return Math.round(n * 1000) / 1000;
}
function polar(cx: number, cy: number, r: number, a: number) {
  const t = ((a - 90) * Math.PI) / 180;
  return [r3(cx + r * Math.cos(t)), r3(cy + r * Math.sin(t))] as const;
}
export function arcPath(
  cx: number,
  cy: number,
  ro: number,
  ri: number,
  s: number,
  e: number
) {
  const [x1, y1] = polar(cx, cy, ro, e);
  const [x2, y2] = polar(cx, cy, ro, s);
  const [x3, y3] = polar(cx, cy, ri, s);
  const [x4, y4] = polar(cx, cy, ri, e);
  const lg = e - s > 180 ? 1 : 0;
  return `M${x1} ${y1} A${ro} ${ro} 0 ${lg} 0 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${lg} 1 ${x4} ${y4} Z`;
}
