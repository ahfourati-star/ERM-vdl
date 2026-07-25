"use client";

import React from "react";
import {
  FILL,
  SOLID,
  PAL,
  niveau,
  avg,
  fmtEuro,
  arcPath,
  LEVEL_ORDER,
  STATUS_LABELS,
  type Computed,
} from "./dashboardHelpers";
import { ACTION_STATUS_LABELS } from "@/lib/risk";

/* Coloured pill for a risk status (OPEN / IN_PROGRESS / CLOSED). */
export function StatusPill({ status }: { status: string }) {
  const cls: Record<string, string> = { OPEN: "nd", IN_PROGRESS: "enc", CLOSED: "re" };
  return <span className={"st " + (cls[status] || "nd")}>{STATUS_LABELS[status] || status}</span>;
}

/* Coloured pill for an action-plan status (NOT_STARTED / IN_PROGRESS / DONE). */
export function ActionStatusPill({ status }: { status: string }) {
  const cls: Record<string, string> = { NOT_STARTED: "nd", IN_PROGRESS: "enc", DONE: "re" };
  return <span className={"st " + (cls[status] || "nd")}>{ACTION_STATUS_LABELS[status] || status}</span>;
}

/* Coloured pill for a criticality level + score. */
export function LevelPill({ level, score }: { level: string; score: number }) {
  return (
    <span className="pill" style={{ background: FILL[level], color: "#333" }}>
      {score} · {level}
    </span>
  );
}

/* Small trend arrow (direction of residual criticality vs previous period). */
export function Arrow({ dir }: { dir: "up" | "down" | "flat" | "new" }) {
  const map = { up: "▲", down: "▼", flat: "▬", new: "＊" } as const;
  return <span className={"arw " + dir}>{map[dir]}</span>;
}

/* Sparkline: tiny line with optional favourable/critical threshold lines. */
export function Sparkline({
  vals,
  vert,
  rouge,
  color = "#2E4C7E",
  w = 120,
  h = 34,
}: {
  vals: number[];
  vert?: number;
  rouge?: number;
  color?: string;
  w?: number;
  h?: number;
}) {
  const p = 3;
  const pool = [...vals];
  if (vert != null) pool.push(vert);
  if (rouge != null) pool.push(rouge);
  const lo = Math.min(...pool);
  const hi = Math.max(...pool);
  const rng = hi - lo || 1;
  const X = (i: number) => p + (vals.length <= 1 ? 0 : (i / (vals.length - 1)) * (w - 2 * p));
  const Y = (v: number) => h - p - ((v - lo) / rng) * (h - 2 * p);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      {vert != null && (
        <line x1={p} y1={Y(vert)} x2={w - p} y2={Y(vert)} stroke="#63BE7B" strokeDasharray="2 2" strokeWidth={1} />
      )}
      {rouge != null && (
        <line x1={p} y1={Y(rouge)} x2={w - p} y2={Y(rouge)} stroke="#E15759" strokeDasharray="2 2" strokeWidth={1} />
      )}
      <polyline points={vals.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke={color} strokeWidth={2} />
      <circle cx={X(vals.length - 1)} cy={Y(vals[vals.length - 1])} r={3} fill={color} />
    </svg>
  );
}

