"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";

const REPORT_PAGES = [
  { href: "/dashboard", label: "Synthèse" },
  { href: "/dashboard/directions", label: "Directions" },
  { href: "/dashboard/infographie", label: "Infographie" },
  { href: "/dashboard/priorisation", label: "Priorisation" },
  { href: "/dashboard/tendance", label: "Tendance" },
  { href: "/dashboard/appetit", label: "Appétit & cible" },
  { href: "/dashboard/registre", label: "Registre détaillé" },
  { href: "/dashboard/kri", label: "Indicateurs (KRI)" },
  { href: "/dashboard/actions", label: "Plans d'action" },
];

export function Rail({
  orgName,
  isAdmin,
}: {
  orgName: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="rail">
      <div className="brand">
        <b>{orgName}</b>
        <span>Cartographie des risques</span>
      </div>
      <nav className="nav">
        {REPORT_PAGES.map((p) => {
          const active = pathname === p.href;
          return (
            <Link key={p.href} href={p.href} className={active ? "active" : ""}>
              <span className="dot" />
              {p.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "6px 0", borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <Link
          href="/dashboard/risks"
          className={pathname.startsWith("/dashboard/risks") ? "active" : ""}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            color: "#c8d2e8",
            fontSize: 13,
            textDecoration: "none",
            borderLeft: "3px solid transparent",
          }}
        >
          ✎ Saisir les risques
        </Link>
        {isAdmin && (
          <Link
            href="/dashboard/invite"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              color: "#c8d2e8",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            + Inviter un collègue
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className="linkbtn">
            Se déconnecter
          </button>
        </form>
      </div>
      <div className="foot">
        Données saisies dans l&apos;application.
        <br />
        Tableau de bord mis à jour automatiquement.
      </div>
    </aside>
  );
}
