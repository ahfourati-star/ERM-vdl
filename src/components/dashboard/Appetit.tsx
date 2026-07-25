"use client";

import type { RiskDTO } from "./types";
import { avg } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { ProgressLine } from "./charts";

const SCALE_MAX = 25;

export function Appetit({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Appétit & cible" sub="Positionnement vs seuils d'appétit et objectifs de maîtrise" who={who}>
      {({ data, all, onPick }) => {
        const cats = [...new Set(all.map((d) => d.category))];
        const bars = cats
          .map((cat) => {
            const items = data.filter((d) => d.category === cat);
            return { cat, items, a: items.length ? avg(items.map((d) => d.cr)) : 0, seuil: items[0]?.seuil ?? 9 };
          })
          .filter((r) => r.items.length)
          .sort((x, y) => y.a - x.a);

        const hors = data.filter((d) => d.hors).sort((a, b) => b.cr - b.seuil - (a.cr - a.seuil));
        const top = data.slice().sort((a, b) => b.cr - a.cr).slice(0, 8);

        return (
          <>
            <div className="card">
              <h3>
                Criticité résiduelle moyenne vs seuil d&apos;appétit
                <span className="hint">par catégorie</span>
              </h3>
              {bars.map((r) => {
                const over = r.a > r.seuil;
                return (
                  <div key={r.cat} className="bar-row">
                    <div className="name">{r.cat}</div>
                    <div className="track">
                      <div
                        className="seg"
                        style={{ width: (r.a / SCALE_MAX) * 100 + "%", background: over ? "#E15759" : "#63BE7B" }}
                      />
                      <div
                        title={"Seuil d'appétit : " + r.seuil}
                        style={{
                          position: "absolute",
                          left: (r.seuil / SCALE_MAX) * 100 + "%",
                          top: -2,
                          bottom: -2,
                          width: 0,
                          borderLeft: "2px dashed #1F3864",
                        }}
                      />
                    </div>
                    <div className="tot">{r.a.toFixed(1)}</div>
                  </div>
                );
              })}
              {bars.length === 0 && <div className="muted">Aucune donnée.</div>}
              <div className="muted" style={{ marginTop: 8 }}>
                Barre = criticité résiduelle moyenne · trait pointillé = seuil d&apos;appétit · rouge = au-dessus du seuil.
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Risques hors appétit<span className="hint">{hors.length} risque(s) au-dessus du seuil</span>
              </h3>
              {hors.length ? (
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Risque</th>
                        <th>Catégorie</th>
                        <th>Résiduel</th>
                        <th>Seuil</th>
                        <th>Écart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hors.map((d) => (
                        <tr key={d.id} onClick={() => onPick(d)}>
                          <td>{d.title}</td>
                          <td>{d.category}</td>
                          <td style={{ textAlign: "center", fontWeight: 700 }}>{d.cr}</td>
                          <td style={{ textAlign: "center" }}>{d.seuil}</td>
                          <td style={{ textAlign: "center", color: "#C0392B", fontWeight: 700 }}>+{d.cr - d.seuil}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="muted">Aucun risque au-dessus de son seuil d&apos;appétit.</div>
              )}
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Progression inhérent → résiduel → cible
                <span className="hint">principaux risques · échelle 0-25</span>
              </h3>
              {top.map((d) => (
                <div key={d.id} style={{ margin: "6px 0", cursor: "pointer" }} onClick={() => onPick(d)}>
                  <ProgressLine d={d} />
                </div>
              ))}
              {top.length === 0 && <div className="muted">Aucune donnée.</div>}
              <div className="legend">
                <div className="it">
                  <span className="sw" style={{ background: "#9a9a9a" }} />
                  Inhérent
                </div>
                <div className="it">
                  <span className="sw" style={{ background: "#EE8B34" }} />
                  Résiduel actuel
                </div>
                <div className="it">
                  <span className="sw" style={{ background: "#1F3864" }} />
                  Cible
                </div>
              </div>
            </div>
          </>
        );
      }}
    </ReportShell>
  );
}
