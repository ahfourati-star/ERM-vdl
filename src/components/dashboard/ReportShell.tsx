"use client";

import React, { useMemo, useState } from "react";
import type { RiskDTO } from "./types";
import { compute, type Computed, STATUS_LABELS } from "./dashboardHelpers";
import { RiskModal } from "./RiskModal";

export type ReportContext = {
  /** Risks after applying the active filters. */
  data: Computed[];
  /** All risks (unfiltered) — useful to keep category axes stable. */
  all: Computed[];
  cat: string;
  statut: string;
  niv: string;
  toggleCat: (c: string) => void;
  toggleStatut: (s: string) => void;
  toggleNiv: (n: string) => void;
  /** Open the detail fiche for a risk. */
  onPick: (r: Computed) => void;
};

export function ReportShell({
  risks,
  title,
  sub,
  who,
  children,
}: {
  risks: RiskDTO[];
  title: string;
  sub: string;
  who?: string;
  children: (ctx: ReportContext) => React.ReactNode;
}) {
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

  const toggleCat = (c: string) => setCat((v) => (v === c ? "" : c));
  const toggleStatut = (s: string) => setStatut((v) => (v === s ? "" : s));
  const toggleNiv = (n: string) => setNiv((v) => (v === n ? "" : n));

  const chips: { label: string; clear: () => void }[] = [];
  if (cat) chips.push({ label: "Catégorie : " + cat, clear: () => setCat("") });
  if (statut) chips.push({ label: "Statut : " + (STATUS_LABELS[statut] || statut), clear: () => setStatut("") });
  if (niv) chips.push({ label: "Niveau : " + niv, clear: () => setNiv("") });

  return (
    <>
      <div className="topbar">
        <h1>{title}</h1>
        <span className="sub">{sub}</span>
        {who && <span className="who">{who}</span>}
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
        {children({ data, all, cat, statut, niv, toggleCat, toggleStatut, toggleNiv, onPick: setSelected })}
      </div>

      <RiskModal risk={selected} onClose={() => setSelected(null)} />
    </>
  );
}
