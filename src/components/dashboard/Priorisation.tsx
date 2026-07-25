"use client";

import type { RiskDTO } from "./types";
import { SOLID, expoBand } from "./dashboardHelpers";
import { CONTROL_TYPE_LABELS } from "@/lib/risk";
import { ReportShell } from "./ReportShell";
import { DonutBy } from "./charts";

export function Priorisation({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Priorisation" sub="Classement multi-critères des risques" who={who}>
      {({ data, onPick }) => {
        const rows = data.slice().sort((a, b) => b.cr - a.cr);
        return (
          <>
            <div className="drow">
              <DonutBy items={data} keyOf={(d) => d.nr} palette={SOLID} title="Par priorité" />
              <DonutBy items={data} keyOf={(d) => d.category} title="Par catégorie" />
              <DonutBy items={data} keyOf={(d) => d.owner} title="Par responsable" />
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Priorisation multi-critères
                <span className="hint">tri par criticité résiduelle · cliquer pour la fiche</span>
              </h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Risque</th>
                      <th>Priorité</th>
                      <th>Impact rés.</th>
                      <th>Prob. rés.</th>
                      <th>Criticité</th>
                      <th>Exposition</th>
                      <th>Dispositifs</th>
                      <th>Hors appétit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d) => {
                      const b = expoBand(d.expo);
                      return (
                        <tr key={d.id} onClick={() => onPick(d)}>
                          <td>{d.title}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className="dotp" style={{ background: SOLID[d.nr] }} />
                          </td>
                          <td style={{ textAlign: "center" }}>{d.ir}</td>
                          <td style={{ textAlign: "center" }}>{d.pr}</td>
                          <td style={{ textAlign: "center", fontWeight: 700 }}>{d.cr}</td>
                          <td>
                            <span className="pill" style={{ background: b.c, color: "#333" }}>
                              {b.l}
                            </span>
                          </td>
                          <td>
                            {d.controls.length
                              ? d.controls.length +
                                " (" +
                                [...new Set(d.controls.map((c) => CONTROL_TYPE_LABELS[c.type] || c.type))].join(", ") +
                                ")"
                              : "—"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {d.hors ? <span className="flag">oui</span> : "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }} className="muted">
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
