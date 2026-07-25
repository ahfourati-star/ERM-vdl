"use client";

import type { RiskDTO } from "./types";
import { fmtEuro, sum } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { ActionStatusPill } from "./charts";

export function ActionsReport({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Plans d'action" sub="Suivi des mesures de traitement et responsabilités" who={who}>
      {({ data, onPick }) => {
        const flat = data.flatMap((d) => d.actions.map((a) => ({ risk: d, a })));
        const retard = flat.filter((x) => x.a.overdue).length;
        const done = flat.filter((x) => x.a.status === "DONE").length;
        const pct = flat.length ? Math.round((done / flat.length) * 100) : 0;
        const sansPlan = data.filter(
          (d) => (d.nr === "Critique" || d.nr === "Élevé") && d.actions.every((a) => a.status === "NOT_STARTED")
        ).length;

        const owners = [...new Set(data.map((d) => d.owner))];
        const ownerRows = owners
          .map((o) => {
            const it = data.filter((d) => d.owner === o);
            const acts = it.flatMap((d) => d.actions);
            return {
              o,
              n: it.length,
              ec: it.filter((d) => d.nr === "Critique" || d.nr === "Élevé").length,
              rt: acts.filter((a) => a.overdue).length,
              ex: sum(it.map((d) => d.expo)),
            };
          })
          .sort((a, b) => b.ex - a.ex);

        return (
          <>
            <div className="kpis" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <div className={"kpi" + (retard ? " warn" : "")}>
                <div className="val">{retard}</div>
                <div className="lab">Actions en retard</div>
              </div>
              <div className="kpi good">
                <div className="val">{pct}%</div>
                <div className="lab">Actions terminées</div>
              </div>
              <div className={"kpi" + (sansPlan ? " warn" : " good")}>
                <div className="val">{sansPlan}</div>
                <div className="lab">Risques élevés/critiques sans plan actif</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Vue par propriétaire<span className="hint">responsabilité et charge</span>
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Propriétaire</th>
                    <th>Risques</th>
                    <th>Élevés/critiques</th>
                    <th>Actions en retard</th>
                    <th>Exposition</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerRows.map((r) => (
                    <tr key={r.o} style={{ cursor: "default" }}>
                      <td>{r.o}</td>
                      <td style={{ textAlign: "center" }}>{r.n}</td>
                      <td style={{ textAlign: "center" }}>{r.ec}</td>
                      <td style={{ textAlign: "center" }}>{r.rt}</td>
                      <td style={{ textAlign: "right" }}>{fmtEuro(r.ex)}</td>
                    </tr>
                  ))}
                  {ownerRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="muted" style={{ textAlign: "center" }}>
                        Aucune donnée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Suivi des actions<span className="hint">cliquer pour la fiche du risque</span>
              </h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Risque</th>
                      <th>Plan d&apos;action</th>
                      <th>Responsable</th>
                      <th>Échéance</th>
                      <th>Avancement</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flat.map((x, i) => (
                      <tr key={i} onClick={() => onPick(x.risk)}>
                        <td>{x.risk.title}</td>
                        <td>{x.a.title}</td>
                        <td>{x.a.owner || "—"}</td>
                        <td style={{ textAlign: "center" }}>
                          {x.a.due || "—"} {x.a.overdue && <span className="flag">en retard</span>}
                        </td>
                        <td style={{ textAlign: "center" }}>{x.a.percent}%</td>
                        <td>
                          <ActionStatusPill status={x.a.status} />
                        </td>
                      </tr>
                    ))}
                    {flat.length === 0 && (
                      <tr>
                        <td colSpan={6} className="muted" style={{ textAlign: "center" }}>
                          Aucun plan d&apos;action. Ajoutez-en depuis la fiche d&apos;un risque.
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