/* Full-width line chart with a value axis. */
export function LineChart({
  labels,
  values,
  color = "#2E4C7E",
  money = false,
}: {
  labels: string[];
  values: number[];
  color?: string;
  money?: boolean;
}) {
  const W = 560, H = 210, pl = 52, pr = 14, pt = 16, pb = 34;
  const mx = Math.max(...values, 0) * 1.1 || 1;
  const X = (i: number) => pl + (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * (W - pl - pr));
  const Y = (v: number) => H - pb - (v / mx) * (H - pt - pb);
  const grid = [];
  for (let t = 0; t <= 4; t++) {
    const gy = pt + (t / 4) * (H - pt - pb);
    const vv = mx - (t / 4) * mx;
    grid.push(
      <g key={t}>
        <line x1={pl} y1={gy} x2={W - pr} y2={gy} stroke="#eee" />
        <text x={pl - 6} y={gy + 3} textAnchor="end" fontSize={9} fill="#888">
          {money ? fmtEuro(vv) : Math.round(vv)}
        </text>
      </g>
    );
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {grid}
      <polyline points={values.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke={color} strokeWidth={2.5} />
      {values.map((v, i) => (
        <circle key={i} cx={X(i)} cy={Y(v)} r={3.5} fill={color}>
          <title>{labels[i]} : {money ? fmtEuro(v) : v}</title>
        </circle>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={X(i)} y={H - pb + 16} textAnchor="middle" fontSize={9.5} fill="#605e5c">
          {l}
        </text>
      ))}
    </svg>
  );
}

/* Donut grouped by an arbitrary key function, with a legend. */
export function DonutBy({
  items,
  keyOf,
  palette,
  title,
}: {
  items: Computed[];
  keyOf: (d: Computed) => string;
  palette?: Record<string, string>;
  title: string;
}) {
  const groups: Record<string, number> = {};
  items.forEach((d) => {
    const k = keyOf(d) || "—";
    groups[k] = (groups[k] || 0) + 1;
  });
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  const total = items.length || 1;
  let ang = 0;
  const colOf = (k: string, i: number) => (palette && palette[k]) || PAL[i % PAL.length];
  const paths = entries.map(([k, v], i) => {
    let sw = (v / total) * 360;
    let e = ang + sw;
    if (sw >= 359.999) e = ang + 359.999;
    const d = arcPath(60, 60, 52, 32, ang, e);
    ang += sw;
    return (
      <path key={k} d={d} fill={colOf(k, i)} stroke="#fff" strokeWidth={1.5}>
        <title>{k}: {v}</title>
      </path>
    );
  });
  return (
    <div className="dcard">
      <div className="dt">{title}</div>
      <svg viewBox="0 0 120 120" width={118} height={118}>
        {paths}
        <text x={60} y={58} textAnchor="middle" fontSize={22} fontWeight={700} fill="#1F3864">
          {items.length}
        </text>
        <text x={60} y={74} textAnchor="middle" fontSize={9} fill="#605e5c">
          risques
        </text>
      </svg>
      <div className="dleg">
        {entries.map(([k, v], i) => (
          <div key={k}>
            <span className="sw" style={{ background: colOf(k, i) }} />
            {k} · <b>{v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Vertical mini bar chart. */
export function BarsMini({ items }: { items: { l: string; v: number }[] }) {
  const W = 520, H = 150, pb = 26, pl = 20, pt = 12;
  const mx = Math.max(...items.map((x) => x.v), 1) * 1.15;
  const seg = (W - pl) / (items.length || 1);
  const bw = seg * 0.55;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {items.map((x, i) => {
        const cx = pl + (i + 0.5) * seg;
        const h = (x.v / mx) * (H - pt - pb);
        const y = H - pb - h;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={y} width={bw} height={h} fill="#4C7EBF" rx={3}>
              <title>{x.l}: {x.v}</title>
            </rect>
            <text x={cx} y={y - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1F3864">
              {x.v}
            </text>
            <text x={cx} y={H - pb + 15} textAnchor="middle" fontSize={9.5} fill="#605e5c">
              {x.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Hub-and-spoke tree: organisation → entities (owners). */
export function OrgHub({ entities, total }: { entities: { name: string; count: number }[]; total: number }) {
  const n = entities.length || 1;
  const cw = 132;
  const W = Math.max(760, n * 150);
  const gap = (W - n * cw) / (n + 1);
  const cxC = W / 2;
  return (
    <svg viewBox={`0 0 ${W} 150`} style={{ width: "100%", height: "auto" }}>
      <rect x={cxC - 92} y={6} width={184} height={46} rx={8} fill="#1F3864" />
      <text x={cxC} y={30} textAnchor="middle" fontSize={18} fontWeight={700} fill="#fff">{total}</text>
      <text x={cxC} y={45} textAnchor="middle" fontSize={9.5} fill="#c8d2e8">Risques de l&apos;organisation</text>
      <line x1={cxC} y1={52} x2={cxC} y2={72} stroke="#9fb4d6" strokeWidth={2} />
      {n > 1 && <line x1={gap + cw / 2} y1={72} x2={W - gap - cw / 2} y2={72} stroke="#9fb4d6" strokeWidth={2} />}
      {entities.map((e, i) => {
        const x = gap + i * (cw + gap);
        const midx = x + cw / 2;
        return (
          <g key={i}>
            <line x1={midx} y1={72} x2={midx} y2={92} stroke="#9fb4d6" strokeWidth={2} />
            <rect x={x} y={92} width={cw} height={50} rx={7} fill="#2E4C7E" />
            <text x={midx} y={114} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff">{e.count}</text>
            <text x={midx} y={131} textAnchor="middle" fontSize={9} fill="#dbe2ef">{(e.name || "").slice(0, 18)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* Mini 5×5 heatmap showing residual counts per cell. */
export function HeatCounts({ items, cell = 24 }: { items: Computed[]; cell?: number }) {
  const S = cell * 5 + 2;
  const nodes: React.ReactNode[] = [];
  for (let ii = 0; ii < 5; ii++) {
    const imp = 5 - ii;
    for (let pj = 0; pj < 5; pj++) {
      const prob = pj + 1;
      const n = items.filter((d) => d.pr === prob && d.ir === imp).length;
      const x = 1 + pj * cell;
      const y = 1 + ii * cell;
      nodes.push(
        <rect key={`r${ii}-${pj}`} x={x} y={y} width={cell - 1} height={cell - 1} fill={FILL[niveau(prob * imp)]} rx={2} />
      );
      if (n)
        nodes.push(
          <text key={`t${ii}-${pj}`} x={x + cell / 2} y={y + cell / 2 + 3} textAnchor="middle" fontSize={10} fontWeight={700} fill="#333">
            {n}
          </text>
        );
    }
  }
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S}>
      {nodes}
    </svg>
  );
}

/* Inherent vs residual priority counts table (per entity). */
export function PriorityTable({ items }: { items: Computed[] }) {
  return (
    <table className="ptab">
      <thead>
        <tr>
          <th>Priorité</th>
          <th>Inh.</th>
          <th>Rés.</th>
        </tr>
      </thead>
      <tbody>
        {LEVEL_ORDER.map((n) => (
          <tr key={n}>
            <td>
              <span className="sq" style={{ background: SOLID[n] }} />
              {n}
            </td>
            <td>{items.filter((d) => d.ni === n).length}</td>
            <td>{items.filter((d) => d.nr === n).length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Progress bar for a single risk from inherent → residual → target on a 0-25 scale. */
export function ProgressLine({ d }: { d: Computed }) {
  const W = 520;
  const SCX = (v: number) => 52 + (v / 25) * (W - 52 - 16);
  return (
    <svg viewBox={`0 0 ${W} 30`} style={{ width: "100%", height: 30 }}>
      <text x={0} y={19} fontSize={11} fontWeight={700} fill="#1F3864">
        {d.title.slice(0, 6)}
      </text>
      <line x1={52} y1={15} x2={W - 16} y2={15} stroke="#eee" strokeWidth={6} strokeLinecap="round" />
      <line x1={SCX(Math.min(d.ct, d.cr))} y1={15} x2={SCX(d.cr)} y2={15} stroke="#9fb4d6" strokeWidth={6} strokeLinecap="round" />
      <circle cx={SCX(d.ci)} cy={15} r={6} fill="#9a9a9a"><title>Inhérent {d.ci}</title></circle>
      <circle cx={SCX(d.cr)} cy={15} r={6} fill={SOLID[d.nr]}><title>Résiduel {d.cr}</title></circle>
      <rect x={SCX(d.ct) - 4} y={9} width={8} height={12} fill="#1F3864"><title>Cible {d.ct}</title></rect>
    </svg>
  );
}

export { avg };
