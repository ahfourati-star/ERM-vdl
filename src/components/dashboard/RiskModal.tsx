"use client";

import { FILL, SOLID, fmtEuro, STATUS_LABELS } from "./dashboardHelpers";
import type { Computed } from "./dashboardHelpers";
import { CONTROL_TYPE_LABELS, ACTION_STATUS_LABELS } from "@/lib/risk";

function heatArrow(d: Computed, cell = 40) {
  const S = cell * 5 + 2;
  const rects: React.ReactNode[] = [];
  for (let ii = 0; ii < 5; ii++) {
    const imp = 5 - ii;
    for (let pj = 0; pj < 5; pj++) {
      const prob = pj + 1;
      const score = prob * imp;
      const lvl = score <= 4 ? "Faible" : score <= 9 ? "Moyen" : score <= 14 ? "Élevé" : "Critique";
      rects.push(
        <rect
          key={`${ii}-${pj}`}
          x={1 + pj * cell}
          y={1 + ii * cell}
          width={cell - 1}
          height={cell - 1}
          fill={FILL[lvl]}
          rx={2}
        />
      );
    }
  }
  const cx = (p: number) => 1 + (p - 1) * cell + cell / 2;
  const cy = (i: number) => 1 + (5 - i) * cell + cell / 2;
  const x1 = cx(d.pi),
    y1 = cy(d.ii),
    x2 = cx(d.pr),
    y2 = cy(d.ir);
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S}>
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="#1F3864" />
        </marker>
      </defs>
      {rects}
      {(x1 !== x2 || y1 !== y2) && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1F3864"
          strokeWidth={2.5}
          markerEnd="url(#ah)"
        />
      )}
      <circle cx={x1} cy={y1} r={8} fill="#fff" stroke="#555" strokeWidth={2} />
      <text x={x1} y={y1 + 3} textAnchor="middle" fontSize={9} fontWeight={700} fill="#555">
        I
      </text>
      <circle cx={x2} cy={y2} r={9} fill={SOLID[d.nr]} stroke="#fff" strokeWidth={2} />
      <text x={x2} y={y2 + 3} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
        R
      </text>
    </svg>
  );
}

export function RiskModal({ risk, onClose }: { risk: Computed | null; onClose: () => void }) {
  if (!risk) return null;
  return (
    <div
      className="backdrop on"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("backdrop")) onClose();
      }}
    >
      <div className="modal">
        <div className="mhead">
          <div>
            <div className="mid">{risk.category}</div>
            <h2>{risk.title}</h2>
          </div>
          <button className="x" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mbody">
          <div className="badges">
            <span className="badge">Processus : {risk.process || "—"}</span>
            <span className="badge">Propriétaire : {risk.owner || "—"}</span>
            <span className="badge">Statut : {STATUS_LABELS[risk.status] || risk.status}</span>
            {risk.hors && <span className="flag">hors appétit (seuil {risk.seuil})</span>}
          </div>

          <div className="crit3">
            <div className="critbox">
              <div className="cl">Inhérent</div>
              <div className="cv" style={{ color: SOLID[risk.ni] }}>
                {risk.ci}
              </div>
              <div className="muted">{risk.ni}</div>
            </div>
            <div className="critbox">
              <div className="cl">Résiduel</div>
              <div className="cv" style={{ color: SOLID[risk.nr] }}>
                {risk.cr}
              </div>
              <div className="muted">{risk.nr}</div>
            </div>
            <div className="critbox">
              <div className="cl">Cible</div>
              <div className="cv" style={{ color: SOLID[risk.nt] }}>
                {risk.ct}
              </div>
              <div className="muted">{risk.nt}</div>
            </div>
          </div>

          <div className="mgrid">
            <div className="critbox" style={{ textAlign: "left" }}>
              <div className="cl">Exposition résiduelle</div>
              <div className="cv" style={{ color: "#1F3864" }}>
                {fmtEuro(risk.expo)}
              </div>
            </div>
            <div className="critbox" style={{ textAlign: "left" }}>
              <div className="cl">Effet de la maîtrise (inhérent → résiduel)</div>
              <div style={{ marginTop: 6 }}>{heatArrow(risk, 34)}</div>
            </div>
          </div>

          <div className="msec" style={{ marginTop: 12 }}>
            <h4>Causes</h4>
            <p>{risk.cause || "—"}</p>
          </div>
          <div className="msec">
            <h4>Conséquences potentielles</h4>
            <p>{risk.consequence || "—"}</p>
          </div>
          <div className="msec">
            <h4>Dispositifs de maîtrise ({risk.controls.length})</h4>
            {risk.controls.length ? (
              <p>
                {risk.controls
                  .map(
                    (c) =>
                      `${c.name} (${CONTROL_TYPE_LABELS[c.type] || c.type}, efficacité ${c.efficacy}/5)`
                  )
                  .join(" · ")}
              </p>
            ) : (
              <p>—</p>
            )}
          </div>
          <div className="msec">
            <h4>Plans d&apos;action ({risk.actions.length})</h4>
            {risk.actions.length ? (
              risk.actions.map((a, i) => (
                <p key={i}>
                  {a.title}{" "}
                  <span className="muted">
                    — {a.owner || "—"} · {ACTION_STATUS_LABELS[a.status] || a.status} ·{" "}
                    {a.percent}%{a.due ? ` · échéance ${a.due}` : ""}
                  </span>
                </p>
              ))
            ) : (
              <p>—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
