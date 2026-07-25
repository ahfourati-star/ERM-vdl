"use client";

import type { RiskDTO } from "./types";
import { fmtEuro, sum, avg } from "./dashboardHelpers";
import { ReportShell } from "./ReportShell";

type Ind = {
  nom: string;
  val: string;
  statut: "ok" | "warn" | "bad";
  note: string;
};

const STATUT_STYLE = {
  ok: { lab: "Conforme", bg: "#e6f6ea", fg: "#0a7d3a" },
  warn: { lab: "Surveillance", bg: "#fff4e5", fg: "#b06f00" },
  bad: { lab: "Alerte", bg: "#fde7e9", fg: "#9c0006" },
} as const;

export function Kri({ risks, who }: { risks: RiskDTO[]; who: string }) {
  return (
    <ReportShell risks={risks} title="Indicateurs (KRI)" sub="Mesures chiffrées de pilotage des risques" who={who}>
      {({ data }) => {
        const total = data.length;
        const crit = data.filter((d) => d.pr * d.ir >= 15).length;
        const hors = data.filter((d) => d.hors).length;
        const expoT = sum(data.map((d) => d.expo));
        const cInh = avg(data.map((d) => d.pi * d.ii));
        const cRes = avg(data.map((d) => d.pr * d.ir));
        const red = cInh ? Math.round(((cInh - cRes) / cInh) * 100) : 0;
        const allActions = data.flatMap((d) => d.actions);
        const doneActions = allActions.filter((a) => a.status === "DONE").length;
        const pctActions = allActions.length ? Math.round((doneActions / allActions.length) * 100) : 0;
        const overdue = allActions.filter((a) => a.overdue).length;
        const sansPlan = data.filter(
          (d) => (d.nr === "Critique" || d.nr === "Élevé") && d.actions.every((a) => a.status === "NOT_STARTED")
        ).length;

        const inds: Ind[] = [
          {
            nom: "Risques critiques (résiduel)",
            val: String(crit),
            statut: crit === 0 ? "ok" : crit <= 2 ? "warn" : "bad",
            note: "Objectif : 0 risque critique après maîtrise.",
          },
          {
            nom: "Risques hors appétit",
            val: String(hors),
            statut: hors === 0 ? "ok" : hors <= 2 ? "warn" : "bad",
            note: "Nombre de risques au-dessus de leur seuil d'appétit.",
          },
          {
            nom: "Exposition résiduelle totale",
            val: fmtEuro(expoT),
            statut: "warn",
            note: "Somme des expositions financières résiduelles.",
          },
          {
            nom: "Réduction par la maîtrise",
            val: red + "%",
            statut: red >= 40 ? "ok" : red >= 20 ? "warn" : "bad",
            note: "Baisse moyenne de criticité entre inhérent et résiduel.",
          },
          {
            nom: "Actions terminées",
            val: pctActions + "%",
            statut: pctActions >= 70 ? "ok" : pctActions >= 40 ? "warn" : "bad",
            note: `${doneActions}/${allActions.length} plans d'action terminés.`,
          },
          {
            nom: "Actions en retard",
            val: String(overdue),
            statut: overdue === 0 ? "ok" : overdue <= 2 ? "warn" : "bad",
            note: "Plans d'action dont l'échéance est dépassée.",
          },
          {
            nom: "Risques élevés/critiques sans plan",
            val: String(sansPlan),
            statut: sansPlan === 0 ? "ok" : "bad",
            note: "Risques prioritaires sans plan d'action actif.",
          },
          {
            nom: "Total des risques recensés",
            val: String(total),
            statut: "ok",
            note: "Nombre de risques dans le registre.",
          },
        ];

        return (
          <>
            <div className="kgrid">
              {inds.map((k) => {
                const st = STATUT_STYLE[k.statut];
                return (
                  <div className="kcard" key={k.nom}>
                    <div className="kname">{k.nom}</div>
                    <div className="krow">
                      <div>
                        <span className="kval" style={{ color: st.fg }}>
                          {k.val}
                        </span>
                      </div>
                      <span className="kstat" style={{ background: st.bg, color: st.fg }}>
                        {st.lab}
                      </span>
                    </div>
                    <div className="kth">{k.note}</div>
                  </div>
                );
              })}
            </div>
            <div className="muted" style={{ marginTop: 14 }}>
              Ces indicateurs sont calculés automatiquement à partir de votre registre des risques et de vos plans
              d&apos;action. Ils complètent la cotation qualitative par une mesure chiffrée et se mettent à jour à
              chaque modification.
            </div>
          </>
        );
      }}
    </ReportShell>
  );
}
