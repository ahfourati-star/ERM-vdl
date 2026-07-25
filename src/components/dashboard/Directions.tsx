"use client";

import type { RiskDTO } from "./types";
import { fmtEuro, sum, avg, progressOf } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";
import { OrgHub, HeatCounts, PriorityTable } from "./charts";

export function Directions({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Directions" sub="Répartition des risques par responsable / entité" who={who}>
      {({ data }) => {
        const owners = [...new Set(data.map((d) => d.owner))];
        const ents = owners
          .map((o) => ({ name: o, count: data.filter((d) => d.owner === o).length }))
          .sort((a, b) => b.count - a.count);
        return (
          <>
            <div className="card">
              <h3>
                Cartographie par responsable
                <span className="hint">structure des risques par entité</span>
              </h3>
              <OrgHub entities={ents} total={data.length} />
            </div>

            <div className="egrid">
              {ents.map((e) => {
                const items = data.filter((d) => d.owner === e.name);
                const expo = sum(items.map((d) => d.expo));
                const prog = Math.round(avg(items.map((d) => progressOf(d.status))));
                return (
                  <div className="ecard" key={e.name}>
                    <div className="ehead">
                      <div className="einit">{(e.name[0] || "?").toUpperCase()}</div>
                      <div>
                        <div className="ename">{e.name}</div>
                        <div className="emeta">{items.length} risque(s)</div>
                      </div>
                    </div>
                    <div className="ebody">
                      <div style={{ flex: 1 }}>
                        <PriorityTable items={items} />
                      </div>
                      <div>
                        <HeatCounts items={items} cell={24} />
                      </div>
                    </div>
                    <div className="efoot">
                      <span>
                        Exposition <b>{fmtEuro(expo)}</b>
                      </span>
                      <span>
                        Avancement <b>{prog}%</b>
                      </span>
                    </div>
                  </div>
                );
              })}
              {ents.length === 0 && <div className="muted">Aucun risque à répartir.</div>}
            </div>
          </>
        );
      }}
    </ReportShell>
  );
}
