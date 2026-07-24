"use client";

import { useMemo, useState } from "react";
import type { RiskDTO } from "./types";
import {
  compute,
  Computed,
  SOLID,
  FILL,
  IMP_LABEL,
  PROB_LABEL,
  LEVEL_ORDER,
  STATUS_LABELS,
  fmtEuro,
  avg,
  sum,
  niveau,
  arcPath,
} from "./dashboardHelpers";
import { RiskModal } from "./RiskModal";

export function Synthese({ risks, who }: { risks: RiskDTO[]; who: string }) {
  const all = useMemo(() => risks.map(compute), [risks]);
  const [cat, setCat] = useState("");
  const [statut, setStatut] = useState("");
  const [niv, setNiv] = useState("");
  const [selected, setSelected] = useState<Computed | null>(null);

  const cats = useMemo(() => [...new Set(all.map((d) => d.category))], [all]);

  const data = all.filter(
    (d) =>
      (!cat || d.category === cat) &&
      (!statut || d.status === statut) &&
      (!niv || d.nr === niv)
  );

  const nCrit = data.filter((d) => d.nr === "Critique").length;
  const nHors = data.filter((d) => d.hors).length;
  const expoT = sum(data.map((d) => d.expo));
  const cInh = avg(data.map((d) => d.ci));
  const cRes = avg(data.map((d) => d.cr));
  const red = cInh ? Math.round(((cInh - cRes) / cInh) * 100) : 0;

  const chips: { label: string; clear: () => void }[] = [];
  if (cat) chips.push({ label: "Catégorie : " + cat, clear: () => setCat("") });
  if (statut)
    chips.push({ label: "Statut : " + (STATUS_LABELS[statut] || statut), clear: () => setStatut("") });
  if (niv) chips.push({ label: "Niveau : " + niv, clear: () => setNiv("") });

  return (
    <>
      <div className="topbar">
        <h1>Synthèse</h1>
        <span className="sub">Vue d&apos;ensemble à destination du conseil d&apos;administration</span>
        <span className="who">{who}</span>
      </div>

      <div className="filters">
        <label>Filtres</label>
        <span>
          Catégorie{" "}
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Toutes</option>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </span>
        <span>
          Statut{" "}
          <select value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">Tous</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </span>
        <div className="chips">
          {chips.map((ch, i) => (
            <div key={i} className="chip">
              {ch.label} <b onClick={ch.clear}>✕</b>
            </div>
          ))}
        </div>
        <button
          className="reset"
          onClick={() => {
            setCat("");
            setStatut("");
            setNiv("");
          }}
        >
          Réinitialiser
        </button>
      </div>

      <div className="canvas">
        {/* KPIs */}
        <div className="kpis">
          <Kpi val={data.length} lab="Risques recensés" />
          <Kpi val={nHors} lab="Hors appétit" mod={nHors ? "warn" : "good"} />
          <Kpi val={nCrit} lab="Critiques (résiduel)" mod={nCrit ? "warn" : ""} />
          <Kpi val={fmtEuro(expoT)} lab="Exposition résiduelle totale" />
          <Kpi val={red + "%"} lab="Réduction par la maîtrise" mod="good" />
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: "1.4fr 1fr", marginTop: 14 }}
        >
          <Matrix data={data} onPick={setSelected} />
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            <Donut data={data} activeNiv={niv} onToggle={(n) => setNiv(niv === n ? "" : n)} />
            <CatBars
              all={all}
              data={data}
              onPick={(c) => setCat(cat === c ? "" : c)}
            />
          </div>
        </div>

        {/* Top risks by exposure */}
        <div className="card" style={{ marginTop: 14 }}>
          <h3>
            Principaux risques par exposition financière
            <span className="hint">cliquer pour la fiche détaillée</span>
          </h3>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Risque</th>
                  <th>Catégorie</th>
                  <th>Exposition</th>
                  <th>Résiduel</th>
                  <th>Cible</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data
                  .slice()
                  .sort((a, b) => b.expo - a.expo)
                  .slice(0, 8)
                  .map((d) => (
                    <tr key={d.id} onClick={() => setSelected(d)}>
                      <td>{d.title}</td>
                      <td>{d.category}</td>
                      <td style={{ textAlign: "right" }}>{fmtEuro(d.expo)}</td>
                      <td>
                        <span className="pill" style={{ background: FILL[d.nr], color: "#333" }}>
                          {d.cr} · {d.nr}
                        </span>
                      </td>
                      <td>
                        <span className="pill" style={{ background: FILL[d.nt], color: "#333" }}>
                          {d.ct} · {d.nt}
                        </span>
                      </td>
                      <td>{d.hors && <span className="flag">hors appétit</span>}</td>
                    </tr>
                  ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }} className="muted">
                      Aucun risque. Ajoutez-en via « Saisir les risques ».
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RiskModal risk={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Kpi({ val, lab, mod }: { val: React.ReactNode; lab: string; mod?: string }) {
  return (
    <div className={"kpi" + (mod ? " " + mod : "")}>
      <div className="val">{val}</div>
      <div className="lab">{lab}</div>
    </div>
  );
}

function Matrix({ data, onPick }: { data: Computed[]; onPick: (r: Computed) => void }) {
  const cells: React.ReactNode[] = [];
  for (const imp of [5, 4, 3, 2, 1]) {
    cells.push(
      <div key={"imp" + imp} className="mx-imp">
        {IMP_LABEL[imp]}
      </div>
    );
    for (const prob of [1, 2, 3, 4, 5]) {
      const items = data.filter((d) => d.pr === prob && d.ir === imp);
      cells.push(
        <div
          key={`${imp}-${prob}`}
          className={"mx-cell" + (items.length ? "" : " zero")}
          style={{ background: FILL[niveau(prob * imp)], cursor: items.length ? "pointer" : "default" }}
          title={items.map((d) => d.title).join("\n")}
          onClick={() => {
            if (items.length === 1) onPick(items[0]);
          }}
        >
          {items.length}
        </div>
      );
    }
  }
  cells.push(<div key="corner" />);
  for (const prob of [1, 2, 3, 4, 5]) {
    cells.push(
      <div key={"prob" + prob} className="mx-prob">
        {PROB_LABEL[prob]}
      </div>
    );
  }

  return (
    <div className="card">
      <h3>
        Matrice de criticité — résiduel<span className="hint">après maîtrise</span>
      </h3>
      <div className="matrix">{cells}</div>
      <div className="mx-axis-x">PROBABILITÉ</div>
    </div>
  );
}

function Donut({
  data,
  activeNiv,
  onToggle,
}: {
  data: Computed[];
  activeNiv: string;
  onToggle: (n: string) => void;
}) {
  const counts = LEVEL_ORDER.map((n) => ({ n, c: data.filter((d) => d.nr === n).length }));
  const total = data.length || 1;
  let ang = 0;
  const paths = counts
    .filter((k) => k.c > 0)
    .map((k, i) => {
      let sw = (k.c / total) * 360;
      let e = ang + sw;
      if (sw >= 359.999) e = ang + 359.999;
      const d = arcPath(90, 90, 80, 50, ang, e);
      ang += sw;
      return <path key={i} d={d} fill={SOLID[k.n]} stroke="#fff" strokeWidth={2} />;
    });

  return (
    <div className="card">
      <h3>Répartition par niveau résiduel</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg viewBox="0 0 180 180" width={160} height={160}>
          {paths}
          <text x={90} y={86} textAnchor="middle" fontSize={30} fontWeight={700} fill="#1F3864">
            {data.length}
          </text>
          <text x={90} y={104} textAnchor="middle" fontSize={11} fill="#605e5c">
            risques
          </text>
        </svg>
        <div className="legend" style={{ flexDirection: "column", gap: 7 }}>
          {counts.map((k) => (
            <div
              key={k.n}
              className={"it" + (activeNiv && activeNiv !== k.n ? " dim" : "")}
              onClick={() => onToggle(k.n)}
            >
              <span className="sw" style={{ background: SOLID[k.n] }} />
              {k.n} · <b>{k.c}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatBars({
  all,
  data,
  onPick,
}: {
  all: Computed[];
  data: Computed[];
  onPick: (c: string) => void;
}) {
  const cats = [...new Set(all.map((d) => d.category))];
  const rows = cats
    .map((c) => ({ c, items: data.filter((d) => d.category === c) }))
    .sort((a, b) => b.items.length - a.items.length);
  const max = Math.max(1, ...rows.map((r) => r.items.length));

  return (
    <div className="card">
      <h3>
        Risques par catégorie<span className="hint">empilé par niveau résiduel</span>
      </h3>
      {rows.map((r) => (
        <div key={r.c} className="bar-row" onClick={() => onPick(r.c)}>
          <div className="name">{r.c}</div>
          <div className="track">
            {LEVEL_ORDER.map((n) => {
              const cn = r.items.filter((d) => d.nr === n).length;
              if (!cn) return null;
              return (
                <div
                  key={n}
                  className="seg"
                  style={{ width: (cn / max) * 100 + "%", background: SOLID[n] }}
                />
              );
            })}
          </div>
          <div className="tot">{r.items.length}</div>
        </div>
      ))}
    </div>
  );
}
