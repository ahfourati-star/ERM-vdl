"use client";

import type { RiskDTO } from "./types";
import { fmtEuro } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { LevelPill, StatusPill } from "./charts";

export function Registre({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Registre détaillé" sub="Inventaire complet des risques cotés" who={who}>
      {({ data, onPick }) => {
        const rows = data.slice().sort((a, b) => b.cr - a.cr);
        return (
          <div className="card">
            <h3>
              Registre des risques
              <span className="hint">{rows.length} risque(s) · cliquer une ligne pour la fiche</span>
            </h3>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Risque</th>
                    <th>Propriétaire</th>
                    <th>Résiduel</th>
                    <th>Cible</th>
                    <th>Exposition</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id} onClick={() => onPick(d)}>
                      <td>{d.category}</td>
                      <td>
                        {d.title} {d.hors && <span className="flag">hors appétit</span>}
                      </td>
                      <td>{d.owner}</td>
                      <td>
                        <LevelPill level={d.nr} score={d.cr} />
                      </td>
                      <td>
                        <LevelPill level={d.nt} score={d.ct} />
                      </td>
                      <td style={{ textAlign: "right" }}>{fmtEuro(d.expo)}</td>
                      <td>
                        <StatusPill status={d.status} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }} className="muted">
                        Aucun risque. Ajoutez-en via « Saisir les risques ».
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
