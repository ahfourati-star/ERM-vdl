"use client";

import type { RiskDTO } from "./types";
import {
  SOLID,
  FILL,
  STATUS_COL,
  STATUS_LABELS,
  LEVEL_ORDER,
  fmtEuro,
  sum,
  avg,
  progressOf,
} from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { DonutBy, BarsMini } from "./charts";

const TREATMENT_ORDER = ["CLOSED", "IN_PROGRESS", "OPEN"];

export function Infographie({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Infographie" sub="Vue synthétique illustrée de l'exposition" who={who}>
      {({ data }) => {
        const cats = [...new Set(data.map((d) => d.category))];
        const prog = Math.round(avg(data.map((d) => progressOf(d.status))));
        return (
          <>
            <div className="drow">
              <DonutBy items={data} keyOf={(d) => d.nr} palette={SOLID} title="Par priorité" />
              <DonutBy items={data} keyOf={(d) => d.category} title="Par catégorie" />
              <DonutBy items={data} keyOf={(d) => d.owner} title="Par responsable" />
              <DonutBy items={data} keyOf={(d) => d.status} palette={STATUS_COL} title="Statut des traitements" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1.25fr 1fr", marginTop: 14 }}>
              <div className="card">
                <h3>
                  Répartition par catégorie
                  <span className="hint">effectif · score moyen · exposition · niveaux</span>
                </h3>
                <div className="cstrip">
                  {cats.map((cat) => {
                    const it = data.filter((d) => d.category === cat);
                    return (
                      <div className="ccol" key={cat}>
                        <div className="cc-n">{it.length}</div>
                        <div className="cc-l">{cat}</div>
                        <div className="cc-s">score {avg(it.map((d) => d.cr)).toFixed(1)}</div>
                        <div className="cc-e">{fmtEuro(sum(it.map((d) => d.expo)))}</div>
                        {LEVEL_ORDER.map((n) => (
                          <div className="cc-b" key={n} style={{ background: FILL[n] }}>
                            {it.filter((d) => d.nr === n).length}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {cats.length === 0 && <div className="muted">Aucune donnée.</div>}
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 14 }}>
                <div className="card">
                  <h3>
                    Traitements<span className="hint">avancement estimé d&apos;après le statut</span>
                  </h3>
                  <div className="prog">
                    <div className="prog-v">{prog}%</div>
                    <div className="prog-l">avancement global estimé</div>
                    <div className="pbar">
                      <span style={{ width: prog + "%" }} />
                    </div>
                  </div>
                  <div className="tstat">
                    {TREATMENT_ORDER.map((s) => (
                      <div key={s}>
                        <span className="sq" style={{ background: STATUS_COL[s] }} /> {STATUS_LABELS[s]}{" "}
                        <b>{data.filter((d) => d.status === s).length}</b>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3>
                    Score de risque par catégorie
                    <span className="hint">criticité résiduelle moyenne</span>
                  </h3>
                  <BarsMini
                    items={cats.map((c) => ({
                      l: c.slice(0, 8),
                      v: +avg(data.filter((d) => d.category === c).map((d) => d.cr)).toFixed(1),
                    }))}
                  />
                </div>
              </div>
            </div>
          </>
        );
      }}
    </ReportShell>
  );
}
