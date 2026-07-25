"use client";

import type { RiskDTO } from "./types";
import { fmtEuro, sum, avg } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { LineChart, Arrow, LevelPill } from "./charts";

export function Tendance({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Tendance" sub="Évolution de l'exposition et des risques dans le temps" who={who}>
      {({ data, onPick }) => {
        const expoT = sum(data.map((d) => d.expo));
        const critAvg = +avg(data.map((d) => d.cr)).toFixed(1);
        const rows = data.slice().sort((a, b) => b.cr - a.cr);
        return (
          <>
            <div className="card" style={{ borderLeft: "3px solid #8fb0ff" }}>
              <h3>Suivi dans le temps</h3>
              <p className="muted">
                Les courbes de tendance se construisent au fil des trimestres. Aujourd&apos;hui, la première
                photo (« Actuel ») est enregistrée. À chaque clôture de trimestre, un nouveau point s&apos;ajoutera
                automatiquement et les flèches d&apos;évolution (amélioration ▼ / aggravation ▲) apparaîtront.
              </p>
            </div>

            <div className="kpis" style={{ gridTemplateColumns: "repeat(4,1fr)", marginTop: 14 }}>
              <div className="kpi good">
                <div className="val">0</div>
                <div className="lab">Risques en amélioration ▼</div>
              </div>
              <div className="kpi">
                <div className="val">0</div>
                <div className="lab">Risques en aggravation ▲</div>
              </div>
              <div className="kpi">
                <div className="val">0</div>
                <div className="lab">Risques stables ▬</div>
              </div>
              <div className="kpi">
                <div className="val">{data.length}</div>
                <div className="lab">Nouveaux risques (photo initiale)</div>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 14 }}>
              <div className="card">
                <h3>
                  Exposition résiduelle totale<span className="hint">par trimestre</span>
                </h3>
                <LineChart labels={["Actuel"]} values={[expoT]} money color="#2E4C7E" />
                <div className="muted">Total actuel : {fmtEuro(expoT)}</div>
              </div>
              <div className="card">
                <h3>
                  Criticité résiduelle moyenne<span className="hint">par trimestre</span>
                </h3>
                <LineChart labels={["Actuel"]} values={[critAvg]} color="#EE8B34" />
                <div className="muted">Moyenne actuelle : {critAvg}</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Trajectoire par risque<span className="hint">criticité résiduelle actuelle</span>
              </h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Risque</th>
                      <th>Catégorie</th>
                      <th>Résiduel</th>
                      <th>Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d) => (
                      <tr key={d.id} onClick={() => onPick(d)}>
                        <td>{d.title}</td>
                        <td>{d.category}</td>
                        <td style={{ textAlign: "center" }}>
                          <LevelPill level={d.nr} score={d.cr} />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Arrow dir="new" />
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="muted" style={{ textAlign: "center" }}>
                          Aucun risque.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }}
    </ReportShell>
  );
}
