"use client";

import type { RiskDTO, HistoryPoint } from "./types";
import { fmtEuro, sum, avg, type Computed } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { LineChart, Arrow, LevelPill } from "./charts";
import { closeQuarter } from "@/app/actions/snapshot";

type Dir = "up" | "down" | "flat" | "new";

/** Latest snapshot criticality per risk id, from before the current period. */
function lastCrByRisk(history: HistoryPoint[]) {
  const best: Record<string, { order: number; cr: number }> = {};
  for (const h of history) {
    if (!h.riskId) continue;
    const cur = best[h.riskId];
    if (!cur || h.periodOrder > cur.order) best[h.riskId] = { order: h.periodOrder, cr: h.cr };
  }
  return best;
}

function dirOf(prev: number | undefined, cr: number): Dir {
  if (prev == null) return "new";
  return cr < prev ? "down" : cr > prev ? "up" : "flat";
}

export function Tendance({
  risks,
  history,
  who,
  isAdmin,
  notice,
}: {
  risks: RiskDTO[];
  history: HistoryPoint[];
  who: string;
  isAdmin: boolean;
  notice?: "saved" | "error" | null;
}) {
  return (
    <ReportShell risks={risks} title="Tendance" sub="Évolution de l'exposition et des risques dans le temps" who={who}>
      {({ data, all, cat, statut, niv, onPick }) => {
        const filterActive = !!(cat || statut || niv);
        const allowed = new Set(data.map((d) => d.id));
        const hist = filterActive ? history.filter((h) => h.riskId && allowed.has(h.riskId)) : history;

        // Ordered distinct periods.
        const periodMap = new Map<number, string>();
        hist.forEach((h) => periodMap.set(h.periodOrder, h.period));
        const orders = [...periodMap.keys()].sort((a, b) => a - b);
        const labels = [...orders.map((o) => periodMap.get(o)!), "Actuel"];

        const expoSeries = orders
          .map((o) => sum(hist.filter((h) => h.periodOrder === o).map((h) => h.exposure)))
          .concat(sum(data.map((d) => d.expo)));
        const critSeries = orders
          .map((o) => {
            const arr = hist.filter((h) => h.periodOrder === o).map((h) => h.cr);
            return arr.length ? +avg(arr).toFixed(1) : 0;
          })
          .concat(+avg(data.map((d) => d.cr)).toFixed(1));

        const last = lastCrByRisk(hist);
        const withDir = data.map((d) => {
          const prev = last[d.id]?.cr;
          return { d, prev, dir: dirOf(prev, d.cr) };
        });
        const amel = withDir.filter((x) => x.dir === "down").length;
        const aggr = withDir.filter((x) => x.dir === "up").length;
        const stab = withDir.filter((x) => x.dir === "flat").length;
        const neuf = withDir.filter((x) => x.dir === "new").length;

        const hasHistory = orders.length > 0;
        const rows = withDir.slice().sort((a, b) => {
          const da = a.prev == null ? 0 : a.d.cr - a.prev;
          const db = b.prev == null ? 0 : b.d.cr - b.prev;
          return db - da;
        });

        return (
          <>
            <div className="card" style={{ borderLeft: "3px solid #8fb0ff", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 4 }}>Suivi dans le temps</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {hasHistory
                    ? "Chaque « clôture de trimestre » enregistre une photo des risques. Les courbes et flèches comparent la situation actuelle aux trimestres précédents."
                    : "Aucun trimestre clôturé pour l'instant. Clôturez un premier trimestre pour commencer à suivre l'évolution ; chaque clôture ajoute un point aux courbes."}
                </p>
                {notice === "saved" && (
                  <p style={{ margin: "6px 0 0", color: "#0a7d3a", fontWeight: 600 }}>✓ Trimestre clôturé et enregistré.</p>
                )}
                {notice === "error" && (
                  <p style={{ margin: "6px 0 0", color: "#9c0006", fontWeight: 600 }}>Action réservée aux administrateurs.</p>
                )}
              </div>
              {isAdmin && (
                <form action={closeQuarter}>
                  <button type="submit" className="reset" style={{ marginLeft: 0, background: "#1F3864", color: "#fff", borderColor: "#1F3864", padding: "8px 14px" }}>
                    Clôturer le trimestre
                  </button>
                </form>
              )}
            </div>

            <div className="kpis" style={{ gridTemplateColumns: "repeat(4,1fr)", marginTop: 14 }}>
              <div className="kpi good">
                <div className="val">{amel}</div>
                <div className="lab">En amélioration ▼</div>
              </div>
              <div className={"kpi" + (aggr ? " warn" : "")}>
                <div className="val">{aggr}</div>
                <div className="lab">En aggravation ▲</div>
              </div>
              <div className="kpi">
                <div className="val">{stab}</div>
                <div className="lab">Stables ▬</div>
              </div>
              <div className="kpi">
                <div className="val">{neuf}</div>
                <div className="lab">Nouveaux</div>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 14 }}>
              <div className="card">
                <h3>
                  Exposition résiduelle totale<span className="hint">par trimestre</span>
                </h3>
                <LineChart labels={labels} values={expoSeries} money color="#2E4C7E" />
              </div>
              <div className="card">
                <h3>
                  Criticité résiduelle moyenne<span className="hint">par trimestre</span>
                </h3>
                <LineChart labels={labels} values={critSeries} color="#EE8B34" />
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>
                Trajectoire par risque
                <span className="hint">
                  {hasHistory ? "criticité résiduelle vs dernier trimestre clôturé" : "criticité résiduelle actuelle"}
                </span>
              </h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Risque</th>
                      <th>Catégorie</th>
                      <th>Précédent</th>
                      <th>Actuel</th>
                      <th>Écart</th>
                      <th>Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ d, prev, dir }) => {
                      const delta = prev == null ? null : d.cr - prev;
                      return (
                        <tr key={d.id} onClick={() => onPick(d as Computed)}>
                          <td>{d.title}</td>
                          <td>{d.category}</td>
                          <td style={{ textAlign: "center" }}>{prev == null ? "—" : prev}</td>
                          <td style={{ textAlign: "center" }}>
                            <LevelPill level={d.nr} score={d.cr} />
                          </td>
                          <td style={{ textAlign: "center" }}>{delta == null ? "—" : delta > 0 ? "+" + delta : delta}</td>
                          <td style={{ textAlign: "center" }}>
                            <Arrow dir={dir} />
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="muted" style={{ textAlign: "center" }}>
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
